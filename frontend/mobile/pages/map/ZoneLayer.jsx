import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Polygon } from 'react-native-maps';
import { safeParseGeometry, extractRings, coordsToLatLng, ringCentroid } from './mapHelpers';

const STYLE_ACTIVE = { strokeColor: '#29e87b', strokeWidth: 3,   fillColor: 'rgba(41,232,123,0.18)' };
const STYLE_DONE   = { strokeColor: '#1A5C2E', strokeWidth: 2,   fillColor: 'rgba(26,92,46,0.22)' };
const STYLE_LOCKED = { strokeColor: '#1e1e1e', strokeWidth: 2,   fillColor: 'rgba(10,10,10,0.55)' };

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

export default function ZoneLayer({ zones, completedZoneIds, activeZone, fromGame }) {
  return zones.map((zone, i) => {
    const status = completedZoneIds.has(zone.id) ? 'done'
      : fromGame && activeZone?.id === zone.id ? 'active'
      : fromGame ? 'locked'
      : 'active';
    return renderZone(zone, i, status);
  });
}

const styles = StyleSheet.create({
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
});
