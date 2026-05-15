import { GoogleGenAI, SchemaType } from '@google/genai';
import { supabaseAdmin } from "./db-admin";

/**
 * Sense Intelligence Engine (Production Grade)
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const EMBEDDING_MODEL = 'gemini-embedding-2';

export type SearchIntent = {
  type: "generic" | "sku" | "constraint" | "attribute";
  category?: string;
  brand?: string;
  maxPrice?: number;
  entities: string[];
};

/**
 * Schema for guaranteed JSON output from Gemini
 */
const intentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: {
      type: SchemaType.STRING,
      enum: ["generic", "sku", "constraint", "attribute"],
      description: "Type of shopping intent",
    },
    category: {
      type: SchemaType.STRING,
      description: "Broad category like Electronics, Grocery, Fashion",
    },
    brand: {
      type: SchemaType.STRING,
      description: "Brand name mentioned in the query",
    },
    maxPrice: {
      type: SchemaType.NUMBER,
      description: "Budget limit if mentioned",
    },
    entities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Key product nouns",
    },
  },
  required: ["type", "entities"],
};

export type Recommendation = {
  type: "semantic" | "trending" | "history" | "deal";
  text: string;
  subtext?: string;
  score: number;
  metadata?: any;
};

export class SenseAI {
  /**
   * Classifies intent using Structured Outputs (JSON Schema)
   */
  static async classifyIntent(query: string): Promise<SearchIntent> {
    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        config: {
          responseMimeType: 'application/json',
          responseSchema: intentSchema,
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Analyze shopping intent: "${query}"` }],
          },
        ],
      });

      if (!response.text) throw new Error("Empty AI response");
      return JSON.parse(response.text) as SearchIntent;
    } catch (error) {
      console.error("Intent Classification Error:", error);
      return { type: "generic", entities: [query] };
    }
  }

  /**
   * Resilient Embedding Generation
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: [{ parts: [{ text }] }]
      });
      return result.embeddings?.[0]?.values || [];
    } catch (error) {
      console.error("Embedding Generation Error:", error);
      return [];
    }
  }

  /**
   * Hybrid retrieval with Search Grounding
   */
  static async getIntelligence(query: string): Promise<Recommendation[]> {
    const [intent, embedding] = await Promise.all([
      this.classifyIntent(query),
      this.generateEmbedding(query)
    ]);

    const recommendations: Recommendation[] = [];

    // 1. Semantic Match via strict RPC
    if (embedding.length > 0 && supabaseAdmin) {
      const { data: similarProducts } = await supabaseAdmin.rpc("match_products", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 3
      });

      if (similarProducts) {
        similarProducts.forEach((p: any) => {
          recommendations.push({
            type: "semantic",
            text: p.product_name,
            subtext: `Similar to ${intent.entities[0] || 'your search'}`,
            score: p.similarity * 0.8
          });
        });
      }
    }

    // 2. Real-time Trending (with Grounding)
    try {
      const trendingPrompt = `Trending items related to "${query}" in India today. Return as 2 short bullet points.`;
      const trendingResponse = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        config: {
          thinkingConfig: { thinkingLevel: 'HIGH' as any },
          tools: [{ googleSearch: {} }] as any
        },
        contents: [{ role: 'user', parts: [{ text: trendingPrompt }] }]
      });

      const text = trendingResponse.text || "";
      const lines = text.split('\n').filter(l => l.trim().length > 5).slice(0, 2);
      lines.forEach(line => {
        recommendations.push({
          type: "trending",
          text: line.replace(/^[-*•]\s*/, '').trim(),
          subtext: "Live Market Trend",
          score: 0.95
        });
      });
    } catch (e: any) {
      if (e?.status !== 429) console.warn("Trending Error:", e);
    }

    // 3. Category Fallback
    if (intent.category && recommendations.length < 3) {
      recommendations.push({
        type: "trending",
        text: `Best ${intent.category} Deals`,
        subtext: `Top picks for ${intent.brand || intent.entities[0]}`,
        score: 0.9
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }
}
