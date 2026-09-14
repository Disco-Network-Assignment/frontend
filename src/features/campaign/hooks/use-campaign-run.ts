"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { campaignApi } from "@/lib/api/campaign";
import { ApiError } from "@/lib/api/http";
import {
  initialRunState,
  runReducer,
  type RunState,
} from "@/features/campaign/lib/run-reducer";
import { queryKeys } from "@/lib/api/query-keys";
import type { PlanOptions, RunRecord } from "@/types/api";

/** Drives one pipeline run: starts the NDJSON stream, feeds every event to the reducer, and
 *  aborts the request when the user starts another run or leaves the page. */
export function useCampaignRun(): {
  state: RunState;
  start: (description: string, options?: PlanOptions) => void;
  cancel: () => void;
  reset: () => void;
  load: (record: RunRecord) => void;
} {
  const [state, dispatch] = useReducer(runReducer, initialRunState);
  const queryClient = useQueryClient();
  const controller = useRef<AbortController | null>(null);
  // one conversation per page load: the backend's session memory lets a refined description
  // build on the earlier turns instead of starting over
  const sessionId = useRef(crypto.randomUUID());

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "cancel" });
  }, []);

  const start = useCallback(
    (description: string, options: PlanOptions = {}) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      dispatch({ type: "start", description });
      campaignApi
        .stream(
          description,
          { ...options, session_id: sessionId.current },
          (event) => {
            if (current.signal.aborted) return;
            dispatch({ type: "event", event });
            // the backend stored the run at this point, so the history list is stale
            if (
              event.stage === "done" ||
              event.stage === "stopped" ||
              event.status === "failed"
            ) {
              queryClient.invalidateQueries({ queryKey: queryKeys.runs });
            }
          },
          current.signal,
        )
        .catch((error: unknown) => {
          if (current.signal.aborted) return;
          dispatch({ type: "transport_error", message: describe(error) });
        });
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "reset" });
  }, []);

  const load = useCallback((record: RunRecord) => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "load", record });
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { state, start, cancel, reset, load };
}

/** A 503 carries the backend's own explanation (no API key); anything else is a transport failure. */
function describe(error: unknown): string {
  if (error instanceof ApiError && error.status === 503) {
    try {
      return String(
        (JSON.parse(error.body) as { detail?: string }).detail ?? error.body,
      );
    } catch {
      return error.body;
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return `Could not reach the backend: ${message}`;
}
