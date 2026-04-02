"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Calendar,
  Wallet,
  Bot,
} from "lucide-react";

const ICONS = {
  LayoutDashboard,
  TrendingUp,
  Target,
  Calendar,
  Wallet,
  Bot,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-white/5 bg-[#0a0a0a]">
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-white/5">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Signal Hub</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/5 text-white font-medium"
                  : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="rounded-lg bg-white/[0.03] px-3 py-2.5 text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Capital</span>
          <p className="text-lg font-semibold text-white tabular-nums mt-0.5">200 EUR</p>
        </div>
      </div>
    </aside>
  );
}
