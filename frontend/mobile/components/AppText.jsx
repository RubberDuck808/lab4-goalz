import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AppText({ style, children, ...props }) {
  const { fontScale } = useAccessibility();
  const flat = StyleSheet.flatten(style) || {};
  const merged = {
    ...flat,
    ...(flat.fontSize != null ? { fontSize: flat.fontSize * fontScale } : {}),
  };
  return <Text style={merged} {...props}>{children}</Text>;
}
