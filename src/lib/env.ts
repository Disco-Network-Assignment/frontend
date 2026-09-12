/**
 * Public build-time configuration. `output: "export"` inlines these at build time, so they
 * must be `NEXT_PUBLIC_*` and present in the environment that runs `next build` (local
 * defaults live in .env.development).
 */
export const env = {
  /** FastAPI backend origin. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
} as const;
