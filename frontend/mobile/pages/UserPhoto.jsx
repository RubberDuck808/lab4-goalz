import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import BottomNavBar from '../components/BottomNavBar';

const PLACEHOLDER_IMAGE = 'https://imgs.search.brave.com/hRkvl3LnUzM9OaDvHhso94cLNguVIeXnscwD_ck_6hA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vTUFEQ0FL/MXNGS3cvMS90aHVt/Ym5haWxfbGFyZ2Ut/MS9jYW52YS1iZWVj/aC10cmVlLU1BRENB/SzFzRkt3LmpwZw';

export default function UserPhoto({ navigation, route }) {
  const imageUri = route?.params?.imageUri ?? null;

  function handleUpload() {
    navigation.navigate('ImageUpload', {
      imageUri: imageUri ?? PLACEHOLDER_IMAGE,
      gps: route?.params?.gps,
    });
  }

  function handleRetry() {
    navigation.navigate('Camera');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <PageHeader title="Upload" />

      {/* Full-bleed photo */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUri ?? PLACEHOLDER_IMAGE }}
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
          <Text style={styles.btnText}>RETRY</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar
        onNavigateHome={() => navigation.navigate('Home')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
        onNavigateToLeaderboard={() => navigation.navigate('Leaderboard')}
      />
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
    backgroundColor: '#58cc02',
    borderRadius: 13,
    borderBottomWidth: 4,
    borderBottomColor: '#5da700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#ff4b4b',
    borderRadius: 13,
    borderBottomWidth: 4,
    borderBottomColor: '#90461f',
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
