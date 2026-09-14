"use client";

import { PenLine, Store, Users, Wallet } from "lucide-react";
import { DeltaChip } from "@/features/campaign/components/dash-card";
import type { RunState } from "@/features/campaign/lib/run-reducer";

const usd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

type Stat = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  chip?: { tone: "good" | "warn" | "neutral" | "bad"; text: string };
  note: string;
};

/** The four numbers a reviewer wants first: publishers, personas, creatives, pilot budget. */
export function StatCards({ state }: { state: RunState }) {
  const publishers = state.publishers ?? [];
  const recommended = publishers.filter(
    (p) => p.verdict === "recommend",
  ).length;
  const consider = publishers.filter((p) => p.verdict === "consider").length;
  const personas = state.personas ?? null;
  const creatives = state.creatives;
  const lintOk = creatives.filter((c) => c.lint.passed).length;
  const config = state.config;

  const stats: Stat[] = [
    {
      label: "Publishers recommended",
      icon: Store,
      value: publishers.length ? String(recommended) : "—",
      chip: publishers.length
        ? recommended > 0
          ? { tone: "good", text: `${consider} to consider` }
          : { tone: "warn", text: "none fit" }
        : undefined,
      note: publishers.length
        ? `of ${publishers.length} in the catalog`
        : "waiting for a run",
    },
    {
      label: "Personas",
      icon: Users,
      value: personas ? String(personas.selected.length) : "—",
      chip: personas
        ? { tone: "neutral", text: `${personas.rejected.length} rejected` }
        : undefined,
      note: personas ? "each with a messaging angle" : "picked after matching",
    },
    {
      label: "Creatives",
      icon: PenLine,
      value: creatives.length ? String(creatives.length) : "—",
      chip: creatives.length
        ? lintOk === creatives.length
          ? { tone: "good", text: "all checks pass" }
          : { tone: "bad", text: `${creatives.length - lintOk} need edits` }
        : undefined,
      note: creatives.length
        ? "one ad unit per persona"
        : "written in parallel",
    },
    {
      label: "Pilot budget",
      icon: Wallet,
      value: config ? usd(config.budget.total_usd) : "—",
      chip: config
        ? config.status === "draft"
          ? { tone: "good", text: `confidence ${config.confidence.toFixed(2)}` }
          : { tone: "warn", text: "not recommended" }
        : undefined,
      note: config
        ? config.budget.total_usd > 0
          ? `${config.budget.flight_days} days · ${usd(config.budget.daily_cap_usd)}/day`
          : "nothing to spend on"
        : "sized by confidence",
    },
  ];

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      data-testid="stats"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="dash-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium text-soft">
              {stat.label}
            </span>
            <span className="ml-auto grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
              <stat.icon className="size-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="h-display text-[26px] leading-none tabular-nums">
              {stat.value}
            </span>
            {stat.chip && (
              <DeltaChip tone={stat.chip.tone}>{stat.chip.text}</DeltaChip>
            )}
          </div>
          <div className="mt-1.5 text-[11.5px] text-soft">{stat.note}</div>
        </div>
      ))}
    </div>
  );
}
