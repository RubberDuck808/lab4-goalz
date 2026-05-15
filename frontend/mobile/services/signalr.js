import * as signalR from '@microsoft/signalr';
import { getToken, clearUser } from './session';
import { navigationRef } from './navigationRef';

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

async function getValidToken() {
  const token = await getToken();
  if (!token || isTokenExpired(token)) {
    await clearUser();
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
    return null;
  }
  return token;
}

export function buildPartyConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BASE}/hubs/party`, {
      accessTokenFactory: getValidToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
