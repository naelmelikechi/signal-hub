import { loadConfig } from "./config.js";
import { initExchange, fetchCandles, getPrice } from "./exchange.js";
import { computeIndicators } from "./indicators.js";
import { analyzeSignal } from "./strategy.js";
import { initAI, confirmWithAI } from "./ai-confirm.js";
import {
  checkCircuitBreaker,
  canOpenPosition,
  checkOpenPositions,
} from "./risk-manager.js";
import { executeTrade, closePosition } from "./trader.js";
import { loadState, saveState, logTrade } from "./logger.js";
import type { BotState } from "./types.js";

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║        SIGNAL HUB — BOT DE TRADING       ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  const config = loadConfig();
  const exchange = initExchange(config);
  initAI(config);

  const state: BotState = loadState(config.capital);
  state.running = true;

  console.log(`📊 Mode: ${config.exchange.testnet ? "PAPER TRADING" : "⚠️  TRADING REEL"}`);
  console.log(`💰 Capital: ${state.capital.toFixed(2)} USDT`);
  console.log(`📈 Paires: ${config.tradingPairs.join(", ")}`);
  console.log(`⏱  Intervalle: ${config.checkIntervalMs / 1000}s`);
  console.log(`🛡  Stop-loss: ${(config.stopLossPct * 100).toFixed(1)}% | Take-profit: ${(config.takeProfitPct * 100).toFixed(1)}%`);
  console.log(`🔒 Max positions: ${config.maxPositions} | Risque/trade: ${(config.maxRiskPerTrade * 100).toFixed(1)}%`);
  console.log(`🛑 Circuit breaker: -${(config.circuitBreakerPct * 100).toFixed(0)}%`);
  console.log();

  // Verify exchange connection
  try {
    await exchange.loadMarkets();
    console.log("✅ Connexion exchange reussie");
  } catch (err) {
    console.error("❌ Impossible de se connecter a l'exchange:", err);
    console.log("💡 Le bot fonctionne en mode simulation (sans ordres reels)");
  }

  console.log();
  console.log("🔄 Demarrage de la boucle de trading...");
  console.log("─".repeat(50));

  // Main loop
  while (state.running) {
    try {
      await cycle(config, state);
    } catch (err) {
      console.error("⚠️  Erreur dans le cycle:", err);
    }

    saveState(state);

    // Wait for next cycle
    await new Promise((resolve) => setTimeout(resolve, config.checkIntervalMs));
  }
}

async function cycle(config: ReturnType<typeof loadConfig>, state: BotState) {
  state.lastCheck = new Date().toISOString();
  const now = new Date().toLocaleTimeString("fr-FR");
  console.log(`\n⏰ [${now}] Nouveau cycle d'analyse`);

  // Check circuit breaker
  if (checkCircuitBreaker(state, config)) {
    state.circuitBreakerTriggered = true;
    return;
  }

  // Check existing positions for stop-loss / take-profit
  const prices = new Map<string, number>();
  for (const pair of config.tradingPairs) {
    try {
      prices.set(pair, await getPrice(pair));
    } catch (err) {
      console.error(`⚠️  Impossible de recuperer le prix de ${pair}`);
    }
  }

  const closedTrades = checkOpenPositions(state, prices);
  for (const trade of closedTrades) {
    // Execute the close order
    const closedTrade = await closePosition(trade, trade.exitPrice!);

    // Update state
    state.openPositions = state.openPositions.filter((t) => t.id !== trade.id);
    state.tradeHistory.push(closedTrade);
    state.capital += closedTrade.pnl ?? 0;
    state.totalPnl += closedTrade.pnl ?? 0;
    state.totalTrades++;

    const wins = state.tradeHistory.filter((t) => (t.pnl ?? 0) > 0).length;
    state.winRate = state.totalTrades > 0 ? (wins / state.totalTrades) * 100 : 0;

    logTrade(closedTrade, state);
  }

  // Analyze each pair for new signals
  if (!canOpenPosition(state, config)) {
    console.log(`   Positions max atteintes (${state.openPositions.length}/${config.maxPositions})`);
    return;
  }

  for (const pair of config.tradingPairs) {
    // Skip if already have a position on this pair
    if (state.openPositions.some((p) => p.pair === pair)) {
      continue;
    }

    try {
      // Fetch candles and compute indicators
      const candles = await fetchCandles(pair, "5m", 100);
      const indicators = computeIndicators(candles);

      if (!indicators) {
        console.log(`   ${pair}: Pas assez de donnees pour les indicateurs`);
        continue;
      }

      // Analyze signal
      const signal = analyzeSignal(pair, indicators);
      console.log(
        `   ${pair}: RSI=${indicators.rsi.toFixed(1)} | MACD=${indicators.macd.histogram > 0 ? "+" : ""}${indicators.macd.histogram.toFixed(4)} | Signal=${signal.type} (${(signal.confidence * 100).toFixed(0)}%)`
      );

      if (signal.type === "NEUTRE" || signal.confidence < 0.5) {
        continue;
      }

      // AI confirmation for strong signals
      let aiConfirmed = false;
      if (signal.confidence >= 0.5) {
        console.log(`   🤖 Demande de confirmation IA pour ${signal.type} ${pair}...`);
        const aiResult = await confirmWithAI(signal);
        aiConfirmed = aiResult.confirmed;
        console.log(
          `   🤖 IA: ${aiResult.confirmed ? "✅ Confirme" : "❌ Refuse"} (score: ${aiResult.score.toFixed(2)}) — ${aiResult.reasoning}`
        );

        if (!aiResult.confirmed) {
          continue;
        }
      }

      // Execute trade
      console.log(`   🎯 Execution ${signal.type} sur ${pair}...`);
      const trade = await executeTrade(signal, config, state, aiConfirmed);

      if (trade) {
        state.openPositions.push(trade);
        logTrade(trade, state);
      }
    } catch (err) {
      console.error(`   ⚠️  Erreur analyse ${pair}:`, err);
    }

    // Don't check more pairs if we hit max positions
    if (!canOpenPosition(state, config)) break;
  }

  // Status summary
  console.log(`   📊 Capital: ${state.capital.toFixed(2)} USDT | P&L: ${state.totalPnl >= 0 ? "+" : ""}${state.totalPnl.toFixed(2)} | Positions: ${state.openPositions.length}/${config.maxPositions} | Win: ${state.winRate.toFixed(0)}%`);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Arret du bot...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Arret du bot (SIGTERM)...");
  process.exit(0);
});

main().catch(console.error);
