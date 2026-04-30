import { authHeaders, apiFetch } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function getZones() {
  try {
    const response = await apiFetch(`${BASE_URL}/api/game/zones`, {
      headers: await authHeaders(),
    });
    if (response.ok) return { success: true, data: await response.json() };
    return { success: false, error: 'Could not fetch zones.' };
  } catch {
    return { success: false, error: 'Could not reach the server.' };
  }
}

export async function getBoundaries() {
  try {
    const response = await apiFetch(`${BASE_URL}/api/game/boundaries`, {
      headers: await authHeaders(),
    });
    if (response.ok) return { success: true, data: await response.json() };
    return { success: false, error: 'Could not fetch boundaries.' };
  } catch {
    return { success: false, error: 'Could not reach the server.' };
  }
}

export async function createParty(name, config = {}) {
  try {
    const response = await apiFetch(`${BASE_URL}/api/game/party/create`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ name, ...config }),
    });

    if (response.ok) return { success: true, data: await response.json() };

    const text = await response.text().catch(() => '');
    if (response.status === 401) return { success: false, error: 'You are not logged in. Please log in again.' };
    return { success: false, error: text || 'Could not create party.' };
  } catch {
    return { success: false, error: 'Could not reach the server. Check your connection.' };
  }
}

export async function joinParty(code) {
  const response = await apiFetch(`${BASE_URL}/api/game/party/join`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ code: parseInt(code, 10) }),
  });
  if (response.ok) return { success: true, data: await response.json() };
  if (response.status === 404) return { success: false, error: 'Party not found.' };
  return { success: false, error: 'Could not join party.' };
}

export async function getLobby(partyId) {
  const response = await apiFetch(`${BASE_URL}/api/game/party/${partyId}/lobby`, {
    headers: await authHeaders(),
  });
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, error: 'Could not fetch lobby.' };
}

export async function startGame(partyId) {
  const response = await apiFetch(`${BASE_URL}/api/game/party/${partyId}/start`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (response.ok) return { success: true };
  return { success: false, error: 'Could not start game.' };
}

export async function getGameState(partyId) {
  const response = await apiFetch(`${BASE_URL}/api/game/party/${partyId}/state`, {
    headers: await authHeaders(),
  });
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, error: 'Could not fetch game state.' };
}

export async function getCheckpoints() {
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/checkpoints`);
    if (response.ok) return { success: true, data: await response.json() };
    return { success: false, data: [] };
  } catch {
    return { success: false, data: [] };
  }
}

export async function visitCheckpoint(partyId, checkpointId) {
  const response = await apiFetch(`${BASE_URL}/api/game/party/${partyId}/visit`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ checkpointId }),
  });
  if (response.ok) return { success: true };
  return { success: false, error: 'Could not visit checkpoint.' };
}
