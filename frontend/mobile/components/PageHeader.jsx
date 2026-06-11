import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LessThanIcon from '../assets/lessthan.svg';
import AppText from './AppText';


export default function PageHeader({ title = '', onBack, variant = 'back' }) {
  return (
    <View style={styles.container}>
      {onBack && (
        variant === 'cancel' ? (
          <TouchableOpacity onPress={onBack} style={styles.cancelBtn} activeOpacity={0.85}>
            <View style={styles.cancelBtnInner}>
              <Ionicons name="close" size={20} color="#fff" />
              <AppText style={styles.cancelLabel}>EXIT</AppText>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <LessThanIcon width={24} height={24} />
          </TouchableOpacity>
        )
      )}
      <AppText style={styles.title}>{title.toUpperCase()}</AppText>
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
    borderBottomColor: '#CC2525',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  cancelLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27272a',
  },
});
