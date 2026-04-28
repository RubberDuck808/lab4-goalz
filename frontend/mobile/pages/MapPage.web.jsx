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
        <Text style={styles.text}>Map is not available in the web preview.</Text>
        <Text style={styles.sub}>Use the Expo Go app on your phone to see the full map.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  icon:   { fontSize: 48, marginBottom: 16 },
  text:   { fontSize: 16, fontWeight: 'bold', color: '#3f3f46', textAlign: 'center', marginBottom: 8 },
  sub:    { fontSize: 13, color: '#71717a', textAlign: 'center' },
});
