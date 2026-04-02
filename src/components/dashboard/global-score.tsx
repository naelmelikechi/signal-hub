"use client";

import { ScoreRing } from "@/components/shared/score-ring";
import { getScoreLabel } from "@/lib/constants";

interface GlobalScoreProps {
  score: number;
  alerts: string[];
}

export function GlobalScore({ score, alerts }: GlobalScoreProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <ScoreRing score={score} size={200} strokeWidth={10} label={getScoreLabel(score)} />
      <h2 className="text-sm font-medium text-muted-foreground">Score Global des Signaux</h2>
      {alerts.length > 0 && (
        <div className="w-full max-w-md space-y-1.5">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-amber-400/5 border border-amber-400/10 px-3 py-2 text-xs text-amber-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              {alert}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
