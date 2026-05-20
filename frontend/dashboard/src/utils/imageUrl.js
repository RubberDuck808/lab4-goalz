export function isAllowedImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) return true;
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith('.supabase.co');
  } catch {
    return !url.includes('://');
  }
}
