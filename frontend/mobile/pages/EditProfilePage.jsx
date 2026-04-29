import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import { getUser, updateStoredUser } from '../services/session';
import { updateProfile, changePassword } from '../services/api';

export default function EditProfilePage({ navigation }) {
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

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Profile Info</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
          {profileSuccess ? <Text style={styles.successText}>{profileSuccess}</Text> : null}
          <GameButtons
            variant="task"
            onPress={handleSaveProfile}
            style={savingProfile ? styles.dimmed : undefined}
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </GameButtons>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Change Password</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.label}>New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          {passwordSuccess ? <Text style={styles.successText}>{passwordSuccess}</Text> : null}
          <GameButtons
            variant="accept"
            onPress={handleChangePassword}
            style={savingPassword ? styles.dimmed : undefined}
          >
            {savingPassword ? 'Saving...' : 'Change Password'}
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
    marginBottom: 8,
  },
  fieldGroup: { gap: 10, alignItems: 'center' },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: '#3f3f46',
    marginBottom: -4,
  },
  errorText: { color: '#ef4444', fontSize: 13, alignSelf: 'flex-start' },
  successText: { color: '#16a34a', fontSize: 13, alignSelf: 'flex-start' },
  dimmed: { opacity: 0.6 },
});
