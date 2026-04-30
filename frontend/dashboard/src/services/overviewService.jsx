import { APICall } from "../hooks/useAPI";

export const overviewService = {
    getAllElements: async () => {
        try {
            const response = await APICall(
                "GET",
                "/overview",
                null,
                localStorage.getItem("jwtToken") ?? ""
            );

            if (!response?.ok) {
                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");
                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");
                throw new Error('Failed to fetch overview data');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    },

    getCheckpoints: async () => {
        try {
            const response = await APICall(
                "GET",
                "/checkpoints",
                null,
                localStorage.getItem("jwtToken") ?? ""
            );
            if (!response?.ok) throw new Error('Failed to fetch checkpoints');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getElementTypes: async () => {
        const response = await APICall("GET", "/elements/types", null, localStorage.getItem("jwtToken") ?? "");
        if (!response?.ok) throw new Error('Failed to fetch element types');
        return await response.json();
    },

    createElement: async (element) => {
        const response = await APICall(
            "POST",
            "/elements",
            JSON.stringify(element),
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to create element');
        return await response.json();
    },

    updateElement: async (id, element) => {
        const response = await APICall(
            "PUT",
            `/elements/${id}`,
            JSON.stringify(element),
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to update element');
    },

    deleteElement: async (id) => {
        const response = await APICall(
            "DELETE",
            `/elements/${id}`,
            null,
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to delete element');
    },

    createSensor: async (sensor) => {
        const response = await APICall(
            "POST",
            "/sensors",
            JSON.stringify(sensor),
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to create sensor');
        return await response.json();
    },

    updateSensor: async (id, sensor) => {
        const response = await APICall(
            "PUT",
            `/sensors/${id}`,
            JSON.stringify(sensor),
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to update sensor');
    },

    deleteSensor: async (id) => {
        const response = await APICall(
            "DELETE",
            `/sensors/${id}`,
            null,
            localStorage.getItem("jwtToken") ?? ""
        );
        if (!response?.ok) throw new Error('Failed to delete sensor');
    },
}
