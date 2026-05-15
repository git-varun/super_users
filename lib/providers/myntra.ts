import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const MyntraProvider: PlatformProvider = {
  id: "Myntra",
  name: "Myntra",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www.myntra.com/api/search/v1/query?q=${encodeURIComponent(query)}&rows=5`;
    try {
      const res = await fetch(url, { headers: STANDARD_HEADERS });
      if (!res.ok) return [];
      const data = await res.json();
      return data.products?.slice(0, 5).map((p: any) => ({
        platform: "Myntra",
        title: p.productName,
        price: p.price,
        link: `https://www.myntra.com/${p.landingPageUrl}`,
        image: p.searchImage,
        bankOffers: [],
        isAvailable: true,
        features: {
          "Manu": [p.brand].filter(Boolean),
          "Info": [p.category, p.gender].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Myntra API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "2-4 Days",
    reliability: 0.95
  }
};
