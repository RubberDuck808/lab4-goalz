import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import SQUIRREL_URI from '../assets/Intro Notification.png';

export default function PopUp({ visible, message, onConfirm, buttonLabel = 'I HAVE READ THE INFO' }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onConfirm}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.row}>
            <Image source={SQUIRREL_URI} style={styles.mascot} resizeMode="contain" />
            <View style={styles.bubbleOuter}>
              <View style={styles.rectangle19} />
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{message}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascot: {
    width: 102.1269,
    height: 95.2612,
  },
  bubbleOuter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Rectangle 19 — triangular speech bubble nib (Figma: 13.73 × 12.01, rotated 45°)
  rectangle19: {
    width: 13.7313,
    height: 12.0149,
    borderWidth: 2,
    borderColor: '#22CF64',
    borderRadius: 11,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginRight: -8,
  },
  // Rectangle 18 — white fill content area (Figma: bg-white, rounded-10)
  bubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22CF64',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b4b4b',
    letterSpacing: 0.6,
  },
  button: {
    backgroundColor: '#58cc02',
    borderRadius: 13,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#5da700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.32,
    textTransform: 'uppercase',
  },
});
