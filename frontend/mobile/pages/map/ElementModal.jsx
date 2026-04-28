import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ElementModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.title}>Camera</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Close</Text>
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
    alignItems: 'center', width: 280,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  icon:    { fontSize: 48, marginBottom: 12 },
  title:   { fontSize: 22, fontWeight: '800', color: '#27272a', textTransform: 'uppercase', letterSpacing: 1 },
  btn: {
    marginTop: 24, backgroundColor: '#29e87b', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 40,
  },
  btnText: { color: '#0a1a0f', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
});
