import "dotenv/config";
import type { BotConfig } from "./types.js";

export function loadConfig(): BotConfig {
  return {
    exchange: {
      apiKey: process.env.BYBIT_API_KEY ?? "",
      apiSecret: process.env.BYBIT_API_SECRET ?? "",
      testnet: process.env.BYBIT_TESTNET !== "false",
    },
    tradingPairs: (process.env.TRADING_PAIRS ?? "BTC/USDT,ETH/USDT").split(","),
    capital: parseFloat(process.env.CAPITAL ?? "200"),
    maxRiskPerTrade: parseFloat(process.env.MAX_RISK_PER_TRADE ?? "0.02"),
    maxPositions: parseInt(process.env.MAX_POSITIONS ?? "3", 10),
    stopLossPct: parseFloat(process.env.STOP_LOSS_PCT ?? "0.02"),
    takeProfitPct: parseFloat(process.env.TAKE_PROFIT_PCT ?? "0.04"),
    checkIntervalMs: parseInt(process.env.CHECK_INTERVAL_MS ?? "300000", 10),
    circuitBreakerPct: parseFloat(process.env.CIRCUIT_BREAKER_PCT ?? "0.20"),
    openaiApiKey: process.env.OPENAI_API_KEY || undefined,
  };
}
