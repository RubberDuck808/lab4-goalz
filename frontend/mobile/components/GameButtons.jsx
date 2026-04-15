import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SIZES = {
  default: { width: 328, height: 48, borderRadius: 13 },
  half:    { width: 156, height: 48, borderRadius: 13 },
  square:  { width: 328, height: 280, borderRadius: 20 },
};

const VARIANTS = {
  task:    { bg: '#1CB0F6', border: '#1899D6' },
  accept:  { bg: '#58CC02', border: '#5DA700' },
  decline: { bg: '#FF4B4B', border: '#90461F' },
  party:   { bg: '#FFC107', border: '#CC8F00' },
};

export default function GameButtons({ children, onPress, variant = 'task', size = 'default', style }) {
  const s = SIZES[size] || SIZES.default;
  const v = VARIANTS[variant] || VARIANTS.task;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          width: s.width,
          height: s.height,
          borderRadius: s.borderRadius,
          backgroundColor: v.bg,
          borderBottomWidth: 4,
          borderBottomColor: v.border,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderTopWidth: 0,
        },
        style,
      ]}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
