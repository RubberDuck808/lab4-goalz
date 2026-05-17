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
        <Stat value={stats?.totalPoints ?? 0} label="Total nuts" accent />
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <Stat value={stats?.checkpointsVisited ?? 0} label="Checkpoints" />
      <Stat value={stats?.picturesTaken      ?? 0} label="Pictures" />
      <Stat value={stats?.partiesJoined      ?? 0} label="Parties" />
      <Stat value={stats?.gamesPlayed        ?? 0} label="Games played" />
      <Stat value={stats?.totalPoints        ?? 0} label="Total nuts" accent />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  statBox: {
    width: '47%',
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statBoxAccent: {
    width: '100%',
    backgroundColor: '#1CB0F6',
  },
  value: { fontSize: 22, fontWeight: 'bold', color: '#27272a' },
  valueAccent: { color: '#fff' },
  label: { fontSize: 13, color: '#71717a', marginTop: 2 },
  labelAccent: { color: 'rgba(255,255,255,0.85)' },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
});
