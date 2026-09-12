/** Single source of truth for React Query cache keys. */
export const queryKeys = {
  health: ["health"] as const,
  examples: ["examples"] as const,
  catalog: ["catalog"] as const,
} as const;
