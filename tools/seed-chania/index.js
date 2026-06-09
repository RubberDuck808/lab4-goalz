/**
 * Seeds Elements and Sensors for the Chania Old Town / Venetian Harbour area
 * in Crete into the Goalz dashboard API.
 *
 * Usage:
 *   node index.js --url https://localhost:7286
 *   node index.js --url https://localhost:7286 --dry-run
 *
 * Flags:
 *   --url      Base URL of the Goalz API (default: https://localhost:7286)
 *   --dry-run  Print items without posting to the API
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
const DRY_RUN = args["dry-run"] === true || args["dry-run"] === "true";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const agentFor = (url) => url.startsWith("https:") ? httpsAgent : undefined;

// ── Seed data — Chania Old Town, Crete (~35.512–35.521°N, 24.014–24.025°E) ──

const SENSORS = [
  { sensorName: "Sensor - Venetian Harbour",  latitude: 35.5182, longitude: 24.0189 },
  { sensorName: "Sensor - Splantzia",         latitude: 35.5155, longitude: 24.0220 },
  { sensorName: "Sensor - Agora",             latitude: 35.5140, longitude: 24.0175 },
  { sensorName: "Sensor - Topanas",           latitude: 35.5165, longitude: 24.0165 },
  { sensorName: "Sensor - Firkas",            latitude: 35.5196, longitude: 24.0157 },
  { sensorName: "Sensor - Rimondi",           latitude: 35.5150, longitude: 24.0200 },
  { sensorName: "Sensor - Kastelli",          latitude: 35.5177, longitude: 24.0208 },
  { sensorName: "Sensor - Municipal Garden",  latitude: 35.5125, longitude: 24.0197 },
];

const ELEMENTS = [
  // Trees
  { elementName: "Venetian Lighthouse Cypress",     elementType: "Tree",     latitude: 35.5196, longitude: 24.0165, isGreen: true,  imageUrl: null },
  { elementName: "Harbour Palm",                    elementType: "Tree",     latitude: 35.5181, longitude: 24.0191, isGreen: true,  imageUrl: null },
  { elementName: "Splantzia Plane Tree",            elementType: "Tree",     latitude: 35.5157, longitude: 24.0225, isGreen: true,  imageUrl: null },
  { elementName: "Agora Olive Tree",                elementType: "Tree",     latitude: 35.5140, longitude: 24.0173, isGreen: true,  imageUrl: null },
  { elementName: "Topanas Fig Tree",                elementType: "Tree",     latitude: 35.5168, longitude: 24.0170, isGreen: true,  imageUrl: null },
  { elementName: "Archaeological Museum Lemon Tree",elementType: "Tree",     latitude: 35.5147, longitude: 24.0161, isGreen: true,  imageUrl: null },
  { elementName: "Skridlof St Carob",               elementType: "Tree",     latitude: 35.5142, longitude: 24.0186, isGreen: true,  imageUrl: null },
  { elementName: "Daskalogiannis Sq Plane Tree",    elementType: "Tree",     latitude: 35.5133, longitude: 24.0170, isGreen: true,  imageUrl: null },
  // Monuments
  { elementName: "Mosque of the Janissaries",       elementType: "Monument", latitude: 35.5182, longitude: 24.0185, isGreen: false, imageUrl: null },
  { elementName: "Venetian Lighthouse",             elementType: "Monument", latitude: 35.5199, longitude: 24.0163, isGreen: false, imageUrl: null },
  { elementName: "Firkas Fortress Gate",            elementType: "Monument", latitude: 35.5196, longitude: 24.0160, isGreen: false, imageUrl: null },
  { elementName: "Venetian Loggia",                 elementType: "Monument", latitude: 35.5143, longitude: 24.0175, isGreen: false, imageUrl: null },
  { elementName: "Schiavo Bastion",                 elementType: "Monument", latitude: 35.5138, longitude: 24.0150, isGreen: false, imageUrl: null },
  { elementName: "Chania Cathedral",                elementType: "Monument", latitude: 35.5148, longitude: 24.0176, isGreen: false, imageUrl: null },
  { elementName: "Kum Kapi Gate",                   elementType: "Monument", latitude: 35.5170, longitude: 24.0144, isGreen: false, imageUrl: null },
  // Fountains
  { elementName: "Rimondi Fountain",                elementType: "Fountain", latitude: 35.5151, longitude: 24.0202, isGreen: false, imageUrl: null },
  // Gardens
  { elementName: "Splantzia Oleanders",             elementType: "Garden",   latitude: 35.5158, longitude: 24.0219, isGreen: true,  imageUrl: null },
  { elementName: "Theotokopoulou Bougainvillea",    elementType: "Garden",   latitude: 35.5162, longitude: 24.0168, isGreen: true,  imageUrl: null },
  { elementName: "Kondeliaki Alley Jasmine",        elementType: "Garden",   latitude: 35.5152, longitude: 24.0183, isGreen: true,  imageUrl: null },
  { elementName: "Venetian Arsenal Moss Wall",      elementType: "Garden",   latitude: 35.5188, longitude: 24.0200, isGreen: true,  imageUrl: null },
  { elementName: "Kanevaro Bastion Agave",          elementType: "Garden",   latitude: 35.5180, longitude: 24.0149, isGreen: true,  imageUrl: null },
  { elementName: "Portou St Wisteria",              elementType: "Garden",   latitude: 35.5165, longitude: 24.0192, isGreen: true,  imageUrl: null },
];

// ── API helpers ───────────────────────────────────────────────────────────────

async function postSensor(sensor) {
  const res = await fetch(`${BASE_URL}/api/dashboard/sensors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sensor),
    agent: agentFor(BASE_URL),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
}

async function postElement(element) {
  const res = await fetch(`${BASE_URL}/api/dashboard/elements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(element),
    agent: agentFor(BASE_URL),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Target: ${BASE_URL}`);
  console.log(`\nSensors to seed (${SENSORS.length}):`);
  SENSORS.forEach((s) => console.log(`  ${s.sensorName} (${s.latitude}, ${s.longitude})`));

  console.log(`\nElements to seed (${ELEMENTS.length}):`);
  ELEMENTS.forEach((e) =>
    console.log(`  [${e.elementType}] ${e.elementName} (${e.latitude}, ${e.longitude}) isGreen=${e.isGreen}`)
  );

  if (DRY_RUN) {
    console.log("\n--dry-run: skipping API calls.");
    return;
  }

  let sensorOk = 0, sensorFail = 0;
  console.log("\nPosting sensors...");
  for (const sensor of SENSORS) {
    try {
      await postSensor(sensor);
      console.log(`  ✓ ${sensor.sensorName}`);
      sensorOk++;
    } catch (err) {
      console.error(`  ✗ ${sensor.sensorName}: ${err.message}`);
      sensorFail++;
    }
  }

  let elementOk = 0, elementFail = 0;
  console.log("\nPosting elements...");
  for (const element of ELEMENTS) {
    try {
      await postElement(element);
      console.log(`  ✓ ${element.elementName}`);
      elementOk++;
    } catch (err) {
      console.error(`  ✗ ${element.elementName}: ${err.message}`);
      elementFail++;
    }
  }

  console.log(`\nDone. Sensors: ${sensorOk} seeded, ${sensorFail} failed. Elements: ${elementOk} seeded, ${elementFail} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
