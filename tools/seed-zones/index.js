/**
 * Fetches Humber Arboretum boundary and named trails from OpenStreetMap (Overpass API)
 * and seeds them as Zone records via the Goalz dashboard API.
 *
 * Usage:
 *   node index.js --url https://localhost:7286 --email staff@goalz.ca --password yourpassword
 *
 * Flags:
 *   --url      Base URL of the Goalz API (default: https://localhost:7286)
 *   --email    Staff/Admin account email
 *   --password Account password
 *   --dry-run  Print zones without posting to the API
 */

import fetch from "node-fetch";
import https from "https";

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, val, i, arr) => {
    if (val.startsWith("--")) pairs.push([val.slice(2), arr[i + 1] ?? true]);
    return pairs;
  }, [])
);

const BASE_URL = args.url ?? "https://localhost:7286";
const EMAIL = args.email;
const PASSWORD = args.password;
const DRY_RUN = args["dry-run"] === true || args["dry-run"] === "true";

if (!DRY_RUN && (!EMAIL || !PASSWORD)) {
  console.error("Usage: node index.js --url <url> --email <email> --password <password>");
  console.error("       Add --dry-run to preview zones without posting.");
  process.exit(1);
}

// Allow self-signed certs in local dev (only used for HTTPS URLs)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const agentFor = (url) => url.startsWith("https:") ? httpsAgent : undefined;

// ── Overpass query ────────────────────────────────────────────────────────────

// Bounding box covers the Humber Arboretum campus in Etobicoke
const BBOX = "43.715,-79.625,43.740,-79.595";

const OVERPASS_QUERY = `
[out:json][timeout:30][bbox:${BBOX}];
(
  relation["name"="Humber Arboretum"];
  way["name"="Humber Arboretum"];
  way["leisure"~"garden|park"]["name"](${BBOX});
  way["landuse"~"forest|grass|meadow"]["name"](${BBOX});
  way["highway"~"path|footway"]["name"](${BBOX});
);
out geom;
`.trim();

async function fetchOsmData() {
  console.log("Fetching arboretum data from Overpass API...");
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });
  if (!res.ok) throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log(`  Received ${json.elements.length} OSM elements.`);
  return json.elements;
}

// ── OSM → GeoJSON conversion ──────────────────────────────────────────────────

function wayToCoordinates(element) {
  if (!element.geometry || element.geometry.length === 0) return null;
  return element.geometry.map((pt) => [pt.lon, pt.lat]);
}

function isClosed(coords) {
  if (!coords || coords.length < 4) return false;
  const first = coords[0];
  const last = coords[coords.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

function elementToZone(element) {
  const name = element.tags?.name;
  if (!name) return null;

  if (element.type === "way") {
    const coords = wayToCoordinates(element);
    if (!coords) return null;

    const closed = isClosed(coords);
    const highway = element.tags?.highway;
    const isPath = highway === "path" || highway === "footway";
    const zoneType = isPath ? "path" : closed ? "area" : "path";
    const color = zoneType === "path" ? "#8B6914" : "#2D7D46";

    const geometry = closed && !isPath
      ? { type: "Polygon", coordinates: [coords] }
      : { type: "LineString", coordinates: coords };

    return { name, zoneType, color, geometry };
  }

  if (element.type === "relation") {
    // Use the outer member ways to build a polygon
    const outerMembers = (element.members ?? [])
      .filter((m) => m.type === "way" && m.role === "outer" && m.geometry?.length > 0)
      .map((m) => m.geometry.map((pt) => [pt.lon, pt.lat]));

    if (outerMembers.length === 0) return null;

    const geometry = {
      type: "MultiPolygon",
      coordinates: outerMembers.map((ring) => [ring]),
    };

    return { name, zoneType: "boundary", color: "#1A5C2E", geometry };
  }

  return null;
}

// ── API interaction ───────────────────────────────────────────────────────────

async function login() {
  console.log(`Logging in as ${EMAIL}...`);
  const res = await fetch(`${BASE_URL}/api/game/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    agent: agentFor(BASE_URL),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const token = data.token ?? data.Token ?? data.accessToken;
  if (!token) throw new Error("Login response did not include a token.");
  console.log("  Logged in successfully.");
  return token;
}

async function postZone(token, zone) {
  const body = {
    name: zone.name,
    zoneType: zone.zoneType,
    color: zone.color,
    boundary: zone.geometry,
  };
  const res = await fetch(`${BASE_URL}/api/dashboard/zones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    agent: agentFor(BASE_URL),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /api/dashboard/zones failed (${res.status}): ${text}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const elements = await fetchOsmData();

  const zones = elements
    .map(elementToZone)
    .filter(Boolean)
    .filter((z, i, arr) => arr.findIndex((x) => x.name === z.name) === i); // dedupe by name

  if (zones.length === 0) {
    console.warn("No named zones found in the Overpass response. Check the bounding box or tags.");
    return;
  }

  console.log(`\nZones to seed (${zones.length}):`);
  zones.forEach((z) => console.log(`  [${z.zoneType}] ${z.name} (${z.color})`));

  if (DRY_RUN) {
    console.log("\n--dry-run: skipping API calls.");
    return;
  }

  const token = await login();

  console.log("\nPosting zones...");
  let ok = 0;
  let fail = 0;
  for (const zone of zones) {
    try {
      await postZone(token, zone);
      console.log(`  ✓ ${zone.name}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${zone.name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone. ${ok} seeded, ${fail} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
