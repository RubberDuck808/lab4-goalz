import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

type TakePhotoResult =
  | { kind: 'success'; uri: string }
  | { kind: 'cancelled' }
  | { kind: 'denied' };

export function usePhotoGallery() {
  const takePhoto = async (): Promise<TakePhotoResult> => {
    // requestCameraPermissionsAsync is idempotent — returns immediately if
    // already granted, so no need to call getCameraPermissionsAsync first.
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Camera Access Required',
          'Camera access has been denied. Please enable it in Settings to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return { kind: 'denied' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
      exif: false,
    });

    if (result.canceled) return { kind: 'cancelled' };

    // Convert to JPEG regardless of capture format (iOS captures HEIC by default
    // which browsers cannot display — this guarantees a browser-compatible file).
    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    return { kind: 'success', uri: compressed.uri };
  };

  return { takePhoto };
}
