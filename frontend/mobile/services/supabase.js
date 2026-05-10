const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = 'Photo';
// 1 year in seconds — long-lived so the stored URL remains usable
const SIGNED_URL_EXPIRES_IN = 31536000;

export async function uploadPhotoToSupabase(imageUri) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
  }

  const filename = `photo-${Date.now()}.jpg`;
  const authHeader = { Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

  // 1. Upload
  const formData = new FormData();
  formData.append('file', { uri: imageUri, name: filename, type: 'image/jpeg' });

  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method: 'POST',
      headers: { ...authHeader, 'x-upsert': 'true' },
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`Supabase upload failed (${uploadRes.status}): ${body}`);
  }

  // 2. Generate a signed URL so the private bucket object is accessible
  const signRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${filename}`,
    {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: SIGNED_URL_EXPIRES_IN }),
    }
  );

  if (!signRes.ok) {
    const body = await signRes.text();
    throw new Error(`Supabase sign URL failed (${signRes.status}): ${body}`);
  }

  const { signedURL } = await signRes.json();
  return `${SUPABASE_URL}${signedURL}`;
}
