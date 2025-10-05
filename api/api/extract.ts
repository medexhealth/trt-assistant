import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { LabData } from '../types';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Server Configuration Error: The Gemini API key is missing. Please set the API_KEY environment variable in your Vercel project settings.");
    }
    return new GoogleGenAI({ apiKey });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text to analyze is required.' });
        }

        const ai = getAiClient();
        
        const prompt = `
            Analyze the following text from a medical lab report. Your task is to extract the numerical values for the specified biomarkers.
            - totalTestosterone (ng/dL)
            - freeTestosterone (pg/mL)
            - estradiol (pg/mL)
            - hematocrit (%)

            The text may contain other values and information. Only extract the values for these four specific items.
            If a value for a specific item is not present in the text, return null for that key.
            The user's text to analyze is:
            ---
            ${text}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalTestosterone: { type: Type.STRING },
                        freeTestosterone: { type: Type.STRING },
                        estradiol: { type: Type.STRING },
                        hematocrit: { type: Type.STRING },
                    },
                },
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        
        return res.status(200).json(parsedJson as Partial<LabData>);

    } catch (error) {
        console.error("Error in /api/extract:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return res.status(500).json({ message: `Failed to extract lab values: ${errorMessage}` });
    }
}
