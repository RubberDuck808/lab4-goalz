import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
    return { kind: 'success', uri: result.assets[0].uri };
  };

  return { takePhoto };
}
