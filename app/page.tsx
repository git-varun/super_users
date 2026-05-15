"use client";

import { useState } from "react";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import PlatformSelector from "@/components/PlatformSelector";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const platformsParam = selectedPlatforms.length > 0 ? `&platforms=${selectedPlatforms.join(',')}` : '';
      router.push(`/results?q=${encodeURIComponent(query.trim())}${platformsParam}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-4">
          <Zap size={14} className="text-accent-primary" />
          <span className="text-xs font-medium text-accent-primary tracking-wider uppercase">Real-Time Savings Engine</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter glow-text">
            SENSE
          </h1>
          <p className="text-muted-foreground text-lg">
            Stop overpaying. Compare 10+ platforms in seconds.
          </p>
        </div>

        <div className="space-y-4">
          <SearchWithSuggestions onSearch={handleSearch} />
          <div className="flex justify-center">
            <PlatformSelector onSelectionChange={setSelectedPlatforms} />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 pt-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span className="text-sm font-bold tracking-widest">AMAZON</span>
          <span className="text-sm font-bold tracking-widest">FLIPKART</span>
          <span className="text-sm font-bold tracking-widest">MYNTRA</span>
          <span className="text-sm font-bold tracking-widest">BLINKIT</span>
          <span className="text-sm font-bold tracking-widest">ZEPTO</span>
        </div>
      </div>
    </main>
  );
}
