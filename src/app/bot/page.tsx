"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, TrendingUp, TrendingDown, Pause, AlertTriangle } from "lucide-react";

interface Trade {
  id: string;
  pair: string;
  type: "ACHAT" | "VENTE";
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  status: string;
  exitPrice?: number;
  pnl?: number;
  pnlPct?: number;
  entryTime: string;
  exitTime?: string;
  aiConfirmed: boolean;
  reason: string;
}

interface BotData {
  running: boolean;
  mode: "paper" | "live";
  capital: number;
  initialCapital: number;
  openPositions: Trade[];
  tradeHistory: Trade[];
  recentTrades: Trade[];
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  lastCheck: string;
  circuitBreakerTriggered: boolean;
}

export default function BotPage() {
  const [data, setData] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/bot");
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const bot = data ?? {
    running: false, mode: "paper" as const, capital: 200, initialCapital: 200,
    openPositions: [], tradeHistory: [], recentTrades: [],
    totalPnl: 0, totalTrades: 0, winRate: 0, lastCheck: "", circuitBreakerTriggered: false,
  };

  const pnlPct = bot.initialCapital > 0 ? (bot.totalPnl / bot.initialCapital) * 100 : 0;
  const progressToGoal = Math.min(100, (bot.capital / (bot.initialCapital * 2)) * 100);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Bot de Trading</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Strategie adaptative IA + indicateurs techniques
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bot.circuitBreakerTriggered ? (
            <span className="flex items-center gap-1.5 rounded-full bg-rose-400/10 border border-rose-400/20 px-3 py-1 text-xs text-rose-400">
              <AlertTriangle className="h-3 w-3" /> Circuit Breaker
            </span>
          ) : bot.running ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Actif
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-muted-foreground">
              <Pause className="h-3 w-3" /> Inactif
            </span>
          )}
          <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 text-[10px] text-amber-400 font-medium uppercase">
            {bot.mode}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Capital</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{bot.capital.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">USDT</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">P&L Total</p>
          <p className={`text-lg font-bold tabular-nums mt-0.5 ${bot.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {bot.totalPnl >= 0 ? "+" : ""}{bot.totalPnl.toFixed(2)}
          </p>
          <p className={`text-[10px] tabular-nums ${bot.totalPnl >= 0 ? "text-emerald-400/60" : "text-rose-400/60"}`}>
            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Trades</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{bot.totalTrades}</p>
          <p className="text-[10px] text-muted-foreground">executes</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Win Rate</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{bot.winRate.toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground">
            {bot.tradeHistory.filter((t) => (t.pnl ?? 0) > 0).length}W / {bot.tradeHistory.filter((t) => (t.pnl ?? 0) < 0).length}L
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Positions</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{bot.openPositions.length}</p>
          <p className="text-[10px] text-muted-foreground">ouvertes</p>
        </div>
      </div>

      {/* Progress to goal */}
      <div className="rounded-lg border border-white/5 bg-[#111] p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Objectif : {bot.initialCapital * 2} USDT (x2)</span>
          <span className="tabular-nums font-medium">{bot.capital.toFixed(2)} / {bot.initialCapital * 2} USDT</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${progressToGoal}%` }}
          />
        </div>
      </div>

      {/* Open positions */}
      {bot.openPositions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Positions Ouvertes</h2>
          {bot.openPositions.map((trade) => (
            <div key={trade.id} className="rounded-xl border border-white/5 bg-[#111] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {trade.type === "ACHAT" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                  )}
                  <span className="text-sm font-medium">{trade.pair}</span>
                  <span className={`text-xs font-medium ${trade.type === "ACHAT" ? "text-emerald-400" : "text-rose-400"}`}>
                    {trade.type}
                  </span>
                  {trade.aiConfirmed && (
                    <span className="rounded-full bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 text-[9px] text-blue-400">
                      IA
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/60">Entree</span>
                  <span className="tabular-nums">{trade.entryPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/60">Stop-Loss</span>
                  <span className="tabular-nums text-rose-400">{trade.stopLoss.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/60">Take-Profit</span>
                  <span className="tabular-nums text-emerald-400">{trade.takeProfit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/60">Quantite</span>
                  <span className="tabular-nums">{trade.quantity.toFixed(6)}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60">{trade.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trade history */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Historique des Trades ({bot.recentTrades.length})</h2>
        {bot.recentTrades.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <Bot className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun trade execute</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Lance le bot avec : cd bot && npm start
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 border-b border-white/5">
              <span>Type</span>
              <span>Paire</span>
              <span className="text-right">Entree</span>
              <span className="text-right">Sortie</span>
              <span className="text-right">P&L</span>
            </div>
            {[...bot.recentTrades].reverse().map((trade) => (
              <div
                key={trade.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02]"
              >
                <span className={`text-xs font-medium ${trade.type === "ACHAT" ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.type}
                </span>
                <div className="min-w-0">
                  <span className="text-sm">{trade.pair}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{trade.status}</span>
                </div>
                <span className="text-xs tabular-nums text-right">{trade.entryPrice.toFixed(2)}</span>
                <span className="text-xs tabular-nums text-right">{trade.exitPrice?.toFixed(2) ?? "—"}</span>
                <span className={`text-xs tabular-nums text-right font-medium ${(trade.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.pnl != null ? `${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last check */}
      {bot.lastCheck && (
        <p className="text-[10px] text-muted-foreground/40 text-center">
          Derniere verification : {new Date(bot.lastCheck).toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  );
}
