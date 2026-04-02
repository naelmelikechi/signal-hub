import { RSI, MACD, EMA, BollingerBands } from "technicalindicators";
import type { Candle, Indicators } from "./types.js";

export function computeIndicators(candles: Candle[]): Indicators | null {
  if (candles.length < 30) return null;

  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1];

  // RSI(14)
  const rsiValues = RSI.calculate({ values: closes, period: 14 });
  const rsi = rsiValues[rsiValues.length - 1];

  // MACD(12, 26, 9)
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const macdLast = macdValues[macdValues.length - 1];

  // EMA(9) et EMA(21)
  const emaFastValues = EMA.calculate({ values: closes, period: 9 });
  const emaSlowValues = EMA.calculate({ values: closes, period: 21 });
  const emaFast = emaFastValues[emaFastValues.length - 1];
  const emaSlow = emaSlowValues[emaSlowValues.length - 1];

  // Bollinger Bands(20, 2)
  const bbValues = BollingerBands.calculate({
    values: closes,
    period: 20,
    stdDev: 2,
  });
  const bbLast = bbValues[bbValues.length - 1];

  if (!rsi || !macdLast || !emaFast || !emaSlow || !bbLast) return null;

  return {
    rsi,
    macd: {
      MACD: macdLast.MACD ?? 0,
      signal: macdLast.signal ?? 0,
      histogram: macdLast.histogram ?? 0,
    },
    emaFast,
    emaSlow,
    bollingerUpper: bbLast.upper,
    bollingerMiddle: bbLast.middle,
    bollingerLower: bbLast.lower,
    price: currentPrice,
  };
}
