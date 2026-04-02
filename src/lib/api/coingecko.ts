import { API_URLS, CACHE_TTL } from "@/lib/constants";
import { withCache } from "@/lib/cache";
import type { CoinData } from "@/types";

export async function fetchTopCoins(): Promise<CoinData[]> {
  return withCache("coingecko:top50", CACHE_TTL.crypto, async () => {
    const url = `${API_URLS.coinGecko}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=7d`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    return res.json();
  });
}
