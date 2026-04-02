import type { CompositeSignal, SignalScore } from "@/types";
import { WEIGHTS, ALERT_HIGH, ALERT_LOW, getScoreLabel } from "@/lib/constants";
import { fetchTopCoins } from "@/lib/api/coingecko";
import { fetchPredictionMarkets } from "@/lib/api/polymarket";
import { fetchMacroEvents } from "@/lib/api/macro";
import { fetchFearGreed } from "@/lib/api/fear-greed";
import { computeCryptoScore } from "./crypto-score";
import { computePredictionScore } from "./prediction-score";
import { computeMacroScore } from "./macro-score";
import { computeSentimentScore } from "./sentiment-score";

export async function computeCompositeSignal(): Promise<CompositeSignal> {
  // Fetch all data in parallel
  const [coins, markets, events, fearGreed] = await Promise.allSettled([
    fetchTopCoins(),
    fetchPredictionMarkets(),
    fetchMacroEvents(),
    fetchFearGreed(),
  ]);

  const cryptoData = coins.status === "fulfilled" ? coins.value : [];
  const predictionData = markets.status === "fulfilled" ? markets.value : [];
  const macroData = events.status === "fulfilled" ? events.value : [];
  const sentimentData = fearGreed.status === "fulfilled" ? fearGreed.value : null;

  const cryptoScore = computeCryptoScore(cryptoData);
  const predictionScore = computePredictionScore(predictionData);
  const macroScore = computeMacroScore(macroData);
  const sentimentScore = computeSentimentScore(sentimentData);

  const scores: SignalScore[] = [
    {
      source: "crypto",
      score: cryptoScore,
      label: getScoreLabel(cryptoScore),
      description: `${cryptoData.length} coins analyzed`,
      weight: WEIGHTS.crypto,
      alert: cryptoScore >= ALERT_HIGH || cryptoScore <= ALERT_LOW,
    },
    {
      source: "predictions",
      score: predictionScore,
      label: getScoreLabel(predictionScore),
      description: `${predictionData.length} markets tracked`,
      weight: WEIGHTS.predictions,
      alert: predictionScore >= ALERT_HIGH || predictionScore <= ALERT_LOW,
    },
    {
      source: "macro",
      score: macroScore,
      label: getScoreLabel(macroScore),
      description: `${macroData.length} events monitored`,
      weight: WEIGHTS.macro,
      alert: macroScore >= ALERT_HIGH || macroScore <= ALERT_LOW,
    },
    {
      source: "sentiment",
      score: sentimentScore,
      label: sentimentData?.classification ?? getScoreLabel(sentimentScore),
      description: "Fear & Greed Index",
      weight: WEIGHTS.sentiment,
      alert: sentimentScore >= ALERT_HIGH || sentimentScore <= ALERT_LOW,
    },
  ];

  const globalScore = Math.round(
    scores.reduce((sum, s) => sum + s.score * s.weight, 0)
  );

  const alerts: string[] = [];
  for (const s of scores) {
    if (s.score >= ALERT_HIGH) alerts.push(`${s.source}: ${s.label} (${s.score})`);
    if (s.score <= ALERT_LOW) alerts.push(`${s.source}: ${s.label} (${s.score})`);
  }
  if (sentimentData && sentimentData.value >= 80) {
    alerts.push("Extreme Greed detected — correction risk elevated");
  }

  return { globalScore, scores, alerts, timestamp: Date.now() };
}
