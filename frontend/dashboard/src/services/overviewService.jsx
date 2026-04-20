import { APICall } from "../hooks/useAPI";

export async function getOverviewData() {
    const token = localStorage.getItem("jwtToken") ?? "";
    const res = await APICall("GET", "/overview", undefined, token);
    if (!res.ok) throw new Error("Failed to fetch overview data");
    return res.json();
}
