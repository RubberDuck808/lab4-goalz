import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/AppText';
import PageHeader from '../components/PageHeader';
import BottomNavBar from '../components/BottomNavBar';
import FriendsTab from '../components/FriendsTab';
import StatisticsCard from '../components/StatisticsCard';
import PlayerSearch from '../components/PlayerSearch';
import GameButtons from '../components/GameButtons';
import SettingsIcon from '../assets/Settings.svg';
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
  // Fetch stats whenever the profile subject is known
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
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Profile" onBack={isOther ? () => navigation.goBack() : undefined} />

      {!isOther && (
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <SettingsIcon width={24} height={24} />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoRow}>
          <View style={styles.textBlock}>
            <AppText style={styles.username}>{viewedUsername ?? user?.username ?? '—'}</AppText>
            <AppText style={styles.joined}>
              {!isOther && user?.createdAt
                ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                : 'Joined —'}
            </AppText>
            <AppText style={styles.badges}>Badges 0</AppText>
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
  safe: { flex: 1, backgroundColor: '#fff' },
  settingsBtn: {
    position: 'absolute',
    top: 87,
    right: 24,
    width: 24,
    height: 24,
    zIndex: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 28, marginTop: 16 },
  textBlock: { flex: 1, gap: 4 },
  username: { fontSize: 28, fontWeight: 'bold', color: '#27272a' },
  joined: { fontSize: 14, color: '#71717a' },
  badges: { fontSize: 22, fontWeight: 'bold', color: '#27272a', marginTop: 4 },
  avatar: { width: 160, height: 160, borderRadius: 16 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: -50 },
  actionRow: { flexDirection: 'row', gap: 16, width: 156, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { width: 70 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, gap: 12 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#27272a' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, color: '#71717a' },
});
