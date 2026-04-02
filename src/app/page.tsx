"use client";

import { useSignals } from "@/hooks/use-signals";
import { GlobalScore } from "@/components/dashboard/global-score";
import { SignalCard } from "@/components/dashboard/signal-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, loading, error } = useSignals();

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col items-center gap-4 py-8">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Erreur de chargement des signaux</p>
          <p className="text-xs text-muted-foreground/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Tableau de Bord</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Derniere mise a jour : {new Date(data.timestamp).toLocaleTimeString("fr-FR")}
        </p>
      </div>

      <GlobalScore score={data.globalScore} alerts={data.alerts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.scores.map((signal) => (
          <SignalCard key={signal.source} signal={signal} />
        ))}
      </div>
    </div>
  );
}
