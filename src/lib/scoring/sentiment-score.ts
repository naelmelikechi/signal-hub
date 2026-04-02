import type { FearGreedData } from "@/types";

export function computeSentimentScore(data: FearGreedData | null): number {
  if (!data) return 50;
  // Fear & Greed Index is already 0-100
  // We use it directly as the sentiment score
  return data.value;
}
