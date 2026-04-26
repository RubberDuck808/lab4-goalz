import { authHeaders } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function createParty(name, username) {
  const response = await fetch(`${BASE_URL}/api/game/party/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username }),
  });
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, error: 'Could not create party.' };
}

export async function joinParty(code) {
  const response = await fetch(`${BASE_URL}/api/game/party/join`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ code }),
  });
  if (response.ok) return { success: true, data: await response.json() };
  if (response.status === 404) return { success: false, error: 'Party not found.' };
  return { success: false, error: 'Could not join party.' };
}
