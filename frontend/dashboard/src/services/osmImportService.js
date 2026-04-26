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
    const outerMembers = (element.members ?? [])
      .filter((m) => m.type === "way" && m.role === "outer" && m.geometry?.length > 0)
      .map((m) => m.geometry.map((pt) => [pt.lon, pt.lat]));

    if (outerMembers.length === 0) return null;

    return {
      name,
      zoneType: "boundary",
      color: "#1A5C2E",
      geometry: { type: "MultiPolygon", coordinates: outerMembers.map((ring) => [ring]) },
    };
  }

  return null;
}

export async function fetchOsmZones() {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });
  if (!res.ok) throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.elements
    .map(elementToZone)
    .filter(Boolean)
    .filter((z, i, arr) => arr.findIndex((x) => x.name === z.name) === i);
}
