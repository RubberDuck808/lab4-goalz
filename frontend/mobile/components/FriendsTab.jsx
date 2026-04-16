import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import UserIcon from '../assets/User.svg';
import { getConnections, getFriendRequests } from '../services/api';

const VISIBLE_LIMIT = 3;

function Avatar() {
  return <View style={styles.avatar} />;
}

function FriendRow({ username, onAction, actionLabel }) {
  return (
    <View style={styles.row}>
      <Avatar />
      <Text style={styles.name}>{username}</Text>
      <TouchableOpacity style={styles.actionBtn} onPress={onAction} accessibilityLabel={actionLabel}>
        <UserIcon width={22} height={22} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );
}

export default function FriendsTab({ currentUsername, viewedUsername, connectionsOnly = false, onViewProfile }) {
  const targetUsername = viewedUsername ?? currentUsername;
  const tabs = connectionsOnly ? ['Connections'] : ['Connections', 'Requests'];

  const [activeTab, setActiveTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!targetUsername) return;
    setLoading(true);
    const tasks = [getConnections(targetUsername)];
    if (!connectionsOnly) tasks.push(getFriendRequests());
    const [connRes, reqRes] = await Promise.all(tasks);
    setConnections(connRes.data ?? []);
    setRequests(reqRes?.data ?? []);
    setLoading(false);
  }, [targetUsername, connectionsOnly]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isConnections = activeTab === 0;
  const items = isConnections ? connections : requests;
  const visible = items.slice(0, VISIBLE_LIMIT);
  const extra = items.length - VISIBLE_LIMIT;

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
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === i && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {isConnections ? 'No connections yet' : 'No pending requests'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visible.map((item, idx) => (
            <React.Fragment key={item.friendshipId}>
              <FriendRow
                username={item.username}
                actionLabel={isConnections ? 'View profile' : 'View requester profile'}
                onAction={
                  isConnections
                    ? (onViewProfile ? () => onViewProfile(item.username, false) : undefined)
                    : (onViewProfile ? () => onViewProfile(item.username, true) : undefined)
                }
              />
              {idx < visible.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}

          {extra > 0 && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.moreRow}>
                <Text style={styles.moreText}>{extra}+</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 361,
    height: 215,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
    alignSelf: 'center',
  },

  tabBar: { flexDirection: 'row' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabText: { fontSize: 15, color: '#71717a', fontWeight: '500' },
  tabTextActive: { color: '#3b82f6', fontWeight: '600' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 1,
  },

  divider: { height: 1, backgroundColor: '#e4e4e7' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: '#a1a1aa' },

  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  rowDivider: { height: 1, backgroundColor: '#f4f4f5', marginHorizontal: 16 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d4d4d8' },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: '#27272a' },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreRow: { alignItems: 'center', paddingVertical: 8 },
  moreText: { fontSize: 14, color: '#71717a', fontWeight: '500' },
});
