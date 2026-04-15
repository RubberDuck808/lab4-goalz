import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import BottomNavBar from '../components/BottomNavBar';

export default function ProfilePage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Profile" />

      <View style={styles.infoRow}>
        <View style={styles.textBlock}>
          <Text style={styles.username}>Username</Text>
          <Text style={styles.joined}>Joined &lt;Month&gt; &lt;Year&gt;</Text>
          <Text style={styles.badges}>Badges 0</Text>
        </View>
        <Image source={require('../assets/UserAvatar_1.png')} style={styles.avatar} resizeMode="contain" />
      </View>

      <View style={styles.btnRow}>
        <GameButtons variant="task" size="half">Edit Profile</GameButtons>
        <View style={{ width: 156 }} />
      </View>

      <View style={{ flex: 1 }} />

      <BottomNavBar
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 28, marginTop: 16 },
  textBlock: { flex: 1, gap: 4 },
  username: { fontSize: 28, fontWeight: 'bold', color: '#27272a' },
  joined: { fontSize: 14, color: '#71717a' },
  badges: { fontSize: 22, fontWeight: 'bold', color: '#27272a', marginTop: 4 },
  avatar: { width: 160, height: 160, borderRadius: 16 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
});
