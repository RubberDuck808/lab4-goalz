const REQUEST_TIMEOUT_MS = 10_000;

export async function APICall(type = "GET", endpoint = "", value, authToken){

    const headers = new Headers();
    if (authToken) {
        headers.append("Authorization", `Bearer ${authToken}`);
    }
    if (!(value instanceof FormData)) {
        headers.append("Content-Type", "application/json");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const base = import.meta.env.VITE_API_BASE_URL;

        const requestOptions = {
            method: type,
            headers: headers,
            signal: controller.signal,
        };

        if (value !== undefined && value !== null && type !== "GET" && type !== "HEAD") {
            requestOptions.body = value;
        }

        const res = await fetch(`${base}/api/dashboard${endpoint}`, requestOptions);

        return res;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}