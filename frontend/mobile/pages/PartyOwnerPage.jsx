import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, BackHandler, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import UserRow from '../components/UserRow';
import { useGameContext } from '../context/GameContext';
import { startGame } from '../services/api/partyApi';

export default function PartyOwnerPage({ navigation }) {
  const { partyId, partyCode, partyStatus, members, resetGame, triggerPoll } = useGameContext();

  useEffect(() => {
    if (partyStatus === 'InGame') {
      navigation.navigate('YourRole', { singlePlayer: false });
    }
  }, [partyStatus, navigation]);

  const confirmCancel = useCallback(() => {
    Alert.alert(
      'End Party',
      'This will end the session for everyone.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'End Party', style: 'destructive', onPress: () => { resetGame(); navigation.navigate('PartyMode'); } },
      ]
    );
  }, [resetGame, navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        confirmCancel();
        return true;
      });
      return () => sub.remove();
    }, [confirmCancel])
  );

  async function handleShare() {
    try {
      await Share.share({ message: `Join my Goalz party! Code: ${partyCode}` });
    } catch {}
  }

  async function handleStart() {
    if (!partyId) return;
    await startGame(partyId);
    // Immediately refresh game state so the role is in context before navigation.
    triggerPoll();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party" onBack={confirmCancel} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.codeBox} onPress={handleShare} activeOpacity={0.75}>
          <Text style={styles.codeLabel}>Your code — tap to share</Text>
          <Text style={styles.codeValue}>{partyCode}</Text>
        </TouchableOpacity>
        <View style={styles.btnCenter}>
          <GameButtons variant="accept" onPress={handleStart}>
            Start
          </GameButtons>
        </View>
        <Text style={styles.sectionLabel}>In the party</Text>
        {members.map((member, i) => (
          <View key={i} style={styles.playerRow}>
            <UserRow username={member} rank={i + 1} badge="Joined" />
          </View>
        ))}
        <View style={[styles.btnCenter, { marginTop: 16 }]}>
          <GameButtons variant="decline" onPress={confirmCancel}>
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
  btnCenter: { alignItems: 'center' },
  codeBox: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  codeLabel: { fontSize: 13, color: '#71717a', textTransform: 'uppercase', fontWeight: 'bold' },
  codeValue: { fontSize: 32, fontWeight: 'bold', color: '#18181b', letterSpacing: 2, marginTop: 4 },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', color: '#27272a', textAlign: 'center', marginTop: 8 },
  playerRow: { borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  extra: { backgroundColor: '#f4f4f5', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  extraText: { fontSize: 13, color: '#a1a1aa' },
});
