import React, { useState, useCallback } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GameButtons from '../components/GameButtons';
import BottomNavBar from '../components/BottomNavBar';
import AppText from '../components/AppText';
import { getUser } from '../services/session';
import { getUserStats } from '../services/api/partyApi';
import { getLeaderboard } from '../services/api';
import { computeBadges } from '../utils/badges';

const MASCOT = require('../assets/icon_white.png');

export default function HomePage({ navigation }) {
  const [user, setUser]         = useState(null);
  const [stats, setStats]       = useState(null);
  const [rank, setRank]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    getUser().then(u => {
      if (cancelled) return;
      setUser(u);
      if (!u?.username) return;
      setStatsLoading(true);
      Promise.all([
        getUserStats(undefined),
        getLeaderboard(),
      ]).then(([statsRes, lbRes]) => {
        if (cancelled) return;
        if (statsRes.success) setStats(statsRes.data);
        if (lbRes.success) {
          const entry = lbRes.data.find(e => e.username === u.username);
          setRank(entry?.rank ?? null);
        }
        setStatsLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, []));

  const badges = computeBadges(stats);
  const earnedCount = badges.filter(b => b.earned).length;
  const lockedCount = badges.length - earnedCount;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Hero */}
      <View style={styles.hero}>
        <AppText style={styles.heroTitle}>EXPLORE</AppText>
        <View style={styles.heroRow}>
          <View style={styles.greetingBlock}>
            <AppText style={styles.greeting}>Hey, {user?.username ?? '…'}!</AppText>
            <AppText style={styles.subtitle}>Ready to explore?</AppText>
          </View>
          <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
        </View>
      </View>

      {/* Content card */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Primary action */}
        <GameButtons variant="accept" onPress={() => navigation.navigate('RouteMode')}>
          Start Route
        </GameButtons>

        {/* Quick actions */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('PartyMode')}
          >
            <AppText style={styles.quickTitle}>Join Party</AppText>
            <AppText style={styles.quickSub}>Enter a code to join your group</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickCard, styles.quickCardAmber]}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('GameSetup', { singlePlayer: false })}
          >
            <AppText style={styles.quickTitle}>Create Party</AppText>
            <AppText style={styles.quickSub}>Start a session for your group</AppText>
          </TouchableOpacity>
        </View>

        {/* Your progress */}
        <View style={styles.sectionRow}>
          <AppText style={styles.sectionTitle}>Your progress</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <AppText style={styles.seeAll}>See all →</AppText>
          </TouchableOpacity>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <AppText style={styles.pillValue}>
              {statsLoading ? '—' : (stats?.gamesPlayed ?? 0)}
            </AppText>
            <AppText style={styles.pillLabel}>games</AppText>
          </View>
          <View style={[styles.pill, styles.pillAmber]}>
            <AppText style={[styles.pillValue, styles.pillValueAmber]}>
              {statsLoading ? '—' : (stats?.totalPoints ?? 0)}
            </AppText>
            <AppText style={[styles.pillLabel, styles.pillLabelAmber]}>nuts</AppText>
          </View>
          <View style={[styles.pill, styles.pillBlue]}>
            <AppText style={[styles.pillValue, styles.pillValueBlue]}>
              {statsLoading ? '—' : (rank != null ? `#${rank}` : '—')}
            </AppText>
            <AppText style={[styles.pillLabel, styles.pillLabelBlue]}>rank</AppText>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.sectionRow}>
          <AppText style={styles.sectionTitle}>Badges</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <AppText style={styles.seeAll}>See all →</AppText>
          </TouchableOpacity>
        </View>
        <View style={styles.badgeGrid}>
          {badges.map(badge => (
            <View
              key={badge.id}
              style={[styles.badgeSlot, badge.earned ? styles.badgeSlotEarned : styles.badgeSlotLocked]}
            >
              <AppText style={[styles.badgeLabel, !badge.earned && styles.badgeLabelLocked]}>
                {badge.label}
              </AppText>
            </View>
          ))}
        </View>
        {lockedCount > 0 && (
          <AppText style={styles.badgeHint}>
            {lockedCount} more {lockedCount === 1 ? 'badge' : 'badges'} to unlock
          </AppText>
        )}
      </ScrollView>

      <BottomNavBar
        activeScreen="home"
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1A3A2A' },

  hero: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#1A3A2A',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingBlock: { flex: 1, gap: 6 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.78)' },
  mascot: { width: 120, height: 120 },

  scroll: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },

  // ── Quick actions ──
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  quickCardAmber: {
    backgroundColor: '#FFF8EE',
    borderWidth: 1.5,
    borderColor: '#FFC107',
  },
  quickTitle: { fontSize: 14, fontWeight: '700', color: '#27272A' },
  quickSub: { fontSize: 12, color: '#71717A', lineHeight: 16 },

  // ── Section header ──
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#27272A' },
  seeAll: { fontSize: 13, color: '#71717A' },

  // ── Progress pills ──
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pillAmber: { backgroundColor: '#FFF3D4' },
  pillBlue:  { backgroundColor: '#DDF4FF' },
  pillValue: { fontSize: 18, fontWeight: '700', color: '#27272A' },
  pillValueAmber: { color: '#CC8B00' },
  pillValueBlue:  { color: '#1CB0F6' },
  pillLabel: { fontSize: 11, color: '#71717A', marginTop: 2 },
  pillLabelAmber: { color: '#CC8B00' },
  pillLabelBlue:  { color: '#1CB0F6' },

  // ── Badges ──
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeSlot: {
    width: '47%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  badgeSlotEarned: {
    backgroundColor: '#FFF3D4',
    borderWidth: 1.5,
    borderColor: '#FFC107',
  },
  badgeSlotLocked: {
    backgroundColor: '#F4F4F5',
    opacity: 0.5,
  },
  badgeLabel: { fontSize: 13, fontWeight: '600', color: '#27272A', textAlign: 'center' },
  badgeLabelLocked: { color: '#A1A1AA' },
  badgeHint: { fontSize: 12, color: '#A1A1AA', textAlign: 'center', marginTop: -4 },
});
