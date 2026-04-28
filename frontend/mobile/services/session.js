import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'login_user';
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
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  await Promise.all([
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile)),
    token ? SecureStore.setItemAsync(TOKEN_KEY, token) : Promise.resolve(),
  ]);
}

export async function getUser() {
  const json = await SecureStore.getItemAsync(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearUser() {
  await Promise.all([
    SecureStore.deleteItemAsync(USER_KEY),
    SecureStore.deleteItemAsync(TOKEN_KEY),
  ]);
}
