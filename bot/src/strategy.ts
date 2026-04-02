import type { Indicators, TradeSignal, SignalType } from "./types.js";

export function analyzeSignal(pair: string, ind: Indicators): TradeSignal {
  const reasons: string[] = [];
  let buyScore = 0;
  let sellScore = 0;

  // RSI
  if (ind.rsi < 35) {
    buyScore += 2;
    reasons.push(`RSI survente (${ind.rsi.toFixed(1)})`);
  } else if (ind.rsi < 45) {
    buyScore += 1;
  } else if (ind.rsi > 65) {
    sellScore += 2;
    reasons.push(`RSI surachat (${ind.rsi.toFixed(1)})`);
  } else if (ind.rsi > 55) {
    sellScore += 1;
  }

  // MACD crossover
  if (ind.macd.histogram > 0 && ind.macd.MACD > ind.macd.signal) {
    buyScore += 2;
    reasons.push("MACD croisement haussier");
  } else if (ind.macd.histogram < 0 && ind.macd.MACD < ind.macd.signal) {
    sellScore += 2;
    reasons.push("MACD croisement baissier");
  }

  // EMA crossover
  if (ind.emaFast > ind.emaSlow) {
    buyScore += 1;
    if (ind.emaFast / ind.emaSlow > 1.002) {
      buyScore += 1;
      reasons.push("Golden cross EMA(9/21)");
    }
  } else {
    sellScore += 1;
    if (ind.emaSlow / ind.emaFast > 1.002) {
      sellScore += 1;
      reasons.push("Death cross EMA(9/21)");
    }
  }

  // Bollinger Bands
  const bbRange = ind.bollingerUpper - ind.bollingerLower;
  const pricePosition = (ind.price - ind.bollingerLower) / bbRange;

  if (pricePosition < 0.15) {
    buyScore += 2;
    reasons.push("Prix pres de la bande basse Bollinger");
  } else if (pricePosition > 0.85) {
    sellScore += 2;
    reasons.push("Prix pres de la bande haute Bollinger");
  }

  // Determine signal type and confidence
  const maxScore = 8; // max possible per side
  let type: SignalType = "NEUTRE";
  let confidence = 0;

  if (buyScore >= 4 && buyScore > sellScore + 1) {
    type = "ACHAT";
    confidence = Math.min(1, buyScore / maxScore);
  } else if (sellScore >= 4 && sellScore > buyScore + 1) {
    type = "VENTE";
    confidence = Math.min(1, sellScore / maxScore);
  } else {
    confidence = 0;
  }

  return {
    pair,
    type,
    confidence,
    indicators: ind,
    reason: reasons.length > 0 ? reasons.join(" | ") : "Pas de signal clair",
    timestamp: Date.now(),
  };
}
