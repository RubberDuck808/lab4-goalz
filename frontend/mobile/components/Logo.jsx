import React from 'react';
import { View, StyleSheet } from 'react-native';
import LogoIcon from '../assets/logo.svg';
import LogginText from '../assets/loggin.svg';

export default function Logo({ style }) {
  return (
    <View style={[styles.container, style]}>
      <LogoIcon width={55} height={55} />
      <LogginText width={120} height={40} />
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

});
