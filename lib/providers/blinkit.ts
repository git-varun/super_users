import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const BlinkitProvider: PlatformProvider = {
  id: "Blinkit",
  name: "Blinkit",
  categories: ["Grocery", "General"],
  search: async (query: string, options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const lat = options?.lat || 28.4595;
    const lon = options?.lon || 77.0266;
    const url = `https://blinkit.com/v1/layout/search?q=${encodeURIComponent(query)}&search_type=type_to_search&lat=${lat}&lon=${lon}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...STANDARD_HEADERS,
          "app_client": "web",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Origin": "https://blinkit.com",
          "Referer": "https://blinkit.com/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        },
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          console.warn("Blinkit API access Forbidden (Bot protection detected).");
        }
        throw new Error(`Blinkit API Error: ${res.statusText} (${res.status})`);
      }
      const json = await res.json();
      
      const products: ScrapedProduct[] = [];
      const imageMap: Record<string, string> = {};

      function extractData(obj: any) {
        if (!obj || typeof obj !== 'object') return;

        if (obj.product_id && (obj.image_url || obj.image)) {
          imageMap[obj.product_id] = obj.image_url || obj.image;
        }

        if (obj.widget_type === "product_card_snippet_type_2" && obj.data) {
          const d = obj.data;
          const productId = d.product_id;
          const name = d.name?.text || d.display_name?.text;
          const priceStr = d.normal_price?.text || d.price?.text;
          const price = priceStr ? parseInt(priceStr.replace(/[^0-9]/g, '')) : 0;
          const mrpStr = d.mrp?.text;
          const mrp = mrpStr ? parseInt(mrpStr.replace(/[^0-9]/g, '')) : undefined;
          
          if (name && productId && !products.find(p => p.title === name)) {
            const image = imageMap[productId] || d.image_url || '';
            const absoluteImage = image.startsWith('http') ? image : `https://blinkit.com/images/${image}`;
            const slug = d.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            products.push({
              platform: "Blinkit",
              title: name,
              price: price,
              originalPrice: mrp,
              discount: mrp ? `${Math.round(((mrp - price) / mrp) * 100)}% off` : undefined,
              link: `https://blinkit.com/prn/${slug}/${productId}`,
              image: absoluteImage,
              bankOffers: [],
              isAvailable: !d.out_of_stock,
              deliveryDate: "15-20 mins",
              features: {
                "Info": [d.variant?.text].filter(Boolean),
                "Manu": [d.brand_name || d.brand].filter(Boolean),
                "Type": [d.category_name].filter(Boolean)
              }
            });
          }
        }

        if (Array.isArray(obj)) {
          obj.forEach(extractData);
        } else {
          for (const k in obj) extractData(obj[k]);
        }
      }

      extractData(json);
      return products.slice(0, 5);
    } catch (error) {
      console.error("Blinkit API Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "10-20 Mins",
    reliability: 0.94
  }
};
