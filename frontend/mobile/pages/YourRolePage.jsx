import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';

const ROLES = ['Scout', 'Trailblazer'];

export default function YourRolePage({ navigation, route }) {
  const singlePlayer = route?.params?.singlePlayer ?? false;
  const roles = singlePlayer ? ROLES : ['Scout'];
  const [revealed, setRevealed] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <View style={singlePlayer ? styles.rowCards : null}>
          {roles.map((role) => (
            <TouchableOpacity key={role} onPress={() => setRevealed(r => !r)} activeOpacity={0.9}>
              <View style={styles.card}>
                {revealed ? (
                  <View style={styles.revealedInner}>
                    <Text style={styles.roleText}>{role}</Text>
                  </View>
                ) : (
                  <View style={styles.hiddenInner}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.tapLabel}>
          {revealed ? 'YOUR ROLE!' : 'TAP TO\nVIEW ROLE'}
        </Text>
        {revealed && (
          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Map', { fromGame: true })}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: -60 },
  rowCards: { flexDirection: 'row', gap: 16 },
  card: {
    width: 150,
    height: 210,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  hiddenInner: {
    width: 110,
    height: 160,
    backgroundColor: '#d4d4d8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealedInner: {
    width: 110,
    height: 160,
    backgroundColor: '#DDF4FF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#63C9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  roleText: { fontSize: 22, fontWeight: 'bold', color: '#1CB0F6', textTransform: 'uppercase', textAlign: 'center' },
  tapLabel: { fontSize: 22, fontWeight: 'bold', color: '#3f3f46', textTransform: 'uppercase', textAlign: 'center', lineHeight: 30 },
  continueBtn: { backgroundColor: '#2D7D46', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});
