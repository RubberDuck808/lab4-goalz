import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import PageHeader from '../components/PageHeader';
import { useGameContext } from '../context/GameContext';
import { visitCheckpoint } from '../services/api/partyApi';

const ARBORETUM_REGION = {
  latitude: 48.1468,
  longitude: 16.3852,
  latitudeDelta: 0.012,
  longitudeDelta: 0.015,
};

const VISIT_RADIUS_METERS = 30;

// ── Zone styles ───────────────────────────────────────────────────────────────
const STYLE_ACTIVE    = { strokeColor: '#29e87b', strokeWidth: 3,   fillColor: 'rgba(41,232,123,0.18)' };
const STYLE_DONE      = { strokeColor: '#1A5C2E', strokeWidth: 2,   fillColor: 'rgba(26,92,46,0.22)' };
const STYLE_LOCKED    = { strokeColor: '#1e1e1e', strokeWidth: 2,   fillColor: 'rgba(10,10,10,0.55)' };

// ── Pure helpers ──────────────────────────────────────────────────────────────
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function safeParseGeometry(raw) {
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
  return raw && typeof raw === 'object' ? raw : null;
}

function coordsToLatLng(ring) {
  return ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

function extractRings(geometry) {
  switch (geometry?.type) {
    case 'Polygon':      return [geometry.coordinates[0]];
    case 'MultiPolygon': return geometry.coordinates.map(p => p[0]);
    default:             return [];
  }
}

function ringCentroid(ring) {
  if (!ring?.length) return null;
  const sum = ring.reduce((a, [lng, lat]) => ({ lat: a.lat + lat, lng: a.lng + lng }), { lat: 0, lng: 0 });
  return { latitude: sum.lat / ring.length, longitude: sum.lng / ring.length };
}

function zoneCentroid(zone) {
  const geom = safeParseGeometry(zone?.boundary);
  if (!geom) return null;
  return ringCentroid(extractRings(geom)[0]);
}

function pickCpForZone(zone, allCps, role) {
  const cps = allCps.filter(cp => {
    if (cp.zoneId !== zone.id) return false;
    if (role === 'Scout')      return cp.type === 'sensor';
    if (role === 'Trailblazer') return cp.type !== 'sensor';
    return true;
  });
  return cps.length ? cps[Math.floor(Math.random() * cps.length)] : null;
}

function nearestLocked(fromZone, allZones, doneIds) {
  const locked = allZones.filter(z => !doneIds.has(z.id) && z.id !== fromZone.id);
  if (!locked.length) return null;
  const from = zoneCentroid(fromZone);
  if (!from) return locked[0];
  return locked.sort((a, b) => {
    const ca = zoneCentroid(a), cb = zoneCentroid(b);
    return (ca ? haversineMeters(from, ca) : Infinity) - (cb ? haversineMeters(from, cb) : Infinity);
  })[0];
}

// ── Map rendering helpers ─────────────────────────────────────────────────────
function renderZone(zone, idx, status) {
  const geom = safeParseGeometry(zone?.boundary);
  if (!geom) return null;
  const style = status === 'active' ? STYLE_ACTIVE : status === 'done' ? STYLE_DONE : STYLE_LOCKED;
  const rings = extractRings(geom);

  const polys = rings.map((ring, ri) => (
    <Polygon
      key={`z-${idx}-${ri}`}
      coordinates={coordsToLatLng(ring)}
      strokeColor={style.strokeColor}
      strokeWidth={style.strokeWidth}
      fillColor={style.fillColor}
    />
  ));

  if (status === 'locked') {
    const center = ringCentroid(rings[0]);
    return [
      ...polys,
      center && (
        <Marker key={`lock-${idx}`} coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.lockBadge}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
        </Marker>
      ),
    ];
  }

  if (status === 'done') {
    const center = ringCentroid(rings[0]);
    return [
      ...polys,
      center && (
        <Marker key={`done-${idx}`} coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.doneBadge}>
            <Text style={styles.doneEmoji}>✓</Text>
          </View>
        </Marker>
      ),
    ];
  }

  return polys;
}

