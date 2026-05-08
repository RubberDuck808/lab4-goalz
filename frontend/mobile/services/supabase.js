import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
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

export async function uploadPhotoToSupabase(imageUri) {
  const mimeType = getMimeType(imageUri);
  const ext      = getExtension(imageUri);
  const filename = `photo-${Date.now()}-${randomSuffix()}.${ext}`;

  // Read the file as a Blob for the Supabase client
  const response = await fetch(imageUri);
  const blob     = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filename, SIGNED_URL_EXPIRES_IN);

  if (signError) throw new Error(`Signed URL failed: ${signError.message}`);

  return data.signedUrl;
}
