import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';

const SIZES = {
  default: { alignSelf: 'center', width: '100%', maxWidth: 328, height: 48, borderRadius: 13 },
  half:    { width: 156,                          height: 48,    borderRadius: 13 },
  square:  { alignSelf: 'center', width: '100%', maxWidth: 328, height: 280, borderRadius: 20 },
};

const VARIANTS = {
  task:    { bg: '#1CB0F6', border: '#1899D6' },
  accept:  { bg: '#58CC02', border: '#5DA700' },
  decline: { bg: '#FF4B4B', border: '#CC2525' },
  party:   { bg: '#F5A623', border: '#CC8B00' },
};

export default function GameButtons({ children, onPress, variant = 'task', size = 'default', style, disabled = false }) {
  const s = SIZES[size] || SIZES.default;
  const v = VARIANTS[variant] || VARIANTS.task;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.base,
        {
          ...s,
          backgroundColor: v.bg,
          borderBottomWidth: 4,
          borderBottomColor: v.border,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderTopWidth: 0,
        },
        style,
        disabled && styles.disabled,
      ]}
    >
      <AppText style={styles.text}>{children}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
