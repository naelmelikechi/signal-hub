"use client";
import { useState, useEffect, useCallback } from "react";
import type { Position, Portfolio } from "@/types";
import { CAPITAL } from "@/lib/constants";

const STORAGE_KEY = "signal-hub:portfolio";

function loadPortfolio(): Portfolio {
  if (typeof window === "undefined") return { capital: CAPITAL, positions: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { capital: CAPITAL, positions: [] };
}

function savePortfolio(portfolio: Portfolio) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch {}
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>({ capital: CAPITAL, positions: [] });

  useEffect(() => {
    setPortfolio(loadPortfolio());
  }, []);

  const addPosition = useCallback((position: Omit<Position, "id">) => {
    setPortfolio((prev) => {
      const next = {
        ...prev,
        positions: [...prev.positions, { ...position, id: crypto.randomUUID() }],
      };
      savePortfolio(next);
      return next;
    });
  }, []);

  const removePosition = useCallback((id: string) => {
    setPortfolio((prev) => {
      const next = { ...prev, positions: prev.positions.filter((p) => p.id !== id) };
      savePortfolio(next);
      return next;
    });
  }, []);

  const updateCapital = useCallback((capital: number) => {
    setPortfolio((prev) => {
      const next = { ...prev, capital };
      savePortfolio(next);
      return next;
    });
  }, []);

  const totalInvested = portfolio.positions.reduce(
    (sum, p) => sum + p.entryPrice * p.quantity,
    0
  );
  const totalValue = portfolio.positions.reduce(
    (sum, p) => sum + (p.currentPrice ?? p.entryPrice) * p.quantity,
    0
  );
  const pnl = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const available = portfolio.capital - totalInvested;

  return {
    portfolio,
    addPosition,
    removePosition,
    updateCapital,
    totalInvested,
    totalValue,
    pnl,
    pnlPercent,
    available,
  };
}
