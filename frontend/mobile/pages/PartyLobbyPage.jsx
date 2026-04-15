import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';

const STATUS_COLORS = { Creator: '#58CC02', Joined: '#1CB0F6', Invited: '#FFC107' };

const MOCK_PLAYERS = [
  { id: 1, name: 'maximax', status: 'Creator' },
  { id: 2, name: 'User',    status: 'Joined'  },
  { id: 3, name: 'User',    status: 'Joined'  },
  { id: 4, name: 'User',    status: 'Joined'  },
  { id: 5, name: 'User',    status: 'Invited' },
];

export default function PartyLobbyPage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        {MOCK_PLAYERS.map(({ id, name, status }) => (
          <View key={id} style={styles.row}>
            <Text style={styles.num}>{id}</Text>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{name}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[status] }]}>{status}</Text>
          </View>
        ))}
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>waiting for players ...</Text>
        </View>
      </ScrollView>
      <View style={styles.btnWrap}>
        <GameButtons variant="decline" onPress={() => navigation.navigate('PartyMode')}>
          Leave Party
        </GameButtons>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f4f4f5', gap: 12 },
  num: { width: 16, color: '#a1a1aa', fontWeight: 'bold', fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  name: { flex: 1, fontWeight: 'bold', fontSize: 16, color: '#27272a' },
  status: { fontSize: 13, fontWeight: 'bold' },
  waiting: { backgroundColor: '#f4f4f5', borderRadius: 10, paddingVertical: 12, marginTop: 8, alignItems: 'center' },
  waitingText: { fontSize: 13, color: '#a1a1aa' },
  btnWrap: { alignItems: 'center', paddingBottom: 40 },
});
