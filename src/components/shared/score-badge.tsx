import { getScoreColor, getScoreBg } from "@/lib/constants";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export function ScoreBadge({ score, label, className = "" }: ScoreBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getScoreBg(score)} ${getScoreColor(score)} ${className}`}
    >
      <span className="tabular-nums">{score}</span>
      {label && <span className="text-muted-foreground">/ {label}</span>}
    </span>
  );
}
