import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";

export const PumaProvider: PlatformProvider = {
  id: "Puma",
  name: "Puma",
  categories: ["Fashion"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://in.puma.com/api/graphql`;
    const gql = {
      operationName: "ProductSearch",
      variables: { query, offset: 0, limit: 5, sort: "RELEVANCE" },
      query: `query ProductSearch($query: String, $offset: Int, $limit: Int, $sort: ProductSort) {
        search(query: $query, offset: $offset, limit: $limit, sort: $sort) {
          products {
            name
            price { amount }
            images { url }
            url
            brand
            productType
          }
        }
      }`
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-puma-region": "IN",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(gql)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.search?.products?.slice(0, 5).map((p: any) => ({
        platform: "Puma",
        title: p.name,
        price: p.price?.amount,
        link: `https://in.puma.com${p.url}`,
        image: p.images?.[0]?.url || '',
        bankOffers: [],
        isAvailable: true,
        features: {
          "Manu": [p.brand || "Puma"].filter(Boolean),
          "Type": [p.productType].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Puma API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "2-4 Days",
    reliability: 0.95
  }
};
