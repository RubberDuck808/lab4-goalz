import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatisticsCard({ checkpoints = 0, picturesTaken = 0 }) {
  return (
    <View style={styles.row}>
      <View style={styles.statBox}>
        <Text style={styles.value}>{checkpoints}</Text>
        <Text style={styles.label}>Checkpoints</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.value}>{picturesTaken}</Text>
        <Text style={styles.label}>Pictures taken</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  value: { fontSize: 22, fontWeight: 'bold', color: '#27272a' },
  label: { fontSize: 13, color: '#71717a', marginTop: 2 },
});
