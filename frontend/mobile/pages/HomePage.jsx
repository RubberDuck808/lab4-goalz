import React, { useState, useCallback } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import BottomNavBar from '../components/BottomNavBar';
import AppText from '../components/AppText';
import StatisticsCard from '../components/StatisticsCard';
import { getUser } from '../services/session';
import { getUserStats } from '../services/api/partyApi';

const MASCOT = require('../assets/loggy_happy.png');

export default function HomePage({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    getUser().then(u => {
      if (cancelled) return;
      setUser(u);
      if (!u?.username) return;
      setStatsLoading(true);
      getUserStats(undefined)
        .then(res => { if (!cancelled && res.success) setStats(res.data); })
        .finally(() => { if (!cancelled) setStatsLoading(false); });
    });
    return () => { cancelled = true; };
  }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Home" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoRow}>
          <View style={styles.greetingBlock}>
            <AppText style={styles.greeting}>Hey, {user?.username ?? '…'}!</AppText>
            <AppText style={styles.subtitle}>Ready to explore?</AppText>
          </View>
          <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
        </View>

        <StatisticsCard stats={stats} loading={statsLoading} />

        <View style={styles.actions}>
          <GameButtons variant="accept" onPress={() => navigation.navigate('RouteMode')}>
            Start Route
          </GameButtons>
        </View>
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
  safe: { flex: 1, backgroundColor: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 20 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingBlock: { flex: 1, gap: 4 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#27272a' },
  subtitle: { fontSize: 15, color: '#71717a' },
  mascot: { width: 120, height: 120 },

  actions: { alignItems: 'center', marginTop: 8 },
});
