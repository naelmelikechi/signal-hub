import OpenAI from "openai";
import type { TradeSignal, BotConfig } from "./types.js";

let client: OpenAI | null = null;

export function initAI(config: BotConfig) {
  if (config.openaiApiKey) {
    client = new OpenAI({ apiKey: config.openaiApiKey });
    console.log("🤖 Confirmation IA activee (GPT-4o-mini)");
  } else {
    console.log("⚠️  Pas de cle OpenAI — le bot fonctionne avec les indicateurs techniques seuls");
  }
}

export async function confirmWithAI(signal: TradeSignal): Promise<{
  confirmed: boolean;
  score: number;
  reasoning: string;
}> {
  if (!client) {
    return { confirmed: true, score: 0.7, reasoning: "IA non configuree — confirmation auto" };
  }

  const { indicators: ind } = signal;

  const prompt = `Tu es un analyste crypto quantitatif. Analyse ce signal de trading et donne ton avis.

SIGNAL: ${signal.type} ${signal.pair}
RAISON: ${signal.reason}

INDICATEURS:
- RSI(14): ${ind.rsi.toFixed(1)}
- MACD: ${ind.macd.MACD.toFixed(4)} | Signal: ${ind.macd.signal.toFixed(4)} | Histogramme: ${ind.macd.histogram.toFixed(4)}
- EMA(9): ${ind.emaFast.toFixed(2)} | EMA(21): ${ind.emaSlow.toFixed(2)}
- Bollinger: Bas ${ind.bollingerLower.toFixed(2)} | Milieu ${ind.bollingerMiddle.toFixed(2)} | Haut ${ind.bollingerUpper.toFixed(2)}
- Prix actuel: ${ind.price.toFixed(2)}

Reponds en JSON strict:
{"score": 0.0-1.0, "confirmed": true/false, "reasoning": "explication courte en francais"}

Score > 0.6 = confirme. Sois conservateur — en cas de doute, refuse.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { confirmed: false, score: 0, reasoning: "Reponse IA vide" };

    const result = JSON.parse(content);
    return {
      confirmed: result.confirmed ?? result.score > 0.6,
      score: result.score ?? 0,
      reasoning: result.reasoning ?? "Pas de justification",
    };
  } catch (err) {
    console.error("⚠️  Erreur appel IA:", err);
    return { confirmed: false, score: 0, reasoning: "Erreur API — signal refuse par precaution" };
  }
}
