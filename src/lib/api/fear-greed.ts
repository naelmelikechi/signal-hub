import { API_URLS, CACHE_TTL } from "@/lib/constants";
import { withCache } from "@/lib/cache";
import type { FearGreedData } from "@/types";

export async function fetchFearGreed(): Promise<FearGreedData> {
  return withCache("feargreed:latest", CACHE_TTL.fearGreed, async () => {
    const res = await fetch(`${API_URLS.fearGreed}/?limit=1`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Fear & Greed error: ${res.status}`);
    const json = await res.json();
    const entry = json.data[0];
    return {
      value: parseInt(entry.value, 10),
      classification: entry.value_classification,
      timestamp: parseInt(entry.timestamp, 10) * 1000,
    };
  });
}
