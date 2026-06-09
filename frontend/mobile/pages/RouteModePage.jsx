import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';

export default function RouteModePage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Route Mode" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <View style={styles.modeOption}>
          <GameButtons variant="task" onPress={() => navigation.navigate('GameSetup', { singlePlayer: true })}>
            Solo
          </GameButtons>
          <AppText style={styles.modeDesc}>Play on your own</AppText>
        </View>
        <View style={styles.modeOption}>
          <GameButtons variant="party" onPress={() => navigation.navigate('PartyMode')}>
            Party
          </GameButtons>
          <AppText style={styles.modeDesc}>Join or create a group</AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', gap: 24, paddingHorizontal: 24 },
  modeOption: { gap: 8, alignItems: 'center' },
  modeDesc: { fontSize: 13, color: '#71717a', textAlign: 'center' },
});
