import type { FormData, LabData } from '../types';

export const extractLabValuesFromText = async (text: string): Promise<Partial<LabData>> => {
    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to extract lab values.');
        }

        return await response.json();
    } catch (error) {
        console.error("Error calling extraction API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred during extraction.");
    }
};


export const analyzeLabResults = async (formData: FormData): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });

     if (!response.ok) {
        const errorData = await response.json();
        // Return the server's error message to be displayed to the user
        return errorData.message || "An error occurred on the server.";
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Error calling analysis API:", error);
    return "A network error occurred while analyzing your results. Please check your connection and try again.";
  }
};
