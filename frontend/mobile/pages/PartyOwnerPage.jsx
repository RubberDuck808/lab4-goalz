import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import avatar from '../assets/UserAvatar_1.png';

const MOCK_PLAYERS = [
  { id: 1, name: 'maximax',     status: 'Joined' },
  { id: 2, name: 'frankyfrank', status: 'Joined' },
  { id: 3, name: 'billyjoe',    status: 'Joined' },
];

export default function PartyOwnerPage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <TextInput placeholder="Type email" style={{ flex: 1, width: undefined }} />
          <GameButtons variant="task" size="half">Invite</GameButtons>
        </View>
        <View style={styles.row}>
          <TextInput placeholder="Type partycode" style={{ flex: 1, width: undefined }} />
        </View>
        <GameButtons variant="accept" onPress={() => navigation.navigate('YourRole', { singlePlayer: false })} style={{ width: '100%' }}>
          Start
        </GameButtons>
        <Text style={styles.sectionLabel}>Players in party</Text>
        {MOCK_PLAYERS.map(({ id, name, status }) => (
          <View key={id} style={styles.playerRow}>
            <Text style={styles.num}>{id}</Text>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.joined}>{status}</Text>
          </View>
        ))}
        <View style={styles.extra}>
          <Text style={styles.extraText}>+5</Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <GameButtons variant="decline" onPress={() => navigation.navigate('PartyMode')}>
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
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', color: '#3f3f46', textAlign: 'center', marginTop: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f4f4f5', gap: 12 },
  num: { width: 16, color: '#a1a1aa', fontWeight: 'bold', fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  name: { flex: 1, fontWeight: 'bold', fontSize: 16, color: '#27272a' },
  joined: { fontSize: 13, fontWeight: 'bold', color: '#1CB0F6' },
  extra: { backgroundColor: '#f4f4f5', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  extraText: { fontSize: 13, color: '#a1a1aa' },
});
