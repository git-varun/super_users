import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";

export const UniqloProvider: PlatformProvider = {
  id: "Uniqlo",
  name: "Uniqlo",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www.uniqlo.com/in/api/commerce/v1/en/products/search?q=${encodeURIComponent(query)}&offset=0&limit=5&httpMethod=GET`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.result?.items?.slice(0, 5).map((item: any) => ({
        platform: "Uniqlo",
        title: item.name,
        price: parseFloat(item.price.base),
        link: `https://www.uniqlo.com/in/en/products/${item.productId}`,
        image: item.images?.[0]?.url || '',
        bankOffers: [],
        isAvailable: item.stockAvailability,
        features: {
          "Manu": ["Uniqlo"],
          "Info": [item.productId, item.genderCategory].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Uniqlo API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "3-5 Days",
    reliability: 0.97
  }
};
