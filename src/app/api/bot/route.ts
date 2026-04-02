import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "bot-trades.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      running: false,
      mode: "paper",
      capital: 200,
      initialCapital: 200,
      openPositions: [],
      tradeHistory: [],
      recentTrades: [],
      totalPnl: 0,
      totalTrades: 0,
      winRate: 0,
      lastCheck: "",
      circuitBreakerTriggered: false,
    });
  }
}
