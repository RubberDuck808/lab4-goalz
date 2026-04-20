import { useState, useEffect } from "react";
import { getOverviewData } from "../services/overviewService";
import { mockOverviewData } from "../mock/overviewMock";

// Set to false when the backend is ready to serve real data.
const USE_MOCK = true;

export function useOverviewData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (USE_MOCK) {
            setData(mockOverviewData);
            setLoading(false);
            return;
        }

        getOverviewData()
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}
