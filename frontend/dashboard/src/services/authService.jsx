import { APICall } from "../hooks/useAPI";

export const authService = {
    authenticate: async (email, password) => {
        const response = await APICall("POST", "/auth/login", JSON.stringify({ email, password }), null);

        if (!response?.ok) {
            if (response?.status === 404)
                throw new Error("Invalid email or password.");
            throw new Error("An error occurred during login. Please try again.");
        }

        const data = await response.json();
        localStorage.setItem("user", JSON.stringify({ email: data.email, name: data.name, role: data.role }));
        return data;
    },

    getUser: () => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    },

    logout: () => {
        localStorage.removeItem("user");
    }
}
