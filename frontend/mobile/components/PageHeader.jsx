import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LessThanIcon from '../assets/lessthan.svg';

export default function PageHeader({ title = '', onBack, variant = 'back' }) {
  return (
    <View style={styles.container}>
      {onBack && (
        variant === 'cancel' ? (
          <TouchableOpacity onPress={onBack} style={styles.cancelBtn} activeOpacity={0.85}>
            <View style={styles.cancelBtnInner}>
              <Ionicons name="close" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <LessThanIcon width={24} height={24} />
          </TouchableOpacity>
        )
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
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  cancelBtn: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  cancelBtnInner: {
    width: 69,
    height: 47,
    borderRadius: 12,
    backgroundColor: '#FF4B4B',
    borderBottomWidth: 4,
    borderBottomColor: '#90461F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f3f46',
  },
});
