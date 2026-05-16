import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useGameContext } from '../context/GameContext';
import { getZones, getCheckpoints } from '../services/api/partyApi';
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
} from './map/mapHelpers';
import ZoneLayer from './map/ZoneLayer';
import MapHud from './map/MapHud';
import SensorModal from './map/SensorModal';

export default function MapPage({ navigation, route }) {
  const completedRef = React.useRef(false);
  const mapRef = useRef(null);

  const [zones,       setZones]       = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);

  const [activeZone,       setActiveZone]       = useState(null);
  const [completedZoneIds, setCompletedZoneIds] = useState(new Set());
  const [targetCp,         setTargetCp]         = useState(null);
  const [pendingZoneCps,   setPendingZoneCps]   = useState([]);
  const [nearTarget,       setNearTarget]        = useState(false);
  const [flashMsg,         setFlashMsg]         = useState(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const [mapReady,    setMapReady]    = useState(false);
  const [sensorModal, setSensorModal] = useState(null);
  const [loadError,   setLoadError]   = useState(false);

  const initRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraActiveRef = useRef(false);
  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);
  const pendingPhotoCpRef = useRef(null);
  const [leaveModal, setLeaveModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  // Tracks the most-recent GPS fix so we can immediately check proximity
  // when targetCp changes (e.g. user is already standing next to the next checkpoint)
  const lastCoordsRef = useRef(null);
  const { partyId, markVisited, addPendingVisit, postQuizZoneId, setPostQuizZoneId, clearPostQuizZone, role, gameConfig,
          pendingPhotoCompletion, setPendingPhotoCompletion } = useGameContext();

  // Keep refs so effects can read current values without stale closures
  const checkpointsRef = useRef(checkpoints);
  useEffect(() => { checkpointsRef.current = checkpoints; }, [checkpoints]);
  const roleRef = useRef(role);
  useEffect(() => { roleRef.current = role; }, [role]);
  const gameZonesRef = useRef([]);
  useEffect(() => { gameZonesRef.current = gameZones; }, [gameZones]);
  // Ref so the useFocusEffect callback can read the latest value without stale closure
  const postQuizZoneIdRef = useRef(postQuizZoneId);
  useEffect(() => { postQuizZoneIdRef.current = postQuizZoneId; }, [postQuizZoneId]);
  const targetCpRef = useRef(null);
  useEffect(() => { targetCpRef.current = targetCp; }, [targetCp]);
  const completedZoneIdsRef = useRef(completedZoneIds);
  useEffect(() => { completedZoneIdsRef.current = completedZoneIds; }, [completedZoneIds]);

  // Returning from Quiz/QuizResult: reset camera state and advance to the next zone.
  useFocusEffect(
    useCallback(() => {
      setCameraActive(false);
      cameraActiveRef.current = false;

      // Re-evaluate proximity immediately — handles returning from Camera when the user
      // hasn't moved since setNearTarget(false) was called in handleVisit.
      const currentCp = targetCpRef.current;
      const coords = lastCoordsRef.current;
      if (currentCp && coords) {
        const radius = currentCp.type === 'photo' ? PHOTO_VISIT_RADIUS_METERS : VISIT_RADIUS_METERS;
        setNearTarget(haversineMeters(coords, { latitude: currentCp.latitude, longitude: currentCp.longitude }) <= radius);
      }

      const zoneId = postQuizZoneIdRef.current;
      if (!zoneId) return;
      clearPostQuizZone();
      let nextZone = gameZonesRef.current.find(z => z.id === zoneId);
      if (!nextZone) {
        // gameZones changed (e.g. SignalR config update) — fall back to nearest unlocked zone
        nextZone = gameZonesRef.current.find(z => !completedZoneIdsRef.current.has(z.id));
        if (!nextZone) return;
      }
      const cps = getCpsForZone(nextZone, checkpointsRef.current, roleRef.current);
      let nextCps = cps;
      if (cps.length === 0 && (roleRef.current === 'Trailblazer' || roleRef.current === 'Explorer')) {
        const spot = generatePhotoSpot(nextZone);
        nextCps = spot ? [spot] : [];
      }
      setActiveZone(nextZone);
      setTargetCp(nextCps[0] ?? null);
      setPendingZoneCps(nextCps.slice(1));
      const geom = safeParseGeometry(nextZone.boundary);
      if (geom) {
        const coords = extractRings(geom).flatMap(coordsToLatLng);
        if (coords.length) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 80, bottom: 120, left: 80 },
              animated: true,
            });
          }, 400);
        }
      }
    }, [clearPostQuizZone, navigation])
  );

  // Photo completion: ImageUploadScreen sets pendingPhotoCompletion=true in context
  // before navigating back. isFocused is NOT used as a gate here because the context
  // update and the navigation focus event arrive in separate React batches — gating on
  // both would cause one condition to always be false when the other first becomes true.
  // pendingPhotoCpRef is the guard against spurious calls (only set in handleVisit).
  useEffect(() => {
    if (!pendingPhotoCompletion) return;
    setPendingPhotoCompletion(false);
    if (!pendingPhotoCpRef.current) return;
    const { cp, zone } = pendingPhotoCpRef.current;
    pendingPhotoCpRef.current = null;
    completeCheckpoint(cp, zone); // sets postQuizZoneId + starts 900ms quiz timer
  }, [pendingPhotoCompletion, completeCheckpoint]);

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
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,    // update at least once per second
          distanceInterval: 1,   // and on every 1 m of movement
        },
        ({ coords }) => {
          lastCoordsRef.current = coords;
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
  }, []);

  // ── Immediate proximity check when the target checkpoint changes ────────────
  // Handles the case where the user is already standing within range of the
  // next checkpoint before the watcher fires its next update.
  useEffect(() => {
    if (!targetCp) return;
    const coords = lastCoordsRef.current;
    if (!coords) return;
    const radius = targetCp.type === 'photo' ? PHOTO_VISIT_RADIUS_METERS : VISIT_RADIUS_METERS;
    setNearTarget(haversineMeters(coords, { latitude: targetCp.latitude, longitude: targetCp.longitude }) <= radius);
  }, [targetCp]);

  // ── Fetch zones + checkpoints ───────────────────────────────────────────────
  const [fetchKey, setFetchKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    (async () => {
      try {
        const [zr, cr] = await Promise.all([getZones(), getCheckpoints()]);
        if (cancelled) return;
        if (zr.success) setZones(Array.isArray(zr.data) ? zr.data : []);
        if (cr.success) setCheckpoints(Array.isArray(cr.data) ? cr.data : []);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchKey]);

  // ── Zones visible on map — scoped to the active boundary + zoneCount cap ───
  const gameZones = React.useMemo(() => {
    const bid = gameConfig?.boundaryId;
    const scoped = bid ? zones.filter(z => z.boundaryId === bid) : zones;
    const cap = gameConfig?.zoneCount;
    if (!cap) return scoped;
    // Sort by proximity to the user so the cap keeps the nearest zones, not DB-order zones.
    if (userLocation) {
      const sorted = [...scoped].sort((a, b) => {
        const ca = zoneCentroid(a), cb = zoneCentroid(b);
        if (!ca && !cb) return 0;
        if (!ca) return 1;
        if (!cb) return -1;
        return haversineMeters(userLocation, ca) - haversineMeters(userLocation, cb);
      });
      return sorted.slice(0, cap);
    }
    return scoped.slice(0, cap);
  }, [zones, gameConfig, userLocation]);

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
    if (!role || initRef.current || !gameZones.length || !checkpoints.length) return;
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
  }, [gameZones, checkpoints, role]);

  // ── Checkpoint visit ────────────────────────────────────────────────────────
  function completeCheckpoint(cp, zone, skipQuizTimer = false) {
    markVisited(cp.id);
    addPendingVisit(cp.id); // deferred — only sent to backend on full game completion
    setNearTarget(false);

    if (pendingZoneCps.length > 0) {
      const [next, ...rest] = pendingZoneCps;
      setTargetCp(next);
      setPendingZoneCps(rest);
      showFlash(`Checkpoint done! ${rest.length + 1} left in zone`);
      return;
    }

    // Zone complete — show quiz before advancing
    const newDone = new Set(completedZoneIds).add(zone.id);
    setCompletedZoneIds(newDone);
    const nextZone = nearestLocked(zone, gameZones, newDone);
    // Store in context (survives remount): 0 = all done, N = advance to zone N
    setPostQuizZoneId(nextZone ? nextZone.id : 0);
    showFlash('Zone Complete! 🎉');
    // Photo tasks open the camera first; quiz is triggered via useFocusEffect on return
    if (!skipQuizTimer) {
      setTimeout(() => navigation.navigate('Quiz', { fromGame: true }), 900);
    }
  }

  async function handleVisit() {
    if (!targetCp || !activeZone) return;
    setNearTarget(false);
    if (targetCp.type === 'sensor') {
      setSensorModal({ cp: targetCp, zone: activeZone, sensorId: targetCp.referenceId, sensorName: targetCp.name });
    } else if (targetCp.type === 'photo') {
      // Store cp/zone for completion after upload — checkpoint is only marked
      // done once useFocusEffect sees photoUploaded=true on return from ImageUpload.
      pendingPhotoCpRef.current = { cp: targetCp, zone: activeZone };
      cameraActiveRef.current = true;
      setCameraActive(true);
      navigation.navigate('Camera', { gps: null });
    } else {
      completeCheckpoint(targetCp, activeZone);
    }
  }

  const totalZones     = gameZones.length;
  const remainingCount = totalZones - completedZoneIds.size;

  const sensorsLeft = React.useMemo(() => {
    // Sensors still pending in the current zone
    const currentSensors =
      (targetCp?.type === 'sensor' ? 1 : 0) +
      pendingZoneCps.filter(cp => cp.type === 'sensor').length;
    // Sensors in zones not yet started
    const futureSensors = gameZones
      .filter(z => !completedZoneIds.has(z.id) && z.id !== activeZone?.id)
      .flatMap(z => getCpsForZone(z, checkpoints, role))
      .filter(cp => cp.type === 'sensor').length;
    return currentSensors + futureSensors;
  }, [targetCp, pendingZoneCps, gameZones, completedZoneIds, activeZone, checkpoints, role]);

  function handleLeaveGame() {
    setLeaveModal(true);
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Map" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Text style={{ fontSize: 16, color: '#3f3f46', textAlign: 'center' }}>
            Failed to load map data.
          </Text>
          <TouchableOpacity
            onPress={() => setFetchKey(k => k + 1)}
            style={{ backgroundColor: '#1CB0F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader
        title="Map"
        onBack={handleLeaveGame}
        variant="cancel"
      />

      <View style={styles.mapWrap}>
        {/* Tile loading overlay — prevents the black mapType="none" canvas from showing */}
        {!mapReady && (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#1CB0F6" />
          </View>
        )}
        {totalZones > 0 && (
          <MapHud
            targetCp={targetCp}
            remainingCount={remainingCount}
            zoneCpsLeft={pendingZoneCps.length + (targetCp ? 1 : 0)}
            sensorsLeft={sensorsLeft}
          />
        )}

        {targetCp && (() => {
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
            zones={gameZones}
            completedZoneIds={completedZoneIds}
            activeZone={activeZone}
          />

          {targetCp?.latitude != null && targetCp.type !== 'photo' && (
            <Marker
              coordinate={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.cpDot, { backgroundColor: checkpointColor(targetCp) }]} />
            </Marker>
          )}

          {targetCp?.type === 'photo' && targetCp.latitude != null && (
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
  safe:    { flex: 1, backgroundColor: '#e8ede8' },
  mapWrap: { flex: 1, backgroundColor: '#e8ede8' },
  map:     { flex: 1 },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#e8ede8',
    alignItems: 'center',
    justifyContent: 'center',
  },

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

});
