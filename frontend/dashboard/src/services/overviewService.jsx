import { APICall } from "../hooks/useAPI";

const _cache = {};
const CACHE_TTL = 60_000;

function cached(key, fetcher) {
    const entry = _cache[key];
    if (entry && Date.now() - entry.ts < CACHE_TTL) return Promise.resolve(entry.data);
    return fetcher().then(data => { _cache[key] = { data, ts: Date.now() }; return data; });
}

export function invalidateOverviewCache() {
    delete _cache['overview'];
}

export const overviewService = {
    getAllElements: async () => {
        return cached('overview', async () => {
            const response = await APICall(
                "GET",
                "/overview",
                null,
                sessionStorage.getItem("token") ?? ""
            );

            if (!response?.ok) {
                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");
                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");
                throw new Error('Failed to fetch overview data');
            }
            return response.json();
        });
    },

    getCheckpoints: async () => {
        try {
            const response = await APICall(
                "GET",
                "/checkpoints",
                null,
                sessionStorage.getItem("token") ?? ""
            );
            if (!response?.ok) throw new Error('Failed to fetch checkpoints');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getElementTypes: async () => {
        try {
            const response = await APICall("GET", "/elements/types", null, sessionStorage.getItem("token") ?? "");
            if (!response?.ok) throw new Error('Failed to fetch element types');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    createElement: async (element) => {
        const response = await APICall(
            "POST",
            "/elements",
            JSON.stringify(element),
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to create element');
        invalidateOverviewCache();
        return await response.json();
    },

    updateElement: async (id, element) => {
        const response = await APICall(
            "PUT",
            `/elements/${id}`,
            JSON.stringify(element),
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to update element');
        invalidateOverviewCache();
    },

    deleteElement: async (id) => {
        const response = await APICall(
            "DELETE",
            `/elements/${id}`,
            null,
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to delete element');
        invalidateOverviewCache();
    },

    createSensor: async (sensor) => {
        const response = await APICall(
            "POST",
            "/sensors",
            JSON.stringify(sensor),
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to create sensor');
        invalidateOverviewCache();
        return await response.json();
    },

    updateSensor: async (id, sensor) => {
        const response = await APICall(
            "PUT",
            `/sensors/${id}`,
            JSON.stringify(sensor),
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to update sensor');
        invalidateOverviewCache();
    },

    deleteSensor: async (id) => {
        const response = await APICall(
            "DELETE",
            `/sensors/${id}`,
            null,
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to delete sensor');
        invalidateOverviewCache();
    },

    getPendingElements: async () => {
        const res = await APICall("GET", "/elements/pending", null, sessionStorage.getItem("token") ?? "");
        if (!res?.ok) throw new Error('Failed to fetch pending elements');
        return res.json();
    },

    approveElement: async (id) => {
        const res = await APICall("PUT", `/elements/${id}/approve`, null, sessionStorage.getItem("token") ?? "");
        if (!res?.ok) throw new Error('Failed to approve element');
        invalidateOverviewCache();
    },

    rejectElement: async (id) => {
        const res = await APICall("PUT", `/elements/${id}/reject`, null, sessionStorage.getItem("token") ?? "");
        if (!res?.ok) throw new Error('Failed to reject element');
        invalidateOverviewCache();
    },

    getSensorHistory: async (id, limit = 500) => {
        const res = await APICall("GET", `/sensors/${id}/data?limit=${limit}`, null, sessionStorage.getItem("token") ?? "");
        if (!res?.ok) throw new Error('Failed to fetch sensor data history');
        return res.json();
    },
}
