import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import BottomNavBar from '../components/BottomNavBar';
import UserRow from '../components/UserRow';
import { getLeaderboard } from '../services/api';
import { getUser } from '../services/session';

export default function LeaderboardPage({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [userRes, lbRes] = await Promise.all([getUser(), getLeaderboard()]);
      setCurrentUsername(userRes?.username ?? null);
      if (lbRes.success) {
        setEntries(lbRes.data);
      } else {
        setError('Could not load leaderboard.');
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Leaderboard" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No scores yet — play a game to appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.rank)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[
              styles.rowWrap,
              item.username === currentUsername && styles.rowHighlight,
            ]}>
              <UserRow
                username={item.username}
                rank={item.rank}
                score={item.totalPoints}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}

      <BottomNavBar
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile', { username: undefined, incomingRequest: false })}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 15, color: '#ef4444', textAlign: 'center' },
  emptyText: { fontSize: 15, color: '#71717a', textAlign: 'center' },
  list: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  rowWrap: { borderRadius: 10, paddingHorizontal: 8 },
  rowHighlight: { backgroundColor: '#eff6ff' },
  divider: { height: 1, backgroundColor: '#f4f4f5', marginHorizontal: 8 },
});
