import { CACHE_TTL } from "@/lib/constants";
import { withCache } from "@/lib/cache";
import type { MacroEvent } from "@/types";

// Static macro events — key upcoming dates for 2025-2026
// Updated manually or via a free calendar API when available
const STATIC_EVENTS: MacroEvent[] = [
  { date: "2026-04-10", time: "14:30", country: "US", event: "CPI (Mar)", impact: "high", forecast: "2.8%", previous: "2.8%" },
  { date: "2026-04-16", time: "14:30", country: "US", event: "Retail Sales (Mar)", impact: "medium", forecast: "0.4%", previous: "0.2%" },
  { date: "2026-04-30", time: "14:30", country: "US", event: "GDP Q1 (Advance)", impact: "high", forecast: "2.1%", previous: "2.4%" },
  { date: "2026-05-02", time: "14:30", country: "US", event: "Non-Farm Payrolls (Apr)", impact: "high", forecast: "180K", previous: "195K" },
  { date: "2026-05-07", time: "20:00", country: "US", event: "FOMC Decision", impact: "high" },
  { date: "2026-05-13", time: "14:30", country: "US", event: "CPI (Apr)", impact: "high" },
  { date: "2026-05-29", time: "14:30", country: "US", event: "PCE Price Index (Apr)", impact: "high" },
  { date: "2026-06-04", time: "14:30", country: "US", event: "Non-Farm Payrolls (May)", impact: "high" },
  { date: "2026-06-10", time: "14:30", country: "US", event: "CPI (May)", impact: "high" },
  { date: "2026-06-18", time: "20:00", country: "US", event: "FOMC Decision", impact: "high" },
  { date: "2026-04-17", time: "13:45", country: "EU", event: "ECB Rate Decision", impact: "high" },
  { date: "2026-06-04", time: "13:45", country: "EU", event: "ECB Rate Decision", impact: "high" },
  { date: "2026-05-08", time: "13:00", country: "UK", event: "BoE Rate Decision", impact: "medium" },
];

export async function fetchMacroEvents(): Promise<MacroEvent[]> {
  return withCache("macro:events", CACHE_TTL.macro, async () => {
    // Return events sorted by date, only future or recent ones
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return STATIC_EVENTS
      .filter((e) => new Date(e.date) >= twoWeeksAgo)
      .sort((a, b) => a.date.localeCompare(b.date));
  });
}
