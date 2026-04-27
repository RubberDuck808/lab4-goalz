import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

import { storeUser } from '../services/session';

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError('');

    if (!username || !name || !email || !password || !repeatPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(username, name, email, password);
      if (result.success) {
        await storeUser(result.data);
        navigation.replace('Home');
      } else {
        setError(result.error);
      }
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Logo style={styles.logo} />
      <View style={styles.form}>
        <Text style={styles.heading}>Sign Up</Text>
        <TextInput
          placeholder="username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="full name"
          value={name}
          onChangeText={setName}
        />
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
        <TextInput
          placeholder="repeat password"
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ marginTop: 24 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#1CB0F6" />
          ) : (
            <GameButtons variant="task" onPress={handleSignUp}>
              Sign Up
            </GameButtons>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>I already have an account.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  logo: { marginTop: 24, alignSelf: 'center' },
  form: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: -60 },
  heading: { fontSize: 32, fontWeight: 'bold', textTransform: 'uppercase', color: '#27272a', marginBottom: 8 },
  link: { fontSize: 13, color: '#71717a', textDecorationLine: 'underline', marginTop: 4 },
  error: { fontSize: 13, color: '#ef4444', textAlign: 'center', maxWidth: 300 },
});
