import { defineConfig } from "@playwright/test";

/**
 * End-to-end: the real backend (heuristic mode, no key needed) + the real frontend, driven in
 * the installed Edge/Chrome so nothing has to be downloaded. `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    channel: process.env.PW_CHANNEL ?? "msedge",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: process.env.E2E_BACKEND_CMD ?? "cd ../backend && .venv/Scripts/python.exe -m uvicorn app.main:app --port 8000",
      url: "http://localhost:8000/health",
      reuseExistingServer: true,
      timeout: 60_000,
      env: { OPENAI_API_KEY: "", EXECUTION_MODE: "heuristic" },
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
