/** Single source of truth for React Query cache keys. */
export const queryKeys = {
  health: ["health"] as const,
  examples: ["examples"] as const,
  runs: ["runs"] as const,
} as const;
