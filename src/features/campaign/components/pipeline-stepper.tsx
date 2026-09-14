"use client";

/** The pipeline as a vertical stepper: a checked circle for every stage already done, a
 *  half-filled circle for the one in flight, empty circles for what is still ahead. */

import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STEPS } from "@/features/campaign/lib/stages";
import { stepState, type RunState } from "@/features/campaign/lib/run-reducer";
import { cn } from "@/lib/utils";

type MarkerState = "done" | "active" | "failed" | "pending";

function Marker({ state }: { state: MarkerState }) {
  if (state === "done" || state === "failed") {
    return (
      <span
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-full",
          state === "failed" ? "bg-fail" : "bg-ink",
        )}
      >
        {state === "failed" ? (
          <X className="size-3 text-white" strokeWidth={3} />
        ) : (
          <Check className="size-3 text-white" strokeWidth={3} />
        )}
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px] border-ink">
        <span
          className="size-[10px] animate-pulse rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-ink) 50%, transparent 50%)" }}
        />
      </span>
    );
  }
  return <span className="block size-[18px] shrink-0 rounded-full border-[1.5px] border-line bg-panel" />;
}

export function PipelineStepper({ state }: { state: RunState }) {
  const { done, active } = stepState(state);

  return (
    <Card className="gap-0 py-4" data-testid="stepper">
      <CardContent className="px-4">
        <div className="flex items-center gap-2">
          <div className="text-[15px] font-semibold">Pipeline</div>
          <StatusPill status={state.status} />
        </div>

        <ol className="mt-4">
          {STEPS.map((step, i) => {
            const stage = state.stages[step.key];
            const marker: MarkerState =
              stage.status === "failed"
                ? "failed"
                : active === step.key
                  ? "active"
                  : done.has(step.key)
                    ? "done"
                    : "pending";
            const last = i === STEPS.length - 1;
            return (
              <li key={step.key} className={cn("relative pl-8", !last && "pb-4")} data-stage={step.key} data-state={marker}>
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-[22px] bottom-0 left-[8.5px] w-px",
                      marker === "done" ? "bg-ink" : "bg-line",
                    )}
                  />
                )}
                <span className="absolute top-px left-0">
                  <Marker state={marker} />
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-[13.5px] font-medium",
                      marker === "pending" && "text-soft",
                      marker === "failed" && "text-fail",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="font-mono text-[11px] text-soft">
                    {step.kind === "code" ? "code" : "model"}
                  </span>
                  {stage.progress && marker === "active" && (
                    <span className="font-mono text-[11px] text-soft">
                      {stage.progress.completed}/{stage.progress.total}
                    </span>
                  )}
                  {stage.ms !== undefined && marker === "done" && (
                    <span className="ml-auto font-mono text-[11px] text-soft">
                      {stage.ms < 1000 ? `${stage.ms} ms` : `${(stage.ms / 1000).toFixed(1)} s`}
                    </span>
                  )}
                </div>
                {marker === "active" && <p className="mt-0.5 text-[12px] text-soft">{step.desc}</p>}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

const PILL: Record<RunState["status"], { label: string; dot: string }> = {
  idle: { label: "Idle", dot: "bg-line" },
  running: { label: "Running", dot: "bg-info" },
  done: { label: "Done", dot: "bg-green-600" },
  stopped: { label: "Needs input", dot: "bg-amber-500" },
  error: { label: "Failed", dot: "bg-fail" },
};

function StatusPill({ status }: { status: RunState["status"] }) {
  const pill = PILL[status];
  return (
    <span
      data-testid="run-status"
      data-status={status}
      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-0.5 text-[11px] font-medium"
    >
      <span className={cn("size-1.5 rounded-full", pill.dot)} />
      {pill.label}
    </span>
  );
}
