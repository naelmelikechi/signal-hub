// ============================================================
// Signal Aggregator — Configuration & Constants
// ============================================================

export const CAPITAL = 200; // EUR

// Scoring weights (must sum to 1.0)
export const WEIGHTS = {
  crypto: 0.35,
  predictions: 0.25,
  macro: 0.2,
  sentiment: 0.2,
} as const;

// Alert thresholds
export const ALERT_HIGH = 80;
export const ALERT_LOW = 20;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  crypto: 300, // 5 min — conservative for CoinGecko 10K/month limit
  predictions: 300, // 5 min
  macro: 3600, // 1 hour
  fearGreed: 3600, // 1 hour
  composite: 300, // 5 min
} as const;

// API endpoints
export const API_URLS = {
  coinGecko: "https://api.coingecko.com/api/v3",
  polymarket: "https://gamma-api.polymarket.com",
  fearGreed: "https://api.alternative.me/fng",
} as const;

// Polymarket liquidity thresholds
export const LIQUIDITY_THRESHOLDS = {
  high: 100_000,
  medium: 50_000,
} as const;

// Client polling intervals (ms)
export const POLL_INTERVALS = {
  signals: 300_000, // 5 min
  crypto: 300_000,
  predictions: 300_000,
  macro: 3_600_000, // 1 hour
} as const;

// Navigation items
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Crypto", href: "/crypto", icon: "TrendingUp" },
  { label: "Predictions", href: "/predictions", icon: "Target" },
  { label: "Macro", href: "/macro", icon: "Calendar" },
  { label: "Portfolio", href: "/portfolio", icon: "Wallet" },
] as const;

// Score color mapping
export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-rose-400";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-400/10 border-emerald-400/20";
  if (score >= 40) return "bg-amber-400/10 border-amber-400/20";
  return "bg-rose-400/10 border-rose-400/20";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Very Bullish";
  if (score >= 60) return "Bullish";
  if (score >= 40) return "Neutral";
  if (score >= 20) return "Bearish";
  return "Very Bearish";
}
