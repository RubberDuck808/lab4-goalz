import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getAvatar } from '../utils/avatars';
import AppText from './AppText';

export default function UserRow({ username, rank, score, badge, onPress, avatarId }) {
  const content = (
    <View style={styles.row}>
      {rank != null && <AppText style={styles.rank}>{rank}</AppText>}
      <Image source={getAvatar(avatarId)} style={styles.avatar} />
      <AppText style={styles.name}>{username}</AppText>
      {score != null && <AppText style={styles.score}>{score} pts</AppText>}
      {badge != null && <AppText style={styles.badge}>{badge}</AppText>}
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
    overflow: 'hidden',
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
