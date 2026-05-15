import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";

export const HMProvider: PlatformProvider = {
  id: "H&M",
  name: "H&M",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www2.hm.com/en_in/search-results/_jcr_content/search.display.json?q=${encodeURIComponent(query)}&offset=0&page-size=5`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.hits?.slice(0, 5).map((p: any) => ({
        platform: "H&M",
        title: p.name,
        price: p.sellingPrice,
        link: `https://www2.hm.com${p.pdpUrl}`,
        image: p.image?.[0]?.url ? `https:${p.image[0].url}` : '',
        bankOffers: [],
        isAvailable: true,
        features: {
          "Manu": ["H&M"],
          "Info": [p.category, p.articleColorNames?.[0]].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("H&M API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "3-5 Days",
    reliability: 0.94
  }
};
