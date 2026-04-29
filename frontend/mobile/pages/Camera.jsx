import React, { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePhotoGallery } from '../src/hooks/usePhotoGallery';

export default function CameraPage({ navigation, route }) {
  const { takePhoto } = usePhotoGallery();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function launch() {
        const uri = await takePhoto();
        if (!active) return;
        if (uri) {
          navigation.navigate('UserPhoto', {
            imageUri: uri,
            gps: route?.params?.gps ?? null,
          });
        } else {
          navigation.goBack();
        }
      }
      launch();
      return () => { active = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
});
