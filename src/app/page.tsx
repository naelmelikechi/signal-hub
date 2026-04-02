"use client";

import { useSignals } from "@/hooks/use-signals";
import { useCrypto } from "@/hooks/use-crypto";
import { Skeleton } from "@/components/ui/skeleton";
import { getScoreColor, getScoreLabel } from "@/lib/constants";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Heart,
  Bot,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

function ScoreArc({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="white" strokeOpacity={0.04} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

const SOURCE_ICONS = {
  crypto: TrendingUp,
  predictions: Target,
  macro: Calendar,
  sentiment: Heart,
};

const SOURCE_LABELS: Record<string, string> = {
  crypto: "Crypto",
  predictions: "Predictions",
  macro: "Macro",
  sentiment: "Sentiment",
};

const SOURCE_LINKS: Record<string, string> = {
  crypto: "/crypto",
  predictions: "/predictions",
  macro: "/macro",
  sentiment: "/",
};

interface BotData {
  running: boolean;
  mode: string;
  capital: number;
  totalPnl: number;
  openPositions: { pair: string; type: string; pnl?: number }[];
  totalTrades: number;
  winRate: number;
}

export default function DashboardPage() {
  const { data, loading } = useSignals();
  const { data: cryptoData } = useCrypto();
  const [botData, setBotData] = useState<BotData | null>(null);

  const fetchBot = useCallback(async () => {
    try {
      const res = await fetch("/api/bot");
      if (res.ok) setBotData(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchBot(); }, [fetchBot]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Erreur de chargement des signaux</p>
      </div>
    );
  }

  const topMovers = cryptoData?.coins?.slice(0, 6) ?? [];

  return (
    <div className="p-5 md:p-7 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mis a jour a {new Date(data.timestamp).toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <Link
          href="/bot"
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
            botData?.running
              ? "bg-emerald-400/5 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10"
              : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          {botData?.running ? "Bot Actif" : "Bot Inactif"}
          {botData?.running && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </Link>
      </div>

      {/* Alert banner */}
      {data.alerts.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-amber-400/5 to-transparent border border-amber-400/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {data.alerts.map((alert, i) => (
              <p key={i} className="text-xs text-amber-400/90">{alert}</p>
            ))}
          </div>
        </div>
      )}

      {/* Main grid: Score + Signals + Bot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Global Score card */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-gradient-to-b from-[#131313] to-[#0e0e0e] p-5 flex flex-col items-center justify-center">
          <ScoreArc score={data.globalScore} size={140} />
          <p className="text-[11px] text-muted-foreground mt-3 font-medium">Score Global</p>
          <div className="flex gap-1.5 mt-3">
            {data.scores.map((s) => (
              <div key={s.source} className="flex flex-col items-center gap-1">
                <div className={`text-xs font-bold tabular-nums ${getScoreColor(s.score)}`}>{s.score}</div>
                <div className="text-[8px] text-muted-foreground/50 uppercase">{SOURCE_LABELS[s.source]?.slice(0, 4)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Signal cards */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3">
          {data.scores.map((signal) => {
            const Icon = SOURCE_ICONS[signal.source];
            const color = getScoreColor(signal.score);
            return (
              <Link
                key={signal.source}
                href={SOURCE_LINKS[signal.source]}
                className="group rounded-xl border border-white/5 bg-[#111] p-4 hover:border-white/10 hover:bg-[#141414] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{SOURCE_LABELS[signal.source]}</span>
                  </div>
                  {signal.alert && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>{signal.score}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{signal.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{signal.description}</p>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 ml-auto mt-1 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bot Status + Quick Stats */}
        <div className="lg:col-span-3 space-y-3">
          <Link href="/bot" className="block rounded-xl border border-white/5 bg-[#111] p-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Bot Trading</span>
              <span className={`ml-auto text-[9px] uppercase font-medium px-1.5 py-0.5 rounded ${
                botData?.running ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-muted-foreground/60"
              }`}>
                {botData?.mode ?? "paper"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-muted-foreground/50 uppercase">Capital</p>
                <p className="text-sm font-bold tabular-nums">{(botData?.capital ?? 200).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground/50 uppercase">P&L</p>
                <p className={`text-sm font-bold tabular-nums ${(botData?.totalPnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {(botData?.totalPnl ?? 0) >= 0 ? "+" : ""}{(botData?.totalPnl ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground/50 uppercase">Trades</p>
                <p className="text-sm font-bold tabular-nums">{botData?.totalTrades ?? 0}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground/50 uppercase">Win</p>
                <p className="text-sm font-bold tabular-nums">{(botData?.winRate ?? 0).toFixed(0)}%</p>
              </div>
            </div>
          </Link>

          {/* Capital progress */}
          <div className="rounded-xl border border-white/5 bg-[#111] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">Objectif x2</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-lg font-bold tabular-nums">{(botData?.capital ?? 200).toFixed(0)}</span>
              <span className="text-xs text-muted-foreground">/ 400 USDT</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, ((botData?.capital ?? 200) / 400) * 100)}%` }}
              />
            </div>
          </div>

          {/* Active positions */}
          <div className="rounded-xl border border-white/5 bg-[#111] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Positions</span>
            </div>
            {(botData?.openPositions?.length ?? 0) === 0 ? (
              <p className="text-[10px] text-muted-foreground/40">Aucune position ouverte</p>
            ) : (
              <div className="space-y-1.5">
                {botData!.openPositions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{p.pair}</span>
                    <span className={p.type === "ACHAT" ? "text-emerald-400" : "text-rose-400"}>{p.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Top Movers */}
      {topMovers.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Top Cryptos</span>
            </div>
            <Link href="/crypto" className="text-[10px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-white/5">
            {topMovers.map((coin) => {
              const positive = (coin.price_change_percentage_24h ?? 0) > 0;
              return (
                <div key={coin.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                    <span className="text-xs font-medium">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <p className="text-sm font-bold tabular-nums">
                    {coin.current_price?.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                  </p>
                  <div className={`flex items-center gap-0.5 mt-0.5 text-[11px] font-medium tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                    {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {positive ? "+" : ""}{(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
