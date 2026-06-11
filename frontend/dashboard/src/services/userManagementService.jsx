import { APICall } from "../hooks/useAPI";
import { authService } from "./authService";

export const userManagementService = {
    listUsers: async () => {
        const response = await APICall(
            "GET",
            "/auth/users",
            null,
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) {
            if (response?.status === 401) throw new Error("Only admins can view users.");
            throw new Error("Failed to load users.");
        }
        return await response.json();
    },

    changeRole: async (userId, newRole) => {
        const response = await APICall(
            "PUT",
            `/auth/users/${userId}/role`,
            JSON.stringify({ newRole }),
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) {
            if (response?.status === 401) throw new Error("Only admins can change user roles.");
            if (response?.status === 404) throw new Error("User not found.");
            if (response?.status === 400) throw new Error("Invalid role.");
            throw new Error("Failed to change role.");
        }
    },

    deleteUser: async (userId) => {
        const response = await APICall(
            "DELETE",
            `/auth/users/${userId}`,
            null,
            sessionStorage.getItem("token") ?? ""
        );
        if (!response?.ok) {
            if (response?.status === 401) throw new Error("Only admins can delete users.");
            if (response?.status === 404) throw new Error("User not found.");
            if (response?.status === 400) throw new Error("Cannot delete your own account.");
            throw new Error("Failed to delete user.");
        }
    }
};
