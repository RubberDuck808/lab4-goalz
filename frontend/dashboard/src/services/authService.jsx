import { APICall } from "../hooks/useAPI";

const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { email: payload.sub, name: payload.name, role: payload.role };
    } catch {
        return null;
    }
};

export const authService = {
    authenticate: async (email, password) => {
        const response = await APICall("POST", "/auth/login", JSON.stringify({ email, password }), null);

        if (!response?.ok) {
            if (response?.status === 404)
                throw new Error("Invalid email or password.");
            throw new Error("An error occurred during login. Please try again.");
        }

        const data = await response.json();
        localStorage.removeItem("user");
        localStorage.setItem("token", data.token);
        return data;
    },

    getUser: () => {
        const token = localStorage.getItem("token");
        return token ? decodeToken(token) : null;
    },

    getToken: () => {
        return localStorage.getItem("token");
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}
