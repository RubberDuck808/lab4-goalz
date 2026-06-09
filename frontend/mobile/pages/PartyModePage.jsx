import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.form}>

          {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

          {/* ── Join section ── */}
          <AppText style={styles.sectionLabel}>Have a code?</AppText>
          <TextInput placeholder="Party code" value={code} onChangeText={setCode} />
          <View style={{ alignSelf: 'stretch' }}>
            <GameButtons variant="task" onPress={handleJoin}>
              {loading ? 'Joining...' : 'Join Party'}
            </GameButtons>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>no code?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Create section ── */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('GameSetup', { singlePlayer: false })}
            activeOpacity={0.75}
          >
            <Text style={styles.outlineBtnText}>Create a new party</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e4e4e7' },
  dividerText: { fontSize: 12, color: '#a1a1aa', marginHorizontal: 12 },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#1CB0F6',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1CB0F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
