import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'loggin_user';
const TOKEN_KEY = 'loggin_token';

export async function storeUser(user) {
  const { token, ...profile } = user;
  await Promise.all([
    AsyncStorage.setItem(USER_KEY, JSON.stringify(profile)),
    token ? AsyncStorage.setItem(TOKEN_KEY, token) : Promise.resolve(),
  ]);
}

export async function getUser() {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearUser() {
  await Promise.all([
    AsyncStorage.removeItem(USER_KEY),
    AsyncStorage.removeItem(TOKEN_KEY),
  ]);
}
