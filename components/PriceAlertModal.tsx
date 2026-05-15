"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Mail, Target, Loader2, CheckCircle2 } from "lucide-react";
import { setupPriceAlert } from "@/app/actions";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    link: string;
    platform: string;
  };
}

export default function PriceAlertModal({ isOpen, onClose, product }: PriceAlertModalProps) {
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState(Math.floor(product.price * 0.9).toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await setupPriceAlert(
        product.link,
        product.name,
        parseInt(targetPrice),
        email
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to set alert. Please check your configuration.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/10 blur-[80px] pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <X size={20} className="text-muted-foreground" />
        </button>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Alert Set!</h3>
              <p className="text-muted-foreground">We'll email you when the price drops below ₹{parseInt(targetPrice).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
                <Bell size={24} className="text-accent-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Price Drop Alert</h3>
                <p className="text-xs text-muted-foreground">Get notified when the price hits your target</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Monitoring</p>
              <p className="text-sm font-medium text-white truncate">{product.name}</p>
              <p className="text-xs text-accent-primary font-bold">Current: ₹{product.price.toLocaleString()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Target size={12} /> Target Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent-primary/50 transition-colors"
                  placeholder="Enter target price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Mail size={12} /> Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent-primary/50 transition-colors"
                  placeholder="alex@example.com"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-accent-primary text-black font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "SET ALERT"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
