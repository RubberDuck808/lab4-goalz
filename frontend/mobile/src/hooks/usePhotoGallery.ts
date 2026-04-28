import * as ImagePicker from 'expo-image-picker';

export function usePhotoGallery() {
  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  return { takePhoto };
}
