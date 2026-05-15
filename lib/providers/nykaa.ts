import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const NykaaProvider: PlatformProvider = {
  id: "Nykaa",
  name: "Nykaa",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://nyk-aggregator-api.nykaa.com/nyk/aggregator-gludo/api/search.list?q=${encodeURIComponent(query)}&page_no=1&limit=5`;
    try {
      const res = await fetch(url, { headers: STANDARD_HEADERS });
      if (!res.ok) return [];
      const data = await res.json();
      return data.response?.products?.slice(0, 5).map((p: any) => ({
        platform: "Nykaa",
        title: p.name,
        price: p.final_price,
        originalPrice: p.price,
        discount: p.discount ? `${p.discount}% off` : undefined,
        link: `https://www.nykaa.com${p.url}`,
        image: p.image_url,
        bankOffers: [],
        isAvailable: p.in_stock,
        features: {
          "Manu": [p.brand_name].filter(Boolean),
          "Info": [p.quantity, p.offer_text].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Nykaa API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "2-4 Days",
    reliability: 0.93
  }
};
