import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';

const PLACEHOLDER_IMAGE = require('../assets/icon_white.png');

export default function UserPhoto({ navigation, route }) {
  const imageUri = route?.params?.imageUri ?? null;
  const imageSource = imageUri ? { uri: imageUri } : PLACEHOLDER_IMAGE;

  function handleUpload() {
    navigation.navigate('ImageUpload', {
      imageUri: imageUri,
      gps: route?.params?.gps,
      fromGame: route?.params?.fromGame ?? false,
    });
  }

  function handleRetry() {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <PageHeader title="Check your shot" />

      {/* Full-bleed photo */}
      <View style={styles.imageWrap}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Action buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.85}>
          <Text style={styles.btnText}>NEXT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
          <Text style={styles.btnText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  imageWrap: {
    flex: 1,
    marginHorizontal: -1,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  imageFallback: {
    backgroundColor: '#e4e4e7',
  },

  btnRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  uploadBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#52B788',
    borderRadius: 13,
    borderBottomWidth: 4,
    borderBottomColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#ff4b4b',
    borderRadius: 13,
    borderBottomWidth: 4,
    borderBottomColor: '#CC2525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
