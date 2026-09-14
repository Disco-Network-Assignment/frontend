/** Client for the disco-backend API. */
import { request, requestNdjson } from "@/lib/api/http";
import { env } from "@/lib/env";
import type {
  ExampleAdvertiser,
  HealthResponse,
  PipelineEvent,
  PlanOptions,
  RunRecord,
  RunSummary,
} from "@/types/api";

const call = <T>(path: string, init?: RequestInit) =>
  request<T>(env.apiUrl, path, init);

export const campaignApi = {
  health: () => call<HealthResponse>("/health"),
  examples: () => call<ExampleAdvertiser[]>("/api/examples"),
  /** Stored runs, newest first. */
  runs: () => call<RunSummary[]>("/api/runs"),
  /** One stored run with its plan, stop result or error. */
  run: (runId: string) =>
    call<RunRecord>(`/api/runs/${encodeURIComponent(runId)}`),
  /** Stage events as they happen; resolves when the backend closes the stream. */
  stream: (
    description: string,
    options: PlanOptions,
    onEvent: (event: PipelineEvent) => void,
    signal?: AbortSignal,
  ) =>
    requestNdjson<PipelineEvent>(
      env.apiUrl,
      "/api/plan",
      { description, options },
      onEvent,
      signal,
    ),
};
