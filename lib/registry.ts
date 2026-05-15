import { PlatformProvider, ScrapedProduct, SearchOptions } from "./providers";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, PlatformProvider> = new Map();

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  register(provider: PlatformProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): PlatformProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): PlatformProvider[] {
    return Array.from(this.providers.values());
  }

  getProvidersByCategory(category: string): PlatformProvider[] {
    return this.getAllProviders().filter((p) =>
      p.categories.includes(category as any)
    );
  }

  async searchAll(
    platformIds: string[],
    query: string,
    options?: SearchOptions
  ): Promise<Record<string, ScrapedProduct[]>> {
    const results: Record<string, ScrapedProduct[]> = {};
    
    const tasks = platformIds.map(async (id) => {
      const provider = this.getProvider(id);
      if (provider) {
        try {
          results[id] = await provider.search(query, options);
        } catch (error) {
          console.error(`Provider [${id}] Error:`, error);
          results[id] = [];
        }
      }
    });

    await Promise.all(tasks);
    return results;
  }
}

export const registry = ProviderRegistry.getInstance();
