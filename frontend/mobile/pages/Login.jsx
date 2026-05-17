import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';
import { login } from '../services/api';
import { getToken, storeUser } from '../services/session';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        await storeUser(result.data);
        const token = await getToken();
        if (!token) {
          setError('Login succeeded but no token was stored. Please try again.');
          return;
        }
        navigation.replace('Home');
        await ImagePicker.requestCameraPermissionsAsync();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Can't connect right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <Logo white />
        <AppText style={styles.heroTagline}>Welcome back!</AppText>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.card}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <AppText style={styles.heading}>Login</AppText>
          <TextInput
            placeholder="email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <View style={{ marginTop: 24, alignSelf: 'stretch' }}>
            {loading ? (
              <ActivityIndicator size="large" color="#1CB0F6" />
            ) : (
              <GameButtons variant="task" onPress={handleLogin}>
                Login
              </GameButtons>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <AppText style={styles.link}>I don't have an account yet.</AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1CB0F6' },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 48 },
  heroTagline: { fontSize: 16, color: 'rgba(255,255,255,0.88)', marginTop: 8, fontWeight: '500' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  form: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  heading: { fontSize: 32, fontWeight: 'bold', textTransform: 'uppercase', color: '#27272a', marginBottom: 8 },
  link: { fontSize: 13, color: '#1CB0F6', textDecorationLine: 'underline', marginTop: 4 },
  error: { fontSize: 13, color: '#ef4444', textAlign: 'center', maxWidth: 300 },
});
