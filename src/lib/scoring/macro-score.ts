import type { MacroEvent } from "@/types";

export function computeMacroScore(events: MacroEvent[]): number {
  if (events.length === 0) return 50;

  const now = new Date();
  const highImpactEvents = events.filter((e) => e.impact === "high");

  if (highImpactEvents.length === 0) return 30; // No upcoming high-impact = low signal

  // Find the nearest high-impact event
  let nearestDaysAway = Infinity;
  for (const event of highImpactEvents) {
    const eventDate = new Date(event.date);
    const daysAway = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAway >= 0 && daysAway < nearestDaysAway) {
      nearestDaysAway = daysAway;
    }
  }

  if (nearestDaysAway === Infinity) return 30;

  // Closer = higher score (more market movement expected)
  // 0 days → 100, 1 day → 90, 3 days → 70, 7 days → 40, 14+ days → 20
  if (nearestDaysAway <= 0.5) return 100;
  if (nearestDaysAway <= 1) return 90;
  if (nearestDaysAway <= 3) return 70;
  if (nearestDaysAway <= 7) return 50;
  if (nearestDaysAway <= 14) return 35;
  return 20;
}
