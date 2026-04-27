import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { useGameContext } from '../context/GameContext';

export default function YourRolePage({ navigation, route }) {
  const singlePlayer = route?.params?.singlePlayer ?? false;
  const { role, setRole, gameConfig } = useGameContext();
  const [selectedRole, setSelectedRole] = useState(null);

  // Party mode: wait for role from context before showing the card
  const partyRole = singlePlayer ? null : role;
  const singlePlayerRoles = gameConfig?.groupSize == null ? ['Explorer'] : ['Scout', 'Trailblazer'];
  const roles = singlePlayer ? singlePlayerRoles : (partyRole ? [partyRole] : null);

  const isRevealed = singlePlayer ? selectedRole !== null : selectedRole !== null;

  if (!singlePlayer && !partyRole) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.tapLabel}>{'WAITING FOR\nROLE...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <View style={singlePlayer ? styles.rowCards : null}>
          {roles.map((r) => (
            <TouchableOpacity key={r} onPress={() => setSelectedRole(r)} activeOpacity={0.9}>
              <View style={styles.card}>
                {selectedRole === r ? (
                  <View style={styles.revealedInner}>
                    <Text style={styles.roleText}>{r}</Text>
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
          {isRevealed ? 'YOUR ROLE!' : 'TAP TO\nVIEW ROLE'}
        </Text>
        {isRevealed && (
          <TouchableOpacity style={styles.continueBtn} onPress={() => {
            if (singlePlayer) setRole(selectedRole);
            navigation.navigate('Map', { fromGame: true });
          }}>
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
