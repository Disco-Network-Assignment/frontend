/** Client for the disco-backend API. */
import { request, requestNdjson } from "@/lib/api/http";
import { env } from "@/lib/env";
import type { ExampleAdvertiser, HealthResponse, PipelineEvent, PlanOptions } from "@/types/api";

const call = <T>(path: string, init?: RequestInit) => request<T>(env.apiUrl, path, init);

export const campaignApi = {
  health: () => call<HealthResponse>("/health"),
  examples: () => call<ExampleAdvertiser[]>("/api/examples"),
  /** Stage events as they happen; resolves when the backend closes the stream. */
  stream: (
    description: string,
    options: PlanOptions,
    onEvent: (event: PipelineEvent) => void,
    signal?: AbortSignal,
  ) => requestNdjson<PipelineEvent>(env.apiUrl, "/api/plan", { description, options }, onEvent, signal),
};
