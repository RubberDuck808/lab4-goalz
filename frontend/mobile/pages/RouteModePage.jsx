import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';

export default function RouteModePage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Route Mode" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <GameButtons variant="task" size="square" onPress={() => navigation.navigate('GameSetup', { singlePlayer: true })} textStyle={styles.buttonText}>
          Single
        </GameButtons>
        <GameButtons variant="party" size="square" onPress={() => navigation.navigate('PartyMode')} textStyle={styles.buttonText}>
          Party
        </GameButtons>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  buttonText: { color: '#FFF', textAlign: 'center', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Bold', fontSize: 16, fontWeight: '700', letterSpacing: -0.32, textTransform: 'uppercase' },
});
