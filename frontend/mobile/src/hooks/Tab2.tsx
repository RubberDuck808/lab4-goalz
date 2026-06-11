import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePhotoGallery } from './usePhotoGallery';

interface Props {
  navigation: any;
}

const Tab2: React.FC<Props> = ({ navigation }) => {
  const { takePhoto } = usePhotoGallery();

  async function handleCamera() {
    const uri = await takePhoto();
    navigation.navigate('Camera', { imageUri: uri });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Gallery</Text>
      </View>

      <View style={styles.content} />

      <TouchableOpacity style={styles.fab} onPress={handleCamera} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Tab2;

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  header:  { height: 56, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e4e4e7' },
  title:   { fontSize: 18, fontWeight: 'bold', color: '#27272a' },
  content: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1cb0f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { fontSize: 28 },
});
