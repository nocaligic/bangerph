
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MarketCategory } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface DetailedAnalysis extends AnalysisResult {
  narrative: string; // Cultural context
}

export const analyzeVirality = async (tweetContent: string): Promise<DetailedAnalysis> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return {
      hypeScore: 69,
      reasoning: "API Key missing. Simulating maximum aesthetic hype.",
      verdict: "BANG",
      narrative: "This tweet is tapping into the current zeitgeist of decentralized finance and internet subcultures. It's high-octane alpha."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the viral potential and cultural context of this tweet for a prediction market called 'BANGR'.
      
      Tweet Content: "${tweetContent}"
      
      Provide a JSON response with:
      - hypeScore (integer 0-100)
      - reasoning (string, short, gen-z slang)
      - verdict (string: "BANG", "FLOP", "MID")
      - narrative (string, 2-3 sentences explaining the CULTURAL CONTEXT and why traders would bet on this. Be specific about internet trends.)
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
    
    return JSON.parse(text) as DetailedAnalysis;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      hypeScore: 0,
      reasoning: "AI broke. Too much hype.",
      verdict: "MID",
      narrative: "The narrative is currently obscured by high-frequency signal noise. Proceed with caution."
    };
  }
};

export const generateMarketDetails = async (tweetContent: string): Promise<{ title: string; description: string; category: MarketCategory }> => {
  if (!apiKey) {
    return {
      title: "Simulated Market Title",
      description: "This is a simulated description because the API key is missing.",
      category: "SHITPOST"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a prediction market title and description based on this tweet. 
      The market title should be a question about the outcome. 
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
    console.error("Gemini market generation failed:", error);
    return {
      title: "Unknown Market",
      description: "Could not generate details.",
      category: "SHITPOST"
    };
  }
}
