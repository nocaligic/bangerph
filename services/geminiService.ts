
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MarketCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVirality = async (tweetContent: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the viral potential and cultural context of this tweet for a prediction market called 'BANGR'.
      
      Tweet Content: "${tweetContent}"
      
      Provide a JSON response with:
      - hypeScore (integer 0-100)
      - reasoning (string, keep it short, punchy, gen-z slang)
      - verdict (string: "BANG", "FLOP", "MID")
      - narrative (string, 1-2 sentences explaining the CULTURAL CONTEXT of this tweet)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypeScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ["BANG", "FLOP", "MID"] },
            narrative: { type: Type.STRING },
          },
          required: ["hypeScore", "reasoning", "verdict", "narrative"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      hypeScore: 69,
      reasoning: "AI is vibing too hard. Manual override.",
      verdict: "BANG",
      narrative: "This content is tapping into the current zeitgeist of internet absurdity."
    };
  }
};

export const generateMarketDetails = async (tweetContent: string): Promise<{ title: string; description: string; category: MarketCategory }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a prediction market title and description based on this tweet. 
      Title should be a short question. Description should be hype.
      Category must be one of: SHITPOST, RAGEBAIT, ALPHA, DRAMA.

      Tweet: "${tweetContent}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["SHITPOST", "RAGEBAIT", "ALPHA", "DRAMA"] },
          },
          required: ["title", "description", "category"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as { title: string; description: string; category: MarketCategory };
  } catch (error) {
    return {
      title: "Will this go viral?",
      description: "Betting on the absolute chaos of this tweet.",
      category: "SHITPOST"
    };
  }
};
