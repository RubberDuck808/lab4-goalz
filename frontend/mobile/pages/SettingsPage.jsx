import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';
import { clearUser } from '../services/session';
import { useAccessibility, useColors, FONT_SCALES } from '../context/AccessibilityContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage({ navigation }) {
  const { fontScale, colorMode, setFontScale, setColorMode } = useAccessibility();
  const colors = useColors();

  async function handleLogout() {
    await clearUser();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PageHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <AppText style={styles.sectionTitle}>Account</AppText>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
            <AppText style={styles.navLabel}>Edit Profile</AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <AppText style={styles.sectionTitle}>Text Size</AppText>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>
          {FONT_SCALES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.optionRow, { borderBottomColor: colors.border }]}
              onPress={() => setFontScale(value)}
              activeOpacity={0.7}
            >
              <AppText style={styles.optionLabel}>{label}</AppText>
              <View style={[styles.radio, fontScale === value && styles.radioSelected]} />
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Accessibility</AppText>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <View style={[styles.optionRow, { borderBottomColor: colors.border }]}>
            <View>
              <AppText style={styles.optionLabel}>High Contrast</AppText>
              <AppText style={styles.optionHint}>Black & white high-contrast mode</AppText>
            </View>
            <Switch
              value={colorMode === 'high_contrast'}
              onValueChange={(val) => setColorMode(val ? 'high_contrast' : 'none')}
              trackColor={{ false: '#d4d4d8', true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>
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
  optionHint: { fontSize: 12, color: '#a1a1aa', marginTop: 2 },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },

  logoutWrap: { alignItems: 'center', marginTop: 32 },
});
