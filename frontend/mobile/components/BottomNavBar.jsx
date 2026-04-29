import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AwardIcon from '../assets/Award.svg';
import NavigationIcon from '../assets/Navigation.svg';
import UserIcon from '../assets/User.svg';

const NAV_ITEMS = [
  { Icon: AwardIcon,      alt: 'Goals',   onPressKey: 'leaderboard', width: 22, height: 22 },
  { Icon: NavigationIcon, alt: 'Explore', onPressKey: 'home',        width: 22, height: 22 },
  { Icon: UserIcon,       alt: 'Profile', onPressKey: 'profile',     width: 22, height: 25 },
];

export default function BottomNavBar({ onNavigateHome, onNavigateToProfile, onNavigateToLeaderboard }) {
  const handlers = { home: onNavigateHome, profile: onNavigateToProfile, leaderboard: onNavigateToLeaderboard };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map(({ Icon, alt, onPressKey, width, height }) => (
        <TouchableOpacity
          key={alt}
          onPress={onPressKey ? handlers[onPressKey] : null}
          style={styles.btn}
          activeOpacity={0.75}
        >
          <Icon width={width} height={height} />
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#DDF4FF',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#63C9F9',
    borderBottomWidth: 5,
    borderBottomColor: '#3aaedc',
  },
  icon: {
    fontSize: 20,
  },
});
