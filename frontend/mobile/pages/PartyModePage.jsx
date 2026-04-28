import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import { joinParty } from '../services/api';
import { useGameContext } from '../context/GameContext';

export default function PartyModePage({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setParty } = useGameContext();

  async function handleJoin() {
    if (!code.trim()) return;
    setLoading(true);
    const result = await joinParty(code.trim());
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    const { id, code: partyCode, name, members } = result.data;
    setParty(id, partyCode, name, members ?? []);
    navigation.navigate('PartyLobby');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party Mode" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput placeholder="Party code" value={code} onChangeText={setCode} />
        <View style={{ marginTop: 8 }}>
          <GameButtons variant="task" onPress={handleJoin}>
            {loading ? 'Joining...' : 'Join Party'}
          </GameButtons>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('GameSetup', { singlePlayer: false })}>
          <Text style={styles.link}>Create party</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  form: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: -60 },
  link: { fontSize: 13, color: '#3f3f46', textDecorationLine: 'underline', marginTop: 4 },
  errorText: { color: 'red', marginBottom: 8 },
});
