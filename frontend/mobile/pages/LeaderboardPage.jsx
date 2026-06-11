import React, { useState, useEffect } from 'react';
import {
  View, FlatList, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import AppText from '../components/AppText';
import { getLeaderboard, getConnections } from '../services/api';
import { getUser } from '../services/session';
import { getAvatar } from '../utils/avatars';

const FILTERS = [
  { id: 'alltime', label: 'All time' },
  { id: 'month',   label: 'This month' },
  { id: 'week',    label: 'This week' },
  { id: 'friends', label: 'Friends' },
];

// Podium display order: left=2nd, center=1st, right=3rd
const PODIUM_DISPLAY = [
  { rankIdx: 1, avatarSize: 56, barHeight: 60 },
  { rankIdx: 0, avatarSize: 72, barHeight: 88 },
  { rankIdx: 2, avatarSize: 50, barHeight: 44 },
];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage({ navigation }) {
  const [filter, setFilter]               = useState('alltime');
  const [entries, setEntries]             = useState([]);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [friendSet, setFriendSet]         = useState(new Set());
  const [currentUsername, setCurrentUsername] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [listLoading, setListLoading]     = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [userRes, lbRes] = await Promise.all([getUser(), getLeaderboard()]);
      if (cancelled) return;
      const username = userRes?.username ?? null;
      setCurrentUsername(username);
      if (lbRes.success) {
        setEntries(lbRes.data);
        setAllTimeEntries(lbRes.data);
      } else {
        setError("Couldn't reach the leaderboard. Try again.");
      }
      if (username) {
        getConnections(username).then(res => {
          if (!cancelled && res.success) {
            setFriendSet(new Set(res.data.map(f => f.username)));
          }
        });
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleFilterChange(newFilter) {
    if (newFilter === filter) return;
    setFilter(newFilter);
    setError('');

    if (newFilter === 'friends') {
      const filtered = allTimeEntries.filter(
        e => e.username === currentUsername || friendSet.has(e.username)
      );
      setEntries(filtered.map((e, i) => ({ ...e, rank: i + 1 })));
      return;
    }

    setListLoading(true);
    const period = newFilter === 'alltime' ? null : newFilter;
    const res = await getLeaderboard(period);
    if (res.success) {
      setEntries(res.data);
      if (newFilter === 'alltime') setAllTimeEntries(res.data);
    } else {
      setError("Couldn't load the leaderboard.");
    }
    setListLoading(false);
  }

  const podium = entries.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Blue hero ── */}
      <View style={styles.hero}>
        <AppText style={styles.heroTitle}>LEADERBOARD</AppText>

        {loading ? (
          <View style={styles.heroLoading}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : podium.length >= 3 ? (
          <View style={styles.podiumRow}>
            {PODIUM_DISPLAY.map(({ rankIdx, avatarSize, barHeight }, slotIdx) => {
              const item = podium[rankIdx];
              const isFirst = rankIdx === 0;
              return (
                <View key={slotIdx} style={styles.podiumSlot}>
                  <Image
                    source={getAvatar(item.avatarId)}
                    style={[
                      styles.podiumAvatar,
                      { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                      isFirst && styles.podiumAvatarFirst,
                    ]}
                  />
                  <AppText style={styles.podiumName} numberOfLines={1}>{item.username}</AppText>
                  {isFirst ? (
                    <AppText style={styles.podiumScore}>
                      {item.totalPoints > 0 ? `${item.totalPoints} nuts` : '—'}
                    </AppText>
                  ) : (
                    <AppText style={styles.podiumScoreDim}>—</AppText>
                  )}
                  <View style={[styles.podiumBar, { height: barHeight }]}>
                    <AppText style={styles.podiumMedal}>{MEDALS[rankIdx]}</AppText>
                  </View>
                </View>
              );
            })}
          </View>
        ) : !loading ? (
          <View style={styles.heroEmpty}>
            <AppText style={styles.heroEmptyText}>
              {filter === 'friends'
                ? 'Add friends to see how you compare.'
                : 'Not enough players yet.'}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ── White card ── */}
      <View style={styles.card}>
        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, filter === f.id && styles.chipActive]}
              onPress={() => handleFilterChange(f.id)}
              activeOpacity={0.7}
            >
              <AppText style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
                {f.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? (
          <View style={styles.center}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : entries.length === 0 && !listLoading ? (
          <View style={styles.center}>
            <AppText style={styles.emptyText}>No entries yet.</AppText>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => String(item.rank)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.rankingsHeader}>
                <AppText style={styles.rankingsTitle}>Rankings</AppText>
                <AppText style={styles.rankingsCount}>{entries.length} players</AppText>
              </View>
            }
            renderItem={({ item, index }) => {
              const isTop3 = index < 3;
              const isMe = item.username === currentUsername;
              const isLast = index === entries.length - 1;
              const scoreLabel = item.totalPoints === 0 ? '—' : `${item.totalPoints} nuts`;
              return (
                <View>
                  <View style={[
                    styles.rowWrap,
                    isTop3 && styles.rowTop3,
                    isMe && styles.rowHighlight,
                  ]}>
                    <AppText style={styles.rankNum}>{item.rank}</AppText>
                    <Image source={getAvatar(item.avatarId)} style={styles.rowAvatar} />
                    <AppText style={styles.rowName}>{item.username}</AppText>
                    {isMe && (
                      <View style={styles.youBadge}>
                        <AppText style={styles.youText}>you</AppText>
                      </View>
                    )}
                    <AppText style={[styles.rowScore, item.totalPoints === 0 && styles.rowScoreDim]}>
                      {scoreLabel}
                    </AppText>
                  </View>
                  {!isLast && (
                    index === 2
                      ? <View style={styles.top3Divider} />
                      : <View style={styles.divider} />
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      <BottomNavBar
        activeScreen="leaderboard"
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile', { username: undefined, incomingRequest: false })}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#CC8B00' },

  // ── Hero ──
  hero: {
    backgroundColor: '#CC8B00',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    alignSelf: 'center',
    position: 'absolute',
    top: 12,
  },
  heroLoading: { height: 140, justifyContent: 'center' },
  heroEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  heroEmptyText: { fontSize: 14, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },

  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  podiumSlot: { alignItems: 'center', flex: 1 },
  podiumAvatar: { backgroundColor: '#2D6A4F' },
  podiumAvatarFirst: {
    borderWidth: 3,
    borderColor: '#F5A623',
  },
  podiumAvatarEmpty: { backgroundColor: 'rgba(255,255,255,0.25)' },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF3D4',
    marginBottom: 6,
  },
  podiumScoreDim: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  podiumBar: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  podiumMedal: { fontSize: 18 },

  // ── White card ──
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    overflow: 'hidden',
  },

  // ── Filter chips ──
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 24,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#FFF3D4',
    borderColor: '#FFC107',
  },
  chipText: { fontSize: 14, fontWeight: '600', color: '#71717a', textAlign: 'center' },
  chipTextActive: { color: '#CC8B00' },

  // ── Rankings ──
  rankingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  rankingsTitle: { fontSize: 16, fontWeight: '700', color: '#27272a' },
  rankingsCount: { fontSize: 13, color: '#71717a' },

  listContent: { paddingBottom: 16 },

  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowTop3: { backgroundColor: '#fffbeb' },
  rowHighlight: { backgroundColor: '#eff6ff' },
  rankNum: { width: 20, fontSize: 13, fontWeight: '700', color: '#a1a1aa', textAlign: 'center' },
  rowAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d4d4d8' },
  rowName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#27272a' },
  rowScore: { fontSize: 14, fontWeight: '700', color: '#F5A623' },
  rowScoreDim: { color: '#a1a1aa', fontWeight: '400' },

  youBadge: {
    backgroundColor: '#DDF4FF',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  youText: { fontSize: 11, fontWeight: '700', color: '#0E7BB5' },

  divider: { height: 1, backgroundColor: '#f4f4f5', marginHorizontal: 16 },
  top3Divider: { height: 1, backgroundColor: '#e4e4e7', marginHorizontal: 16, marginVertical: 4 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 15, color: '#ef4444', textAlign: 'center' },
  emptyText: { fontSize: 15, color: '#71717a', textAlign: 'center' },
});
