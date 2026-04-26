import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';

const ARBORETUM_REGION = {
  latitude: 48.1468,
  longitude: 16.3852,
  latitudeDelta: 0.012,
  longitudeDelta: 0.015,
};

const VISIT_RADIUS_METERS = 30;

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const ZONE_STYLES = {
  boundary: { strokeColor: '#1A5C2E', strokeWidth: 3 },
  path:     { strokeColor: '#8B6914', strokeWidth: 2 },
  area:     { strokeColor: '#2D7D46', strokeWidth: 2, fillColor: 'rgba(45,125,70,0.15)' },
};

function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1';
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661';
  if (cp.elementTypeId === 2) return '#3B82F6';
  return '#EF4444';
}

function renderCheckpoint(cp, i, onPress) {
  if (cp.latitude == null || cp.longitude == null) return null;
  return (
    <Marker
      key={`cp-${i}`}
      coordinate={{ latitude: cp.latitude, longitude: cp.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress ? () => onPress(cp) : undefined}
    >
      <View style={[styles.dot, { backgroundColor: checkpointColor(cp) }]} />
    </Marker>
  );
}

function safeParseGeometry(raw) {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw && typeof raw === 'object' ? raw : null;
}

function coordsToLatLng(ring) {
  return ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

function extractRings(geometry) {
  switch (geometry?.type) {
    case 'Polygon':         return [geometry.coordinates[0]];
    case 'MultiPolygon':    return geometry.coordinates.map(p => p[0]);
    case 'LineString':      return [geometry.coordinates];
    case 'MultiLineString': return geometry.coordinates;
    default: return [];
  }
}

function renderZone(zone, zoneIndex, greyOut = false) {
  const geom = safeParseGeometry(zone?.boundary);
  if (!geom) return null;

  const type = (zone.zoneType || 'area').toLowerCase();
  const style = greyOut
    ? { strokeColor: '#c4c4c4', strokeWidth: 1, fillColor: 'rgba(180,180,180,0.08)' }
    : ZONE_STYLES[type] || ZONE_STYLES.area;
  const rings = extractRings(geom);
  const isArea = type === 'area';

  return rings.map((ring, ringIndex) => {
    const coords = coordsToLatLng(ring);
    const key = `${zoneIndex}-${ringIndex}`;
    if (isArea) {
      return (
        <Polygon
          key={key}
          coordinates={coords}
          strokeColor={style.strokeColor}
          strokeWidth={style.strokeWidth}
          fillColor={style.fillColor}
        />
      );
    }
    return (
      <Polyline
        key={key}
        coordinates={coords}
        strokeColor={style.strokeColor}
        strokeWidth={style.strokeWidth}
      />
    );
  });
}

export default function MapPage({ navigation, route }) {
  const fromGame = route?.params?.fromGame ?? false;
  const mapRef = useRef(null);

  const [zones, setZones]             = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [assignedZone, setAssignedZone]         = useState(null);
  const [targetCheckpoint, setTargetCheckpoint] = useState(null);
  const [nearTarget, setNearTarget]       = useState(false);
  const [visited, setVisited]             = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const assignedRef = useRef(false);

  // Request location permission + watch position to detect proximity to target checkpoint
  useEffect(() => {
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status !== 'granted' || !fromGame) return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        ({ coords }) => {
          setTargetCheckpoint(prev => {
            if (!prev) return prev;
            const dist = haversineMeters(coords, { latitude: prev.latitude, longitude: prev.longitude });
            setNearTarget(dist <= VISIT_RADIUS_METERS);
            return prev;
          });
        },
      ).catch(() => null);
    })();
    return () => { sub?.remove?.(); };
  }, [fromGame]);

  useEffect(() => {
    let cancelled = false;
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    (async () => {
      try {
        const [zonesRes, cpRes] = await Promise.all([
          fetch(`${baseUrl}/api/dashboard/zones`),
          fetch(`${baseUrl}/api/dashboard/checkpoints`),
        ]);
        if (cancelled) return;
        if (zonesRes.ok) {
          const json = await zonesRes.json();
          if (!cancelled) setZones(Array.isArray(json) ? json : []);
        }
        if (cpRes.ok) {
          const json = await cpRes.json();
          if (!cancelled) setCheckpoints(Array.isArray(json) ? json : []);
        }
      } catch {
        // ignore (offline / bad cert / unreachable)
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Assign zone + target checkpoint once data loads (game mode only)
  useEffect(() => {
    if (!fromGame || assignedRef.current || !zones.length) return;
    const candidates = zones.filter(z => z.zoneType !== 'boundary');
    if (!candidates.length) return;
    assignedRef.current = true;
    const zone = candidates[Math.floor(Math.random() * candidates.length)];
    setAssignedZone(zone);
    const zoneCps = checkpoints.filter(cp => cp.zoneId === zone.id);
    if (zoneCps.length) {
      setTargetCheckpoint(zoneCps[Math.floor(Math.random() * zoneCps.length)]);
    }
  }, [zones, checkpoints, fromGame]);

  // Fly to assigned zone once it's set
  useEffect(() => {
    if (!assignedZone || !mapRef.current) return;
    const geom = safeParseGeometry(assignedZone.boundary);
    if (!geom) return;
    const coords = extractRings(geom).flatMap(ring => coordsToLatLng(ring));
    if (!coords.length) return;
    // Small delay to let the map finish its initial render before animating
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [assignedZone]);

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Map" onBack={() => navigation.goBack()} />
      {fromGame && targetCheckpoint && (
        <View style={styles.visitBanner}>
          <Text style={styles.visitLabel}>VISIT</Text>
          <Text style={styles.visitName}>{targetCheckpoint.name}</Text>
        </View>
      )}
      <View style={styles.mapWrap}>
        {fromGame && nearTarget && !visited && targetCheckpoint && (
          <View style={styles.visitOverlay}>
            <TouchableOpacity
              style={styles.visitBtn}
              onPress={() => {
                if (targetCheckpoint.type === 'sensor') {
                  setShowVisitModal(true);
                } else {
                  setVisited(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.visitBtnText}>You visited {targetCheckpoint.name}</Text>
            </TouchableOpacity>
          </View>
        )}
        {fromGame && visited && (
          <View style={styles.visitOverlay}>
            <View style={[styles.visitBtn, styles.visitBtnDone]}>
              <Text style={styles.visitBtnText}>✓ Visited!</Text>
            </View>
          </View>
        )}

        <Modal visible={showVisitModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>You Visited</Text>
              <GameButtons
                variant="decline"
                onPress={() => { setShowVisitModal(false); setVisited(true); }}
              >
                Close
              </GameButtons>
            </View>
          </View>
        </Modal>
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
            const greyOut = fromGame && assignedZone != null && zone.id !== assignedZone.id && zone.zoneType !== 'boundary';
            return renderZone(zone, i, greyOut);
          })}
          {checkpoints.map((cp, i) => renderCheckpoint(cp, i, (tapped) => {
            setTargetCheckpoint(tapped);
            setShowVisitModal(true);
          }))}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#fff' },
  mapWrap:     { flex: 1 },
  map:         { flex: 1 },
  dot:         { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'white' },
  visitBanner:  { backgroundColor: '#2D7D46', paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  visitLabel:   { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  visitName:    { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  visitOverlay: { position: 'absolute', bottom: 32, left: 20, right: 20, zIndex: 10, alignItems: 'center' },
  visitBtn:     { backgroundColor: '#2D7D46', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  visitBtnDone: { backgroundColor: '#1A5C2E' },
  visitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalCard:     { width: 360, backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', gap: 24,
                   shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  modalTitle:    { fontSize: 22, fontWeight: 'bold', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: 1 },
});
