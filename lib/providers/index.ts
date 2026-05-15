export interface ScrapedProduct {
  platform: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  link: string;
  image: string;
  bankOffers: string[];
  rating?: number;
  reviewsCount?: number;
  deliveryDate?: string;
  isAvailable: boolean;
  features?: Record<string, string[]>; // e.g., { "Info": ["500g", "Fresh"], "Manu": ["Nestle"] }
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  lat?: number;
  lon?: number;
  limit?: number;
}

export interface PlatformProvider {
  id: string;
  name: string;
  categories: ("Electronics" | "Grocery" | "Fashion" | "General")[];
  search: (query: string, options?: SearchOptions) => Promise<ScrapedProduct[]>;
  metadata?: {
    isScraper: boolean; // True if uses Puppeteer
    deliveryTime?: string;
    reliability?: number;
  };
}
