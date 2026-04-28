import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store is native-only; fall back to localStorage on web
const storage = Platform.OS === 'web'
  ? {
      setItemAsync:    async (key, val) => { localStorage.setItem(key, val); },
      getItemAsync:    async (key)      => localStorage.getItem(key) ?? null,
      deleteItemAsync: async (key)      => { localStorage.removeItem(key); },
    }
  : SecureStore;

const USER_KEY  = 'login_user';
const TOKEN_KEY = 'login_token';

export async function storeUser(user) {
  // Backend DTOs use PascalCase (Token, Username, ...). Normalize to camelCase
  // so the rest of the app can consistently use `username`/`token`.
  const token = user?.token ?? user?.Token ?? null;

  const profile = {
    username: user?.username ?? user?.Username ?? '',
    name: user?.name ?? user?.Name ?? '',
    email: user?.email ?? user?.Email ?? '',
    createdAt: user?.createdAt ?? user?.CreatedAt ?? null,
  };

  if (!token) {
    await storage.deleteItemAsync(TOKEN_KEY);
  }
  await Promise.all([
    storage.setItemAsync(USER_KEY, JSON.stringify(profile)),
    token ? storage.setItemAsync(TOKEN_KEY, token) : Promise.resolve(),
  ]);
}

export async function getUser() {
  const json = await storage.getItemAsync(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function getToken() {
  return storage.getItemAsync(TOKEN_KEY);
}

export async function clearUser() {
  await Promise.all([
    storage.deleteItemAsync(USER_KEY),
    storage.deleteItemAsync(TOKEN_KEY),
  ]);
}
