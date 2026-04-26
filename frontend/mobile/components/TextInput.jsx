import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';

export default function TextInput({ style, ...props }) {
  return (
    <RNTextInput
      placeholderTextColor="#888"
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: 325,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#777',
    backgroundColor: '#D9D9D9',
    fontSize: 15,
    color: '#333',
  },
});
