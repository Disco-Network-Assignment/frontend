/** Pure state machine for one pipeline run. The hook feeds it NDJSON events; components read
 *  the result. Being a plain reducer it is unit-tested without React. */

import type {
  AdvertiserBrief,
  CampaignConfig,
  CampaignPlan,
  CampaignSummary,
  CreativeVariant,
  FailureKind,
  FitSignals,
  PersonaSelection,
  PipelineEvent,
  PipelineStage,
  PublisherAssessment,
  StageKey,
  StopResult,
} from "@/types/api";

export type StageStatus = "idle" | "running" | "done" | "failed";
export type StageState = {
  status: StageStatus;
  ms?: number;
  progress?: { completed: number; total: number };
};

export type RunStatus = "idle" | "running" | "done" | "stopped" | "error";

export type RunState = {
  status: RunStatus;
  description: string;
  stages: Record<PipelineStage, StageState>;
  brief?: AdvertiserBrief;
  signals?: FitSignals[];
  publishers?: PublisherAssessment[];
  personas?: PersonaSelection | null;
  creatives: CreativeVariant[];
  config?: CampaignConfig;
  summary?: CampaignSummary | null;
  plan?: CampaignPlan;
  stopped?: StopResult;
  error?: { stage: StageKey; message: string; kind?: FailureKind };
};

export const PIPELINE_STAGES: PipelineStage[] = [
  "intake",
  "signals",
  "match",
  "personas",
  "creative",
  "config",
  "summary",
];

const idleStages = (): Record<PipelineStage, StageState> =>
  Object.fromEntries(PIPELINE_STAGES.map((s) => [s, { status: "idle" }])) as Record<
    PipelineStage,
    StageState
  >;

export const initialRunState: RunState = {
  status: "idle",
  description: "",
  stages: idleStages(),
  creatives: [],
};

export type RunAction =
  | { type: "start"; description: string }
  | { type: "event"; event: PipelineEvent }
  | { type: "transport_error"; message: string }
  | { type: "cancel" }
  | { type: "reset" };

function isPipelineStage(stage: StageKey): stage is PipelineStage {
  return (PIPELINE_STAGES as string[]).includes(stage);
}

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case "start":
      return { ...initialRunState, stages: idleStages(), status: "running", description: action.description };
    case "reset":
      return { ...initialRunState, stages: idleStages() };
    case "cancel":
      return state.status === "running" ? { ...state, status: "idle" } : state;
    case "transport_error":
      return { ...state, status: "error", error: { stage: "error", message: action.message } };
    case "event":
      return applyEvent(state, action.event);
  }
}

function applyEvent(state: RunState, event: PipelineEvent): RunState {
  const { stage, status } = event;

  if (status === "failed") {
    const stages = isPipelineStage(stage)
      ? { ...state.stages, [stage]: { ...state.stages[stage], status: "failed" as const } }
      : state.stages;
    return {
      ...state,
      stages,
      status: "error",
      error: { stage, message: event.message ?? "unknown error", kind: event.kind },
    };
  }

  if (stage === "done") {
    return { ...state, status: "done", plan: event.data as CampaignPlan };
  }
  if (stage === "stopped") {
    return { ...state, status: "stopped", stopped: event.data as StopResult };
  }
  if (!isPipelineStage(stage)) return state;

  if (status === "started") {
    return { ...state, stages: { ...state.stages, [stage]: { status: "running" } } };
  }
  if (status === "progress") {
    const creatives =
      stage === "creative" && event.data
        ? [...state.creatives, event.data as CreativeVariant]
        : state.creatives;
    return {
      ...state,
      creatives,
      stages: {
        ...state.stages,
        [stage]: {
          ...state.stages[stage],
          progress: { completed: event.completed ?? 0, total: event.total ?? 0 },
        },
      },
    };
  }
  // completed
  const stages = { ...state.stages, [stage]: { ...state.stages[stage], status: "done" as const, ms: event.ms } };
  switch (stage) {
    case "intake":
      return { ...state, stages, brief: event.data as AdvertiserBrief };
    case "signals":
      return { ...state, stages, signals: event.data as FitSignals[] };
    case "match":
      return { ...state, stages, publishers: event.data as PublisherAssessment[] };
    case "personas":
      return { ...state, stages, personas: event.data as PersonaSelection };
    case "creative":
      return { ...state, stages, creatives: event.data as CreativeVariant[] };
    case "config":
      return { ...state, stages, config: event.data as CampaignConfig };
    case "summary":
      return { ...state, stages, summary: event.data as CampaignSummary };
  }
}

/** Which step the stepper should highlight, and which are behind it. */
export function stepState(state: RunState): { done: Set<PipelineStage>; active: PipelineStage | null } {
  const done = new Set(PIPELINE_STAGES.filter((s) => state.stages[s].status === "done"));
  const active = PIPELINE_STAGES.find((s) => state.stages[s].status === "running") ?? null;
  return { done, active };
}
