import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const ZeptoProvider: PlatformProvider = {
  id: "Zepto",
  name: "Zepto",
  categories: ["Grocery"],
  search: async (query: string, options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const token = process.env.ZEPTO_JWT_TOKEN;
    if (!token) return [];

    const lat = options?.lat || 28.4595;
    const lon = options?.lon || 77.0266;
    const url = `https://api.zeptonow.com/api/v1/inventory/search/?query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&page_number=0`;

    try {
      const res = await fetch(url, {
        headers: {
          ...STANDARD_HEADERS,
          "Authorization": `Bearer ${token}`,
          "platform": "android",
          "tenant_id": "1",
        }
      });
      if (!res.ok) throw new Error(`Zepto Error: ${res.statusText}`);
      const data = await res.json();
      return data.products?.slice(0, 5).map((item: any) => ({
        platform: "Zepto",
        title: item.name,
        price: item.discounted_price / 100 || item.mrp / 100,
        originalPrice: item.mrp / 100,
        discount: item.discount_percent ? `${item.discount_percent}% off` : undefined,
        link: `https://www.zeptonow.com/pn/${item.slug}/${item.id}`,
        image: item.image_url || '',
        bankOffers: [],
        isAvailable: item.is_out_of_stock === false,
        deliveryDate: "10-15 mins",
        features: {
          "Info": [
            item.quantity && `${item.quantity} ${item.unit || ''}`,
            item.pack_size
          ].filter(Boolean),
          "Manu": [item.brand_name].filter(Boolean),
          "Type": [item.category_name].filter(Boolean)
        }
      })) || [];
    } catch (error) {
      console.error("Zepto API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "10 Mins",
    reliability: 0.96
  }
};
