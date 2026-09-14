"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSearch } from "@/components/layout/search-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreColumns } from "@/features/campaign/components/charts";
import { DashCard, DeltaChip } from "@/features/campaign/components/dash-card";
import { ScoreBar } from "@/features/campaign/components/score-bar";
import { cn } from "@/lib/utils";
import type { PublisherAssessment, Verdict } from "@/types/api";

const VERDICT: Record<Verdict, { label: string; className: string }> = {
  recommend: { label: "Recommend", className: "bg-pass-soft text-pass" },
  consider: { label: "Consider", className: "bg-warn-soft text-warn" },
  exclude: { label: "Excluded", className: "bg-panel2 text-soft" },
};

type Filter = "all" | Verdict;

/** The ranked catalog as a dashboard table: verdict, score, the evidence, and the reasons on
 *  expand. The score chart above shows the whole distribution at a glance. */
export function PublisherPanel({
  publishers,
}: {
  publishers?: PublisherAssessment[];
}) {
  const { query } = useSearch();
  const [filter, setFilter] = useState<Filter>("all");

  if (!publishers) return <PanelSkeleton title="Publisher ranking" rows={4} />;

  const counts = {
    recommend: publishers.filter((p) => p.verdict === "recommend").length,
    consider: publishers.filter((p) => p.verdict === "consider").length,
    exclude: publishers.filter((p) => p.verdict === "exclude").length,
  };
  const needle = query.trim().toLowerCase();
  const rows = publishers.filter((p) => {
    if (filter !== "all" && p.verdict !== filter) return false;
    if (needle && !p.publisher_name.toLowerCase().includes(needle))
      return false;
    return true;
  });

  return (
    <DashCard
      id="publishers"
      data-testid="publishers"
      title="Publisher ranking"
      subtitle={`${counts.recommend} recommended · ${counts.consider} to consider · ${counts.exclude} excluded`}
      action={
        <div className="flex flex-wrap gap-1">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All ({publishers.length})
          </FilterTab>
          <FilterTab
            active={filter === "recommend"}
            onClick={() => setFilter("recommend")}
          >
            Recommended ({counts.recommend})
          </FilterTab>
          <FilterTab
            active={filter === "consider"}
            onClick={() => setFilter("consider")}
          >
            Consider ({counts.consider})
          </FilterTab>
          <FilterTab
            active={filter === "exclude"}
            onClick={() => setFilter("exclude")}
          >
            Excluded ({counts.exclude})
          </FilterTab>
        </div>
      }
    >
      {counts.recommend === 0 && (
        <p className="mb-3 rounded-lg bg-warn-soft px-3 py-2 text-[13px]">
          No publisher in this catalog is a defensible fit. The exclusion
          reasons below say why.
        </p>
      )}

      <ScoreColumns publishers={publishers} />

      <div className="thin-scroll mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12.5px]">
          <thead className="text-left text-[11px] tracking-wide text-soft uppercase">
            <tr>
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Publisher</th>
              <th className="py-2 pr-3 font-medium">Verdict</th>
              <th className="py-2 pr-3 font-medium">Score</th>
              <th className="py-2 pr-3 font-medium">Shelf</th>
              <th className="py-2 pr-3 font-medium">Age overlap</th>
              <th className="py-2 pr-3 font-medium">AOV</th>
              <th className="py-2 pr-3 font-medium">Why</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <PublisherRow key={p.publisher_id} assessment={p} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-soft">
                  No publisher matches “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
}

function PublisherRow({ assessment: a }: { assessment: PublisherAssessment }) {
  const [open, setOpen] = useState(false);
  const s = a.signals;
  const verdict = VERDICT[a.verdict];
  const lead =
    a.verdict === "recommend"
      ? a.reasons[0]
      : (a.exclusion_reason ?? a.concerns[0] ?? a.reasons[0]);
  const shelf =
    s.category_overlap >= 1
      ? "same"
      : s.category_overlap > 0
        ? "adjacent"
        : "none";

  return (
    <>
      <tr
        data-testid="publisher-card"
        className="cursor-pointer border-t border-line align-middle hover:bg-panel2/60"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="py-2.5 pr-3 font-mono text-[11px] text-soft">
          {a.rank}
        </td>
        <td className="py-2.5 pr-3 font-medium whitespace-nowrap">
          {a.publisher_name}
        </td>
        <td className="py-2.5 pr-3">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
              verdict.className,
            )}
          >
            {verdict.label}
          </span>
        </td>
        <td className="py-2.5 pr-3">
          <ScoreBar value={a.score} />
        </td>
        <td className="py-2.5 pr-3">
          <DeltaChip
            tone={
              shelf === "same"
                ? "good"
                : shelf === "adjacent"
                  ? "neutral"
                  : "warn"
            }
          >
            {shelf}
          </DeltaChip>
        </td>
        <td className="py-2.5 pr-3 font-mono tabular-nums">
          {Math.round(s.age_overlap_pct * 100)}%
        </td>
        <td className="py-2.5 pr-3 font-mono tabular-nums">
          {s.aov_ratio.toFixed(1)}×
        </td>
        <td className="max-w-[280px] py-2.5 pr-3 text-soft">
          <span className="line-clamp-1">{lead}</span>
        </td>
        <td className="py-2.5 text-soft">
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </td>
      </tr>
      {open && (
        <tr className="border-t border-line bg-panel2/40">
          <td colSpan={9} className="px-3 py-3">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <ul className="list-disc space-y-0.5 pl-4 text-[12.5px]">
                  {a.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {a.concerns.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12px] text-warn">
                    {a.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
                {a.exclusion_reason && (
                  <p className="mt-1.5 text-[12px] text-soft">
                    Excluded because: {a.exclusion_reason}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap content-start gap-1.5 md:max-w-[260px]">
                <Sub label="audience" value={a.subscores.audience_fit} />
                <Sub label="category" value={a.subscores.category_fit} />
                <Sub label="price" value={a.subscores.price_fit} />
                <Sub label="context" value={a.subscores.context_fit} />
                <Sub label="prior" value={s.prior} />
                {a.guardrails_applied.map((g) => (
                  <Badge
                    key={g}
                    variant="outline"
                    className="font-mono text-[10px]"
                  >
                    guard: {g}
                  </Badge>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap",
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-line text-soft hover:bg-panel2",
      )}
    >
      {children}
    </button>
  );
}

function Sub({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-md bg-panel px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-line">
      {label} {Math.round(value)}
    </span>
  );
}

export function PanelSkeleton({
  title,
  rows,
  id,
}: {
  title: string;
  rows: number;
  id?: string;
}) {
  return (
    <DashCard title={title} id={id}>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </DashCard>
  );
}
