import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function PartyModePage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party Mode" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <TextInput placeholder="Party code" />
        <View style={{ marginTop: 8 }}>
          <GameButtons variant="task" onPress={() => navigation.navigate('PartyLobby')}>
            Join Party
          </GameButtons>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CreateParty')}>
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
});
