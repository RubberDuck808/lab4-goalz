import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, PanResponder, LayoutAnimation, UIManager, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import { createParty, getZones, getBoundaries } from '../services/api/partyApi';
import { useGameContext } from '../context/GameContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

// ── Draggable slider ────────────────────────────────────────────────────────
function Slider({ min, max, value, onChange }) {
  const trackRef   = useRef(null);
  const trackX     = useRef(0);
  const trackW     = useRef(1);
  // Keep mutable refs so PanResponder callbacks (created once) always see fresh values
  const onChangeRef = useRef(onChange);
  const minRef      = useRef(min);
  const maxRef      = useRef(max);
  onChangeRef.current = onChange;
  minRef.current      = min;
  maxRef.current      = max;

  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.pageX - trackX.current;
        const r = Math.max(0, Math.min(1, x / trackW.current));
        onChangeRef.current(Math.round(minRef.current + r * (maxRef.current - minRef.current)));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.pageX - trackX.current;
        const r = Math.max(0, Math.min(1, x / trackW.current));
        onChangeRef.current(Math.round(minRef.current + r * (maxRef.current - minRef.current)));
      },
    })
  ).current;

  return (
    <View
      ref={trackRef}
      style={styles.trackContainer}
      onLayout={() => {
        trackRef.current?.measure((_fx, _fy, width, _h, px) => {
          trackX.current = px;
          trackW.current = width;
        });
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={[styles.thumb, { left: `${ratio * 100}%`, marginLeft: -12 }]} />
    </View>
  );
}

// ── Stepper (manual ±) ──────────────────────────────────────────────────────
function Stepper({ value, min, max, onChange }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.stepInput}
        keyboardType="number-pad"
        value={String(value)}
        onChangeText={(t) => {
          const n = parseInt(t, 10);
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
      />
      <TouchableOpacity
        style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Section label ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function GameSetupPage({ navigation, route }) {
  const singlePlayer = route?.params?.singlePlayer ?? false;

  const [partyName, setPartyName]           = useState('');
  const [useGroups, setUseGroups]           = useState(true);
  const [groupSize, setGroupSize]           = useState(4);
  const [boundaryId, setBoundaryId]         = useState(null);
  const [zoneCount, setZoneCount]           = useState(3);
  const [cpPerZone, setCpPerZone]           = useState(2);
  const [boundaries, setBoundaries]         = useState([]);
  const [zones, setZones]                   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const { setParty, setGameConfig } = useGameContext();

  useEffect(() => {
    getBoundaries().then((res) => {
      if (res.success) {
        setBoundaries(res.data);
        if (res.data.length > 0) setBoundaryId(res.data[0].id);
      }
    });
    getZones().then((res) => {
      if (res.success) setZones(res.data);
    });
  }, []);

  function toggleGroups(val) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUseGroups(val);
  }

  async function handleStart() {
    if (!singlePlayer && !partyName.trim()) {
      setError('Party name is required.');
      return;
    }
    setError('');
    setLoading(true);

    const config = {
      groupSize: singlePlayer ? null : (useGroups ? groupSize : null),
      boundaryId,
      zoneCount: singlePlayer ? null : zoneCount,
      checkpointsPerZone: cpPerZone,
    };

    if (singlePlayer) {
      setGameConfig(config);
      navigation.navigate('YourRole', { singlePlayer: true });
    } else {
      const result = await createParty(partyName.trim(), config);
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      const { id, code, name, members } = result.data;
      setParty(id, code, name, members ?? []);
      navigation.navigate('PartyOwner');
    }
    setLoading(false);
  }

  const zonesInBoundary = boundaryId ? zones.filter(z => z.boundaryId === boundaryId) : zones;
  const maxZones = Math.max(1, zonesInBoundary.length);

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader
        title={singlePlayer ? 'Solo Setup' : 'Party Setup'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Party name — party mode only */}
        {!singlePlayer && (
          <Section title="Party Name">
            <TextInput
              style={styles.nameInput}
              placeholder="Enter party name"
              placeholderTextColor="#a1a1aa"
              value={partyName}
              onChangeText={setPartyName}
            />
          </Section>
        )}

        {/* Boundary */}
        <Section title="Play Area (Boundary)">
          {boundaries.length === 0 ? (
            <Text style={styles.hint}>No boundaries found.</Text>
          ) : (
            <View style={styles.chipRow}>
              {boundaries.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.chip, boundaryId === b.id && styles.chipActive]}
                  onPress={() => setBoundaryId(b.id)}
                >
                  <Text style={[styles.chipText, boundaryId === b.id && styles.chipTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Section>

        {/* Zone count — party only */}
        {!singlePlayer && (
          <Section title={`Zones to include: ${zoneCount}`}>
            {zonesInBoundary.length === 0 ? (
              <Text style={styles.hint}>No zones set up for this boundary yet.</Text>
            ) : (
              <>
                <Slider min={1} max={maxZones} value={zoneCount} onChange={setZoneCount} />
                <Stepper min={1} max={maxZones} value={zoneCount} onChange={setZoneCount} />
              </>
            )}
          </Section>
        )}

        {/* Checkpoints per zone */}
        <Section title={`Checkpoints per zone: ${cpPerZone}`}>
          <Slider min={1} max={10} value={cpPerZone} onChange={setCpPerZone} />
          <Stepper min={1} max={10} value={cpPerZone} onChange={setCpPerZone} />
        </Section>

        {/* Groups — party only */}
        {!singlePlayer && (
          <Section title="Groups">
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, useGroups && styles.toggleBtnActive]}
                onPress={() => toggleGroups(true)}
              >
                <Text style={[styles.toggleBtnText, useGroups && styles.toggleBtnTextActive]}>
                  With Groups
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !useGroups && styles.toggleBtnActive]}
                onPress={() => toggleGroups(false)}
              >
                <Text style={[styles.toggleBtnText, !useGroups && styles.toggleBtnTextActive]}>
                  No Groups
                </Text>
              </TouchableOpacity>
            </View>

            {useGroups ? (
              <View>
                <Text style={styles.hint}>
                  Players per group: <Text style={styles.hintBold}>{groupSize}</Text>
                </Text>
                <Slider min={2} max={10} value={groupSize} onChange={setGroupSize} />
                <Stepper min={2} max={10} value={groupSize} onChange={setGroupSize} />
              </View>
            ) : (
              <Text style={styles.hint}>
                Everyone plays as <Text style={styles.hintBold}>Explorer</Text> — both Scout and
                Trailblazer tasks available.
              </Text>
            )}
          </Section>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ marginTop: 8, marginBottom: 24 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#1CB0F6" />
          ) : (
            <GameButtons variant="accept" onPress={handleStart}>
              {singlePlayer ? 'Start Solo Game' : 'Create Party'}
            </GameButtons>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#2D7D46';
const BLUE  = '#1CB0F6';

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 12, gap: 4 },

  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: '#71717a', letterSpacing: 0.5, marginBottom: 10 },

  nameInput: {
    borderWidth: 1.5, borderColor: '#e4e4e7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, color: '#18181b',
  },

  // slider
  trackContainer: { height: 40, justifyContent: 'center', paddingHorizontal: 12, marginBottom: 4 },
  track:   { height: 6, backgroundColor: '#e4e4e7', borderRadius: 3 },
  fill:    { height: 6, backgroundColor: GREEN, borderRadius: 3 },
  thumb:   {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: GREEN,
    top: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },

  // stepper
  stepper:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 },
  stepBtn:         { width: 36, height: 36, borderRadius: 10, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { backgroundColor: '#d4d4d8' },
  stepBtnText:     { color: '#fff', fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
  stepInput:       { width: 56, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#18181b', borderBottomWidth: 1.5, borderBottomColor: '#e4e4e7' },

  // boundary chips
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e4e4e7', backgroundColor: '#fafafa' },
  chipActive:      { borderColor: GREEN, backgroundColor: '#e8f5ed' },
  chipText:        { fontSize: 14, color: '#71717a' },
  chipTextActive:  { color: GREEN, fontWeight: 'bold' },

  // groups toggle
  toggleRow:           { flexDirection: 'row', gap: 10, marginBottom: 14 },
  toggleBtn:           { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e4e4e7', alignItems: 'center' },
  toggleBtnActive:     { borderColor: BLUE, backgroundColor: '#EBF8FF' },
  toggleBtnText:       { fontSize: 14, color: '#71717a', fontWeight: '600' },
  toggleBtnTextActive: { color: BLUE },

  hint:     { fontSize: 14, color: '#71717a', marginBottom: 8 },
  hintBold: { fontWeight: 'bold', color: '#27272a' },
  error:    { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 },
});
