import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';
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
        <TextInput
          placeholder="email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.inputText}
        />
        <TextInput
          placeholder="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.inputText}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ marginTop: 24 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#1CB0F6" />
          ) : (
            <GameButtons variant="task" onPress={handleLogin} textStyle={styles.buttonText}>
              Login
            </GameButtons>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>I don't have an account yet.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  logo: { marginTop: 24, alignSelf: 'center' },
  form: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: -60 },
  heading: { fontSize: 40, fontWeight: '700', textTransform: 'uppercase', color: '#4B4B4B', textAlign: 'center', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Bold', marginBottom: 8 },
  link: { color: '#4B4B4B', fontFamily: 'Inter', fontSize: 13, fontWeight: '500', textDecorationLine: 'underline' },
  error: { color: '#ef4444', fontFamily: 'Inter', fontSize: 13, fontWeight: '500' },
  subtext: { color: '#4B4B4B', textAlign: 'left', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Demi', fontSize: 16, fontWeight: '600', letterSpacing: -0.32 },
  inputText: { color: '#777', fontFamily: 'Inter', fontSize: 16, fontWeight: '500', letterSpacing: 0.48 },
  buttonText: { color: '#FFF', textAlign: 'center', fontFamily: 'FONTSPRING DEMO - DIN 2014 Rounded Bold', fontSize: 16, fontWeight: '700', letterSpacing: -0.32, textTransform: 'uppercase' },
});
