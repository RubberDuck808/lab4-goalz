import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ElementModal({ visible, onClose, onTakePhoto }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.title}>Photo Checkpoint</Text>
          <Text style={styles.subtitle}>Take a photo to complete this checkpoint.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={onTakePhoto} activeOpacity={0.85}>
            <Text style={styles.btnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnSecondaryText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 32,
    alignItems: 'center', width: 300,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  icon:     { fontSize: 48, marginBottom: 12 },
  title:    { fontSize: 22, fontWeight: '800', color: '#27272a', textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#71717a', textAlign: 'center', marginTop: 6 },
  btnPrimary: {
    marginTop: 24, backgroundColor: '#29e87b', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 40,
  },
  btnText: { color: '#0a1a0f', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  btnSecondary: { marginTop: 12 },
  btnSecondaryText: { fontSize: 13, color: '#a1a1aa', textDecorationLine: 'underline' },
});
