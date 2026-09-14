"use client";

import { useQuery } from "@tanstack/react-query";
import { campaignApi } from "@/lib/api/campaign";
import { queryKeys } from "@/lib/api/query-keys";

/** The stored run history; the run hook invalidates it whenever a run reaches its end. */
export function useRuns() {
  return useQuery({
    queryKey: queryKeys.runs,
    queryFn: () => campaignApi.runs(),
    retry: false,
  });
}
