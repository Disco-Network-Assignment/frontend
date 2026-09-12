"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEP_TITLE } from "@/features/campaign/lib/stages";
import type { RunState } from "@/features/campaign/lib/run-reducer";
import type { PipelineStage } from "@/types/api";

const HINT: Record<string, string> = {
  rate_limit: "The model provider rate-limited the request. Wait a minute and retry.",
  timeout: "The model call timed out; a retry usually succeeds.",
  refusal: "The model declined this request.",
  validation: "The model's answer did not fit the expected shape twice in a row.",
  api: "The model provider returned an error.",
};

type Props = { error: NonNullable<RunState["error"]>; onRetry: () => void };

/** A stage failed. Earlier stages keep their panels on screen; only the run needs retrying. */
export function ErrorCard({ error, onRetry }: Props) {
  const where = (STEP_TITLE as Record<string, string>)[error.stage as PipelineStage] ?? error.stage;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3" data-testid="error">
      <div className="flex items-center gap-2 text-[13.5px] font-medium text-fail">
        <TriangleAlert className="size-4" /> {where} failed
      </div>
      <p className="mt-1 text-[12px]">{error.message}</p>
      {error.kind && HINT[error.kind] && <p className="mt-1 text-[12px] text-soft">{HINT[error.kind]}</p>}
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        <RotateCcw className="size-3.5" /> Retry
      </Button>
    </div>
  );
}
