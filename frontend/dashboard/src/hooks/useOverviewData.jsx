import { useState, useEffect } from "react";
import { overviewService } from "../services/overviewService";

export function useOverviewData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        overviewService.getAllElements()
            .then((result) => {
                setData(result ?? null);
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
}
