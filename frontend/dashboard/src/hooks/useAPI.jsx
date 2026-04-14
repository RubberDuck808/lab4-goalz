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
        const res = await fetch("/api/dashboard" + endpoint, {
            method: type,
            headers: headers,
            body: value,
        });

       return res;
    } catch (error) {
        // ErrorNotification({text: "Gegevens kunnen niet worden opgeslagen!"});
        console.error(error);
        throw error;
    }
}