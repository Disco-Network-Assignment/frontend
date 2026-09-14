/** Wire types mirroring the backend's app/schemas.py (the API is the contract). */

export type InputQuality = "clear" | "vague" | "ambiguous" | "off_catalog" | "insufficient";
export type Verdict = "recommend" | "consider" | "exclude";
export type EventStatus = "started" | "progress" | "completed" | "failed";
export type FailureKind = "validation" | "rate_limit" | "timeout" | "refusal" | "api" | "unknown";
export type ConfigStatus = "draft" | "not_recommended";
export type LintSeverity = "hard" | "soft";

/** The stages the pipeline reports on, in order; `done`/`stopped`/`error` are terminal markers. */
export type PipelineStage = "intake" | "signals" | "match" | "personas" | "creative" | "config" | "summary";
export type StageKey = PipelineStage | "done" | "stopped" | "error";

// ---- read-only ----

export type ExampleAdvertiser = { id: string; number: number; description: string };
export type HealthResponse = { status: "ok"; llm_configured: boolean; version: string };

// ---- stage outputs ----

export type Interpretation = { label: string; brief_patch: string };

export type AdvertiserBrief = {
  business_summary: string;
  product_category: string;
  secondary_categories: string[];
  price_tier: string;
  estimated_price_point_usd: number | null;
  purchase_model: string;
  brand_attributes: string[];
  target_customer: {
    age_range: string | null;
    gender_skew: string;
    income_tier: string | null;
    life_stage: string | null;
  };
  audience_signals: string[];
  is_consumer_commerce: boolean;
  input_quality: InputQuality;
  confidence: number;
  assumptions: string[];
  clarifying_questions: string[];
  interpretations: Interpretation[];
};

export type FitSignals = {
  publisher_id: string;
  category_overlap: number;
  age_overlap_pct: number;
  gender_alignment: number;
  income_price_alignment: number;
  aov_ratio: number;
  aov_fit: number;
  reach_index: number;
  notes_keyword_hits: string[];
  prior: number;
};

export type PublisherAssessment = {
  publisher_id: string;
  publisher_name: string;
  verdict: Verdict;
  score: number;
  subscores: { audience_fit: number; category_fit: number; price_fit: number; context_fit: number };
  reasons: string[];
  concerns: string[];
  exclusion_reason: string | null;
  signals: FitSignals;
  guardrails_applied: string[];
  rank: number;
};

export type PersonaPick = {
  persona_id: string;
  persona_name: string;
  fit_score: number;
  why_plausible: string;
  angle: string;
  watchouts: string[];
  best_publishers: string[];
};

export type RejectedPersona = { persona_id: string; persona_name: string; why_not: string };
export type PersonaSelection = { selected: PersonaPick[]; rejected: RejectedPersona[] };

export type LintIssue = { severity: LintSeverity; rule: string; message: string };
export type LintReport = { passed: boolean; issues: LintIssue[]; self_checks: number };

export type CreativeVariant = {
  id: string;
  persona_id: string;
  persona_name: string;
  headline: string;
  body: string;
  cta: string;
  alt_headline: string;
  persona_reasoning: string;
  target_publishers: string[];
  lint: LintReport;
};

export type PublisherAllocation = {
  publisher_id: string;
  publisher_name: string;
  share_pct: number;
  budget_usd: number;
  suggested_cpm_range_usd: [number, number];
  est_impressions: number;
  rationale: string;
};

export type CampaignConfig = {
  status: ConfigStatus;
  objective: string;
  confidence: number;
  targeting: {
    demographics: { age_range: string | null; gender_skew: string; income_tiers: string[] };
    interests: string[];
    contextual: string[];
    geo: string[];
    persona_ids: string[];
    exclusions: string[];
  };
  publisher_allocation: PublisherAllocation[];
  bid_strategy: {
    model: "CPM" | "CPC" | "CPA";
    starting_cpm_usd: number;
    target_cpa_usd: number | null;
    max_cpc_usd: number | null;
    rationale: string;
  };
  budget: { total_usd: number; daily_cap_usd: number; flight_days: number; pacing: "even" };
  creative_rotation: { mode: "even_then_optimize"; optimize_after_impressions: number };
  frequency_cap: { impressions: number; per_days: number };
  kpis: { primary: string; secondary: string[]; targets: Record<string, number> };
  forecast: { impressions: number; clicks: number; conversions: number; cpa_usd: number | null };
  assumptions: string[];
  open_questions: string[];
};

export type CampaignSummary = { strategy_summary: string; risks: string[] };

export type StageMeta = {
  stage: StageKey;
  ms: number;
  /** null when the stage is plain code */
  agent: string | null;
  model: string | null;
  reasoning_effort: string | null;
  prompt_version: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  tool_calls: number;
  handoffs: number;
  retried: boolean;
};

export type CampaignPlan = {
  run_id: string;
  description: string;
  brief: AdvertiserBrief;
  publishers: PublisherAssessment[];
  personas: PersonaSelection | null;
  creatives: CreativeVariant[];
  config: CampaignConfig;
  summary: CampaignSummary | null;
  trace: StageMeta[];
};

export type StopResult = {
  run_id: string;
  description: string;
  reason: string;
  clarifying_questions: string[];
  examples: string[];
  trace: StageMeta[];
};

// ---- API ----

export type PlanOptions = { force_exploratory?: boolean; session_id?: string };

/** One NDJSON line from POST /api/plan. `data` is the stage output on `completed`. */
export type PipelineEvent = {
  stage: StageKey;
  status: EventStatus;
  ms?: number;
  data?: unknown;
  message?: string;
  kind?: FailureKind;
  completed?: number;
  total?: number;
};

