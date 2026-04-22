// Helpers for snapping a drawn polygon's closing segment to follow the curved
// boundary ring of the arboretum. All coordinates are Leaflet LatLng-like
// objects: { lat, lng }.

export const SNAP_TOLERANCE_METERS = 15

function toRad(d) { return (d * Math.PI) / 180 }

function haversine(a, b) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Perpendicular-project a point onto the segment a→b in equirectangular space.
// Close enough at arboretum scale and much cheaper than great-circle math.
function projectOntoSegment(p, a, b) {
  const ax = a.lng, ay = a.lat
  const bx = b.lng, by = b.lat
  const px = p.lng, py = p.lat
  const dx = bx - ax
  const dy = by - ay
  const denom = dx * dx + dy * dy
  if (denom === 0) return { t: 0, projected: { lat: ay, lng: ax } }
  let t = ((px - ax) * dx + (py - ay) * dy) / denom
  t = Math.max(0, Math.min(1, t))
  return { t, projected: { lat: ay + t * dy, lng: ax + t * dx } }
}

export function nearestPointOnRing(ring, point) {
  let best = { index: 0, t: 0, projected: ring[0], dist: Infinity }
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const { t, projected } = projectOntoSegment(point, a, b)
    const d = haversine(point, projected)
    if (d < best.dist) best = { index: i, t, projected, dist: d }
  }
  return best
}

function ringLength(vertices) {
  let total = 0
  for (let i = 0; i < vertices.length - 1; i++) total += haversine(vertices[i], vertices[i + 1])
  return total
}

// Walk the ring forward from position (aIdx, aT) to (bIdx, bT), collecting
// intermediate ring vertices so the returned path traces the actual boundary.
function sliceRingForward(ring, a, b) {
  const out = [a.projected]
  let i = a.index
  // If a and b land on the same segment and b is further along, no intermediate vertices
  const sameSeg = a.index === b.index && b.t >= a.t
  if (sameSeg) {
    out.push(b.projected)
    return out
  }
  // Advance to end of segment a.index, then walk vertices until we reach segment b.index
  let guard = 0
  const n = ring.length
  i = (a.index + 1) % n
  while (i !== (b.index + 1) % n && guard < n + 2) {
    out.push(ring[i])
    if (i === b.index) break
    i = (i + 1) % n
    guard++
  }
  out.push(b.projected)
  return out
}

export function shorterArc(ring, a, b) {
  const forward = sliceRingForward(ring, a, b)
  const backward = sliceRingForward(ring, b, a).slice().reverse()
  return ringLength(forward) <= ringLength(backward) ? forward : backward
}

// Snap the closing segment of `drawn` to follow the boundary arc.
// Returns the final ring of LatLng vertices (open — caller closes as needed).
// If either endpoint is further than SNAP_TOLERANCE_METERS from the ring,
// returns `drawn` unchanged.
export function snapClosingSegment(drawn, boundaryRing, toleranceM = SNAP_TOLERANCE_METERS) {
  if (!drawn || drawn.length < 3 || !boundaryRing || boundaryRing.length < 3) return drawn
  const first = drawn[0]
  const last = drawn[drawn.length - 1]
  const nearLast = nearestPointOnRing(boundaryRing, last)
  const nearFirst = nearestPointOnRing(boundaryRing, first)
  if (nearLast.dist > toleranceM || nearFirst.dist > toleranceM) return drawn
  const arc = shorterArc(boundaryRing, nearLast, nearFirst)
  // arc starts at projection(last) and ends at projection(first).
  // Drop the first arc vertex (duplicate of `last`-ish) and the last arc vertex
  // (will re-duplicate `first` when polygon closes).
  const middle = arc.slice(1, -1)
  return [...drawn, ...middle]
}

// Ray-cast point-in-polygon against a single ring of {lat,lng}.
export function isInsideRing(point, ring) {
  if (!ring || ring.length < 3) return true
  let inside = false
  const x = point.lng, y = point.lat
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lng, yi = ring[i].lat
    const xj = ring[j].lng, yj = ring[j].lat
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-15) + xi)
    if (intersect) inside = !inside
  }
  return inside
}
