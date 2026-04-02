"use client";

import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { CAPITAL } from "@/lib/constants";
import { Trash2, Plus } from "lucide-react";

export default function PortfolioPage() {
  const { portfolio, addPosition, removePosition, totalInvested, totalValue, pnl, pnlPercent, available } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ asset: string; type: "crypto" | "prediction" | "other"; entryPrice: string; quantity: string; notes: string }>({ asset: "", type: "crypto", entryPrice: "", quantity: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asset || !form.entryPrice || !form.quantity) return;
    addPosition({
      asset: form.asset,
      type: form.type,
      entryPrice: parseFloat(form.entryPrice),
      quantity: parseFloat(form.quantity),
      entryDate: new Date().toISOString().split("T")[0],
      notes: form.notes || undefined,
    });
    setForm({ asset: "", type: "crypto", entryPrice: "", quantity: "", notes: "" });
    setShowForm(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Portfolio Tracker</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Suivi manuel de tes positions &middot; Donnees stockees localement
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Capital</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{CAPITAL} EUR</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Investi</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{totalInvested.toFixed(2)} EUR</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Disponible</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{available.toFixed(2)} EUR</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-[#111] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">P&L</p>
          <p className={`text-lg font-bold tabular-nums mt-0.5 ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} EUR
          </p>
          <p className={`text-[10px] tabular-nums ${pnl >= 0 ? "text-emerald-400/60" : "text-rose-400/60"}`}>
            {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress bar toward 400€ goal */}
      <div className="rounded-lg border border-white/5 bg-[#111] p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Objectif : 400 EUR (x2)</span>
          <span className="tabular-nums font-medium">{(CAPITAL + pnl).toFixed(2)} / 400 EUR</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, ((CAPITAL + pnl) / 400) * 100)}%` }}
          />
        </div>
      </div>

      {/* Positions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Positions ({portfolio.positions.length})</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/5 bg-[#111] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Asset</label>
                <input
                  type="text"
                  value={form.asset}
                  onChange={(e) => setForm({ ...form, asset: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  placeholder="BTC, ETH, ..."
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "crypto" | "prediction" | "other" })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                >
                  <option value="crypto">Crypto</option>
                  <option value="prediction">Prediction</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Prix d&apos;entree (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.entryPrice}
                  onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Quantite</label>
                <input
                  type="number"
                  step="any"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Notes (optionnel)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400/50"
                placeholder="Raison de l'entree..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 transition-colors"
            >
              Ajouter la position
            </button>
          </form>
        )}

        {portfolio.positions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune position enregistree</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Clique sur &quot;Ajouter&quot; pour tracker tes trades</p>
          </div>
        ) : (
          <div className="space-y-2">
            {portfolio.positions.map((pos) => {
              const value = (pos.currentPrice ?? pos.entryPrice) * pos.quantity;
              const cost = pos.entryPrice * pos.quantity;
              const posPnl = value - cost;
              return (
                <div
                  key={pos.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#111] px-4 py-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{pos.asset}</p>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">{pos.type}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {pos.quantity} x {pos.entryPrice.toFixed(2)} EUR &middot; {pos.entryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">{value.toFixed(2)} EUR</p>
                    <p className={`text-[10px] tabular-nums ${posPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {posPnl >= 0 ? "+" : ""}{posPnl.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removePosition(pos.id)}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
