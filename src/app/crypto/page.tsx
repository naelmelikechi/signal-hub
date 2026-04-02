"use client";

import { useCrypto } from "@/hooks/use-crypto";
import { Skeleton } from "@/components/ui/skeleton";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#34d399" : "#fb7185"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(2);
}

export default function CryptoPage() {
  const { data, loading, error } = useCrypto();

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Erreur de chargement des donnees crypto</p>
      </div>
    );
  }

  const greenCount = data.coins.filter((c) => (c.price_change_percentage_24h ?? 0) > 0).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Crypto Momentum</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Top 50 par market cap &middot; {greenCount}/{data.coins.length} en hausse (24h)
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-emerald-400/5 border border-emerald-400/10 p-3 text-center">
          <p className="text-lg font-bold text-emerald-400 tabular-nums">{greenCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hausse</p>
        </div>
        <div className="flex-1 rounded-lg bg-rose-400/5 border border-rose-400/10 p-3 text-center">
          <p className="text-lg font-bold text-rose-400 tabular-nums">{data.coins.length - greenCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Baisse</p>
        </div>
      </div>

      {/* Coin table */}
      <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 border-b border-white/5">
          <span>Coin</span>
          <span className="text-right">Prix</span>
          <span className="text-right">24h</span>
          <span className="text-right hidden sm:block">7j</span>
          <span className="text-right hidden sm:block">Volume</span>
        </div>
        {data.coins.map((coin) => {
          const positive = coin.price_change_percentage_24h > 0;
          return (
            <div
              key={coin.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{coin.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{coin.symbol}</p>
                </div>
              </div>
              <span className="text-sm tabular-nums text-right">{coin.current_price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
              <span className={`text-xs tabular-nums text-right font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                {positive ? "+" : ""}{(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
              </span>
              <span className={`text-xs tabular-nums text-right hidden sm:block ${(coin.price_change_percentage_7d_in_currency ?? 0) > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {(coin.price_change_percentage_7d_in_currency ?? 0) > 0 ? "+" : ""}{(coin.price_change_percentage_7d_in_currency ?? 0).toFixed(1)}%
              </span>
              <span className="text-xs tabular-nums text-right text-muted-foreground hidden sm:block">
                {formatNum(coin.total_volume)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
