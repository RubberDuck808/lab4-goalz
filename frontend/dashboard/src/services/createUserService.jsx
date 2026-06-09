import { APICall } from "../hooks/useAPI";

export const createUserService = {
    createStaffUser: async (email, name, password) => {
        const response = await APICall(
            "POST",
            "/auth/create-user",
            JSON.stringify({ email, name, password }),
            sessionStorage.getItem("token") ?? ""
        );

        if (!response?.ok) {
            if (response?.status === 401)
                throw new Error("Only admins can create new users.");
            if (response?.status === 409)
                throw new Error("An account with this email already exists.");
            throw new Error("Failed to create user. Please try again.");
        }

        return await response.json();
    }
}
