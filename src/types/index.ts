// ============================================================
// Market Signal Aggregator — Type Definitions
// ============================================================

// --- Crypto ---
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CryptoResponse {
  coins: CoinData[];
  timestamp: number;
}

// --- Prediction Markets ---
export interface PredictionMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string; // JSON string of prices
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  image: string;
  active: boolean;
  closed: boolean;
  // Computed fields
  probability?: number;
  probabilityShift24h?: number;
  liquidityLevel?: "high" | "medium" | "low";
}

export interface PredictionsResponse {
  markets: PredictionMarket[];
  timestamp: number;
}

// --- Macro Calendar ---
export interface MacroEvent {
  date: string;
  time: string;
  country: string;
  event: string;
  impact: "high" | "medium" | "low";
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface MacroResponse {
  events: MacroEvent[];
  timestamp: number;
}

// --- Fear & Greed ---
export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: number;
}

export interface FearGreedResponse {
  data: FearGreedData;
  timestamp: number;
}

// --- Scoring ---
export interface SignalScore {
  source: "crypto" | "predictions" | "macro" | "sentiment";
  score: number; // 0-100
  label: string;
  description: string;
  weight: number;
  alert: boolean;
}

export interface CompositeSignal {
  globalScore: number;
  scores: SignalScore[];
  alerts: string[];
  timestamp: number;
}

// --- Portfolio ---
export interface Position {
  id: string;
  asset: string;
  type: "crypto" | "prediction" | "other";
  entryPrice: number;
  quantity: number;
  currentPrice?: number;
  entryDate: string;
  notes?: string;
}

export interface Portfolio {
  capital: number;
  positions: Position[];
}
