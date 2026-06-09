import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import GameButtons from '../components/GameButtons';

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
        <GameButtons variant="accept" size="half" onPress={handleUpload}>NEXT</GameButtons>
        <GameButtons variant="decline" size="half" onPress={handleRetry}>TRY AGAIN</GameButtons>
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
});
