import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import { createParty } from '../services/api';
import { useGameContext } from '../context/GameContext';

export default function CreatePartyPage({ navigation }) {
  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setParty } = useGameContext();

  async function handleCreate() {
    if (!partyName.trim()) return;
    setLoading(true);
    const result = await createParty(partyName.trim());
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    const { id, code, name, members } = result.data;
    setParty(id, code, name, members ?? []);
    navigation.navigate('PartyOwner');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party Mode" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput placeholder="Party name" value={partyName} onChangeText={setPartyName} style={styles.inputText}/>
        <View style={{ marginTop: 8 }}>
          <GameButtons variant="task" onPress={handleCreate} textStyle={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Party'}
          </GameButtons>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  form: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: -60 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 8 },
  subtext: { color: '#4B4B4B', textAlign: 'left', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Demi', fontSize: 16, fontWeight: '600', letterSpacing: -0.32 },
  inputText: { color: '#777', fontFamily: 'Inter', fontSize: 16, fontWeight: '500', letterSpacing: 0.48 },
  buttonText: { color: '#FFF', textAlign: 'center', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Bold', fontSize: 16, fontWeight: '700', letterSpacing: -0.32, textTransform: 'uppercase' },
});
