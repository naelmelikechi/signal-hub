import { NextResponse } from "next/server";
import { fetchTopCoins } from "@/lib/api/coingecko";

export async function GET() {
  try {
    const coins = await fetchTopCoins();
    return NextResponse.json(
      { coins, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Crypto API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto data", coins: [], timestamp: Date.now() },
      { status: 502 }
    );
  }
}
