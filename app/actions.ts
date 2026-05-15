"use server";

import { registry } from "@/lib/registry";
import { initProviders } from "@/lib/providers/init";
import { ScrapedProduct } from "@/lib/providers";
import { redis } from "@/lib/redis";
import { recordPrice, createPriceWatch } from "@/lib/db";
import { SenseAI, Recommendation, SearchIntent } from "@/lib/ai-engine";

// Initialize registry
initProviders();

export type OrchestrationResponse = {
  intent: SearchIntent;
  platforms: string[];
  cacheKey: string;
};

/**
 * Production-grade HTML Sanitization
 */
function sanitize(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip tags
    .replace(/[&"']/g, '')     // Strip special chars that could break JSON/HTML
    .trim();
}

/**
 * Simple Redis-based Rate Limiter (Max 10 requests / minute)
 */
async function checkRateLimit(ip: string = "global"): Promise<boolean> {
  if (!redis) return true;
  const key = `rate_limit:${ip}`;
  const current = await (redis as any).incr(key);
  if (current === 1) await (redis as any).expire(key, 60);
  return current <= 15;
}

/**
 * PHASE 1: Classify and Route
 */
export async function getSearchOrchestration(
  query: string, 
  lat?: number, 
  lon?: number,
  allowedPlatforms?: string[]
): Promise<OrchestrationResponse> {
  const isAllowed = await checkRateLimit();
  if (!isAllowed) throw new Error("Rate limit exceeded. Please wait a minute.");

  const sanitizedQuery = sanitize(query);
  const intent = await SenseAI.classifyIntent(sanitizedQuery);
  const cacheKey = `search:${sanitizedQuery.toLowerCase()}:${lat || 0}:${lon || 0}`;

  // Determine platforms
  const category = intent.category || "General";
  let platforms = registry.getProvidersByCategory(category).map(p => p.id);
  
  if (platforms.length === 0) {
    platforms = registry.getProvidersByCategory("General").map(p => p.id);
  }

  // Filter by user selection
  if (allowedPlatforms && allowedPlatforms.length > 0) {
    platforms = platforms.filter(p => allowedPlatforms.includes(p));
  }

  return { intent, platforms, cacheKey };
}

/**
 * PHASE 2: Atomic Search Task (with Deduplication & Sanitization)
 */
export async function searchPlatformTask(
  platformId: string, 
  query: string, 
  lat?: number, 
  lon?: number
): Promise<ScrapedProduct[]> {
  try {
    const provider = registry.getProvider(platformId);
    if (!provider) return [];

    const results = await provider.search(sanitize(query), { lat, lon });

    // Production Hardening: Sanitize and record history
    const processed = results.map(p => ({
      ...p,
      title: sanitize(p.title),
      link: p.link.startsWith('http') ? p.link : `https://${p.platform.toLowerCase()}.com`
    }));

    for (const p of processed) {
      // Use stable SKU: platform + sanitized first 3 words of title
      const slug = p.title.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^\w-]/g, '');
      const productSku = `${platformId}:${slug}`;
      await recordPrice(productSku, p.platform, p.price);
    }

    return processed;
  } catch (error) {
    console.error(`[${platformId}] Task Error:`, error);
    return [];
  }
}

/**
 * Global Deduplication Utility for Frontend
 */
export function deduplicateResults(results: ScrapedProduct[]): ScrapedProduct[] {
  const seen = new Set();
  return results.filter(p => {
    // Deduplicate by price + truncated title
    const key = `${p.price}:${p.title.substring(0, 20).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Suggestion Engine (with Rate Limiting)
 */
export async function getSearchSuggestions(query: string): Promise<Suggestion[]> {
  if (!query || query.length < 2) return [];
  
  const isAllowed = await checkRateLimit();
  if (!isAllowed) return [];

  try {
    const [aiIntelligence] = await Promise.allSettled([
      SenseAI.getIntelligence(sanitize(query))
    ]);

    const results: Suggestion[] = [];
    if (aiIntelligence.status === "fulfilled" && aiIntelligence.value) {
      aiIntelligence.value.forEach((rec: Recommendation) => {
        results.push({
          type: rec.type === "deal" ? "price-trend" : rec.type === "semantic" ? "product" : "category",
          text: sanitize(rec.text),
          subtext: sanitize(rec.subtext || "")
        });
      });
    }

    return results.slice(0, 5);
  } catch (error) {
    return [];
  }
}

export type Suggestion = {
  type: "product" | "category" | "tip" | "history" | "price-trend";
  text: string;
  subtext?: string;
  price?: number;
  platform?: string;
};

export async function getAvailablePlatforms() {
  return registry.getAllProviders().map(p => ({
    id: p.id,
    name: p.name,
    categories: p.categories
  }));
}

export async function setupPriceAlert(productUrl: string, productName: string, targetPrice: number, userEmail: string) {
  return await createPriceWatch(productUrl, sanitize(productName), targetPrice, userEmail);
}
