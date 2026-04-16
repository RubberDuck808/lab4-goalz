import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import BottomNavBar from '../components/BottomNavBar';
import FriendsTab from '../components/FriendsTab';
import StatisticsCard from '../components/StatisticsCard';
import PlayerSearch from '../components/PlayerSearch';
import GameButtons from '../components/GameButtons';
import SettingsIcon from '../assets/Settings.svg';
import { getUser } from '../services/session';
import { acceptFriendRequest, declineFriendRequest, getConnections, removeConnection } from '../services/api';

export default function ProfilePage({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const viewedUsername = route?.params?.username;
  const incomingRequest = route?.params?.incomingRequest === true;
  const isOther = !!viewedUsername && viewedUsername !== user?.username;

  useEffect(() => {
    if (!isOther || !user?.username || !viewedUsername) return;
    getConnections(user.username).then(res => {
      setIsFriend((res.data ?? []).some(c => c.username === viewedUsername));
    });
  }, [isOther, user?.username, viewedUsername]);

  function openProfile(username, incoming) {
    navigation.push('Profile', { username, incomingRequest: !!incoming });
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

      <View style={styles.infoRow}>
        <View style={styles.textBlock}>
          <Text style={styles.username}>{viewedUsername ?? '—'}</Text>
          <Text style={styles.joined}>
            {!isOther && user?.createdAt
              ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'Joined —'}
          </Text>
          <Text style={styles.badges}>Badges 0</Text>
        </View>
        <Image source={require('../assets/UserAvatar_1.png')} style={styles.avatar} resizeMode="contain" />
      </View>

      <View style={styles.btnRow}>
        {isOther ? (
          incomingRequest ? (
            <View style={styles.actionRow}>
              <GameButtons variant="accept" size="half" onPress={handleAccept} style={styles.actionBtn}>✓</GameButtons>
              <GameButtons variant="decline" size="half" onPress={handleDeny} style={styles.actionBtn}>✕</GameButtons>
            </View>
          ) : isFriend ? (
            <GameButtons variant="decline" size="half" onPress={handleRemoveFriend}>Remove Friend</GameButtons>
          ) : (
            <View style={{ width: 156 }} />
          )
        ) : (
          <GameButtons variant="task" size="half">Edit Profile</GameButtons>
        )}
        <View style={{ width: 156 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <StatisticsCard />

        <Text style={styles.sectionTitle}>Friends</Text>
        {!isOther && <PlayerSearch currentUsername={user?.username} />}
        <FriendsTab
          currentUsername={user?.username}
          viewedUsername={viewedUsername}
          connectionsOnly={isOther}
          onViewProfile={openProfile}
        />
      </View>

      <BottomNavBar
        onNavigateHome={() => navigation.popTo('Home')}
        onNavigateToProfile={() => navigation.popTo('Profile', { username: undefined, incomingRequest: false })}
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

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, gap: 12 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#27272a', marginBottom: 4 },
});
