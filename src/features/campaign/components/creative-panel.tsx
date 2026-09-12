"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreativeVariant } from "@/types/api";

type Props = {
  creatives: CreativeVariant[];
  progress?: { completed: number; total: number };
  running: boolean;
};

/** One ad unit per persona, shown the way a checkout page would show it, with the persona
 *  reasoning and the lint verdict beside it. Cards appear as each parallel call lands. */
export function CreativePanel({ creatives, progress, running }: Props) {
  const pending = running ? Math.max(0, (progress?.total ?? 3) - creatives.length) : 0;
  return (
    <Card className="gap-0 py-4" data-testid="creatives">
      <CardContent className="px-4">
        <div className="flex items-baseline gap-2">
          <div className="text-[15px] font-semibold">Creatives</div>
          <span className="text-[12px] text-soft">
            {creatives.length} written{progress && running ? ` · ${progress.completed}/${progress.total}` : ""}
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {creatives.map((c) => (
            <CreativeCard key={c.id} creative={c} />
          ))}
          {Array.from({ length: pending }, (_, i) => (
            <Skeleton key={`pending-${i}`} className="h-40 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreativeCard({ creative: c }: { creative: CreativeVariant }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(`${c.headline}\n${c.body}\n${c.cta}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const hard = c.lint.issues.filter((i) => i.severity === "hard");
  const soft = c.lint.issues.filter((i) => i.severity === "soft");

  return (
    <div className="rounded-xl border border-line p-3" data-testid="creative-card">
      <div className="flex items-center gap-2">
        <span className="text-[13.5px] font-semibold">{c.persona_name}</span>
        <Badge variant="outline" className={c.lint.passed ? "text-pass" : "text-fail"}>
          {c.lint.passed ? "lint ok" : "needs edit"}
          {c.lint.retried ? " · retried" : ""}
        </Badge>
        <Button variant="ghost" size="icon-xs" className="ml-auto" onClick={copy} aria-label="Copy creative">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </Button>
      </div>

      <div className="ad-unit mt-2 p-3">
        <div className="text-[15px] font-semibold leading-snug">{c.headline}</div>
        <p className="mt-1 text-[13.5px] leading-snug">{c.body}</p>
        <span className="mt-2 inline-block rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-white">
          {c.cta}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-soft">alt: {c.alt_headline}</p>
      <details className="mt-1.5">
        <summary className="cursor-pointer text-[12px] font-medium">Why this works for {c.persona_name}</summary>
        <p className="mt-1 text-[12px]">{c.persona_reasoning}</p>
        {c.target_publishers.length > 0 && (
          <p className="mt-1 font-mono text-[11px] text-soft">runs on {c.target_publishers.join(", ")}</p>
        )}
      </details>
      {(hard.length > 0 || soft.length > 0) && (
        <ul className="mt-1.5 space-y-0.5 text-[11px]">
          {hard.map((i) => (
            <li key={i.message} className="text-fail">{i.message}</li>
          ))}
          {soft.map((i) => (
            <li key={i.message} className="text-warn">{i.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
