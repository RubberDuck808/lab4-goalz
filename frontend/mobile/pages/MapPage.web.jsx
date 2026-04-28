import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';

export default function MapPage({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Map" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Map unavailable on web</Text>
        <Text style={styles.sub}>Use the mobile app to access the map.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  icon:   { fontSize: 48 },
  title:  { fontSize: 18, fontWeight: '700', color: '#27272a', textAlign: 'center' },
  sub:    { fontSize: 14, color: '#71717a', textAlign: 'center' },
});
