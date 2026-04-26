import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import { useState } from 'react';
  
export default function CreatePartyPage({ navigation }) {

  const [userName, setUserName] = useState(''); //empty strings, because on default, it's empty, the placeholder tag is for the placeholder
  const [partyName, setPartyName] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Party Mode" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <TextInput placeholder="Party name" value={partyName} onChangeText={setPartyName}/>
        <View style={styles.row}>
          <TextInput placeholder="Username" style={{ width: 156 }} value={userName} onChangeText={setUserName}/>
          <GameButtons variant="task" size="half">Invite</GameButtons>
        </View>
        <View style={{ marginTop: 8 }}>
          <GameButtons variant="task" onPress={() => {handleSubmit(); navigation.navigate('PartyOwner')}}>
            Create Party
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
});
