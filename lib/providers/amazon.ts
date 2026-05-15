import { PlatformProvider, ScrapedProduct, SearchOptions } from "./index";
import { STANDARD_HEADERS } from "./utils";

export const AmazonProvider: PlatformProvider = {
  id: "Amazon",
  name: "Amazon",
  categories: ["Electronics", "Fashion", "General"],
  search: async (query: string, _options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    
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
      
      // Strategy: Split by the start of a result item
      const parts = html.split('data-component-type="s-search-result"').slice(1, 10);
      
      for (const block of parts) {
        try {
          // Find title - Look for the h2/span pattern
          const titleMatch = block.match(/<h2[^>]*?>.*?<span[^>]*?>(.*?)<\/span>/s);
          // Find price - Look for a-price-whole
          const priceMatch = block.match(/<span class="a-price-whole">(\d[\d,]*)/);
          // Find Image - Look for s-image class
          const imgMatch = block.match(/<img[^>]*?src="([^"]*?)"[^>]*?class="s-image"/);
          // Find Link
          const linkMatch = block.match(/<a[^>]*?class="a-link-normal s-no-outline"[^>]*?href="([^"]*?)"/);

          if (titleMatch && priceMatch) {
            const title = titleMatch[1].replace(/<[^>]*>?/gm, '').trim();
            const price = parseInt(priceMatch[1].replace(/,/g, ''));
            const image = imgMatch ? imgMatch[1] : '';
            const relativeLink = linkMatch ? linkMatch[1] : '';
            const link = relativeLink.startsWith('http') ? relativeLink : `https://www.amazon.in${relativeLink.split('?')[0]}`;

            const brandMatch = block.match(/Visit the (.*?) Store/i);

            products.push({
              platform: "Amazon",
              title,
              price,
              link,
              image,
              bankOffers: [],
              isAvailable: !block.includes('Currently unavailable'),
              deliveryDate: "2-4 days",
              features: {
                "Manu": [brandMatch ? brandMatch[1] : undefined].filter(Boolean) as string[],
                "Info": [block.includes('sponsored') ? 'Sponsored' : undefined].filter(Boolean) as string[]
              }
            });
          }
        } catch (e) {}
      }

      console.log(`[Amazon] Found ${products.length} products`);
      return products.slice(0, 5);
    } catch (error) {
      console.error("Amazon API Sniffing Error:", error);
      return [];
    }
  },
  metadata: {
    isScraper: false,
    deliveryTime: "2-4 Days",
    reliability: 0.95
  }
};

export const AmazonFreshProvider: PlatformProvider = {
  id: "Amazon Fresh",
  name: "Amazon Fresh",
  categories: ["Grocery"],
  search: async (query: string, options?: SearchOptions): Promise<ScrapedProduct[]> => {
    const results = await AmazonProvider.search(query, options);
    return results.map(r => ({ ...r, platform: "Amazon Fresh" }));
  },
  metadata: {
    isScraper: false,
    deliveryTime: "Same Day",
    reliability: 0.9
  }
};
