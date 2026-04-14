import { APICall } from "../hooks/useAPI";

export const authService = {
    authenticate: async (email, password) => {
        try {
            const response = await APICall({
                endpoint: `/login`,
                authToken: localStorage.getItem("jwtToken") ?? "",
                value: JSON.stringify({ email, password }),
                type: "POST"
            });

            if (!response?.ok) {

                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");
                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");

                throw new Error('Failed to fetch history data');
            }
          
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }
}
