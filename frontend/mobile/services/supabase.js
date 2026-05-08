import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // expo-image-manipulator always outputs a small JPEG so fetch().blob() is reliable
  const blob = await fetch(imageUri).then(r => r.blob());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
