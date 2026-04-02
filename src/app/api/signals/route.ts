import { NextResponse } from "next/server";
import { computeCompositeSignal } from "@/lib/scoring/composite";

export async function GET() {
  try {
    const signal = await computeCompositeSignal();
    return NextResponse.json(signal, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Signals API error:", error);
    return NextResponse.json(
      {
        globalScore: 50,
        scores: [],
        alerts: ["Signal computation failed — showing neutral"],
        timestamp: Date.now(),
      },
      { status: 502 }
    );
  }
}
