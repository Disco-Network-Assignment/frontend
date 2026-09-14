"use client";

/** The pipeline as a horizontal strip of steps: a filled check for every stage done, a pulsing
 *  dot for the one in flight, an empty ring for what is still ahead. */

import { Check, X } from "lucide-react";
import { STEPS } from "@/features/campaign/lib/stages";
import { stepState, type RunState } from "@/features/campaign/lib/run-reducer";
import { cn } from "@/lib/utils";

type MarkerState = "done" | "active" | "failed" | "pending";

function Marker({ state }: { state: MarkerState }) {
  if (state === "done" || state === "failed") {
    return (
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full",
          state === "failed" ? "bg-fail" : "bg-brand",
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
      <span className="grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-brand">
        <span className="size-2 animate-pulse rounded-full bg-brand" />
      </span>
    );
  }
  return (
    <span className="block size-5 shrink-0 rounded-full border-[1.5px] border-line bg-panel" />
  );
}

export function PipelineStepper({ state }: { state: RunState }) {
  const { done, active } = stepState(state);

  return (
    <div className="dash-card px-4 py-3" data-testid="stepper">
      <div className="flex items-center gap-2">
        <span className="text-[13.5px] font-semibold">Pipeline</span>
        <StatusPill status={state.status} />
      </div>
      <ol className="thin-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
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
            <li
              key={step.key}
              className="flex min-w-[150px] flex-1 items-start gap-2"
              data-stage={step.key}
              data-state={marker}
              title={step.desc}
            >
              <Marker state={marker} />
              <div className="min-w-0">
                <div
                  className={cn(
                    "truncate text-[12.5px] font-medium",
                    marker === "pending" && "text-soft",
                    marker === "failed" && "text-fail",
                  )}
                >
                  {step.title}
                </div>
                <div className="font-mono text-[10.5px] text-soft">
                  {step.kind === "code" ? "code" : "agent"}
                  {stage.progress &&
                    marker === "active" &&
                    ` · ${stage.progress.completed}/${stage.progress.total}`}
                  {stage.ms !== undefined &&
                    marker === "done" &&
                    ` · ${stage.ms < 1000 ? `${stage.ms} ms` : `${(stage.ms / 1000).toFixed(1)} s`}`}
                </div>
              </div>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "mt-2.5 h-px flex-1",
                    marker === "done" ? "bg-brand" : "bg-line",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const PILL: Record<RunState["status"], { label: string; dot: string }> = {
  idle: { label: "Idle", dot: "bg-line" },
  running: { label: "Running", dot: "bg-brand" },
  done: { label: "Done", dot: "bg-pass" },
  stopped: { label: "Needs input", dot: "bg-amber-500" },
  error: { label: "Failed", dot: "bg-fail" },
};

export function StatusPill({ status }: { status: RunState["status"] }) {
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
