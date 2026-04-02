import { API_URLS, CACHE_TTL } from "@/lib/constants";
import { withCache } from "@/lib/cache";
import type { PredictionMarket } from "@/types";
import { LIQUIDITY_THRESHOLDS } from "@/lib/constants";

interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string;
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  image: string;
  active: boolean;
  closed: boolean;
}

function classifyLiquidity(
  liquidity: number
): "high" | "medium" | "low" {
  if (liquidity >= LIQUIDITY_THRESHOLDS.high) return "high";
  if (liquidity >= LIQUIDITY_THRESHOLDS.medium) return "medium";
  return "low";
}

function parseProbability(outcomePrices: string): number {
  try {
    const prices = JSON.parse(outcomePrices);
    // First outcome is typically "Yes"
    return typeof prices[0] === "string" ? parseFloat(prices[0]) : prices[0];
  } catch {
    return 0.5;
  }
}

export async function fetchPredictionMarkets(): Promise<PredictionMarket[]> {
  return withCache("polymarket:trending", CACHE_TTL.predictions, async () => {
    const url = `${API_URLS.polymarket}/markets?closed=false&active=true&order=volume24hr&ascending=false&limit=20`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Polymarket error: ${res.status}`);
    const markets: GammaMarket[] = await res.json();

    return markets.map((m) => ({
      ...m,
      probability: parseProbability(m.outcomePrices),
      liquidityLevel: classifyLiquidity(m.liquidity),
    }));
  });
}
