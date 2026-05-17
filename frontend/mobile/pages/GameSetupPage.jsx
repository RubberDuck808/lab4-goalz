import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, PanResponder, LayoutAnimation, UIManager, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';
import AppTextInput from '../components/TextInput';
import * as Location from 'expo-location';
import { createParty, getZones, getBoundaries, getCheckpoints } from '../services/api/partyApi';
import { useGameContext } from '../context/GameContext';
import { boundaryDistanceMeters } from './map/mapHelpers';

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

  const ALL_ROLES = ['Scout', 'Trailblazer', 'Explorer'];

  const [partyName, setPartyName]           = useState('');
  const [useGroups, setUseGroups]           = useState(true);
  const [groupSize, setGroupSize]           = useState(4);
  const [boundaryId, setBoundaryId]         = useState(null);
  const [zoneCount, setZoneCount]           = useState(3);
  const [cpPerZone, setCpPerZone]           = useState(2);
  const [allowedRoles, setAllowedRoles]     = useState(new Set(ALL_ROLES));
  const [boundaries, setBoundaries]         = useState([]);
  const [zones, setZones]                   = useState([]);
  const [checkpoints, setCheckpoints]       = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [userLocation, setUserLocation]     = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const { setParty, setGameConfig } = useGameContext();

  useEffect(() => {
    getBoundaries().then((res) => { if (res.success) setBoundaries(res.data); });
    getZones().then((res) => { if (res.success) setZones(res.data); });
    getCheckpoints().then((res) => { if (res.success) setCheckpoints(res.data); });
  }, []);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') { setLocationLoading(false); return; }
        return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      })
      .then(loc => {
        if (loc) setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      })
      .catch(() => {})
      .finally(() => setLocationLoading(false));
  }, []);

  // Boundaries within 1 km of the user. Only falls back to all when location is unavailable.
  const nearbyBoundaries = useMemo(() => {
    if (!userLocation) return boundaries;
    return boundaries.filter(b => boundaryDistanceMeters(b, userLocation) <= 1000);
  }, [boundaries, userLocation]);

  // Auto-select nearest boundary once location + boundaries are ready.
  useEffect(() => {
    if (!userLocation || !nearbyBoundaries.length) return;
    const nearest = nearbyBoundaries.reduce((best, b) => {
      const d = boundaryDistanceMeters(b, userLocation);
      return d < boundaryDistanceMeters(best, userLocation) ? b : best;
    }, nearbyBoundaries[0]);
    setBoundaryId(nearest.id);
  }, [nearbyBoundaries, userLocation]);

  // Zones belonging to the selected boundary.
  const zonesInBoundary = useMemo(
    () => (boundaryId ? zones.filter(z => z.boundaryId === boundaryId) : zones),
    [zones, boundaryId],
  );

  // Max zones slider = how many zones the boundary actually has.
  const maxZones = Math.max(1, zonesInBoundary.length);

  // Per-role minimum checkpoint count across all zones in the selected boundary.
  const roleMaxCps = useMemo(() => {
    const result = {};
    ALL_ROLES.forEach(role => {
      if (!zonesInBoundary.length || !checkpoints.length) { result[role] = 10; return; }
      const counts = zonesInBoundary.map(z => {
        const zCps = checkpoints.filter(cp => cp.zoneId === z.id);
        if (role === 'Scout')       return zCps.filter(cp => cp.type === 'sensor').length;
        if (role === 'Trailblazer') return zCps.filter(cp => cp.type !== 'sensor').length;
        return zCps.length;
      }).filter(c => c > 0);
      result[role] = counts.length ? Math.min(...counts) : 0;
    });
    return result;
  }, [zonesInBoundary, checkpoints]);

  // Overall max = the most-constrained allowed role. Ensures every role can satisfy the value.
  const maxCpPerZone = useMemo(() => {
    const selected = ALL_ROLES.filter(r => allowedRoles.has(r));
    if (!selected.length) return 1;
    return Math.max(1, Math.min(...selected.map(r => roleMaxCps[r] ?? 10)));
  }, [allowedRoles, roleMaxCps]);

  // Roles that are allowed but have 0 available checkpoints in some zone.
  const roleWarnings = useMemo(
    () => ALL_ROLES.filter(r => allowedRoles.has(r) && roleMaxCps[r] === 0),
    [allowedRoles, roleMaxCps],
  );

  function toggleRole(r) {
    setAllowedRoles(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  }

  // Clamp zoneCount and cpPerZone whenever their ceilings shrink (e.g. boundary
  // switched to one that has fewer zones or checkpoints than the current values).
  useEffect(() => {
    setZoneCount(prev => Math.min(prev, maxZones));
  }, [maxZones]);

  useEffect(() => {
    setCpPerZone(prev => Math.min(prev, maxCpPerZone));
  }, [maxCpPerZone]);

  function toggleGroups(val) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUseGroups(val);
  }

  async function handleStart() {
    if (!singlePlayer && !partyName.trim()) {
      setError('Enter a party name to continue.');
      return;
    }
    if (allowedRoles.size === 0) {
      setError('Select at least one role.');
      return;
    }
    setError('');
    setLoading(true);

    const config = {
      groupSize: singlePlayer ? null : (useGroups ? groupSize : null),
      boundaryId,
      zoneCount: singlePlayer ? null : zoneCount,
      checkpointsPerZone: cpPerZone,
      allowedRoles: [...allowedRoles],
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
  }

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
            <AppTextInput
              placeholder="Enter party name"
              value={partyName}
              onChangeText={setPartyName}
              style={{ width: '100%', alignSelf: 'stretch' }}
            />
          </Section>
        )}

        {/* Boundary */}
        <Section title="Play Area (Boundary)">
          {locationLoading ? (
            <ActivityIndicator size="small" color="#1CB0F6" style={{ alignSelf: 'flex-start' }} />
          ) : nearbyBoundaries.length === 0 ? (
            <Text style={styles.hint}>
              {userLocation
                ? 'No play areas nearby. Move closer to get started.'
                : 'No play areas found.'}
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {nearbyBoundaries.map((b) => (
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
              <Text style={styles.hint}>No zones set up here yet.</Text>
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
          <Slider min={1} max={maxCpPerZone} value={cpPerZone} onChange={setCpPerZone} />
          <Stepper min={1} max={maxCpPerZone} value={cpPerZone} onChange={setCpPerZone} />
          {maxCpPerZone < 10 && (
            <Text style={styles.hint}>
              Max <Text style={styles.hintBold}>{maxCpPerZone}</Text>
              {allowedRoles.size < 3
                ? ' — limited by the most-constrained allowed role.'
                : ' — limited by the fewest checkpoints in any zone of this boundary.'}
            </Text>
          )}
        </Section>

        {/* Allowed Roles */}
        <Section title="Allowed Roles">
          <View style={styles.chipRow}>
            {ALL_ROLES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, allowedRoles.has(r) && styles.chipActive]}
                onPress={() => toggleRole(r)}
              >
                <Text style={[styles.chipText, allowedRoles.has(r) && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {roleWarnings.length > 0 && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠ {roleWarnings.join(' & ')} {roleWarnings.length === 1 ? 'has' : 'have'} 0 checkpoints in at least one zone — those players would have nothing to visit.
              </Text>
            </View>
          )}
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

        <View style={{ marginTop: 8, marginBottom: 24, alignItems: 'center' }}>
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

const GREEN = '#58CC02';
const BLUE  = '#1CB0F6';

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 12, gap: 4 },

  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: '#71717a', letterSpacing: 0.5, marginBottom: 10 },

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
  chip:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e4e4e7', backgroundColor: '#f4f4f5' },
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
  warningCard: {
    backgroundColor: '#FFF3D4',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F5A623',
    marginTop: 6,
  },
  warningText: { fontSize: 13, color: '#CC8B00', fontWeight: '500', lineHeight: 18 },
  error:    { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 },
});
