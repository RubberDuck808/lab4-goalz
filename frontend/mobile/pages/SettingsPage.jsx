import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';
import { clearUser } from '../services/session';
import { useAccessibility, FONT_SCALES } from '../context/AccessibilityContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage({ navigation }) {
  const { fontScale, setFontScale } = useAccessibility();

  async function handleLogout() {
    await clearUser();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <AppText style={styles.sectionTitle}>Account</AppText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
            <AppText style={styles.navLabel}>Edit Profile</AppText>
            <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <AppText style={styles.sectionTitle}>Text Size</AppText>
        <View style={styles.card}>
          {FONT_SCALES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={styles.optionRow}
              onPress={() => setFontScale(value)}
              activeOpacity={0.7}
            >
              <AppText style={styles.optionLabel}>{label}</AppText>
              <View style={[styles.radio, fontScale === value && styles.radioSelected]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutWrap}>
          <GameButtons variant="decline" onPress={handleLogout}>
            Log Out
          </GameButtons>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 8 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#71717a',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
    paddingBottom: 4,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navLabel: { fontSize: 16, color: '#27272a', fontWeight: '500' },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  optionLabel: { fontSize: 16, color: '#27272a', fontWeight: '500' },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#1CB0F6',
    backgroundColor: '#1CB0F6',
  },

  logoutWrap: { alignItems: 'center', marginTop: 32 },
});
