import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";

export const AdidasProvider: PlatformProvider = {
  id: "Adidas",
  name: "Adidas",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www.adidas.co.in/api/plp/content-engine/search?query=${encodeURIComponent(query)}&start=0&count=5`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.raw?.itemList?.items?.slice(0, 5).map((p: any) => ({
        platform: "Adidas",
        title: p.displayName,
        price: p.salePrice || p.price,
        link: `https://www.adidas.co.in${p.link}`,
        image: p.image?.src || '',
        bankOffers: [],
        isAvailable: true,
        features: {
          "Manu": ["Adidas"],
          "Info": [p.subTitle, p.category].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Adidas API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "3-5 Days",
    reliability: 0.96
  }
};
