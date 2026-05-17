import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/AppText';
import BottomNavBar from '../components/BottomNavBar';
import FriendsTab from '../components/FriendsTab';
import StatisticsCard from '../components/StatisticsCard';
import PlayerSearch from '../components/PlayerSearch';
import GameButtons from '../components/GameButtons';
import { getUser } from '../services/session';
import { acceptFriendRequest, declineFriendRequest, getConnections, removeConnection } from '../services/api';
import { getUserStats } from '../services/api/partyApi';
import { getAvatar } from '../utils/avatars';

export default function ProfilePage({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(false);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    getUser().then(u => { if (!cancelled) setUser(u); });
    return () => { cancelled = true; };
  }, []));

  const viewedUsername = route?.params?.username;
  useEffect(() => {
    const target = viewedUsername || user?.username;
    if (!target) return;
    setStatsLoading(true);
    getUserStats(viewedUsername || undefined)
      .then(res => { if (res.success) setStats(res.data); })
      .finally(() => setStatsLoading(false));
  }, [viewedUsername, user?.username]);

  const incomingRequest = route?.params?.incomingRequest === true;
  const viewedAvatarId = route?.params?.avatarId ?? 1;
  const isOther = !!viewedUsername && viewedUsername !== user?.username;

  useEffect(() => {
    if (!isOther || !user?.username || !viewedUsername) return;
    let cancelled = false;
    getConnections(user.username).then(res => {
      if (!cancelled) setIsFriend((res.data ?? []).some(c => c.username === viewedUsername));
    });
    return () => { cancelled = true; };
  }, [isOther, user?.username, viewedUsername]);

  function openProfile(username, incoming, avatarId) {
    navigation.push('Profile', { username, incomingRequest: !!incoming, avatarId });
  }

  async function handleAccept() {
    if (!viewedUsername) return;
    await acceptFriendRequest(viewedUsername);
    navigation.goBack();
  }

  async function handleDeny() {
    if (!viewedUsername) return;
    await declineFriendRequest(viewedUsername);
    navigation.goBack();
  }

  async function handleRemoveFriend() {
    if (!viewedUsername) return;
    await removeConnection(viewedUsername);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <View style={styles.heroNav}>
          {isOther ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtn} />
          )}
          <AppText style={styles.heroTitle}>PROFILE</AppText>
          {!isOther ? (
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtn} />
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.textBlock}>
            <AppText style={styles.username}>{viewedUsername ?? user?.username ?? '—'}</AppText>
            <AppText style={styles.joined}>
              {!isOther && user?.createdAt
                ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                : 'Joined —'}
            </AppText>
            <AppText style={styles.badgesEmpty}>No badges yet</AppText>
          </View>
          <Image source={getAvatar(isOther ? viewedAvatarId : user?.avatarId)} style={styles.avatar} resizeMode="contain" />
        </View>

        {isOther && (
          <View style={styles.btnRow}>
            {incomingRequest ? (
              <View style={styles.actionRow}>
                <GameButtons variant="accept" size="half" onPress={handleAccept} style={styles.actionBtn}>✓</GameButtons>
                <GameButtons variant="decline" size="half" onPress={handleDeny} style={styles.actionBtn}>✕</GameButtons>
              </View>
            ) : isFriend ? (
              <GameButtons variant="decline" size="half" onPress={handleRemoveFriend}>Remove Friend</GameButtons>
            ) : (
              <View style={{ width: 156 }} />
            )}
            <View style={{ width: 156 }} />
          </View>
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.cardWrap}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.sectionRow}>
              <AppText style={styles.sectionTitle}>Statistics</AppText>
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => setStatsExpanded(v => !v)}>
                <AppText style={styles.seeAllText}>{statsExpanded ? 'Show less' : 'See all'}</AppText>
                <Ionicons name={statsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#71717a" />
              </TouchableOpacity>
            </View>
            <StatisticsCard stats={stats} loading={statsLoading} collapsed={!statsExpanded} />

            <AppText style={styles.sectionTitle}>Friends</AppText>
            {!isOther && <PlayerSearch currentUsername={user?.username} />}
            <FriendsTab
              currentUsername={user?.username}
              viewedUsername={viewedUsername}
              connectionsOnly={isOther}
              onViewProfile={openProfile}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNavBar
        activeScreen="profile"
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile', { username: undefined, incomingRequest: false })}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1453A3' },

  hero: { backgroundColor: '#1453A3', paddingHorizontal: 24, paddingBottom: 40 },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  textBlock: { flex: 1, gap: 4, paddingTop: 8 },
  username: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  joined: { fontSize: 14, color: 'rgba(255,255,255,0.78)' },
  badgesEmpty: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  avatar: { width: 120, height: 120, borderRadius: 9999, overflow: 'hidden', backgroundColor: '#2D6A4F' },

  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: -20 },
  actionRow: { flexDirection: 'row', gap: 16, width: 156, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { width: 70 },

  cardWrap: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 12 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#27272a' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, color: '#71717a' },
});
