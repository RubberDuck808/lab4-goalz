import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import BottomNavBar from '../components/BottomNavBar';
import { submitElement, getElementTypes } from '../services/api';

const PLACEHOLDER_IMAGE = 'https://imgs.search.brave.com/hRkvl3LnUzM9OaDvHhso94cLNguVIeXnscwD_ck_6hA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vTUFEQ0FL/MXNGS3cvMS90aHVt/Ym5haWxfbGFyZ2Ut/MS9jYW52YS1iZWVj/aC10cmVlLU1BRENB/SzFzRkt3LmpwZw';

function parseGps(gpsStr) {
  const match = gpsStr?.match(/([-\d.]+),\s*([-\d.]+)/);
  if (!match) return { latitude: 0, longitude: 0 };
  return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
}

export default function ImageUploadScreenPage({ navigation, route }) {
  const imageUri = route?.params?.imageUri ?? PLACEHOLDER_IMAGE;
  const gps      = route?.params?.gps      ?? null;

  const [elementTypes, setElementTypes] = useState([]);
  const [typeOpen, setTypeOpen]   = useState(false);
  const [elementType, setElementType] = useState('');
  const [species, setSpecies]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    getElementTypes().then(setElementTypes);
  }, []);

  const canUpload = !!imageUri && !!elementType && species.trim().length > 0;

  async function handleUpload() {
    if (!canUpload) return;
    setSubmitting(true);
    setError('');
    try {
      const { latitude, longitude } = parseGps(gps);
      const result = await submitElement({
        elementName: species.trim(),
        elementType,
        latitude,
        longitude,
        imageUrl: imageUri,
        isGreen: true,
      });
      if (!result.success) {
        setError(result.error ?? 'Upload failed. Please try again.');
        return;
      }
      navigation.popTo('Map');
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Input" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image preview */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>

        {gps && <Text style={styles.gps}>{gps}</Text>}

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
            onSubmitEditing={handleUpload}
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

        <TouchableOpacity
          style={[styles.uploadBtn, !canUpload && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          activeOpacity={0.85}
          disabled={!canUpload || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.uploadText}>UPLOAD</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar
        onNavigateHome={() => navigation.popTo('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
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

  // gps
  gps: { marginTop: 12, fontSize: 14, color: '#4b4b4b', textAlign: 'center' },

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

  // upload
  uploadBtn: {
    marginTop: 36,
    width: '100%',
    height: 48,
    backgroundColor: '#1cb0f6',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnDisabled: { backgroundColor: '#a0d8f5' },
  uploadText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
