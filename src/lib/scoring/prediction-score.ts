import type { PredictionMarket } from "@/types";
import { LIQUIDITY_THRESHOLDS } from "@/lib/constants";

export function computePredictionScore(markets: PredictionMarket[]): number {
  if (markets.length === 0) return 50;

  // Only consider markets with decent liquidity
  const reliableMarkets = markets.filter(
    (m) => m.liquidity >= LIQUIDITY_THRESHOLDS.medium
  );

  if (reliableMarkets.length === 0) return 50;

  // Score based on how decisive markets are (probability far from 0.5)
  // Markets with clear direction = higher conviction = higher score
  const avgDecisiveness =
    reliableMarkets.reduce((sum, m) => {
      const prob = m.probability ?? 0.5;
      // Distance from 0.5, normalized to 0-1
      return sum + Math.abs(prob - 0.5) * 2;
    }, 0) / reliableMarkets.length;

  // Volume momentum — higher 24h volume relative to total = more activity
  const avgVolMomentum =
    reliableMarkets.reduce((sum, m) => {
      if (m.volume === 0) return sum;
      return sum + Math.min(1, m.volume24hr / (m.volume * 0.01));
    }, 0) / reliableMarkets.length;

  // Combine: decisiveness (60%) + activity (40%)
  const score = avgDecisiveness * 60 + avgVolMomentum * 40;
  return Math.round(Math.min(100, Math.max(0, score)));
}
