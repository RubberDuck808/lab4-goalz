import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BUTTON_STYLES = {
  default: {
    bg: '#1CB0F6', border: '#0E8BC0',
    text: '#fff',
  },
  cancel: {
    bg: '#e4e4e7', border: '#a1a1aa',
    text: '#3f3f46',
  },
  destructive: {
    bg: '#FF4B4B', border: '#90461F',
    text: '#fff',
  },
};

export default function ConfirmModal({ visible, title, message, buttons = [] }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={[styles.btnRow, buttons.length === 1 && styles.btnRowSingle]}>
            {buttons.map((btn, i) => {
              const s = BUTTON_STYLES[btn.style ?? 'default'] ?? BUTTON_STYLES.default;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    buttons.length === 1 && styles.btnFull,
                    { backgroundColor: s.bg, borderBottomColor: s.border },
                  ]}
                  onPress={btn.onPress}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.btnText, { color: s.text }]}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f3f46',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 15,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnRowSingle: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 0,
    width: '100%',
  },
  btnText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
