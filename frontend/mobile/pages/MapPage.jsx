import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import PageHeader from '../components/PageHeader';
import { useGameContext } from '../context/GameContext';
import { visitCheckpoint } from '../services/api/partyApi';
import {
  ARBORETUM_REGION,
  VISIT_RADIUS_METERS,
  haversineMeters,
  safeParseGeometry,
  extractRings,
  coordsToLatLng,
  pickCpForZone,
  nearestLocked,
  checkpointColor,
} from './map/mapHelpers';
import ZoneLayer from './map/ZoneLayer';
import MapHud from './map/MapHud';
import ElementModal from './map/ElementModal';
import SensorModal from './map/SensorModal';

export default function MapPage({ navigation, route }) {
  const fromGame = route?.params?.fromGame ?? false;
  const mapRef   = useRef(null);

  const [zones,       setZones]       = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);

  const [activeZone,       setActiveZone]       = useState(null);
  const [completedZoneIds, setCompletedZoneIds] = useState(new Set());
  const [targetCp,         setTargetCp]         = useState(null);
  const [nearTarget,       setNearTarget]        = useState(false);
  const [flashMsg,         setFlashMsg]         = useState(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const [mapReady,      setMapReady]      = useState(false);
  const [elementModal,  setElementModal]  = useState(null); // { cp, zone } | null
  const [sensorModal,   setSensorModal]   = useState(null); // { cp, zone, sensorId, sensorName } | null

  const initRef = useRef(false);
  const pendingCpRef = useRef(null);       // checkpoint to complete when map regains focus
  const completeCheckpointRef = useRef(null); // always points to latest completeCheckpoint
  const { partyId, markVisited, role } = useGameContext();

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

  // ── Location permission ─────────────────────────────────────────────────────
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().catch(() => {});
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
            setNearTarget(haversineMeters(coords, { latitude: prev.latitude, longitude: prev.longitude }) <= VISIT_RADIUS_METERS);
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
        const [zr, cr] = await Promise.all([
          fetch(`${base}/api/dashboard/zones`),
          fetch(`${base}/api/dashboard/checkpoints`),
        ]);
        if (cancelled) return;
        if (zr.ok) { const j = await zr.json(); if (!cancelled) setZones(Array.isArray(j) ? j : []); }
        if (cr.ok) { const j = await cr.json(); if (!cancelled) setCheckpoints(Array.isArray(j) ? j : []); }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Initial zone assignment ─────────────────────────────────────────────────
  useEffect(() => {
    if (!fromGame || initRef.current || !zones.length || !checkpoints.length) return;
    initRef.current = true;
    const zone = zones[Math.floor(Math.random() * zones.length)];
    setActiveZone(zone);
    setTargetCp(pickCpForZone(zone, checkpoints, role));
    flyToZone(zone);
  }, [zones, checkpoints, fromGame, role]);

  // ── Checkpoint visit ────────────────────────────────────────────────────────
  async function completeCheckpoint(cp, zone) {
    markVisited(cp.id);
    if (partyId) await visitCheckpoint(partyId, cp.id).catch(() => {});

    const newDone = new Set(completedZoneIds).add(zone.id);
    setCompletedZoneIds(newDone);
    setNearTarget(false);

    const next = nearestLocked(zone, zones, newDone);
    if (next) {
      showFlash('Zone Complete! 🎉');
      setActiveZone(next);
      setTargetCp(pickCpForZone(next, checkpoints, role));
      flyToZone(next);
    } else {
      showFlash('All zones complete! 🏆');
      setActiveZone(null);
      setTargetCp(null);
    }
  }
  completeCheckpointRef.current = completeCheckpoint;

  // Complete any checkpoint that was deferred while the camera was open.
  useFocusEffect(
    useCallback(() => {
      const pending = pendingCpRef.current;
      if (pending) {
        pendingCpRef.current = null;
        completeCheckpointRef.current(pending.cp, pending.zone);
      }
    }, [])
  );

  function handleVisit() {
    if (!targetCp || !activeZone) return;
    setNearTarget(false);
    if (targetCp.type === 'sensor') {
      setSensorModal({ cp: targetCp, zone: activeZone, sensorId: targetCp.referenceId, sensorName: targetCp.name });
    } else {
      setElementModal({ cp: targetCp, zone: activeZone });
    }
  }

  const totalZones     = zones.length;
  const remainingCount = totalZones - completedZoneIds.size;

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Map" onBack={() => navigation.goBack()} />

      <View style={styles.mapWrap}>
        {fromGame && totalZones > 0 && (
          <MapHud targetCp={targetCp} remainingCount={remainingCount} />
        )}

        {fromGame && nearTarget && targetCp && (
          <View style={styles.visitOverlay}>
            <TouchableOpacity style={styles.visitBtn} onPress={handleVisit} activeOpacity={0.85}>
              <Text style={styles.visitBtnLabel}>CHECKPOINT REACHED</Text>
              <Text style={styles.visitBtnSub}>Tap to collect</Text>
            </TouchableOpacity>
          </View>
        )}

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
            zones={zones}
            completedZoneIds={completedZoneIds}
            activeZone={activeZone}
            fromGame={fromGame}
          />

          {fromGame && targetCp?.latitude != null && (
            <Marker
              coordinate={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.cpDot, { backgroundColor: checkpointColor(targetCp) }]} />
            </Marker>
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

      <ElementModal
        visible={!!elementModal}
        onClose={() => {
          const { cp, zone } = elementModal;
          setElementModal(null);
          completeCheckpoint(cp, zone);
        }}
        onTakePhoto={() => {
          const { cp, zone } = elementModal;
          setElementModal(null);
          pendingCpRef.current = { cp, zone };
          navigation.navigate('Camera');
        }}
      />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#111' },
  mapWrap: { flex: 1 },
  map:     { flex: 1 },

  visitOverlay: { position: 'absolute', bottom: 36, left: 24, right: 24, zIndex: 10, alignItems: 'center' },
  visitBtn: {
    backgroundColor: '#29e87b', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#29e87b', shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
  },
  visitBtnLabel: { color: '#0a1a0f', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  visitBtnSub:   { color: 'rgba(10,26,15,0.6)', fontSize: 12, fontWeight: '600', marginTop: 2 },

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
});
