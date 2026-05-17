import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppText from './AppText';
import UserIcon from '../assets/User.svg';
import UserRow from './UserRow';
import { getConnections, getFriendRequests } from '../services/api';

export default function FriendsTab({ currentUsername, viewedUsername, connectionsOnly = false, onViewProfile }) {
  const targetUsername = viewedUsername ?? currentUsername;
  const tabs = connectionsOnly ? ['Friends'] : ['Friends', 'Requests'];

  const [activeTab, setActiveTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedAt = useRef(0);
  const STALE_MS = 30_000;

  const load = useCallback(async (force = false) => {
    if (!targetUsername) return;
    if (!force && Date.now() - lastFetchedAt.current < STALE_MS) return;
    setLoading(true);
    const tasks = [getConnections(targetUsername)];
    if (!connectionsOnly) tasks.push(getFriendRequests());
    const [connRes, reqRes] = await Promise.all(tasks);
    lastFetchedAt.current = Date.now();
    setConnections(connRes.data ?? []);
    setRequests(reqRes?.data ?? []);
    setLoading(false);
  }, [targetUsername, connectionsOnly]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isConnections = activeTab === 0;
  const items = isConnections ? connections : requests;

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.7}
          >
            <AppText style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </AppText>
            {activeTab === i && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#1CB0F6" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.emptyText}>
            {isConnections ? 'No friends yet. Search for players to add them.' : 'No pending requests.'}
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, idx) => (
            <React.Fragment key={item.friendshipId}>
              <View style={styles.rowWrap}>
                <UserRow
                  username={item.username}
                  avatarId={item.avatarId}
                  onPress={
                    onViewProfile
                      ? () => onViewProfile(item.username, !isConnections, item.avatarId)
                      : undefined
                  }
                />
              </View>
              {idx < items.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },

  tabBar: { flexDirection: 'row' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabText: { fontSize: 15, color: '#71717a', fontWeight: '500' },
  tabTextActive: { color: '#1CB0F6', fontWeight: '600' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1CB0F6',
    borderRadius: 1,
  },

  divider: { height: 1, backgroundColor: '#e4e4e7' },

  center: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: '#a1a1aa' },

  list: { paddingVertical: 4 },
  rowWrap: { paddingHorizontal: 16 },
  rowDivider: { height: 1, backgroundColor: '#f4f4f5', marginHorizontal: 16 },
});
