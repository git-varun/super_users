"use client";

import { useEffect, useState, use, useRef } from "react";
import { getSearchOrchestration, searchPlatformTask, deduplicateResults } from "@/app/actions";
import { ScrapedProduct } from "@/lib/providers";
import ProductCard from "@/components/ProductCard";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import { Loader2, ArrowLeft, LayoutList, LayoutGrid, Rows3, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, platforms?: string }>;
}) {
  const { q: query, platforms: platformsParam } = use(searchParams);
  const router = useRouter();
  const allowedPlatforms = platformsParam ? platformsParam.split(',') : [];
  const [results, setResults] = useState<ScrapedProduct[]>([]);
  const [orchestrating, setOrchestrating] = useState(true);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [completedPlatforms, setCompletedPlatforms] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const searchIdRef = useRef(0);
  const resultsRef = useRef<ScrapedProduct[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lon: position.coords.longitude }),
        () => {} // Ignore errors, use defaults
      );
    }
  }, []);

  useEffect(() => {
    async function startOrchestratedSearch() {
      if (!query) return;
      
      const currentSearchId = ++searchIdRef.current;
      setOrchestrating(true);
      setResults([]);
      resultsRef.current = [];
      setCompletedPlatforms([]);

      try {
        const orchestration = await getSearchOrchestration(query, location?.lat, location?.lon, allowedPlatforms);
        
        // If a new search has started, stop this one
        if (currentSearchId !== searchIdRef.current) return;
        
        setActivePlatforms(orchestration.platforms);
        setOrchestrating(false);

        orchestration.platforms.forEach(async (platform) => {
          const platformResults = await searchPlatformTask(platform, query, location?.lat, location?.lon);
          
          // Check if this search is still valid
          if (currentSearchId !== searchIdRef.current) return;

          const typedResults = platformResults as ScrapedProduct[];
          
          if (typedResults && typedResults.length > 0) {
            const combined = [...resultsRef.current, ...typedResults];
            resultsRef.current = deduplicateResults(combined).sort(
              (a, b) => (a.price) - (b.price)
            );
            setResults([...resultsRef.current]);
          }

          setCompletedPlatforms(prev => [...prev, platform]);
        });

      } catch (error) {
        console.error("Orchestration Error:", error);
      }
    }

    startOrchestratedSearch();
  }, [query, location, platformsParam]); // Use platformsParam instead of derived array to avoid re-runs

  const isAllFinished = completedPlatforms.length >= activePlatforms.length && activePlatforms.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 glass border-b border-white/10 p-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <SearchWithSuggestions 
            initialQuery={query} 
            className="flex-1" 
            onSearch={(newQuery) => {
              const pParam = platformsParam ? `&platforms=${platformsParam}` : '';
              router.push(`/results?q=${encodeURIComponent(newQuery.trim())}${pParam}`);
            }}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
        {orchestrating ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <Loader2 className="animate-spin text-accent-primary" size={48} />
              <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={20} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold tracking-tight animate-pulse">Classifying Intent...</h2>
              <p className="text-sm text-muted-foreground">Sense Intelligence Engine is routing your search</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                  {isAllFinished ? "Search Complete" : "Streaming Results"}
                  {!isAllFinished && <Loader2 className="animate-spin text-accent-primary" size={16} />}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {activePlatforms.map(p => (
                    <span key={p} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      completedPlatforms.includes(p) 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                        : "bg-white/5 border-white/10 text-muted-foreground animate-pulse"
                    }`}>
                      {p} {completedPlatforms.includes(p) ? "✓" : "..."}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-accent-primary text-black shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
                  title="List View"
                >
                  <LayoutList size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-accent-primary text-black shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('compact')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-accent-primary text-black shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
                  title="Compact View"
                >
                  <Rows3 size={20} />
                </button>
              </div>
            </div>

            {results.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                  : "space-y-4"
              }>
                {results.map((product, index) => (
                  <div key={`${product.platform}-${index}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ProductCard product={product} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            ) : completedPlatforms.length === activePlatforms.length && (
              <div className="text-center py-32 space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Search size={32} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold">No results found</p>
                  <p className="text-muted-foreground max-w-xs mx-auto">None of our partners have &quot;{query}&quot; in stock right now.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Floating Status Bar */}
      {!isAllFinished && results.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl py-3 px-6 shadow-2xl flex items-center gap-4">
            <Loader2 className="animate-spin text-accent-primary" size={16} />
            <p className="text-xs font-black tracking-widest text-white uppercase whitespace-nowrap">
              Sniffing {activePlatforms.length - completedPlatforms.length} more sources...
            </p>
            <div className="h-4 w-px bg-white/10" />
            <p className="text-xs font-bold text-accent-primary">{results.length} results so far</p>
          </div>
        </div>
      )}
    </div>
  );
}
