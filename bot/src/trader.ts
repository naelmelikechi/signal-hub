import { createOrder, getPrice } from "./exchange.js";
import {
  calculatePositionSize,
  calculateStopLoss,
  calculateTakeProfit,
} from "./risk-manager.js";
import type { BotConfig, BotState, Trade, TradeSignal } from "./types.js";

export async function executeTrade(
  signal: TradeSignal,
  config: BotConfig,
  state: BotState,
  aiConfirmed: boolean
): Promise<Trade | null> {
  const price = await getPrice(signal.pair);
  if (!price) return null;

  const { quantity, investAmount } = calculatePositionSize(config, state, price);

  if (investAmount < 5) {
    console.log(`⚠️  Position trop petite (${investAmount.toFixed(2)} USDT) — trade ignore`);
    return null;
  }

  const side = signal.type === "ACHAT" ? "buy" : "sell";
  const stopLoss = calculateStopLoss(price, signal.type as "ACHAT" | "VENTE", config.stopLossPct);
  const takeProfit = calculateTakeProfit(price, signal.type as "ACHAT" | "VENTE", config.takeProfitPct);

  try {
    const order = await createOrder(signal.pair, side, quantity);
    const executedPrice = order.average ?? order.price ?? price;

    const trade: Trade = {
      id: order.id ?? `trade_${Date.now()}`,
      pair: signal.pair,
      type: signal.type as "ACHAT" | "VENTE",
      entryPrice: executedPrice,
      quantity,
      stopLoss,
      takeProfit,
      status: "ouvert",
      entryTime: new Date().toISOString(),
      aiConfirmed,
      reason: signal.reason,
    };

    console.log(
      `✅ ${signal.type} ${signal.pair} — ${quantity.toFixed(6)} @ ${executedPrice.toFixed(2)} USDT`
    );
    console.log(
      `   Stop-loss: ${stopLoss.toFixed(2)} | Take-profit: ${takeProfit.toFixed(2)} | Montant: ${investAmount.toFixed(2)} USDT`
    );

    return trade;
  } catch (err) {
    console.error(`❌ Erreur execution ordre ${signal.pair}:`, err);
    return null;
  }
}

export async function closePosition(
  trade: Trade,
  currentPrice: number
): Promise<Trade> {
  const side = trade.type === "ACHAT" ? "sell" : "buy";

  try {
    await createOrder(trade.pair, side, trade.quantity);
  } catch (err) {
    console.error(`❌ Erreur fermeture position ${trade.pair}:`, err);
  }

  const pnl =
    trade.type === "ACHAT"
      ? (currentPrice - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - currentPrice) * trade.quantity;

  return {
    ...trade,
    exitPrice: currentPrice,
    pnl,
    pnlPct: (pnl / (trade.entryPrice * trade.quantity)) * 100,
    exitTime: new Date().toISOString(),
  };
}
