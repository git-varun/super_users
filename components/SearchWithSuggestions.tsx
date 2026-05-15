"use client";

import { useState, useEffect, useRef } from "react";
import { Search, History, TrendingUp, Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions, Suggestion } from "@/app/actions";

export default function SearchWithSuggestions({ 
  initialQuery = "", 
  className = "",
  onSearch
}: { 
  initialQuery?: string, 
  className?: string,
  onSearch?: (query: string) => void
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const data = await getSearchSuggestions(query);
        setSuggestions(data);
      } catch (error) {
        console.error("Suggestions Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSearch = (e?: React.FormEvent, selectedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = selectedQuery || query;
    if (finalQuery.trim()) {
      setIsOpen(false);
      if (onSearch) {
        onSearch(finalQuery.trim());
      } else {
        router.push(`/results?q=${encodeURIComponent(finalQuery.trim())}`);
      }
    }
  };

  const getIcon = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case "history": return <History size={14} className="text-white/40" />;
      case "category": return <TrendingUp size={14} className="text-accent-secondary" />;
      case "tip": return <Sparkles size={14} className="text-accent-primary" />;
      case "price-trend": return <TrendingUp size={14} className={suggestion.trend === 'down' ? 'text-accent-primary' : 'text-red-500'} />;
      case "product": return <ShoppingBag size={14} className="text-white/60" />;
      default: return <Search size={14} />;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={(e) => handleSearch(e)} className="relative group">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for iPhone, Nike shoes, or Grocery..."
          className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all text-base glass"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent-primary transition-colors" size={20} />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-primary animate-spin" size={16} />}
      </form>

      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s.text);
                  handleSearch(undefined, s.text);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-primary/10 transition-colors">
                  {getIcon(s)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{s.text}</p>
                    {s.price && (
                      <span className="text-xs font-mono font-bold text-accent-primary">₹{s.price}</span>
                    )}
                    {s.trendPercent && (
                      <span className={`text-xs font-mono font-bold ${s.trend === 'down' ? 'text-accent-primary' : 'text-red-500'}`}>
                        {s.trend === 'down' ? '↓' : '↑'} {Math.abs(s.trendPercent)}%
                      </span>
                    )}
                  </div>
                  {s.subtext && (
                    <p className="text-[10px] text-muted-foreground truncate">{s.subtext}</p>
                  )}
                  {s.platform && (
                    <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{s.platform}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          {suggestions.length === 0 && loading && (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin text-accent-primary mx-auto mb-2" size={24} />
              <p className="text-xs text-muted-foreground">Thinking...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}