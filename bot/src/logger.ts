import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { BotState, Trade } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, "..", "bot-state.json");
const TRADES_PATH = join(__dirname, "..", "..", "public", "bot-trades.json");

export function loadState(initialCapital: number): BotState {
  if (existsSync(STATE_PATH)) {
    try {
      const raw = readFileSync(STATE_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }

  return {
    running: true,
    mode: "paper",
    capital: initialCapital,
    initialCapital,
    openPositions: [],
    tradeHistory: [],
    totalPnl: 0,
    totalTrades: 0,
    winRate: 0,
    lastCheck: new Date().toISOString(),
    circuitBreakerTriggered: false,
  };
}

export function saveState(state: BotState) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  // Also write to public/ for the dashboard to read
  try {
    const dashboardData = {
      ...state,
      recentTrades: state.tradeHistory.slice(-20),
    };
    writeFileSync(TRADES_PATH, JSON.stringify(dashboardData, null, 2));
  } catch {}
}

export function logTrade(trade: Trade, state: BotState) {
  const emoji = trade.pnl && trade.pnl > 0 ? "💰" : trade.pnl && trade.pnl < 0 ? "📉" : "📊";
  const pnlStr = trade.pnl ? `${trade.pnl > 0 ? "+" : ""}${trade.pnl.toFixed(2)} USDT` : "";

  console.log(
    `${emoji} [${trade.pair}] ${trade.type} ${trade.status} — ${pnlStr} | Capital: ${state.capital.toFixed(2)} USDT`
  );
}
