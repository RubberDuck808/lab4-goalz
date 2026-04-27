import { APICall } from "../hooks/useAPI";
import { authService } from "./authService";

export const generateReportSerivce = {
    generateReport: async (fromDate, toDate, checkboxes, reportTypeCheckboxes) => {
        let reportType = 0;

        if (reportTypeCheckboxes.csv) reportType = 1;
        if (reportTypeCheckboxes.pdf) reportType = 2;
        if (reportTypeCheckboxes.txt) reportType = 3;

        const requestBody = {
            dateTimeFrom: fromDate,
            dateTimeTo: toDate,
            reportContents: {
                trees: checkboxes.trees,
                bushes: checkboxes.bushes,
                water: checkboxes.water,
                species: checkboxes.species,

                sensorData: checkboxes.sensorData,
                temperature: checkboxes.temperature,
                light: checkboxes.light,
                humidity: checkboxes.humidity,

                greenVsNonGreen: checkboxes.greenVsNonGreen,
                nativeVsNonNative: checkboxes.nativeVsNonNative,
                biodiversity: checkboxes.biodiversity,
                netZeroGoal: checkboxes.netZero,

                lineCharts: checkboxes.lineCharts,
                barCharts: checkboxes.barCharts,
                pieCharts: checkboxes.pieCharts,
                alboretumMap: checkboxes.map
            },
            reportType: reportType
        };

        const response = await APICall(
            "POST",
            "/generate",
            JSON.stringify(requestBody),
            null
        );

        if (!response?.ok) {
            if (response?.status === 400) {
                const message = await response.text();
                throw new Error(message);
            }
            
            if (response?.status === 500)
                throw new Error("An unexpected error occurred.");

            throw new Error("Failed to create user. Please try again.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "landscape-elements.csv";
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    }
}
