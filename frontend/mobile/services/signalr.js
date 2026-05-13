import * as signalR from '@microsoft/signalr';
import { getToken } from './session';

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export function buildPartyConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BASE}/hubs/party`, {
      accessTokenFactory: () => getToken(),
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
