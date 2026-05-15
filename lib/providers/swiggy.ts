import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const InstamartProvider: PlatformProvider = {
  id: "Instamart",
  name: "Swiggy Instamart",
  categories: ["Grocery"],
  search: async (query: string, options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const lat = options?.lat || 28.4595;
    const lon = options?.lon || 77.0266;
    
    // Swiggy Instamart uses latitude and longitude in query params for localization
    const url = `https://www.swiggy.com/api/instamart/search/v2?query=${encodeURIComponent(query)}&lat=${lat}&lng=${lon}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...STANDARD_HEADERS,
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
          "Referer": "https://www.swiggy.com/instamart",
        },
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) throw new Error(`Swiggy API Error: ${res.statusText}`);
      const json = await res.json();
      
      const products: ScrapedProduct[] = [];

      function findInstamartProducts(obj: any) {
        if (!obj || typeof obj !== 'object') return;
        
        // Match Swiggy's internal product structure
        if (obj.product_id && obj.name && obj.price !== undefined) {
          if (!products.find(p => p.title === obj.name)) {
            const imageId = obj.images?.[0] || obj.image_id;
            const image = imageId ? `https://instamart-media-assets.swiggy.com/swiggy/raw/upload/fl_lossy,f_auto,q_auto,h_250/${imageId}` : '';
            
            products.push({
              platform: "Instamart",
              title: obj.name,
              price: obj.price / 100 || 0,
              link: `https://www.swiggy.com/instamart/item/${obj.product_id}`,
              image,
              bankOffers: [],
              isAvailable: true, // Default to true if in results
              features: {
                "Info": [obj.variation].filter(Boolean),
                "Manu": [obj.brand].filter(Boolean)
              }
            });
          }
        } else if (Array.isArray(obj)) {
          obj.forEach(findInstamartProducts);
        } else {
          for (const k in obj) findInstamartProducts(obj[k]);
        }
      }

      findInstamartProducts(json);
      return products.slice(0, 5);
    } catch (error) {
      console.error("Swiggy Instamart API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "15-25 Mins",
    reliability: 0.92
  }
};
