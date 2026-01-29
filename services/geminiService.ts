import { GoogleGenAI, Type } from "@google/genai";
import { ParsedSchedule } from "../types";

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

export const parseScheduleWithAI = async (input: string): Promise<ParsedSchedule | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const now = new Date().toISOString();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Current Date and Time: ${now}
        User Input: "${input}"

        Extract the tuition schedule details from the user input.
        - If a date is mentioned (e.g., "tomorrow", "next friday"), calculate the ISO date string based on the current date.
        - If no duration is mentioned, assume 60 minutes.
        - If no rate is mentioned, assume 0.
        - If any field is missing and cannot be inferred, make a best guess or use defaults.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            subject: { type: Type.STRING },
            startTime: { type: Type.STRING, description: "ISO 8601 Date String" },
            durationMinutes: { type: Type.NUMBER },
            rate: { type: Type.NUMBER },
          },
          required: ["studentName", "subject", "startTime", "durationMinutes", "rate"],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(cleanJsonString(response.text)) as ParsedSchedule;
      return parsed;
    }
    return null;

  } catch (error) {
    console.error("Error parsing schedule with AI:", error);
    return null;
  }
};
