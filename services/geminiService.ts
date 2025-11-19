import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeVirality = async (tweetContent: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return {
      hypeScore: 69,
      reasoning: "API Key missing. Simulating maximum aesthetic hype.",
      verdict: "BANG"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the viral potential of this tweet content for a prediction market called 'BANGR'.
      
      Tweet Content: "${tweetContent}"
      
      Provide a JSON response with:
      - hypeScore (integer 0-100)
      - reasoning (string, keep it short, punchy, gen-z slang, neo-brutalist style)
      - verdict (string, must be exactly one of: "BANG", "FLOP", "MID")
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypeScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ["BANG", "FLOP", "MID"] },
          },
          required: ["hypeScore", "reasoning", "verdict"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      hypeScore: 0,
      reasoning: "AI broke. Too much hype.",
      verdict: "MID"
    };
  }
};

export const generateMarketDetails = async (tweetContent: string): Promise<{ title: string; description: string; category: 'TECH' | 'MEME' | 'POLITICS' | 'CRYPTO' }> => {
  if (!apiKey) {
    return {
      title: "Simulated Market Title based on Tweet",
      description: "This is a simulated description because the API key is missing.",
      category: "MEME"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a prediction market title and description based on this tweet. 
      The market title should be a question (e.g., "Will X happen?"). 
      The description should be punchy.
      Category must be one of: TECH, MEME, POLITICS, CRYPTO.

      Tweet: "${tweetContent}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["TECH", "MEME", "POLITICS", "CRYPTO"] },
          },
          required: ["title", "description", "category"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as { title: string; description: string; category: 'TECH' | 'MEME' | 'POLITICS' | 'CRYPTO' };

  } catch (error) {
    console.error("Gemini market generation failed:", error);
    return {
      title: "Unknown Market",
      description: "Could not generate details.",
      category: "MEME"
    };
  }
}