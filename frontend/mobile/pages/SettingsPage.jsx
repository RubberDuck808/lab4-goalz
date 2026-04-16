import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import { clearUser } from '../services/session';

export default function SettingsPage({ navigation }) {
  async function handleLogout() {
    await clearUser();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Settings" onBack={() => navigation.goBack()} />
      <View style={styles.bottom}>
        <GameButtons variant="decline" onPress={handleLogout}>
          Log Out
        </GameButtons>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  bottom: { position: 'absolute', bottom: 40, alignSelf: 'center', width: '100%', alignItems: 'center' },
});
