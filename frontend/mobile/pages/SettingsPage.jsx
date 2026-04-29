import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import { clearUser, getUser, updateStoredUser } from '../services/session';
import { updateProfile, changePassword } from '../services/api';
import { useAccessibility, FONT_SCALES } from '../context/AccessibilityContext';

export default function SettingsPage({ navigation }) {
  const { fontScale, colorMode, setFontScale, setColorMode } = useAccessibility();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        setUsername(user.username ?? '');
        setEmail(user.email ?? '');
      }
    });
  }, []);

  async function handleSaveProfile() {
    setProfileError('');
    setProfileSuccess('');
    if (!username.trim() || !email.trim()) {
      setProfileError('Username and email cannot be empty.');
      return;
    }
    setSavingProfile(true);
    const result = await updateProfile(username.trim(), email.trim());
    setSavingProfile(false);
    if (result.success) {
      await updateStoredUser({ username: result.data.username, email: result.data.email });
      setProfileSuccess('Profile updated.');
    } else {
      setProfileError(result.error ?? 'Something went wrong.');
    }
  }

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password changed successfully.');
    } else {
      setPasswordError(result.error ?? 'Something went wrong.');
    }
  }

  async function handleLogout() {
    await clearUser();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Profile Info</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
          {profileSuccess ? <Text style={styles.successText}>{profileSuccess}</Text> : null}
          <View style={styles.saveWrap}>
            <GameButtons variant="task" onPress={handleSaveProfile} style={savingProfile ? styles.dimmed : undefined}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </GameButtons>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" style={styles.input} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>New Password</Text>
            <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" style={styles.input} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" style={styles.input} />
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          {passwordSuccess ? <Text style={styles.successText}>{passwordSuccess}</Text> : null}
          <View style={styles.saveWrap}>
            <GameButtons variant="accept" onPress={handleChangePassword} style={savingPassword ? styles.dimmed : undefined}>
              {savingPassword ? 'Saving...' : 'Change Password'}
            </GameButtons>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Text Size</Text>
        <View style={styles.card}>
          {FONT_SCALES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={styles.optionRow}
              onPress={() => setFontScale(value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLabel}>{label}</Text>
              <View style={[styles.radio, fontScale === value && styles.radioSelected]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.card}>
          <View style={styles.optionRow}>
            <View>
              <Text style={styles.optionLabel}>High Contrast</Text>
              <Text style={styles.optionHint}>Black & white high-contrast mode</Text>
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

  fieldRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46',
  },
  input: {
    width: '100%',
    alignSelf: 'stretch',
  },

  saveWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  errorText: { color: '#ef4444', fontSize: 13, paddingHorizontal: 16, paddingBottom: 4 },
  successText: { color: '#16a34a', fontSize: 13, paddingHorizontal: 16, paddingBottom: 4 },
  dimmed: { opacity: 0.6 },

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
