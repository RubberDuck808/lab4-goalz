import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import GameButtons from '../components/GameButtons';

export default function Login({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <Logo style={styles.logo} />
      <View style={styles.form}>
        <Text style={styles.heading}>Login</Text>
        <TextInput placeholder="email" keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="password" secureTextEntry />
        <View style={{ marginTop: 24 }}>
          <GameButtons variant="task" onPress={() => navigation.replace('Home')}>
            Login
          </GameButtons>
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
  heading: { fontSize: 32, fontWeight: 'bold', textTransform: 'uppercase', color: '#27272a', marginBottom: 8 },
  link: { fontSize: 13, color: '#1CB0F6', textDecorationLine: 'underline', marginTop: 4 },
});
