import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkpointColor } from './mapHelpers';

export default function MapHud({ targetCp, remainingCount }) {
  return (
    <View style={styles.hud}>
      {targetCp ? (
        <View style={styles.hudTarget}>
          <View style={[styles.hudTargetDot, { backgroundColor: checkpointColor(targetCp) }]} />
          <View>
            <Text style={styles.hudTargetName} numberOfLines={1}>
              {targetCp.name || targetCp.type}
            </Text>
            <Text style={styles.hudTargetLabel}>
              {targetCp.type === 'sensor' ? 'Sensor' : 'Element'}
            </Text>
          </View>
        </View>
      ) : <View style={styles.hudTarget} />}
      <View style={styles.hudRight}>
        <Text style={styles.hudCount}>{remainingCount}</Text>
        <Text style={styles.hudLabel}>{remainingCount === 1 ? 'zone left' : 'zones left'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute', top: 12, left: 16, right: 16, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  hudTarget:     { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  hudTargetDot:  {
    width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2,
  },
  hudTargetName: { fontSize: 14, fontWeight: '700', color: '#27272a', maxWidth: 160 },
  hudTargetLabel:{ fontSize: 10, fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 },
  hudRight:      { alignItems: 'flex-end' },
  hudCount:      { color: '#29e87b', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  hudLabel:      { color: '#71717a', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
});
