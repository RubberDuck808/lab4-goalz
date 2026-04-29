import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameButtons from '../components/GameButtons';
import { useGameContext } from '../context/GameContext';

export default function AllCheckpointsCompletePage({ navigation }) {
  const { resetGame } = useGameContext();

  function handleFinish() {
    resetGame();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.heading}>All Checkpoints{'\n'}Complete!</Text>
        <Text style={styles.sub}>
          Your group has visited every checkpoint.{'\n'}Great work!
        </Text>
        <View style={styles.btnWrap}>
          <GameButtons variant="accept" onPress={handleFinish}>
            Finish Game
          </GameButtons>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  trophy:  { fontSize: 80 },
  heading: {
    fontSize: 32, fontWeight: '900', color: '#18181b',
    textAlign: 'center', lineHeight: 38,
  },
  sub: {
    fontSize: 16, color: '#71717a', textAlign: 'center', lineHeight: 24,
  },
  btnWrap: { marginTop: 16 },
});
