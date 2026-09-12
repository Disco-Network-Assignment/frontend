/** Client for the disco-backend API. */
import { request, requestNdjson } from "@/lib/api/http";
import { env } from "@/lib/env";
import type {
  CatalogResponse,
  ExampleAdvertiser,
  HealthResponse,
  PipelineEvent,
  PlanOptions,
  PlanResponse,
} from "@/types/api";

const call = <T>(path: string, init?: RequestInit) => request<T>(env.apiUrl, path, init);

export const campaignApi = {
  health: () => call<HealthResponse>("/health"),
  examples: () => call<ExampleAdvertiser[]>("/api/examples"),
  catalog: () => call<CatalogResponse>("/api/catalog"),
  /** One JSON document for the whole run; the UI uses the stream instead. */
  run: (description: string, options: PlanOptions = {}) =>
    call<PlanResponse>("/api/plan/run", {
      method: "POST",
      body: JSON.stringify({ description, options }),
    }),
  /** Stage events as they happen; resolves when the backend closes the stream. */
  stream: (
    description: string,
    options: PlanOptions,
    onEvent: (event: PipelineEvent) => void,
    signal?: AbortSignal,
  ) => requestNdjson<PipelineEvent>(env.apiUrl, "/api/plan", { description, options }, onEvent, signal),
};
