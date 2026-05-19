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
      <PageHeader title="Party Mode" onBack={() => navigation.navigate('Home')} />
      <View style={styles.form}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput placeholder="Party code" value={code} onChangeText={setCode} style={styles.inputText} />
        <View style={{ marginTop: 8 }}>
          <GameButtons variant="task" onPress={handleJoin} textStyle={styles.buttonText}>
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
  link: { color: '#4B4B4B', fontFamily: 'Inter', fontSize: 13, fontWeight: '500', textDecorationLine: 'underline' },
  errorText: { color: 'red', marginBottom: 8 },
  subtext: { color: '#4B4B4B', textAlign: 'left', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Demi', fontSize: 16, fontWeight: '600', letterSpacing: -0.32 },
  inputText: { color: '#777', fontFamily: 'Inter', fontSize: 16, fontWeight: '500', letterSpacing: 0.48 },
  buttonText: { color: '#FFF', textAlign: 'center', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Bold', fontSize: 16, fontWeight: '700', letterSpacing: -0.32, textTransform: 'uppercase' },
});
