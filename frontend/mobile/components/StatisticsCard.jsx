import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

function Stat({ value, label, accent }) {
  return (
    <View style={[styles.statBox, accent && styles.statBoxAccent]}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value ?? '—'}</Text>
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
    </View>
  );
}

export default function StatisticsCard({ stats, loading, collapsed = false }) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color="#1CB0F6" />
      </View>
    );
  }

  if (collapsed) {
    return (
      <View style={styles.grid}>
        <Stat value={stats?.totalPoints ?? 0} label="Total points" accent />
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <Stat value={stats?.checkpointsVisited ?? 0} label="Checkpoints" />
      <Stat value={stats?.picturesTaken      ?? 0} label="Pictures" />
      <Stat value={stats?.partiesJoined      ?? 0} label="Parties" />
      <Stat value={stats?.gamesPlayed        ?? 0} label="Games played" />
      <Stat value={stats?.totalPoints        ?? 0} label="Total points" accent />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statBoxAccent: {
    width: '100%',
    backgroundColor: '#f0f9ff',
    borderColor: '#1CB0F6',
  },
  value: { fontSize: 22, fontWeight: 'bold', color: '#27272a' },
  valueAccent: { color: '#1CB0F6' },
  label: { fontSize: 13, color: '#71717a', marginTop: 2 },
  labelAccent: { color: '#0e8bc0' },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
});
