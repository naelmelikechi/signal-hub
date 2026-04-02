import { NextResponse } from "next/server";
import { fetchMacroEvents } from "@/lib/api/macro";

export async function GET() {
  try {
    const events = await fetchMacroEvents();
    return NextResponse.json(
      { events, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Macro API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch macro events", events: [], timestamp: Date.now() },
      { status: 502 }
    );
  }
}
