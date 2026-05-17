import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import GameButtons from '../components/GameButtons';
import AppText from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import BottomNavBar from '../components/BottomNavBar';
import { submitElement, getElementTypes } from '../services/api';
import { uploadPhotoToSupabase } from '../services/supabase';
import { useGameContext } from '../context/GameContext';

const PLACEHOLDER_IMAGE = require('../assets/icon_white.png');

function parseGps(gpsStr) {
  const match = gpsStr?.match(/([-\d.]+),\s*([-\d.]+)/);
  if (!match) return { latitude: 0, longitude: 0 };
  return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
}

export default function ImageUploadScreenPage({ navigation, route }) {
  const { setPendingPhotoCompletion } = useGameContext();
  const imageUri = route?.params?.imageUri ?? null;
  const fromGame = route?.params?.fromGame ?? false;
  const imageSource = imageUri ? { uri: imageUri } : PLACEHOLDER_IMAGE;

  const [gps, setGps] = useState(route?.params?.gps ?? null);
  const [elementTypes, setElementTypes] = useState([]);
  const [typeOpen, setTypeOpen]   = useState(false);
  const [elementType, setElementType] = useState('');
  const [species, setSpecies]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [error, setError]         = useState('');
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    getElementTypes().then(setElementTypes);
  }, []);

  useEffect(() => {
    if (gps) return;
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      .then(loc => setGps(`${loc.coords.latitude},${loc.coords.longitude}`))
      .catch(() => {});
  }, []);

  const canUpload = !!imageUri && !!elementType && species.trim().length > 0;

  async function handleUpload() {
    if (!canUpload) return;
    setSubmitting(true);
    setError('');
    try {
      setUploadStep('Uploading photo…');
      const publicUrl = await uploadPhotoToSupabase(imageUri ?? '');

      setUploadStep('Saving element…');
      const { latitude, longitude } = parseGps(gps);
      const result = await submitElement({
        elementName: species.trim(),
        elementType,
        latitude,
        longitude,
        imageUrl: publicUrl,
        isGreen: true,
      });
      if (!result.success) {
        setError(result.error ?? "Upload didn't go through. Try again.");
        return;
      }
      setSuccessModal(true);
    } catch (err) {
      setError(err?.message ?? "Can't connect right now. Try again in a moment.");
    } finally {
      setSubmitting(false);
      setUploadStep('');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Your Photo" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image preview */}
        <View style={styles.imageWrap}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        </View>

        {gps && (
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#52B788" />
            <Text style={styles.gps}>Location captured</Text>
          </View>
        )}

        {/* ── "What did you take a picture of?" — expandable toggle ── */}
        <Text style={styles.label}>What did you take a picture of?</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setTypeOpen(o => !o)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownValue, !elementType && styles.placeholder]}>
              {elementType
                ? elementType.charAt(0).toUpperCase() + elementType.slice(1)
                : 'Select type'}
            </Text>
            <Text style={styles.chevron}>{typeOpen ? '∧' : '∨'}</Text>
          </TouchableOpacity>

          {typeOpen && (
            <View style={styles.optionList}>
              {elementTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.option, elementType === type && styles.optionSelected]}
                  onPress={() => { setElementType(type); setTypeOpen(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, elementType === type && styles.optionTextSelected]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── "What species is it?" — free-text form ── */}
        <Text style={[styles.label, styles.labelSpaced]}>What species is it?</Text>
        <View style={styles.formRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Species name"
            placeholderTextColor="#777"
            value={species}
            onChangeText={setSpecies}
            returnKeyType="done"
            onSubmitEditing={() => {}}
          />
          <TouchableOpacity
            style={[styles.addBtn, species.trim() && styles.addBtnActive]}
            onPress={() => setSpecies('')}
            activeOpacity={0.8}
            disabled={!species.trim()}
          >
            <Text style={styles.addText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={{ marginTop: 36, alignSelf: 'stretch' }}>
          {submitting ? (
            <View style={styles.submittingRow}>
              <ActivityIndicator color="#1CB0F6" size="large" />
              {!!uploadStep && <AppText style={styles.uploadStepText}>{uploadStep}</AppText>}
            </View>
          ) : (
            <GameButtons variant="task" onPress={handleUpload} disabled={!canUpload}>
              Upload
            </GameButtons>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {!fromGame && (
        <BottomNavBar
          onNavigateHome={() => navigation.navigate('Home')}
          onNavigateToProfile={() => navigation.navigate('Profile')}
          onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
        />
      )}

      <ConfirmModal
        visible={successModal}
        title="Element logged."
        message="Saved to the map."
        buttons={[
          {
            text: 'Continue',
            style: 'default',
            onPress: () => { setSuccessModal(false); setPendingPhotoCompletion(true); navigation.navigate('Map', { fromGame: true }); },
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center' },

  // image
  imageWrap: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#c1c1c1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: { width: 210, height: 294 },
  imageFallback: { backgroundColor: '#e4e4e7' },

  // location
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  gps: { fontSize: 14, color: '#52B788', fontWeight: '600' },

  // labels
  label: {
    alignSelf: 'flex-start',
    marginTop: 28,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b4b4b',
  },
  labelSpaced: { marginTop: 20 },

  // dropdown
  dropdownWrap: { width: '100%', zIndex: 10 },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    borderWidth: 2,
    borderColor: '#777',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  dropdownValue: { flex: 1, fontSize: 16, color: '#333' },
  placeholder:   { color: '#777' },
  chevron:       { fontSize: 14, color: '#777', marginLeft: 8 },
  optionList: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 20,
    borderWidth: 2,
    borderColor: '#777',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
  },
  optionSelected: { backgroundColor: '#ddf4ff' },
  optionText:     { fontSize: 16, color: '#333' },
  optionTextSelected: { color: '#1cb0f6', fontWeight: '600' },

  // species form row
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#d9d9d9',
    borderWidth: 2,
    borderColor: '#777',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  addBtn: {
    width: 80,
    height: 44,
    backgroundColor: '#cacaca',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: { backgroundColor: '#919090' },
  addText: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },

  // error
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 13, textAlign: 'center' },

  submittingRow: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  uploadStepText: { color: '#71717a', fontSize: 13, marginTop: 4 },
});
