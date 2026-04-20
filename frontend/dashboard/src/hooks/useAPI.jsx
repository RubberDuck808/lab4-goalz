export async function APICall(type = "GET", endpoint = "", value, authToken){

    const headers = new Headers();
    if (authToken) {
        headers.append("Authorization", `Bearer ${authToken}`);
    }

    // alleen Content-Type header zetten als value géén FormData is
    if (!(value instanceof FormData)) {
        headers.append("Content-Type", "application/json");
    }

    try {
        // Verzend het formulier naar het endpoint
        const base = import.meta.env.VITE_API_BASE_URL;
        console.log(base);

        const requestOptions = {
            method: type,
            headers: headers,
        };

        if (value !== undefined && value !== null && type !== "GET" && type !== "HEAD") {
            requestOptions.body = value;
        }

        const res = await fetch(`${base}/api/dashboard${endpoint}`, requestOptions);

       return res;
    } catch (error) {
        // ErrorNotification({text: "Gegevens kunnen niet worden opgeslagen!"});
        console.error(error);
        throw error;
    }
}