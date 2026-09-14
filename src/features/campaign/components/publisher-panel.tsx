"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBar } from "@/features/campaign/components/score-bar";
import { cn } from "@/lib/utils";
import type { PublisherAssessment, Verdict } from "@/types/api";

const VERDICT: Record<Verdict, { label: string; className: string }> = {
  recommend: { label: "Recommend", className: "bg-pass/10 text-pass" },
  consider: { label: "Consider", className: "bg-amber-100 text-warn" },
  exclude: { label: "Excluded", className: "bg-panel2 text-soft" },
};

/** Ranked publishers: full cards for the recommended set, one-line reasons for the rest. */
export function PublisherPanel({ publishers }: { publishers?: PublisherAssessment[] }) {
  if (!publishers) return <PanelSkeleton title="Publishers" rows={3} />;
  const recommended = publishers.filter((p) => p.verdict === "recommend");
  const consider = publishers.filter((p) => p.verdict === "consider");
  const excluded = publishers.filter((p) => p.verdict === "exclude");

  return (
    <Card className="gap-0 py-4" data-testid="publishers">
      <CardContent className="px-4">
        <div className="flex items-baseline gap-2">
          <div className="text-[15px] font-semibold">Publishers</div>
          <span className="text-[12px] text-soft">
            {recommended.length} recommended · {consider.length} to consider · {excluded.length} excluded
          </span>
        </div>

        {recommended.length === 0 && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[13.5px]">
            No publisher in this catalog is a defensible fit. The exclusion reasons below say why.
          </p>
        )}

        <div className="mt-3 space-y-3">
          {recommended.map((p) => (
            <PublisherCard key={p.publisher_id} assessment={p} />
          ))}
        </div>

        {consider.length > 0 && <Collapsed title={`Consider (${consider.length})`} rows={consider} />}
        {excluded.length > 0 && <Collapsed title={`Excluded (${excluded.length})`} rows={excluded} />}
      </CardContent>
    </Card>
  );
}

function PublisherCard({ assessment: a }: { assessment: PublisherAssessment }) {
  const s = a.signals;
  const verdict = VERDICT[a.verdict];
  return (
    <div className="rounded-xl border border-line p-3" data-testid="publisher-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-soft">#{a.rank}</span>
        <span className="text-[13.5px] font-semibold">{a.publisher_name}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", verdict.className)}>
          {verdict.label}
        </span>
        <ScoreBar value={a.score} className="ml-auto" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Sub label="audience" value={a.subscores.audience_fit} />
        <Sub label="category" value={a.subscores.category_fit} />
        <Sub label="price" value={a.subscores.price_fit} />
        <Sub label="context" value={a.subscores.context_fit} />
        <span className="mx-1 w-px bg-line" />
        <Chip>{s.category_overlap >= 1 ? "same shelf" : s.category_overlap > 0 ? "adjacent shelf" : "no shelf overlap"}</Chip>
        <Chip>age overlap {Math.round(s.age_overlap_pct * 100)}%</Chip>
        <Chip>AOV {s.aov_ratio.toFixed(1)}×</Chip>
        <Chip>prior {Math.round(s.prior)}</Chip>
      </div>

      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[13.5px]">
        {a.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {a.concerns.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-warn">
          {a.concerns.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
      {a.guardrails_applied.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {a.guardrails_applied.map((g) => (
            <Badge key={g} variant="outline" className="font-mono text-[10px]">guard: {g}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function Collapsed({ title, rows }: { title: string; rows: PublisherAssessment[] }) {
  return (
    <details className="mt-3 rounded-xl border border-line">
      <summary className="cursor-pointer px-3 py-2 text-[13.5px] font-medium">{title}</summary>
      <ul className="divide-y divide-line">
        {rows.map((p) => (
          <li key={p.publisher_id} className="flex flex-wrap items-baseline gap-2 px-3 py-2 text-[12px]">
            <span className="font-mono text-soft">#{p.rank}</span>
            <span className="font-medium">{p.publisher_name}</span>
            <span className="font-mono text-soft">{Math.round(p.score)}</span>
            <span className="text-soft">{p.exclusion_reason ?? p.concerns[0] ?? p.reasons[0]}</span>
            {p.guardrails_applied.map((g) => (
              <Badge key={g} variant="outline" className="font-mono text-[10px]">{g}</Badge>
            ))}
          </li>
        ))}
      </ul>
    </details>
  );
}

function Sub({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-md bg-panel2 px-1.5 py-0.5 font-mono text-[11px]">
      {label} {Math.round(value)}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line px-2 py-0.5 text-[11px]">{children}</span>;
}

export function PanelSkeleton({ title, rows }: { title: string; rows: number }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
