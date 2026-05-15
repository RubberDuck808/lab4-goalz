import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameButtons from '../components/GameButtons';
import { useGameContext } from '../context/GameContext';

function BillRow({ label, amount, points, dimmed }) {
  return (
    <View style={[styles.billRow, dimmed && styles.billRowDimmed]}>
      <View style={styles.billLeft}>
        <Text style={[styles.billLabel, dimmed && styles.billLabelDimmed]}>{label}</Text>
        {amount != null && (
          <Text style={styles.billQty}>× {amount}</Text>
        )}
      </View>
      <Text style={[styles.billPoints, dimmed && styles.billPointsDimmed]}>
        +{points} pts
      </Text>
    </View>
  );
}

export default function AllCheckpointsCompletePage({ navigation }) {
  const { partyId, pendingVisits, quizScore, completeGame } = useGameContext();
  const [saving, setSaving] = useState(false);

  const checkpointCount  = pendingVisits.length;
  const checkpointPoints = checkpointCount * 10;
  const totalPoints      = checkpointPoints + quizScore;

  async function handleFinish() {
    setSaving(true);
    await completeGame(partyId, pendingVisits, quizScore);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.heading}>All Checkpoints{'\n'}Complete!</Text>
        <Text style={styles.sub}>Here's what you earned today</Text>

        {/* ── Receipt ───────────────────────────────────────── */}
        <View style={styles.receipt}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>GOALZ RECEIPT</Text>
          </View>

          <View style={styles.receiptBody}>
            <BillRow
              label="Checkpoints visited"
              amount={checkpointCount}
              points={checkpointPoints}
            />
            <BillRow
              label="Quiz bonus"
              points={quizScore}
              dimmed={quizScore === 0}
            />

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalPoints}>{totalPoints} pts</Text>
            </View>
          </View>

          {/* torn-edge decoration */}
          <View style={styles.tearRow}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.tearCircle} />
            ))}
          </View>
        </View>

        <View style={styles.btnWrap}>
          {saving ? (
            <ActivityIndicator size="large" color="#1CB0F6" />
          ) : (
            <GameButtons variant="accept" onPress={handleFinish}>
              Save &amp; finish
            </GameButtons>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f4f4f5' },
  scroll: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 12 },

  trophy:  { fontSize: 72 },
  heading: { fontSize: 30, fontWeight: '900', color: '#18181b', textAlign: 'center', lineHeight: 36 },
  sub:     { fontSize: 15, color: '#71717a', textAlign: 'center' },

  // Receipt card
  receipt: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  receiptHeader: {
    backgroundColor: '#18181b',
    paddingVertical: 12,
    alignItems: 'center',
  },
  receiptTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 3,
  },
  receiptBody: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },

  // Bill rows
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billRowDimmed: { opacity: 0.4 },
  billLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  billLabel: { fontSize: 15, color: '#27272a', fontWeight: '600' },
  billLabelDimmed: { fontWeight: '400' },
  billQty:   { fontSize: 13, color: '#a1a1aa', fontStyle: 'italic' },
  billPoints:{ fontSize: 15, fontWeight: '700', color: '#22c55e' },
  billPointsDimmed: { color: '#a1a1aa' },

  divider: { height: 1, backgroundColor: '#e4e4e7', marginVertical: 4 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel:  { fontSize: 17, fontWeight: '900', color: '#18181b', letterSpacing: 1 },
  totalPoints: { fontSize: 22, fontWeight: '900', color: '#1CB0F6' },

  // Perforated tear line at the bottom of the receipt
  tearRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 6,
    backgroundColor: '#f4f4f5',
  },
  tearCircle: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#f4f4f5',
    borderWidth: 1, borderColor: '#e4e4e7',
  },

  btnWrap: { marginTop: 8, width: '100%', alignItems: 'center' },
});