function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1';
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661';
  if (cp.elementTypeId === 2) return '#3B82F6';
  return '#EF4444';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapPage({ navigation, route }) {
  const fromGame = route?.params?.fromGame ?? false;
  const mapRef   = useRef(null);

  const [zones,       setZones]       = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);

  // Game state
  const [activeZone,       setActiveZone]       = useState(null);
  const [completedZoneIds, setCompletedZoneIds] = useState(new Set());
  const [targetCp,         setTargetCp]         = useState(null);
  const [nearTarget,       setNearTarget]        = useState(false);
  const [flashMsg,         setFlashMsg]         = useState(null); // "Zone Complete!" etc.
  const flashAnim = useRef(new Animated.Value(0)).current;

  const initRef = useRef(false);
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

  // ── Zone complete → unlock nearest ─────────────────────────────────────────
  async function handleVisit() {
    if (!targetCp || !activeZone) return;

    markVisited(targetCp.id);
    if (partyId) await visitCheckpoint(partyId, targetCp.id).catch(() => {});

    const newDone = new Set(completedZoneIds).add(activeZone.id);
    setCompletedZoneIds(newDone);
    setNearTarget(false);

    const next = nearestLocked(activeZone, zones, newDone);
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

  // ── Derived counts ──────────────────────────────────────────────────────────
  const totalZones     = zones.length;
  const doneCount      = completedZoneIds.size;
  const remainingCount = totalZones - doneCount;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Map" onBack={() => navigation.goBack()} />

      {/* ── HUD bar ── */}
      {fromGame && totalZones > 0 && (
        <View style={styles.hud}>
          <View style={styles.hudLeft}>
            <Text style={styles.hudCount}>{remainingCount}</Text>
            <Text style={styles.hudLabel}>{remainingCount === 1 ? 'zone left' : 'zones left'}</Text>
          </View>
          <View style={styles.hudDots}>
            {zones.map(z => {
              const done   = completedZoneIds.has(z.id);
              const active = activeZone?.id === z.id;
              return (
                <View
                  key={z.id}
                  style={[styles.hudDot, done && styles.hudDotDone, active && styles.hudDotActive]}
                />
              );
            })}
          </View>
          <Text style={styles.hudFraction}>{doneCount}/{totalZones}</Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        {/* ── Near-checkpoint button ── */}
        {fromGame && nearTarget && targetCp && (
          <View style={styles.visitOverlay}>
            <TouchableOpacity style={styles.visitBtn} onPress={handleVisit} activeOpacity={0.85}>
              <Text style={styles.visitBtnLabel}>CHECKPOINT REACHED</Text>
              <Text style={styles.visitBtnSub}>Tap to collect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Flash message ── */}
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
        >
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            maximumZ={20}
            flipY={false}
            shouldReplaceMapContent
            tileCachePath={FileSystem.cacheDirectory + 'map-tiles/'}
            tileCacheMaxAge={604800}
          />

          {zones.map((zone, i) => {
            const status = completedZoneIds.has(zone.id) ? 'done'
              : fromGame && activeZone?.id === zone.id ? 'active'
              : fromGame ? 'locked'
              : 'active';
            return renderZone(zone, i, status);
          })}

          {/* show target checkpoint dot */}
          {fromGame && targetCp?.latitude != null && (
            <Marker
              coordinate={{ latitude: targetCp.latitude, longitude: targetCp.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={[styles.cpDot, { backgroundColor: checkpointColor(targetCp) }]} />
            </Marker>
          )}

          {/* non-game mode: show all checkpoints */}
          {!fromGame && checkpoints.map((cp, i) =>
            cp.latitude != null && (
              <Marker key={`cp-${i}`} coordinate={{ latitude: cp.latitude, longitude: cp.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.cpDot, { backgroundColor: checkpointColor(cp) }]} />
              </Marker>
            )
          )}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#111' },
  mapWrap: { flex: 1 },
  map:     { flex: 1 },

  // ── HUD ──────────────────────────────────────────────────────────────────────
  hud: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111', paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  hudLeft:     { alignItems: 'flex-start', minWidth: 52 },
  hudCount:    { color: '#29e87b', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  hudLabel:    { color: '#666', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  hudDots:     { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center' },
  hudDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333', borderWidth: 1, borderColor: '#444' },
  hudDotDone:  { backgroundColor: '#1A5C2E', borderColor: '#29e87b' },
  hudDotActive:{ backgroundColor: '#29e87b', borderColor: '#29e87b', shadowColor: '#29e87b', shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
  hudFraction: { color: '#555', fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },

  // ── Visit button ─────────────────────────────────────────────────────────────
  visitOverlay: { position: 'absolute', bottom: 36, left: 24, right: 24, zIndex: 10, alignItems: 'center' },
  visitBtn: {
    backgroundColor: '#29e87b', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#29e87b', shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
  },
  visitBtnLabel: { color: '#0a1a0f', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  visitBtnSub:   { color: 'rgba(10,26,15,0.6)', fontSize: 12, fontWeight: '600', marginTop: 2 },

  // ── Flash ─────────────────────────────────────────────────────────────────────
  flash: {
    position: 'absolute', top: '40%', left: 40, right: 40, zIndex: 20,
    backgroundColor: 'rgba(10,10,10,0.88)', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#29e87b',
  },
  flashText: { color: '#29e87b', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },

  // ── Zone badges ───────────────────────────────────────────────────────────────
  lockBadge: {
    backgroundColor: 'rgba(10,10,10,0.82)', borderRadius: 22, padding: 8,
    borderWidth: 1.5, borderColor: '#333',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 6, elevation: 5,
  },
  lockEmoji: { fontSize: 18 },

  doneBadge: {
    backgroundColor: 'rgba(26,92,46,0.9)', borderRadius: 22, width: 34, height: 34,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#29e87b',
    shadowColor: '#29e87b', shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  doneEmoji: { color: '#29e87b', fontSize: 16, fontWeight: '900' },

  // ── Checkpoint dot ────────────────────────────────────────────────────────────
  cpDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: 'white',
           shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },
});
