import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { useGameContext } from '../context/GameContext';

const ROLE_META = {
  Scout: {
    icon: '🔍',
    color: '#58CC02',
    borderColor: '#46A302',
    bg: '#F0FBE7',
    description: 'Answer quiz questions\nand gather knowledge.',
  },
  Trailblazer: {
    icon: '🌿',
    color: '#FF9600',
    borderColor: '#CC7800',
    bg: '#FFF5E6',
    description: 'Photograph plants\nand document elements.',
  },
  Explorer: {
    icon: '🧭',
    color: '#1CB0F6',
    borderColor: '#1899D6',
    bg: '#EBF8FF',
    description: 'Do it all — quizzes,\nsensors, and photos.',
  },
};

export default function YourRolePage({ navigation, route }) {
  const singlePlayer = route?.params?.singlePlayer ?? false;
  const { role, setRole, triggerPoll, gameConfig } = useGameContext();
  const [selectedRole, setSelectedRole] = useState(null);

  const availableRoles = (gameConfig?.allowedRoles?.length > 0)
    ? gameConfig.allowedRoles
    : ['Scout', 'Trailblazer', 'Explorer'];

  useEffect(() => {
    if (!singlePlayer && !role) triggerPoll();
  }, [singlePlayer, role, triggerPoll]);

  // ── Single player: choose your role ────────────────────────────────────────
  if (singlePlayer) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Choose Your Role" onBack={() => navigation.goBack()} />
        <View style={styles.spContainer}>
          <Text style={styles.spHeading}>How do you want to play?</Text>

          <View style={styles.spCards}>
            {availableRoles.map((r) => {
              const meta = ROLE_META[r];
              const active = selectedRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  activeOpacity={0.85}
                  onPress={() => setSelectedRole(r)}
                  style={[
                    styles.spCard,
                    active && { borderColor: meta.borderColor, backgroundColor: meta.bg },
                  ]}
                >
                  <Text style={styles.spIcon}>{meta.icon}</Text>
                  <Text style={[styles.spRoleName, active && { color: meta.color }]}>{r}</Text>
                  <Text style={styles.spDesc}>{meta.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, !selectedRole && styles.continueBtnDisabled]}
            disabled={!selectedRole}
            onPress={() => {
              setRole(selectedRole);
              navigation.navigate('Map', { fromGame: true });
            }}
          >
            <Text style={styles.continueBtnText}>
              {selectedRole ? `Play as ${selectedRole}` : 'Select a role'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Party mode: wait for server-assigned role then flip to reveal ───────────
  if (!role) {
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

  const isRevealed = selectedRole !== null;
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Your Role" onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <TouchableOpacity onPress={() => setSelectedRole(role)} activeOpacity={0.9}>
          <View style={styles.card}>
            {isRevealed ? (
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
        <Text style={styles.tapLabel}>
          {isRevealed ? 'YOUR ROLE!' : 'TAP TO\nVIEW ROLE'}
        </Text>
        {isRevealed && (
          <TouchableOpacity style={styles.continueBtn} onPress={() => {
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

  // ── Single player ──
  spContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  spHeading: { fontSize: 18, fontWeight: 'bold', color: '#3f3f46', textAlign: 'center', marginBottom: 20 },
  spCards: { gap: 12, marginBottom: 28 },
  spCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  spIcon: { fontSize: 32 },
  spRoleName: { fontSize: 17, fontWeight: '800', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: 0.5 },
  spDesc: { flex: 1, fontSize: 13, color: '#71717a', lineHeight: 18 },

  // ── Party mode ──
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
    width: 110, height: 160, backgroundColor: '#DDF4FF', borderRadius: 14,
    borderWidth: 2, borderColor: '#63C9F9', alignItems: 'center', justifyContent: 'center',
  },
  questionMark: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  roleText: { fontSize: 22, fontWeight: 'bold', color: '#1CB0F6', textTransform: 'uppercase', textAlign: 'center' },
  tapLabel: { fontSize: 22, fontWeight: 'bold', color: '#3f3f46', textTransform: 'uppercase', textAlign: 'center', lineHeight: 30 },

  // ── Shared ──
  continueBtn: { backgroundColor: '#2D7D46', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: '#a1a1aa' },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});
