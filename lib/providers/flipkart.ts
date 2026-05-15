import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const FlipkartProvider: PlatformProvider = {
  id: "Flipkart",
  name: "Flipkart",
  categories: ["Electronics", "Fashion", "General"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    
    try {
      const res = await fetch(url, { 
        headers: {
          ...STANDARD_HEADERS,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) return [];
      const html = await res.text();
      const products: ScrapedProduct[] = [];

      // Try JSON State first as it's cleaner
      const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});<\/script>/);
      if (stateMatch) {
        try {
          const state = JSON.parse(stateMatch[1]);
          // Search for products anywhere in the state tree
          const searchData = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (obj.productInfo && obj.productInfo.value) {
              const p = obj.productInfo.value;
              const title = p.titles?.primary;
              const price = p.pricing?.finalPrice?.value;
              if (title && price) {
                const baseUrl = p.baseUrl || '';
                products.push({
                  platform: "Flipkart",
                  title,
                  price,
                  link: baseUrl.startsWith('http') ? baseUrl : `https://www.flipkart.com${baseUrl.split('?')[0]}`,
                  image: p.images?.[0]?.url?.replace('{@width}', '400').replace('{@height}', '400') || '',
                  bankOffers: [],
                  isAvailable: true,
                  deliveryDate: "3-5 days",
                  features: {
                    "Info": [p.smartHighlights?.[0], p.keySpecs?.[0]].filter(Boolean),
                    "Manu": [p.brand].filter(Boolean),
                    "Type": [p.category].filter(Boolean)
                  }
                });
              }
            }
            if (Array.isArray(obj)) obj.forEach(searchData);
            else Object.values(obj).forEach(searchData);
          };
          searchData(state);
        } catch (e) {}
      }

      // Fallback: Broad Regex search for price/title pairs in HTML
      if (products.length === 0) {
        const itemBlocks = html.split('data-id=').slice(1, 10);
        for (const block of itemBlocks) {
          const titleMatch = block.match(/title="([^"]*?)"/);
          const priceMatch = block.match(/₹(\d[\d,]*)/);
          const linkMatch = block.match(/href="(\/.*?)"/);
          const imgMatch = block.match(/src="([^"]*?)"/);

          if (titleMatch && priceMatch) {
            products.push({
              platform: "Flipkart",
              title: titleMatch[1],
              price: parseInt(priceMatch[1].replace(/,/g, '')),
              link: `https://www.flipkart.com${linkMatch ? linkMatch[1].split('?')[0] : ''}`,
              image: imgMatch ? imgMatch[1] : '',
              bankOffers: [],
              isAvailable: true,
              deliveryDate: "3-5 days"
            });
          }
        }
      }

      console.log(`[Flipkart] Found ${products.length} products`);
      // De-duplicate by title
      const uniqueResults = Array.from(new Map(products.map(p => [p.title, p])).values());
      return uniqueResults.slice(0, 5);
    } catch (error) {
      console.error("Flipkart API Sniffing Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "3-5 Days",
    reliability: 0.92
  }
};

export const FlipkartGroceryProvider: PlatformProvider = {
  id: "Flipkart Grocery",
  name: "Flipkart Grocery",
  categories: ["Grocery"],
  search: async (query: string, options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const results = await FlipkartProvider.search(query, options);
    return results.map(r => ({ ...r, platform: "Flipkart Grocery" }));
  },
  metadata: {
    isScraper: false,
    deliveryTime: "1-2 Days",
    reliability: 0.88
  }
};
