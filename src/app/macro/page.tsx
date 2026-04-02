"use client";

import { useState, useEffect } from "react";
import type { MacroResponse } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const IMPACT_STYLES = {
  high: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  low: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

export default function MacroPage() {
  const [data, setData] = useState<MacroResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/macro")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const events = data?.events ?? [];
  const now = new Date();

  // Group by date
  const grouped = events.reduce<Record<string, typeof events>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Calendrier Macro</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Evenements economiques cles &middot; Impact sur les marches
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayEvents]) => {
          const eventDate = new Date(date);
          const isToday = eventDate.toDateString() === now.toDateString();
          const isPast = eventDate < now && !isToday;
          const daysAway = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={date} className={isPast ? "opacity-50" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium">
                  {eventDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                </h3>
                {isToday && (
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">
                    Aujourd&apos;hui
                  </span>
                )}
                {!isPast && !isToday && daysAway <= 7 && (
                  <span className="text-[10px] text-muted-foreground">
                    dans {daysAway}j
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {dayEvents.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#111] px-4 py-3 hover:border-white/10 transition-colors"
                  >
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${IMPACT_STYLES[event.impact]}`}>
                      {event.impact}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.event}</p>
                      <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{event.country}</span>
                        <span>{event.time} UTC</span>
                        {event.forecast && <span>Prev: {event.forecast}</span>}
                        {event.previous && <span>Prec: {event.previous}</span>}
                      </div>
                    </div>
                    {event.actual && (
                      <span className="text-sm font-bold tabular-nums">{event.actual}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
