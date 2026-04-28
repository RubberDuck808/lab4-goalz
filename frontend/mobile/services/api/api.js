import { getToken, clearUser } from '../session';
import { navigationRef } from '../navigationRef';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function handle401() {
  await clearUser();
  navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
}

// Wrapper used for all authenticated fetch calls. Triggers auto-logout on 401.
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) await handle401();
  return response;
}

export async function authHeaders() {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/api/game/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) return { success: true, data: await response.json() };
  if (response.status === 401) return { success: false, error: 'Invalid email or password.' };
  if (response.status === 429) return { success: false, error: 'Too many attempts. Please wait a minute.' };
  return { success: false, error: 'Something went wrong. Please try again.' };
}

export async function signUp(username, name, email, password) {
  const response = await fetch(`${BASE_URL}/api/game/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, name, email, password }),
  });

  if (response.status === 201) return { success: true, data: await response.json() };
  if (response.status === 409) return { success: false, error: await response.text() };
  if (response.status === 429) return { success: false, error: 'Too many attempts. Please wait a minute.' };
  return { success: false, error: 'Something went wrong. Please try again.' };
}

// ── Friends ──────────────────────────────────────────────────────────────────

export async function searchUsers(query) {
  const response = await apiFetch(
    `${BASE_URL}/api/game/friends/search?q=${encodeURIComponent(query)}`,
    { headers: await authHeaders() }
  );
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, data: [] };
}

export async function getConnections(username) {
  const response = await fetch(`${BASE_URL}/api/game/friends/connections/${encodeURIComponent(username)}`);
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, data: [] };
}

export async function getFriendRequests() {
  const response = await apiFetch(`${BASE_URL}/api/game/friends/requests`, {
    headers: await authHeaders(),
  });
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, data: [] };
}

export async function sendFriendRequest(addresseeUsername) {
  const response = await apiFetch(`${BASE_URL}/api/game/friends/request`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ username: addresseeUsername }),
  });
  if (response.status === 204) return { success: true };
  if (response.status === 409) return { success: false, error: await response.text() };
  if (response.status === 404) return { success: false, error: 'User not found.' };
  return { success: false, error: 'Something went wrong.' };
}

export async function acceptFriendRequest(requesterUsername) {
  const response = await apiFetch(`${BASE_URL}/api/game/friends/accept`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ username: requesterUsername }),
  });
  if (response.status === 204) return { success: true };
  return { success: false, error: 'Something went wrong.' };
}

export async function declineFriendRequest(requesterUsername) {
  const response = await apiFetch(`${BASE_URL}/api/game/friends/decline`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ username: requesterUsername }),
  });
  if (response.status === 204) return { success: true };
  return { success: false, error: 'Something went wrong.' };
}

export async function getSensorData(sensorId) {
  const response = await fetch(`${BASE_URL}/api/game/sensors/${sensorId}/data`, {
    headers: await authHeaders(),
  });
  if (response.ok) return { success: true, data: await response.json() };
  return { success: false, data: [] };
}

export async function removeConnection(otherUsername) {
  const response = await apiFetch(`${BASE_URL}/api/game/friends/connection`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ username: otherUsername }),
  });
  if (response.status === 204) return { success: true };
  return { success: false, error: 'Something went wrong.' };
}

// ── Elements ─────────────────────────────────────────────────────────────────

export async function submitElement({ elementName, elementType, latitude, longitude, imageUrl, isGreen }) {
  const response = await fetch(`${BASE_URL}/api/dashboard/elements`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ elementName, elementType, latitude, longitude, imageUrl, isGreen }),
  });
  if (response.status === 201) return { success: true, data: await response.json() };
  return { success: false, error: 'Could not save element.' };
}
