import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const BUCKET = 'Photo';

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

function randomSuffix() {
  return Math.random().toString(36).slice(2, 9);
}

export async function uploadPhotoToSupabase(imageUri) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
  }
  // usePhotoGallery always converts to JPEG before calling this function
  const filename = `photo-${Date.now()}-${randomSuffix()}.jpg`;

  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
