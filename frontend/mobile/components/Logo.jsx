import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LogoIcon from '../assets/logo.svg';

export default function Logo({ style }) {
  return (
    <View style={[styles.container, style]}>
      <LogoIcon width={55} height={55} />
      <Text style={styles.text}>loggin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 79,
    gap: 10,
  },

  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#C07F58',
  },
});
