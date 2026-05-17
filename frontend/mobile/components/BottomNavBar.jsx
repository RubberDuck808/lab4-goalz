import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AwardIcon from '../assets/Award.svg';
import NavigationIcon from '../assets/Navigation.svg';
import UserIcon from '../assets/User.svg';
import AppText from './AppText';

const NAV_ITEMS = [
  { Icon: AwardIcon,      alt: 'Goals',   screenKey: 'leaderboard', width: 22, height: 22 },
  { Icon: NavigationIcon, alt: 'Explore', screenKey: 'home',        width: 22, height: 22 },
  { Icon: UserIcon,       alt: 'Profile', screenKey: 'profile',     width: 22, height: 25 },
];

const TAB_COLOURS = {
  leaderboard: { bg: '#FFF3D4', border: '#FFC107', bottomBorder: '#CC8B00', label: '#CC8B00' },
  home:        { bg: '#D1FAE5', border: '#52B788', bottomBorder: '#2D6A4F', label: '#2D6A4F' },
  profile:     { bg: '#DDF4FF', border: '#63C9F9', bottomBorder: '#3AAEDC', label: '#1CB0F6' },
};

export default function BottomNavBar({ onNavigateHome, onNavigateToProfile, onNavigateToLeaderboard, activeScreen }) {
  const handlers = {
    home: onNavigateHome,
    profile: onNavigateToProfile,
    leaderboard: onNavigateToLeaderboard,
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map(({ Icon, alt, screenKey, width, height }) => {
        const isActive = activeScreen === screenKey;
        return (
          <TouchableOpacity
            key={alt}
            onPress={handlers[screenKey]}
            style={[
              styles.btn,
              isActive ? {
                backgroundColor: TAB_COLOURS[screenKey].bg,
                borderWidth: 2,
                borderColor: TAB_COLOURS[screenKey].border,
                borderBottomWidth: 5,
                borderBottomColor: TAB_COLOURS[screenKey].bottomBorder,
              } : styles.btnInactive,
            ]}
            activeOpacity={0.75}
            accessibilityLabel={alt}
            accessibilityRole="button"
          >
            <Icon width={width} height={height} />
            <AppText style={[styles.label, isActive && { color: TAB_COLOURS[screenKey].label }]}>{alt}</AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
  },
  btn: {
    width: 64,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 2,
  },
  label: { fontSize: 10, color: '#a1a1aa', fontWeight: '500' },
  labelActive: { color: '#1CB0F6' },
  btnActive: {
    backgroundColor: '#DDF4FF',
    borderWidth: 2,
    borderColor: '#63C9F9',
    borderBottomWidth: 5,
    borderBottomColor: '#3aaedc',
  },
  btnInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
