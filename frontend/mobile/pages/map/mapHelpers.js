export const ARBORETUM_REGION = {
  latitude: 48.1468,
  longitude: 16.3852,
  latitudeDelta: 0.012,
  longitudeDelta: 0.015,
};

export const VISIT_RADIUS_METERS = 30;
// Photo spot: trigger radius for "arrived" detection and visible area on the map
export const PHOTO_VISIT_RADIUS_METERS  = 20;
export const PHOTO_AREA_DISPLAY_METERS  = 3;

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

// Returns all eligible checkpoints for a zone in a stable order.
export function getCpsForZone(zone, allCps, role) {
  return allCps.filter(cp => {
    if (cp.zoneId !== zone.id) return false;
    if (role === 'Scout')       return cp.type === 'sensor';
    if (role === 'Trailblazer') return cp.type !== 'sensor';
    return true;
  });
}

// Generates a virtual photo-spot checkpoint at the zone centroid.
// Used when a zone has no real checkpoints for Trailblazer/Explorer.
export function generatePhotoSpot(zone) {
  const centroid = zoneCentroid(zone);
  if (!centroid) return null;
  return {
    id: `photo-spot-${zone.id}`,
    type: 'photo',
    zoneId: zone.id,
    latitude: centroid.latitude,
    longitude: centroid.longitude,
    name: 'Photo Spot',
  };
}

// Minimum distance in metres from `user` to a boundary.
// Uses the full polygon bounding box when available (dashboard response),
// or falls back to the centroid point (game API response).
export function boundaryDistanceMeters(boundary, user) {
  const geom = safeParseGeometry(boundary?.boundary);
  if (geom) {
    const rings = extractRings(geom);
    if (rings.length && rings[0].length) {
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
      for (const ring of rings) {
        for (const [lng, lat] of ring) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
      }
      const clampedLat = Math.max(minLat, Math.min(maxLat, user.latitude));
      const clampedLng = Math.max(minLng, Math.min(maxLng, user.longitude));
      return haversineMeters(user, { latitude: clampedLat, longitude: clampedLng });
    }
  }
  // Fall back to centroid distance (game API returns centroidLatitude/centroidLongitude)
  const cLat = boundary?.centroidLatitude;
  const cLng = boundary?.centroidLongitude;
  if (cLat != null && cLng != null) {
    return haversineMeters(user, { latitude: cLat, longitude: cLng });
  }
  return Infinity;
}

// Returns real checkpoints for the zone, or a synthetic photo spot when
// Trailblazer/Explorer has no element checkpoints to visit there.
export function getEligibleCps(zone, allCps, role) {
  const cps = getCpsForZone(zone, allCps, role);
  if (cps.length === 0 && (role === 'Trailblazer' || role === 'Explorer')) {
    const spot = generatePhotoSpot(zone);
    return spot ? [spot] : [];
  }
  return cps;
}

// Walks `candidates` (already sorted in whatever order the caller wants — proximity,
// nearest-locked, etc.) and returns the first zone that actually has a task for `role`.
// Zones with nothing for this role are skipped (and returned in `skippedZoneIds` so the
// caller can mark them complete instead of leaving the player stuck).
export function findZoneWithTasks(candidates, allCps, role) {
  const skippedZoneIds = [];
  for (const zone of candidates) {
    const cps = getEligibleCps(zone, allCps, role);
    if (cps.length > 0) return { zone, cps, skippedZoneIds };
    skippedZoneIds.push(zone.id);
  }
  return { zone: null, cps: [], skippedZoneIds };
}

// Sorts `candidates` by distance from `refPoint` (a {latitude, longitude}, or any
// zone — its centroid is used), then returns the first with a real task for `role`.
export function pickZoneWithTasks(refPoint, candidates, allCps, role) {
  const from = refPoint?.latitude != null ? refPoint : zoneCentroid(refPoint);
  const sorted = from
    ? [...candidates].sort((a, b) => {
        const ca = zoneCentroid(a), cb = zoneCentroid(b);
        return (ca ? haversineMeters(from, ca) : Infinity) - (cb ? haversineMeters(from, cb) : Infinity);
      })
    : candidates;
  return findZoneWithTasks(sorted, allCps, role);
}

export function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1';
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661';
  if (cp.elementTypeId === 2) return '#1CB0F6';
  return '#EF4444';
}
