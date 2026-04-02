"use client";

import { usePredictions } from "@/hooks/use-predictions";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function LiquidityBadge({ level }: { level?: "high" | "medium" | "low" }) {
  if (!level) return null;
  const styles = {
    high: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    low: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[level]}`}>
      {level === "low" && "Low Liquidity"}{level === "medium" && "Medium"}{level === "high" && "High"}
    </span>
  );
}

export default function PredictionsPage() {
  const { data, loading, error } = usePredictions();

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Erreur de chargement des prediction markets</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Prediction Markets</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Polymarket &middot; {data.markets.length} marches actifs &middot; Tries par volume 24h
        </p>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg bg-amber-400/5 border border-amber-400/10 px-4 py-3 text-xs text-amber-400/80">
        Les marches a faible liquidite sont sujets a la manipulation. Verifiez toujours le volume et la liquidite avant d&apos;agir.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.markets.map((market) => {
          const prob = market.probability ?? 0.5;
          const probPct = (prob * 100).toFixed(0);
          return (
            <div
              key={market.id}
              className="rounded-xl border border-white/5 bg-[#111] p-4 hover:border-white/10 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium leading-snug line-clamp-2">{market.question}</h3>
                <LiquidityBadge level={market.liquidityLevel} />
              </div>

              {/* Probability bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Yes {probPct}%</span>
                  <span className="text-rose-400">No {(100 - Number(probPct)).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${probPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Vol 24h: ${market.volume24hr?.toLocaleString() ?? "0"}</span>
                <span>Liquidite: ${market.liquidity?.toLocaleString() ?? "0"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
