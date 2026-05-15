import { cacheCoupons } from "../lib/db";
import { SenseAI } from "../lib/ai-engine";

/**
 * Script to scrape and update coupons from various platforms.
 * Uses direct API sniffing to stay lightweight.
 */
async function updateCoupons() {
  console.log("🚀 Starting Coupon Update...");
  
  const platforms = ["Amazon", "Flipkart", "Myntra", "Nykaa", "Blinkit"];
  const allCoupons: any[] = [];

  for (const platform of platforms) {
    try {
      console.log(`🔍 Fetching coupons for ${platform}...`);
      let coupons: any[] = [];

      if (platform === "Amazon") {
        coupons = await fetchAmazonCoupons();
      } else if (platform === "Flipkart") {
        coupons = await fetchFlipkartCoupons();
      } else if (platform === "Myntra") {
        coupons = await fetchMyntraCoupons();
      }

      // Enhance coupons with AI tags
      for (const coupon of coupons) {
        const intent = await SenseAI.classifyIntent(coupon.description);
        coupon.ai_tags = [intent.category || "General", ...intent.entities];
      }

      allCoupons.push(...coupons);
    } catch (error) {
      console.error(`Failed to fetch coupons for ${platform}:`, error);
    }
  }

  if (allCoupons.length > 0) {
    await cacheCoupons(allCoupons);
    console.log(`✅ Successfully updated ${allCoupons.length} coupons.`);
  } else {
    console.log("⚠️ No coupons found.");
  }
}

async function fetchAmazonCoupons() {
  // Sniffing Amazon's coupon page
  const url = "https://www.amazon.in/gp/coupons";
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    
    const coupons: any[] = [];
    // Using a simpler regex that works with older ES targets if needed, though we updated to ES2020
    const matches = html.matchAll(/coupon-description">(.*?)<\/span>.*?code-text">(.*?)<\/span>/gs);
    
    for (const match of matches) {
      coupons.push({
        platform: "Amazon",
        code: match[2].trim(),
        description: match[1].trim(),
        source: "scraper",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return coupons.slice(0, 10);
  } catch { return []; }
}

async function fetchFlipkartCoupons() {
  // Flipkart coupons are often personalized, but we can sniff general offers
  return [
    { platform: "Flipkart", code: "WELCOME50", discount_percent: 50, category: "General", description: "50% off on your first order", source: "manual" }
  ];
}

async function fetchMyntraCoupons() {
  // Myntra uses a clean JSON for offers
  const url = "https://www.myntra.com/api/coupons/active";
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    return data.coupons?.map((c: any) => ({
      platform: "Myntra",
      code: c.code,
      discount_flat: c.value,
      description: c.description,
      source: "api"
    })) || [];
  } catch { return []; }
}

updateCoupons().catch(console.error);
