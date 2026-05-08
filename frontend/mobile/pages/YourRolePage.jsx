import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { useGameContext } from '../context/GameContext';

const ROLE_COLORS = {
  Scout:       { bg: '#F0FBE7', border: '#46A302', text: '#46A302' },
  Trailblazer: { bg: '#FFF5E6', border: '#CC7800', text: '#CC7800' },
  Explorer:    { bg: '#EBF8FF', border: '#1899D6', text: '#1CB0F6' },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function YourRolePage({ navigation, route }) {
  const singlePlayer = route?.params?.singlePlayer ?? false;
  const { role, setRole, triggerPoll, gameConfig } = useGameContext();
  const [revealed, setRevealed] = useState(false);

  // For single player: pick a random role from the allowed list on mount.
  const availableRoles = gameConfig?.allowedRoles?.length > 0
    ? gameConfig.allowedRoles
    : ['Scout', 'Trailblazer', 'Explorer'];
  const assignedRef = useRef(singlePlayer ? pickRandom(availableRoles) : null);
  const assignedRole = singlePlayer ? assignedRef.current : role;

  useEffect(() => {
    if (!singlePlayer && !role) triggerPoll();
  }, [singlePlayer, role, triggerPoll]);

  const colors = assignedRole ? (ROLE_COLORS[assignedRole] ?? ROLE_COLORS.Explorer) : null;

  // Party: still waiting for server-assigned role
  if (!singlePlayer && !role) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1CB0F6" style={{ marginBottom: 16 }} />
          <Text style={styles.tapLabel}>{'WAITING FOR\nROLE...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <TouchableOpacity onPress={() => setRevealed(true)} activeOpacity={0.9} disabled={revealed}>
          <View style={styles.card}>
            {revealed ? (
              <View style={[styles.revealedInner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[styles.roleText, { color: colors.text }]}>{assignedRole}</Text>
              </View>
            ) : (
              <View style={styles.hiddenInner}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.tapLabel}>
          {revealed ? 'YOUR ROLE!' : 'TAP TO\nREVEAL ROLE'}
        </Text>

        {revealed && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              if (singlePlayer) setRole(assignedRole);
              navigation.navigate('Map', { fromGame: true });
            }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: -60 },

  card: {
    width: 150, height: 210, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e4e4e7', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  hiddenInner: {
    width: 110, height: 160, backgroundColor: '#d4d4d8', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  revealedInner: {
    width: 110, height: 160, borderRadius: 14, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  questionMark: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  roleText:     { fontSize: 22, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' },
  tapLabel:     { fontSize: 22, fontWeight: 'bold', color: '#3f3f46', textTransform: 'uppercase', textAlign: 'center', lineHeight: 30 },
  continueBtn:      { backgroundColor: '#2D7D46', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48 },
  continueBtnText:  { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});
