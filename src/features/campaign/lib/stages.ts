/** The pipeline as the stepper shows it: one entry per stage, in order. One place, so the
 *  stepper and the trace drawer can never drift apart. */

import type { PipelineStage } from "@/types/api";

export type StepDef = { key: PipelineStage; title: string; desc: string; kind: "model" | "code" };

export const STEPS: StepDef[] = [
  { key: "intake", title: "Understand the advertiser", desc: "Free text becomes a structured brief with an input-quality flag.", kind: "model" },
  { key: "signals", title: "Compute fit signals", desc: "Category, age, gender, income and AOV evidence for all 20 publishers.", kind: "code" },
  { key: "match", title: "Score the publishers", desc: "Rubric verdicts with reasons, then guardrails and ranking.", kind: "model" },
  { key: "personas", title: "Pick the personas", desc: "3-5 plausible shoppers, each with a messaging angle.", kind: "model" },
  { key: "creative", title: "Write the creatives", desc: "One unit per persona, in parallel, checked by lint.", kind: "model" },
  { key: "config", title: "Assemble the config", desc: "Targeting, allocation, bids, budget, KPIs, forecast.", kind: "code" },
  { key: "summary", title: "Summarise the strategy", desc: "A reviewer's narrative and the risks.", kind: "model" },
];

export const STEP_TITLE: Record<PipelineStage, string> = Object.fromEntries(
  STEPS.map((s) => [s.key, s.title]),
) as Record<PipelineStage, string>;
