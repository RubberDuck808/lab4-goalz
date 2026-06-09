import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Logo({ style, white = false }) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../assets/icon_white.png')}
        style={[styles.icon, white && styles.iconWhite]}
        resizeMode="contain"
      />
      <Text style={[styles.text, white && styles.textWhite]}>loggin</Text>
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
  icon: {
    width: 55,
    height: 55,
  },
  iconWhite: {
    tintColor: '#ffffff',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#C07F58',
  },
  textWhite: {
    color: '#ffffff',
  },
});
