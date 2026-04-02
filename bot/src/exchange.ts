import ccxt from "ccxt";
import type { BotConfig, Candle } from "./types.js";

let exchange: ccxt.bybit | null = null;

export function initExchange(config: BotConfig): ccxt.bybit {
  exchange = new ccxt.bybit({
    apiKey: config.exchange.apiKey || undefined,
    secret: config.exchange.apiSecret || undefined,
    sandbox: config.exchange.testnet,
    enableRateLimit: true,
    options: { defaultType: "spot" },
  });

  return exchange;
}

export function getExchange(): ccxt.bybit {
  if (!exchange) throw new Error("Exchange non initialise");
  return exchange;
}

export async function fetchCandles(
  pair: string,
  timeframe = "5m",
  limit = 100
): Promise<Candle[]> {
  const ex = getExchange();
  const ohlcv = await ex.fetchOHLCV(pair, timeframe, undefined, limit);
  return ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
    timestamp: timestamp as number,
    open: open as number,
    high: high as number,
    low: low as number,
    close: close as number,
    volume: volume as number,
  }));
}

export async function getPrice(pair: string): Promise<number> {
  const ex = getExchange();
  const ticker = await ex.fetchTicker(pair);
  return ticker.last ?? 0;
}

export async function getBalance(): Promise<number> {
  const ex = getExchange();
  const balance = await ex.fetchBalance();
  return balance.total?.USDT ?? 0;
}

export async function createOrder(
  pair: string,
  side: "buy" | "sell",
  amount: number,
  price?: number
) {
  const ex = getExchange();
  if (price) {
    return ex.createLimitOrder(pair, side, amount, price);
  }
  return ex.createMarketOrder(pair, side, amount);
}
