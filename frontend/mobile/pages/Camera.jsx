import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { usePhotoGallery } from '../src/hooks/usePhotoGallery';

export default function CameraPage({ navigation, route }) {
  const { takePhoto } = usePhotoGallery();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    let cancelled = false;
    (async () => {
      const result = await takePhoto();
      if (cancelled) return;

      if (result.kind === 'success') {
        navigation.navigate('UserPhoto', {
          imageUri: result.uri,
          gps: route?.params?.gps ?? null,
          fromGame: route?.params?.fromGame ?? false,
        });
      } else {
        // 'denied' shows an Alert from the hook before returning here;
        // 'cancelled' is a silent back. Both cases just pop this screen.
        navigation.goBack();
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
