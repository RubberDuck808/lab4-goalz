import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';
import { useGameContext } from '../context/GameContext';
import { startGame } from '../services/api/partyApi';

export default function PartyOwnerPage({ navigation }) {
  const { partyId, partyCode, partyStatus, members, resetGame } = useGameContext();

  useEffect(() => {
    if (partyStatus === 'InGame') {
      navigation.navigate('YourRole', { singlePlayer: false });
    }
  }, [partyStatus, navigation]);

  async function handleStart() {
    if (partyId) await startGame(partyId);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Party Code</Text>
          <Text style={styles.codeValue}>{partyCode}</Text>
        </View>
        <GameButtons variant="accept" onPress={handleStart} style={{ width: '100%' }}>
          Start
        </GameButtons>
        <Text style={styles.sectionLabel}>Players in party</Text>
        {members.map((member, i) => (
          <View key={i} style={styles.playerRow}>
            <Text style={styles.num}>{i + 1}</Text>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{member}</Text>
            <Text style={styles.joined}>Joined</Text>
          </View>
        ))}
        <View style={styles.extra}>
          <Text style={styles.extraText}>+5</Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <GameButtons variant="decline" onPress={() => { resetGame(); navigation.navigate('PartyMode'); }}>
            End Party
          </GameButtons>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 24, gap: 12, paddingBottom: 40 },
  codeBox: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  codeLabel: { fontSize: 13, color: '#71717a', textTransform: 'uppercase', fontWeight: 'bold' },
  codeValue: { fontSize: 32, fontWeight: 'bold', color: '#18181b', letterSpacing: 2, marginTop: 4 },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', color: '#3f3f46', textAlign: 'center', marginTop: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f4f4f5', gap: 12 },
  num: { width: 16, color: '#a1a1aa', fontWeight: 'bold', fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  name: { flex: 1, fontWeight: 'bold', fontSize: 16, color: '#27272a' },
  joined: { fontSize: 13, fontWeight: 'bold', color: '#1CB0F6' },
  extra: { backgroundColor: '#f4f4f5', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  extraText: { fontSize: 13, color: '#a1a1aa' },
});
