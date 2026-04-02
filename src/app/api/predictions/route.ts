import { NextResponse } from "next/server";
import { fetchPredictionMarkets } from "@/lib/api/polymarket";

export async function GET() {
  try {
    const markets = await fetchPredictionMarkets();
    return NextResponse.json(
      { markets, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Predictions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction markets", markets: [], timestamp: Date.now() },
      { status: 502 }
    );
  }
}
