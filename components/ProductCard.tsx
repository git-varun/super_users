"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ExternalLink, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Bell, 
  Star, 
  MessageSquare, 
  Bell as BellIcon, 
  Info, 
  Building2, 
  Tag, 
  ChevronRight 
} from "lucide-react";
import PriceChart from "./PriceChart";
import PriceAlertModal from "./PriceAlertModal";

interface ProductCardProps {
  product: {
    platform: string;
    name?: string;
    title?: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    landingPrice?: number;
    link: string;
    image: string;
    deliveryDate?: string;
    bankOffers?: string[];
    rating?: number;
    reviewsCount?: number;
    isAvailable?: boolean;
    features?: Record<string, string[]>;
  };
  viewMode?: 'list' | 'grid' | 'compact';
}

const PLATFORM_COLORS: Record<string, string> = {
  "Amazon": "bg-[#FF9900] text-black",
  "Amazon Fresh": "bg-[#00A8E1] text-white",
  "Flipkart": "bg-[#2874F0] text-white",
  "Flipkart Grocery": "bg-[#2874F0] text-white",
  "Blinkit": "bg-[#F7E11E] text-black",
  "Instamart": "bg-[#FF5200] text-white",
  "Zepto": "bg-[#5D3292] text-white",
  "Myntra": "bg-[#FF3F6C] text-white",
  "Nykaa": "bg-[#E80071] text-white",
  "Uniqlo": "bg-[#FF0000] text-white",
  "H&M": "bg-[#E50012] text-white",
  "Adidas": "bg-black text-white",
  "Puma": "bg-[#BA2026] text-white",
};

export default function ProductCard({ product, viewMode = 'list' }: ProductCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const name = product.name || product.title;
  const currentPrice = product.landingPrice || product.price;
  const savings = product.originalPrice ? product.originalPrice - currentPrice : (product.landingPrice ? product.price - product.landingPrice : 0);
  
  const platformColor = PLATFORM_COLORS[product.platform] || "bg-white/10 text-white";

  // Create SKU for price chart
  const productSku = name
    ? name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 255)
    : 'unknown-product';

  if (viewMode === 'compact') {
    return (
      <div className="group flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-accent-primary/40 transition-all glass">
        <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
          {product.image && (
            <Image src={product.image} alt={name || ""} fill className="object-contain p-1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${platformColor}`}>
              {product.platform}
            </span>
            {product.deliveryDate && (
              <span className="text-[9px] text-muted-foreground">{product.deliveryDate}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-accent-primary font-bold text-sm leading-none">₹{currentPrice.toLocaleString()}</p>
            {savings > 0 && <p className="text-[9px] text-emerald-500 mt-1">-₹{savings.toLocaleString()}</p>}
          </div>
          <button 
            onClick={() => setIsAlertOpen(true)} 
            className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-accent-primary transition-colors"
            title="Price Alert"
          >
            <Bell size={14} />
          </button>
        </div>
        <a href={product.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-accent-primary text-black flex-shrink-0">
          <ExternalLink size={14} />
        </a>
        <PriceAlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} product={{ name: name || "", price: currentPrice, link: product.link, platform: product.platform }} />
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="group flex flex-col gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-accent-primary/40 transition-all glass relative overflow-hidden h-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white/5">
          {product.image && (
            <Image src={product.image} alt={name || ""} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
          )}
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${platformColor}`}>
            {product.platform}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-white font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{name}</h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">₹{currentPrice.toLocaleString()}</span>
              <button 
                onClick={() => setIsAlertOpen(true)} 
                className="p-1 rounded-md bg-white/5 text-muted-foreground hover:text-accent-primary transition-colors"
                title="Price Alert"
              >
                <Bell size={12} />
              </button>
            </div>
            {(savings > 0 || product.discount) && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {product.discount || `-₹${savings}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={product.link} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-accent-primary text-black text-[10px] font-black flex items-center justify-center gap-2">
            BUY NOW <ExternalLink size={12} />
          </a>
        </div>
        <PriceAlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} product={{ name: name || "", price: currentPrice, link: product.link, platform: product.platform }} />
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-accent-primary/40 transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(var(--accent-primary-rgb),0.15)] glass relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/5 blur-[80px] pointer-events-none group-hover:bg-accent-primary/10 transition-colors" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Section */}
        <div className="relative w-full md:w-44 h-44 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/5">
          {product.image ? (
            <Image
              src={product.image}
              alt={name || "Product"}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              No Image
            </div>
          )}
          
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg backdrop-blur-xl border border-white/10 text-[10px] font-black tracking-widest uppercase shadow-2xl ${platformColor}`}>
            {product.platform}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-white font-semibold text-xl leading-tight line-clamp-2 group-hover:text-accent-primary transition-colors">
                {name}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.deliveryDate && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-muted-foreground">
                  <Clock size={12} className="text-accent-primary" />
                  {product.deliveryDate}
                </div>
              )}
              {product.rating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-yellow-400 font-bold">
                  <Star size={12} fill="currentColor" />
                  {product.rating}
                  {product.reviewsCount && (
                    <span className="text-muted-foreground font-normal ml-0.5">({product.reviewsCount.toLocaleString()})</span>
                  )}
                </div>
              )}
              {product.isAvailable === false && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-bold">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Structured Product Features */}
            {product.features && Object.keys(product.features).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 my-1 border-y border-white/5 bg-white/[0.01] rounded-xl px-3">
                {Object.entries(product.features).map(([category, items]) => (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                      {category.toLowerCase().includes('info') && <Info size={10} className="text-blue-400" />}
                      {category.toLowerCase().includes('manu') && <Building2 size={10} className="text-orange-400" />}
                      {category.toLowerCase().includes('type') && <Tag size={10} className="text-emerald-400" />}
                      {!['info', 'manu', 'type'].some(c => category.toLowerCase().includes(c)) && <ChevronRight size={10} className="text-accent-primary" />}
                      {category}
                    </div>
                    <ul className="space-y-1">
                      {items.filter(i => i && i.trim()).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-white/90 font-semibold leading-tight">
                          <div className="w-1 h-1 rounded-full bg-accent-primary mt-1.5 shrink-0 shadow-[0_0_5px_rgba(var(--accent-primary-rgb),0.5)]" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Bank Offers Slot */}
            {product.bankOffers && product.bankOffers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.bankOffers.slice(0, 2).map((offer, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
                    <Tag size={10} />
                    {offer}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tighter text-white">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => setIsAlertOpen(true)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:text-accent-primary hover:bg-accent-primary/10 hover:border-accent-primary/20 transition-all group/bell"
                    title="Set Price Alert"
                  >
                    <BellIcon size={18} className="group-hover/bell:animate-bounce" />
                  </button>
                </div>
                {(savings > 0 || product.discount) && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <TrendingDown size={14} />
                    {product.discount || `SAVE ₹${savings.toLocaleString()}`}
                  </div>
                )}
              </div>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <p className="text-xs text-muted-foreground/60 font-medium line-through decoration-white/20">
                  MRP: ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-primary text-black text-sm font-black hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.3)] transition-all duration-300 group/btn"
            >
              BUY NOW
              <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Modern Price History Section */}
      <div className="mt-2 group/chart">
        <PriceChart sku={productSku} currentPrice={currentPrice} platform={product.platform} />
      </div>

      <PriceAlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        product={{
          name: name || "Product",
          price: currentPrice,
          link: product.link,
          platform: product.platform
        }}
      />
    </div>
  );
}
