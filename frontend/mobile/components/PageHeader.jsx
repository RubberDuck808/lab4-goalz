import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LessThanIcon from '../assets/lessthan.svg';

export default function PageHeader({ title = '', onBack }) {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <LessThanIcon width={24} height={24} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f3f46',
  },
});
