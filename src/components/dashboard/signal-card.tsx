"use client";

import Link from "next/link";
import { ScoreRing } from "@/components/shared/score-ring";
import { getScoreColor } from "@/lib/constants";
import type { SignalScore } from "@/types";
import { TrendingUp, Target, Calendar, Heart } from "lucide-react";

const SOURCE_CONFIG = {
  crypto: { icon: TrendingUp, href: "/crypto", title: "Crypto Momentum" },
  predictions: { icon: Target, href: "/predictions", title: "Prediction Markets" },
  macro: { icon: Calendar, href: "/macro", title: "Macro Calendar" },
  sentiment: { icon: Heart, href: "/", title: "Market Sentiment" },
} as const;

interface SignalCardProps {
  signal: SignalScore;
}

export function SignalCard({ signal }: SignalCardProps) {
  const config = SOURCE_CONFIG[signal.source];
  const Icon = config.icon;

  return (
    <Link href={config.href} className="block group">
      <div className="rounded-xl border border-white/5 bg-[#111] p-5 transition-colors hover:border-white/10 hover:bg-[#141414]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{config.title}</h3>
              <p className="text-[11px] text-muted-foreground">{signal.description}</p>
            </div>
          </div>
          {signal.alert && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <ScoreRing score={signal.score} size={64} strokeWidth={4} />
          <div className="text-right">
            <p className={`text-lg font-bold tabular-nums ${getScoreColor(signal.score)}`}>
              {signal.score}
            </p>
            <p className="text-[11px] text-muted-foreground">{signal.label}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
