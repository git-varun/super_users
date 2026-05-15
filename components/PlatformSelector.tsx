"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { getAvailablePlatforms } from "@/app/actions";

export type Platform = {
  id: string;
  name: string;
  categories: string[];
};

export default function PlatformSelector({ 
  onSelectionChange 
}: { 
  onSelectionChange: (selectedIds: string[]) => void 
}) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPlatforms = async () => {
      const data = await getAvailablePlatforms();
      setPlatforms(data);
      // Default to all selected
      const ids = data.map(p => p.id);
      setSelectedIds(ids);
      onSelectionChange(ids);
    };
    fetchPlatforms();
  }, [onSelectionChange]);

  const togglePlatform = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelection);
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    const allIds = platforms.map(p => p.id);
    setSelectedIds(allIds);
    onSelectionChange(allIds);
  };

  const selectNone = () => {
    setSelectedIds([]);
    onSelectionChange([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
      >
        <Layers size={16} className="text-accent-primary" />
        <span>{selectedIds.length} Platforms</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Sources</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-[10px] text-accent-primary hover:underline">All</button>
              <button onClick={selectNone} className="text-[10px] text-white/40 hover:underline">None</button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">{p.name}</span>
                  <span className="text-[10px] text-white/20 capitalize">{p.categories.join(', ')}</span>
                </div>
                {selectedIds.includes(p.id) && (
                  <Check size={14} className="text-accent-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
