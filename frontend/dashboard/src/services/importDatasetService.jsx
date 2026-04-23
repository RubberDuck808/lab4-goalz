import { APICall } from "../hooks/useAPI";

export const importDatasetService = {
    uploadCSV: async (files) => {
        try {
            const formData = new FormData();
            // Assuming files is an array or single file
            if (Array.isArray(files)) {
                files.forEach((file) => {
                    formData.append('files', file);
                });
            } else {
                formData.append('files', files);
            }

            const response = await APICall(
                "POST",
                `/ImportDataset`, // Match your API method name
                formData,
                localStorage.getItem("jwtToken") ?? ""
            );

            if (!response?.ok) {
                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");
                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");

                throw new Error('Failed to upload files');
            }
          
            const data = await response.json();
            console.log("Upload successful:", data);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    storeCSV: async (records) => {
        try {
            const response = await APICall(
                "POST",
                `/ImportDataset/store`, // Match your API method name
                JSON.stringify(records),
                localStorage.getItem("jwtToken") ?? ""
            );

            if (!response?.ok) {
                if (response?.status === 401)
                    throw new Error("You are not authorized to run this process.");

                if (response?.status === 403)
                    throw new Error("You do not have permission to access this resource.");

                throw new Error('Failed to upload records');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}