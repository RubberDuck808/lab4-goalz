import { APICall } from "../hooks/useAPI";

export async function getAllBoundaries() {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("GET", "/boundaries", null, token);
  if (!res.ok) throw new Error(`Failed to fetch boundaries: ${res.status}`);
  return res.json();
}

export async function createBoundary(dto) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("POST", "/boundaries", JSON.stringify(dto), token);
  if (!res.ok) throw new Error(`Failed to create boundary (${res.status}): ${await res.text()}`);
}

export async function updateBoundary(id, dto) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("PUT", `/boundaries/${id}`, JSON.stringify(dto), token);
  if (!res.ok) throw new Error(`Failed to update boundary (${res.status}): ${await res.text()}`);
}

export async function deleteBoundary(id) {
  const token = localStorage.getItem("jwtToken") ?? "";
  const res = await APICall("DELETE", `/boundaries/${id}`, null, token);
  if (!res.ok) throw new Error(`Failed to delete boundary (${res.status})`);
}
