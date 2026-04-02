import { NextResponse } from "next/server";
import { fetchFearGreed } from "@/lib/api/fear-greed";

export async function GET() {
  try {
    const data = await fetchFearGreed();
    return NextResponse.json(
      { data, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Fear & Greed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fear & greed index", data: null, timestamp: Date.now() },
      { status: 502 }
    );
  }
}
