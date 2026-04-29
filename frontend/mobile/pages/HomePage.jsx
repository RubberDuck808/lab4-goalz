import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import BottomNavBar from '../components/BottomNavBar';

export default function HomePage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Home" />
      <View style={styles.center}>
        <View style={styles.actions}>
          <GameButtons variant="accept" onPress={() => navigation.navigate('RouteMode')}>
            Start Route
          </GameButtons>
          <GameButtons variant="task" onPress={() => navigation.navigate('Map')}>
            View Map
          </GameButtons>
        </View>
      </View>
      <BottomNavBar
        activeScreen="home"
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: 12, alignItems: 'center' },
});
