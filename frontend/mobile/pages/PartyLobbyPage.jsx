import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';
import { useGameContext } from '../context/GameContext';

export default function PartyLobbyPage({ navigation }) {
  const { partyStatus, members, resetGame } = useGameContext();

  useEffect(() => {
    if (partyStatus === 'InGame') {
      navigation.navigate('YourRole', { singlePlayer: false });
    }
  }, [partyStatus, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        {members.map((member, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.num}>{i + 1}</Text>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{member}</Text>
            <Text style={[styles.status, { color: '#1CB0F6' }]}>Joined</Text>
          </View>
        ))}
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>waiting for players ...</Text>
        </View>
      </ScrollView>
      <View style={styles.btnWrap}>
        <GameButtons variant="decline" onPress={() => { resetGame(); navigation.navigate('PartyMode'); }}>
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
