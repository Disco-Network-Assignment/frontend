"use client";

import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdvertiserBrief } from "@/types/api";

type Props = {
  brief: AdvertiserBrief;
  onInterpretation: (patch: string) => void;
};

/** What the intake stage understood, and (for anything but clear input) the assumptions it
 *  made, the questions it would ask, and interpretation chips that re-run the pipeline. */
export function ClarifyBanner({ brief, onInterpretation }: Props) {
  const clear = brief.input_quality === "clear";
  return (
    <div
      data-testid="brief"
      className={
        clear
          ? "rounded-xl border border-line bg-panel2 px-4 py-3"
          : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {clear ? (
          <Info className="size-4 text-soft" />
        ) : (
          <AlertTriangle className="size-4 text-warn" />
        )}
        <span className="text-[13.5px] font-medium">
          {brief.business_summary}
        </span>
        <Badge variant="outline" className="font-mono">
          {brief.input_quality}
        </Badge>
        <Badge variant="outline">
          {brief.product_category.replaceAll("_", " ")}
        </Badge>
        <Badge variant="outline">
          {brief.price_tier} · {brief.purchase_model.replaceAll("_", " ")}
        </Badge>
        <span className="ml-auto font-mono text-[11px] text-soft">
          confidence {brief.confidence.toFixed(2)}
        </span>
      </div>

      {brief.audience_signals.length > 0 && (
        <p className="mt-2 text-[12px] text-soft">
          Audience signals:{" "}
          {brief.audience_signals.map((s) => `“${s}”`).join(" · ")}
        </p>
      )}

      {!clear && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {brief.assumptions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">
                Assumed
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px]">
                {brief.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {brief.clarifying_questions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">
                Would help to know
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px]">
                {brief.clarifying_questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {brief.interpretations.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">
            Did you mean… (re-runs the plan)
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {brief.interpretations.map((i) => (
              <button
                key={i.label}
                type="button"
                onClick={() => onInterpretation(i.brief_patch)}
                className="rounded-full border border-brand-line bg-panel px-2.5 py-1 text-[12px] hover:bg-brand-soft"
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
