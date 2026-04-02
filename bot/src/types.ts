export interface BotConfig {
  exchange: {
    apiKey: string;
    apiSecret: string;
    testnet: boolean;
  };
  tradingPairs: string[];
  capital: number;
  maxRiskPerTrade: number;
  maxPositions: number;
  stopLossPct: number;
  takeProfitPct: number;
  checkIntervalMs: number;
  circuitBreakerPct: number;
  openaiApiKey?: string;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  rsi: number;
  macd: { MACD: number; signal: number; histogram: number };
  emaFast: number;
  emaSlow: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  price: number;
}

export type SignalType = "ACHAT" | "VENTE" | "NEUTRE";

export interface TradeSignal {
  pair: string;
  type: SignalType;
  confidence: number; // 0-1
  indicators: Indicators;
  reason: string;
  timestamp: number;
}

export interface Trade {
  id: string;
  pair: string;
  type: "ACHAT" | "VENTE";
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  status: "ouvert" | "ferme" | "stop-loss" | "take-profit";
  exitPrice?: number;
  pnl?: number;
  pnlPct?: number;
  entryTime: string;
  exitTime?: string;
  aiConfirmed: boolean;
  reason: string;
}

export interface BotState {
  running: boolean;
  mode: "paper" | "live";
  capital: number;
  initialCapital: number;
  openPositions: Trade[];
  tradeHistory: Trade[];
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  lastCheck: string;
  circuitBreakerTriggered: boolean;
}
