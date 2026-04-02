import type { BotConfig, BotState, Trade } from "./types.js";

export function checkCircuitBreaker(state: BotState, config: BotConfig): boolean {
  const drawdown = (config.capital - state.capital) / config.capital;
  if (drawdown >= config.circuitBreakerPct) {
    console.log(
      `🛑 CIRCUIT BREAKER : drawdown de ${(drawdown * 100).toFixed(1)}% — bot en pause`
    );
    return true;
  }
  return false;
}

export function canOpenPosition(state: BotState, config: BotConfig): boolean {
  if (state.circuitBreakerTriggered) return false;
  if (state.openPositions.length >= config.maxPositions) return false;
  return true;
}

export function calculatePositionSize(
  config: BotConfig,
  state: BotState,
  price: number
): { quantity: number; investAmount: number } {
  // Risque max par trade = capital * maxRiskPerTrade
  const maxRisk = state.capital * config.maxRiskPerTrade;
  // Avec un stop-loss de X%, l'investissement max = maxRisk / stopLossPct
  const investAmount = Math.min(maxRisk / config.stopLossPct, state.capital * 0.15);
  const quantity = investAmount / price;

  return { quantity, investAmount };
}

export function calculateStopLoss(
  entryPrice: number,
  type: "ACHAT" | "VENTE",
  stopLossPct: number
): number {
  if (type === "ACHAT") return entryPrice * (1 - stopLossPct);
  return entryPrice * (1 + stopLossPct);
}

export function calculateTakeProfit(
  entryPrice: number,
  type: "ACHAT" | "VENTE",
  takeProfitPct: number
): number {
  if (type === "ACHAT") return entryPrice * (1 + takeProfitPct);
  return entryPrice * (1 - takeProfitPct);
}

export function checkOpenPositions(
  state: BotState,
  prices: Map<string, number>
): Trade[] {
  const closedTrades: Trade[] = [];

  for (const trade of state.openPositions) {
    const currentPrice = prices.get(trade.pair);
    if (!currentPrice) continue;

    let shouldClose = false;
    let exitReason = "";

    if (trade.type === "ACHAT") {
      if (currentPrice <= trade.stopLoss) {
        shouldClose = true;
        exitReason = "stop-loss";
      } else if (currentPrice >= trade.takeProfit) {
        shouldClose = true;
        exitReason = "take-profit";
      }
    } else {
      if (currentPrice >= trade.stopLoss) {
        shouldClose = true;
        exitReason = "stop-loss";
      } else if (currentPrice <= trade.takeProfit) {
        shouldClose = true;
        exitReason = "take-profit";
      }
    }

    if (shouldClose) {
      const pnl =
        trade.type === "ACHAT"
          ? (currentPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - currentPrice) * trade.quantity;
      const pnlPct =
        trade.type === "ACHAT"
          ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100
          : ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100;

      trade.exitPrice = currentPrice;
      trade.pnl = pnl;
      trade.pnlPct = pnlPct;
      trade.status = exitReason as Trade["status"];
      trade.exitTime = new Date().toISOString();
      closedTrades.push(trade);
    }
  }

  return closedTrades;
}
