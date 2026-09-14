"use client";

import { DashCard } from "@/features/campaign/components/dash-card";
import { PanelSkeleton } from "@/features/campaign/components/publisher-panel";
import { ScoreBar } from "@/features/campaign/components/score-bar";
import type { PersonaSelection } from "@/types/api";

/** The personas the copy is written for, with why, the angle, and what to avoid; plus every
 *  rejected persona with its reason, so the choice is auditable. */
export function PersonaPanel({
  personas,
}: {
  personas: PersonaSelection | null;
}) {
  if (!personas)
    return <PanelSkeleton title="Personas" rows={2} id="personas" />;
  return (
    <DashCard
      id="personas"
      data-testid="personas"
      title="Personas"
      subtitle={`${personas.selected.length} selected · ${personas.rejected.length} rejected · each with a messaging angle`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {personas.selected.map((p) => (
          <div
            key={p.persona_id}
            className="rounded-xl border border-line p-3"
            data-testid="persona-card"
          >
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold">
                {p.persona_name}
              </span>
              <ScoreBar value={p.fit_score} className="ml-auto" />
            </div>
            <p className="mt-1.5 text-[12px]">{p.why_plausible}</p>
            <p className="mt-2 rounded-lg bg-brand-soft px-2.5 py-1.5 text-[12px]">
              <span className="font-semibold text-accent-foreground">
                Angle ·{" "}
              </span>
              {p.angle}
            </p>
            {p.watchouts.length > 0 && (
              <p className="mt-1.5 text-[12px] text-warn">
                Avoid: {p.watchouts.join(" · ")}
              </p>
            )}
            {p.best_publishers.length > 0 && (
              <p className="mt-1 font-mono text-[11px] text-soft">
                on {p.best_publishers.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {personas.rejected.length > 0 && (
        <details className="mt-3 rounded-xl border border-line">
          <summary className="cursor-pointer px-3 py-2 text-[13.5px] font-medium">
            Rejected ({personas.rejected.length})
          </summary>
          <ul className="divide-y divide-line">
            {personas.rejected.map((r) => (
              <li key={r.persona_id} className="px-3 py-2 text-[12px]">
                <span className="font-medium">{r.persona_name}</span>{" "}
                <span className="text-soft">{r.why_not}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </DashCard>
  );
}
