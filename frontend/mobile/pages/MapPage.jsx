import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useGameContext } from '../context/GameContext';
import { visitCheckpoint } from '../services/api/partyApi';
import { apiFetch } from '../services/api/api';
import {
  ARBORETUM_REGION,
  VISIT_RADIUS_METERS,
  PHOTO_VISIT_RADIUS_METERS,
  PHOTO_AREA_DISPLAY_METERS,
  haversineMeters,
  safeParseGeometry,
  extractRings,
  coordsToLatLng,
  getCpsForZone,
  generatePhotoSpot,
  nearestLocked,
  checkpointColor,
  zoneCentroid,
  boundaryDistanceMeters,
} from './map/mapHelpers';
import ZoneLayer from './map/ZoneLayer';
import MapHud from './map/MapHud';
import SensorModal from './map/SensorModal';

export default function MapPage({ navigation, route }) {
  const completedRef = React.useRef(false);
  const fromGame = route?.params?.fromGame ?? false;
  const mapRef   = useRef(null);

  const [zones,       setZones]       = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [boundaries,  setBoundaries]  = useState([]);

  const [activeZone,       setActiveZone]       = useState(null);
  const [completedZoneIds, setCompletedZoneIds] = useState(new Set());
  const [targetCp,         setTargetCp]         = useState(null);
  const [pendingZoneCps,   setPendingZoneCps]   = useState([]);
  const [nearTarget,       setNearTarget]        = useState(false);
  const [flashMsg,         setFlashMsg]         = useState(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const [mapReady,    setMapReady]    = useState(false);
  const [sensorModal, setSensorModal] = useState(null);

  const initRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const { partyId, markVisited, role, gameConfig } = useGameContext();

  // Reset camera lock when map regains focus (user returned from Camera screen)
  useFocusEffect(
    useCallback(() => {
      setCameraActive(false);
    }, [])
  );

  // ── Flash helper ────────────────────────────────────────────────────────────
  function showFlash(msg) {
    setFlashMsg(msg);
    flashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setFlashMsg(null));
  }

  // ── Fly to zone ─────────────────────────────────────────────────────────────
  function flyToZone(zone) {
    const geom = safeParseGeometry(zone.boundary);
    if (!geom) return;
    const coords = extractRings(geom).flatMap(coordsToLatLng);
    if (!coords.length) return;
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 80, bottom: 120, left: 80 },
        animated: true,
      });
    }, 400);
  }

  // ── Location permission + initial position ──────────────────────────────────
  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') return;
        return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      })
      .then(loc => {
        if (loc) setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      })
      .catch(() => {});
  }, []);

  // ── Location watcher ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fromGame) return;
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        ({ coords }) => {
          setTargetCp(prev => {
            if (!prev) return prev;
            const radius = prev.type === 'photo' ? PHOTO_VISIT_RADIUS_METERS : VISIT_RADIUS_METERS;
            setNearTarget(haversineMeters(coords, { latitude: prev.latitude, longitude: prev.longitude }) <= radius);
            return prev;
          });
        },
      ).catch(() => null);
    })();
    return () => sub?.remove?.();
  }, [fromGame]);

  // ── Fetch zones + checkpoints ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const base = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!base) return;
    (async () => {
      try {
        const [zr, cr, br] = await Promise.all([
          apiFetch(`${base}/api/game/map/zones`),
          apiFetch(`${base}/api/game/map/checkpoints`),
          apiFetch(`${base}/api/game/map/boundaries`),
        ]);
        if (cancelled) return;
        if (zr.ok) { const j = await zr.json(); if (!cancelled) setZones(Array.isArray(j) ? j : []); }
        if (cr.ok) { const j = await cr.json(); if (!cancelled) setCheckpoints(Array.isArray(j) ? j : []); }
        if (br.ok) { const j = await br.json(); if (!cancelled) setBoundaries(Array.isArray(j) ? j : []); }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Fit map to loaded boundaries (non-game only — game flies to nearest zone) ─
  useEffect(() => {
    if (!mapReady || fromGame) return;
    let allCoords = boundaries.flatMap(b => {
      const geom = safeParseGeometry(b.boundary);
      if (!geom) return [];
      return extractRings(geom).flatMap(coordsToLatLng);
    });
    if (!allCoords.length) {
      allCoords = zones.flatMap(z => {
        const geom = safeParseGeometry(z.boundary);
        if (!geom) return [];
        return extractRings(geom).flatMap(coordsToLatLng);
      });
    }
    if (!allCoords.length) return;
    // Try to include the user's position so the map centres on them
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then(loc => {
        const userCoord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setTimeout(() => {
          mapRef.current?.fitToCoordinates([...allCoords, userCoord], {
            edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
            animated: true,
          });
        }, 200);
      })
      .catch(() => {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(allCoords, {
            edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
            animated: true,
          });
        }, 200);
      });
  }, [mapReady, zones, boundaries, fromGame]);

  // ── Zones visible on map ────────────────────────────────────────────────────
  // Game mode: scoped to the active boundary + zoneCount cap.
  // Browse mode: only zones belonging to boundaries within 1 km of the user
  //              (falls back to all zones if location not yet available).
  const gameZones = React.useMemo(() => {
    if (!fromGame) {
      if (!userLocation || !boundaries.length) return zones;
      const nearbyBoundaryIds = new Set(
        boundaries
          .filter(b => boundaryDistanceMeters(b, userLocation) <= 1000)
          .map(b => b.id)
      );
      return zones.filter(z => nearbyBoundaryIds.has(z.boundaryId));
    }
    const bid = gameConfig?.boundaryId;
    const scoped = bid ? zones.filter(z => z.boundaryId === bid) : zones;
    const cap = gameConfig?.zoneCount;
    return cap ? scoped.slice(0, cap) : scoped;
  }, [fromGame, zones, boundaries, gameConfig, userLocation]);

  // ── Photo-spot fallback ─────────────────────────────────────────────────────
  // Returns real checkpoints for the zone, or a synthetic photo spot when
  // Trailblazer/Explorer has no element checkpoints to visit there.
  function getTargetCpsForZone(zone) {
    const cps = getCpsForZone(zone, checkpoints, role);
    if (cps.length === 0 && (role === 'Trailblazer' || role === 'Explorer')) {
      const spot = generatePhotoSpot(zone);
      return spot ? [spot] : [];
    }
    return cps;
  }

  // ── Initial zone assignment ─────────────────────────────────────────────────
  useEffect(() => {
    if (!fromGame || initRef.current || !gameZones.length || !checkpoints.length) return;
    initRef.current = true;

    async function init() {
      let startZone = gameZones[0];
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(() => null);

        if (loc) {
          const user = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          let minDist = Infinity;
          for (const z of gameZones) {
            const centroid = zoneCentroid(z);
            if (!centroid) continue;
            const dist = haversineMeters(user, centroid);
            if (dist < minDist) { minDist = dist; startZone = z; }
          }
        }
      } catch { /* keep fallback */ }

      const startCps = getTargetCpsForZone(startZone);
      setActiveZone(startZone);
      setTargetCp(startCps[0] ?? null);
      setPendingZoneCps(startCps.slice(1));
      flyToZone(startZone);
    }

    init();
  }, [gameZones, checkpoints, fromGame, role]);

  // ── Checkpoint visit ────────────────────────────────────────────────────────
  async function completeCheckpoint(cp, zone) {
    markVisited(cp.id);
    if (partyId) await visitCheckpoint(partyId, cp.id).catch(() => {});
    setNearTarget(false);

    if (pendingZoneCps.length > 0) {
      const [next, ...rest] = pendingZoneCps;
      setTargetCp(next);
      setPendingZoneCps(rest);
      showFlash(`Checkpoint done! ${rest.length + 1} left in zone`);
      return;
    }

    const newDone = new Set(completedZoneIds).add(zone.id);
    setCompletedZoneIds(newDone);

    const nextZone = nearestLocked(zone, gameZones, newDone);
    if (nextZone) {
      showFlash('Zone Complete! 🎉');
      const nextCps = getTargetCpsForZone(nextZone);
      setActiveZone(nextZone);
      setTargetCp(nextCps[0] ?? null);
      setPendingZoneCps(nextCps.slice(1));
      flyToZone(nextZone);
    } else {
      if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(() => navigation.navigate('AllCheckpointsComplete'), 600);
      }
    }
  }

  async function handleVisit() {
    if (!targetCp || !activeZone) return;
    setNearTarget(false);
    if (targetCp.type === 'sensor') {
      setSensorModal({ cp: targetCp, zone: activeZone, sensorId: targetCp.referenceId, sensorName: targetCp.name });
    } else if (targetCp.type === 'photo') {
      // Complete the zone progress immediately (arrived at spot), then open camera
      await completeCheckpoint(targetCp, activeZone);
      setCameraActive(true);
      navigation.navigate('Camera', { gps: null });
    } else {
      completeCheckpoint(targetCp, activeZone);
    }
  }

  const totalZones     = gameZones.length;
  const remainingCount = totalZones - completedZoneIds.size;

  function handleLeaveGame() {
    setLeaveModal(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader
        title="Map"
        onBack={fromGame ? handleLeaveGame : () => navigation.goBack()}
        variant={fromGame ? 'cancel' : 'back'}
      />

      <View style={styles.mapWrap}>
        {fromGame && totalZones > 0 && (
          <MapHud
            targetCp={targetCp}
            remainingCount={remainingCount}
            zoneCpsLeft={pendingZoneCps.length + (targetCp ? 1 : 0)}
          />
        )}

        {fromGame && targetCp && (() => {
          const activeColor = '#1CB0F6';
          const activeBorder = '#0E8BC0';
          return (
            <View style={styles.actionBtnWrap} pointerEvents="box-none">
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  nearTarget
                    ? { backgroundColor: activeColor, borderBottomColor: activeBorder }
                    : styles.actionBtnInactive,
                ]}
                onPress={nearTarget ? handleVisit : undefined}
                activeOpacity={nearTarget ? 0.85 : 1}
                disabled={!nearTarget}
              >
                <Ionicons
                  name={targetCp.type === 'sensor' ? 'radio' : 'camera'}
                  size={26}
                  color={nearTarget ? '#fff' : '#a1a1aa'}
                />
              </TouchableOpacity>
            </View>
          );
        })()}

        {flashMsg && (
          <Animated.View style={[styles.flash, { opacity: flashAnim, transform: [{ scale: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
            <Text style={styles.flashText}>{flashMsg}</Text>
          </Animated.View>
        )}


        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          mapType="none"
          initialRegion={ARBORETUM_REGION}
          minZoomLevel={14}
          maxZoomLevel={20}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
        >
          {mapReady && (
            <UrlTile
              urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              maximumZ={20}
              flipY={false}
              shouldReplaceMapContent
            />
          )}

          <ZoneLayer
            zones={fromGame ? gameZones : zones}
            completedZoneIds={completedZoneIds}
            activeZone={activeZone}
            fromGame={fromGame}
          />

          {fromGame && targetCp?.latitude != null && targetCp.type !== 'photo' && (
            <Marker
              coordinate={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.cpDot, { backgroundColor: checkpointColor(targetCp) }]} />
            </Marker>
          )}

          {fromGame && targetCp?.type === 'photo' && targetCp.latitude != null && (
            <>
              <Circle
                center={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
                radius={PHOTO_AREA_DISPLAY_METERS}
                strokeColor="rgba(255,150,0,0.9)"
                fillColor="rgba(255,150,0,0.25)"
                strokeWidth={2}
              />
              <Marker
                coordinate={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.photoSpotDot} />
              </Marker>
            </>
          )}

          {!fromGame && checkpoints.map((cp, i) =>
            cp.latitude != null && (
              <Marker key={`cp-${i}`} coordinate={{ latitude: cp.latitude, longitude: cp.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.cpDot, { backgroundColor: checkpointColor(cp) }]} />
              </Marker>
            )
          )}
        </MapView>
      </View>

      <SensorModal
        visible={!!sensorModal}
        sensorId={sensorModal?.sensorId}
        sensorName={sensorModal?.sensorName ?? 'Nearby Sensor'}
        onClose={() => {
          const { cp, zone } = sensorModal;
          setSensorModal(null);
          completeCheckpoint(cp, zone);
        }}
      />

      <ConfirmModal
        visible={leaveModal}
        title={partyId ? 'Leave Party?' : 'Leave Game?'}
        message={partyId ? 'You will leave the current party session.' : 'Your progress will be lost.'}
        buttons={[
          { text: 'Stay', style: 'cancel', onPress: () => setLeaveModal(false) },
          {
            text: partyId ? 'Leave Party' : 'Leave Game',
            style: 'destructive',
            onPress: () => {
              setLeaveModal(false);
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#111' },
  mapWrap: { flex: 1 },
  map:     { flex: 1 },

  actionBtnWrap: { position: 'absolute', bottom: 20, left: 0, right: 0, zIndex: 15, alignItems: 'center' },
  actionBtn: {
    width: 69, height: 47, borderRadius: 12,
    borderBottomWidth: 4,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  actionBtnInactive: {
    backgroundColor: '#d4d4d8',
    borderBottomColor: '#a1a1aa',
  },

  flash: {
    position: 'absolute', top: '40%', left: 40, right: 40, zIndex: 20,
    backgroundColor: 'rgba(10,10,10,0.88)', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#29e87b',
  },
  flashText: { color: '#29e87b', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },

  cpDot: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: 'white',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, elevation: 3,
  },
  photoSpotDot: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: '#FF9600',
    backgroundColor: 'rgba(255,150,0,0.3)',
    shadowColor: '#FF9600', shadowOpacity: 0.5, shadowRadius: 4, elevation: 4,
  },

  floatingCameraWrap: { position: 'absolute', bottom: 80, right: 20, zIndex: 15 },
  floatingCameraBtn: {
    width: 69, height: 47, borderRadius: 12,
    backgroundColor: '#1CB0F6',
    borderBottomWidth: 4, borderBottomColor: '#1899D6',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  floatingCameraBtnDisabled: {
    backgroundColor: '#8dd5f5',
    borderBottomColor: '#6bbde0',
  },
});
