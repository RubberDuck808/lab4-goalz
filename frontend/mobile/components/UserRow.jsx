import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function UserRow({ username, rank, score, badge, onPress }) {
  const content = (
    <View style={styles.row}>
      {rank != null && <Text style={styles.rank}>{rank}</Text>}
      <View style={styles.avatar} />
      <Text style={styles.name}>{username}</Text>
      {score != null && <Text style={styles.score}>{score} pts</Text>}
      {badge != null && <Text style={styles.badge}>{badge}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rank: {
    width: 20,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textAlign: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d4d4d8',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#27272a',
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  badge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },
});
