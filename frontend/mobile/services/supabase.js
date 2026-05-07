const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const BUCKET = 'Photo';
// 1 year in seconds — long-lived so the stored URL remains usable
const SIGNED_URL_EXPIRES_IN = 31536000;

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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
  }

  const mimeType = getMimeType(imageUri);
  const ext = getExtension(imageUri);
  const filename = `photo-${Date.now()}-${randomSuffix()}.${ext}`;
  const authHeader = { Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

  // 1. Upload
  const formData = new FormData();
  formData.append('file', { uri: imageUri, name: filename, type: mimeType });

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
