import type { CoinData } from "@/types";

export function computeCryptoScore(coins: CoinData[]): number {
  if (coins.length === 0) return 50;

  // Metric 1: % of coins in the green (24h)
  const greenCount = coins.filter((c) => (c.price_change_percentage_24h ?? 0) > 0).length;
  const greenRatio = greenCount / coins.length;
  const greenScore = greenRatio * 100; // 0-100

  // Metric 2: Weighted average % change (by market cap)
  const totalMcap = coins.reduce((sum, c) => sum + (c.market_cap ?? 0), 0);
  const weightedChange = totalMcap === 0 ? 0 : coins.reduce(
    (sum, c) => sum + ((c.price_change_percentage_24h ?? 0) * (c.market_cap ?? 0)) / totalMcap,
    0
  );
  // Map from [-10%, +10%] to [0, 100]
  const changeScore = Math.min(100, Math.max(0, (weightedChange + 10) * 5));

  // Metric 3: Volume strength (simple heuristic — high total volume = bullish)
  const avgVolRatio = coins.reduce((sum, c) => {
    const mcap = c.market_cap ?? 1;
    const volToMcap = (c.total_volume ?? 0) / mcap;
    return sum + volToMcap;
  }, 0) / coins.length;
  // Typical vol/mcap ratio is ~0.03-0.15, map to 0-100
  const volumeScore = Math.min(100, Math.max(0, volToMcapNormalize(avgVolRatio)));

  // Weighted combination
  return Math.round(greenScore * 0.4 + changeScore * 0.4 + volumeScore * 0.2);
}

function volToMcapNormalize(ratio: number): number {
  // 0.01 → 10, 0.05 → 50, 0.10+ → 100
  return Math.min(100, ratio * 1000);
}
