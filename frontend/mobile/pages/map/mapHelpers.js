export const ARBORETUM_REGION = {
  latitude: 48.1468,
  longitude: 16.3852,
  latitudeDelta: 0.012,
  longitudeDelta: 0.015,
};

export const VISIT_RADIUS_METERS = 30;

export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function safeParseGeometry(raw) {
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
  return raw && typeof raw === 'object' ? raw : null;
}

export function coordsToLatLng(ring) {
  return ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

export function extractRings(geometry) {
  switch (geometry?.type) {
    case 'Polygon':      return [geometry.coordinates[0]];
    case 'MultiPolygon': return geometry.coordinates.map(p => p[0]);
    default:             return [];
  }
}

export function ringCentroid(ring) {
  if (!ring?.length) return null;
  const sum = ring.reduce((a, [lng, lat]) => ({ lat: a.lat + lat, lng: a.lng + lng }), { lat: 0, lng: 0 });
  return { latitude: sum.lat / ring.length, longitude: sum.lng / ring.length };
}

export function zoneCentroid(zone) {
  const geom = safeParseGeometry(zone?.boundary);
  if (!geom) return null;
  return ringCentroid(extractRings(geom)[0]);
}

export function pickCpForZone(zone, allCps, role) {
  const cps = allCps.filter(cp => {
    if (cp.zoneId !== zone.id) return false;
    if (role === 'Scout')       return cp.type === 'sensor';
    if (role === 'Trailblazer') return cp.type !== 'sensor';
    return true;
  });
  return cps.length ? cps[Math.floor(Math.random() * cps.length)] : null;
}

export function nearestLocked(fromZone, allZones, doneIds) {
  const locked = allZones.filter(z => !doneIds.has(z.id) && z.id !== fromZone.id);
  if (!locked.length) return null;
  const from = zoneCentroid(fromZone);
  if (!from) return locked[0];
  return locked.sort((a, b) => {
    const ca = zoneCentroid(a), cb = zoneCentroid(b);
    return (ca ? haversineMeters(from, ca) : Infinity) - (cb ? haversineMeters(from, cb) : Infinity);
  })[0];
}

export function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1';
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661';
  if (cp.elementTypeId === 2) return '#3B82F6';
  return '#EF4444';
}
