
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeVehicleUrl = async (url: string): Promise<VehicleData> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this vehicle listing URL and extract all available technical details. 
    If you cannot access the real-time page content, use your search capabilities to find the specific listing details for: ${url}. 
    
    IMPORTANT for Facebook Marketplace compatibility:
    - exteriorColor/interiorColor: Must be a standard color (e.g., Black, White, Silver, Gray, Red, Blue, Brown, Beige). 
    - bodyStyle: Use standard categories (e.g., Sedan, SUV, Coupe, Hatchback, Truck, Van, Convertible).
    - mileage: Provide just the number.
    - price: Provide just the number.
    
    Provide a structured JSON response.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          year: { type: Type.INTEGER },
          make: { type: Type.STRING },
          model: { type: Type.STRING },
          price: { type: Type.STRING },
          mileage: { type: Type.STRING },
          vin: { type: Type.STRING },
          transmission: { type: Type.STRING },
          fuelType: { type: Type.STRING },
          exteriorColor: { type: Type.STRING },
          interiorColor: { type: Type.STRING },
          engine: { type: Type.STRING },
          bodyStyle: { type: Type.STRING },
          description: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "year", "make", "model", "price", "bodyStyle"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to extract vehicle data.");
  return JSON.parse(text) as VehicleData;
};
