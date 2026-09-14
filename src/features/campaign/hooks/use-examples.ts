"use client";

import { useQuery } from "@tanstack/react-query";
import { campaignApi } from "@/lib/api/campaign";
import { queryKeys } from "@/lib/api/query-keys";

export function useExamples() {
  return useQuery({ queryKey: queryKeys.examples, queryFn: () => campaignApi.examples() });
}

/** Whether the backend has an OpenAI key is shown in the header; polled slowly so a restart
 *  with a key switches the badge without a reload. */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => campaignApi.health(),
    refetchInterval: 30_000,
    retry: false,
  });
}
