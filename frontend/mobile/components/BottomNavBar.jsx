import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AwardIcon from '../assets/Award.svg';
import NavigationIcon from '../assets/Navigation.svg';
import UserIcon from '../assets/User.svg';

const NAV_ITEMS = [
  { Icon: AwardIcon,      alt: 'Goals',   screenKey: 'leaderboard', width: 22, height: 22 },
  { Icon: NavigationIcon, alt: 'Explore', screenKey: 'home',        width: 22, height: 22 },
  { Icon: UserIcon,       alt: 'Profile', screenKey: 'profile',     width: 22, height: 25 },
];

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
            style={[styles.btn, isActive ? styles.btnActive : styles.btnInactive]}
            activeOpacity={0.75}
          >
            <Icon width={width} height={height} />
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
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
