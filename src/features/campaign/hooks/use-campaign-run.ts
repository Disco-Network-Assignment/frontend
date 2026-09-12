"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { campaignApi } from "@/lib/api/campaign";
import { initialRunState, runReducer, type RunState } from "@/features/campaign/lib/run-reducer";
import type { PlanOptions } from "@/types/api";

/** Drives one pipeline run: starts the NDJSON stream, feeds every event to the reducer, and
 *  aborts the request when the user starts another run or leaves the page. */
export function useCampaignRun(): {
  state: RunState;
  start: (description: string, options?: PlanOptions) => void;
  cancel: () => void;
  reset: () => void;
} {
  const [state, dispatch] = useReducer(runReducer, initialRunState);
  const controller = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "cancel" });
  }, []);

  const start = useCallback((description: string, options: PlanOptions = {}) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    dispatch({ type: "start", description });
    campaignApi
      .stream(description, options, (event) => {
        if (!current.signal.aborted) dispatch({ type: "event", event });
      }, current.signal)
      .catch((error: unknown) => {
        if (current.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        dispatch({ type: "transport_error", message: `Could not reach the backend: ${message}` });
      });
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { state, start, cancel, reset };
}
