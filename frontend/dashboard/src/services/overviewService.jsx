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

                throw new Error('Failed to fetch history data');
            }
                      console.log(response);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error(error);
        }
    },

    updateElement: async (id, element) => {
        try {
            const response = await APICall(
                "PUT",
                `/overview/${id}`,
                JSON.stringify(element),
                localStorage.getItem("jwtToken") ?? ""
            );

            if (!response?.ok) {
                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");
                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");

                throw new Error('Failed to update element');
            }

            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
