const AVATAR_MAP = {
  1: require('../assets/avatars/UserAvatar_1.png'),
  2: require('../assets/avatars/UserAvatar_2.png'),
  3: require('../assets/avatars/UserAvatar_3.png'),
  4: require('../assets/avatars/UserAvatar_4.png'),
  5: require('../assets/avatars/UserAvatar_5.png'),
  6: require('../assets/avatars/UserAvatar_6.png'),
  7: require('../assets/avatars/UserAvatar_7.png'),
};

export const AVATAR_COUNT = 7;

export function getAvatar(avatarId) {
  return AVATAR_MAP[avatarId] ?? AVATAR_MAP[1];
}
