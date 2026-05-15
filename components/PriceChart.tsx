'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingDown, TrendingUp, Clock } from 'lucide-react';

interface PriceChartProps {
  sku: string;
  currentPrice: number;
  platform: string;
}

interface PricePoint {
  date: string;
  price: number;
  recorded_at: string;
}

export default function PriceChart({ sku, currentPrice, platform }: PriceChartProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        setLoading(true);
        const response = await fetch(`/api/price-history?sku=${encodeURIComponent(sku)}&days=30`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch price history');
        }

        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          // Filter by platform and format for chart
          const platformData = result.data
            .filter((item: any) => item.platform === platform)
            .map((item: any) => ({
              date: new Date(item.recorded_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              price: item.price,
              recorded_at: item.recorded_at
            }))
            .sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

          if (platformData.length > 0) {
            setData(platformData);

            // Calculate trend
            const firstPrice = platformData[0].price;
            const lastPrice = platformData[platformData.length - 1].price;
            if (lastPrice < firstPrice) {
              setTrend('down');
            } else if (lastPrice > firstPrice) {
              setTrend('up');
            } else {
              setTrend('stable');
            }
          } else {
            setError('No price data available for this platform');
          }
        } else {
          setError('No price history found');
        }
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load price history');
      } finally {
        setLoading(false);
      }
    }

    fetchPriceHistory();
  }, [sku, platform]);

  if (loading) {
    return (
      <div className="w-full h-10 flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/5">
        <Loader2 className="animate-spin text-accent-primary/40" size={14} />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="w-full py-2 px-4 flex items-center justify-between bg-white/[0.02] rounded-xl border border-white/5 text-[10px] text-muted-foreground/60 group-hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center gap-2">
          <Clock size={12} className="opacity-50" />
          <span>Price history tracking active</span>
        </div>
        <span className="italic opacity-40">Insufficient data for chart</span>
      </div>
    );
  }

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const priceChange = data[data.length - 1].price - data[0].price;
  const percentChange = ((priceChange / data[0].price) * 100).toFixed(1);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>30-day trend</span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
          {trend === 'down' ? (
            <>
              <TrendingDown size={12} className="text-accent-primary" />
              <span className="text-accent-primary font-semibold">{percentChange}%</span>
            </>
          ) : trend === 'up' ? (
            <>
              <TrendingUp size={12} className="text-red-500" />
              <span className="text-red-500 font-semibold">+{percentChange}%</span>
            </>
          ) : (
            <span>Stable</span>
          )}
        </div>
      </div>

      <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              interval={Math.max(0, Math.floor(data.length / 4))}
            />
            <YAxis 
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              width={40}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `₹${typeof value === 'number' ? value.toLocaleString() : value}`}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={trend === 'down' ? '#10b981' : trend === 'up' ? '#ef4444' : '#8b5cf6'}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <div className="bg-white/5 rounded p-2">
          <p className="text-[9px] uppercase opacity-70">Min</p>
          <p className="text-white font-semibold">₹{minPrice.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded p-2">
          <p className="text-[9px] uppercase opacity-70">Current</p>
          <p className="text-white font-semibold">₹{currentPrice.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded p-2">
          <p className="text-[9px] uppercase opacity-70">Max</p>
          <p className="text-white font-semibold">₹{maxPrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
