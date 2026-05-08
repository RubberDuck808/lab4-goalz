import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const BUCKET = 'Photo';
const SIGNED_URL_EXPIRES_IN = 31536000; // 1 year

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

function getMimeType(uri) {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  if (ext === 'png') return 'image/png';
  return 'image/jpeg';
}

function getExtension(uri) {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'heic') return 'heic';
  if (ext === 'heif') return 'heif';
  if (ext === 'png') return 'png';
  return 'jpg';
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 9);
}

// Decode a base64 string to ArrayBuffer — works without external deps
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function uploadPhotoToSupabase(imageUri) {
  const mimeType = getMimeType(imageUri);
  const ext      = getExtension(imageUri);
  const filename = `photo-${Date.now()}-${randomSuffix()}.${ext}`;

  // Read as base64 via expo-file-system — more reliable than fetch().blob() for
  // local file:// URIs on iOS/Android, especially for large HEIC/JPEG files.
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = base64ToArrayBuffer(base64);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filename, SIGNED_URL_EXPIRES_IN);

  if (signError) throw new Error(`Signed URL failed: ${signError.message}`);

  return data.signedUrl;
}
