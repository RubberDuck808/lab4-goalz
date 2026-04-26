import { APICall } from "../hooks/useAPI";

export async function getAllZones() {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("GET", "/zones", null, token);
  if (!res.ok) throw new Error(`Failed to fetch zones: ${res.status}`);
  return res.json();
}

export async function createZone(dto) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("POST", "/zones", JSON.stringify(dto), token);
  if (!res.ok) throw new Error(`Failed to create zone (${res.status}): ${await res.text()}`);
}

export async function updateZone(id, dto) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("PUT", `/zones/${id}`, JSON.stringify(dto), token);
  if (!res.ok) throw new Error(`Failed to update zone (${res.status}): ${await res.text()}`);
}

export async function deleteZone(id) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("DELETE", `/zones/${id}`, null, token);
  if (!res.ok) throw new Error(`Failed to delete zone (${res.status})`);
}
