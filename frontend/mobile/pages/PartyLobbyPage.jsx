import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import UserRow from '../components/UserRow';
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
            <UserRow username={member} rank={i + 1} badge="Joined" />
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
  row: { borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  waiting: { backgroundColor: '#f4f4f5', borderRadius: 10, paddingVertical: 12, marginTop: 8, alignItems: 'center' },
  waitingText: { fontSize: 13, color: '#a1a1aa' },
  btnWrap: { alignItems: 'center', paddingBottom: 40 },
});
