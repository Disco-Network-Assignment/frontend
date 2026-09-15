# disco-frontend

Dashboard for the Disco campaign brain: describe a business, watch ranked publishers,
persona-tuned creatives and a draft campaign config fill in stage by stage, with every reason
visible. The one-page project README lives in the backend repo:
https://github.com/Disco-Network-Assignment/backend

**Live:** https://main.d3afgogco54xng.amplifyapp.com (AWS Amplify, static export; the API on EC2
is set at build time through `NEXT_PUBLIC_API_URL`).

## Run

```bash
npm install
npm run dev          # http://localhost:5173, talks to the backend on http://localhost:8000
```

Start the backend first (see its README: Postgres via `docker compose up -d`, an
`OPENAI_API_KEY` in its `.env`, then `uvicorn app.main:app`). The sidebar card says whether the
agents can run. `.env.development` points at localhost; copy `.env.example` to `.env` to target
another API.

```bash
npm run typecheck && npm run lint
npm test             # vitest: run reducer (incl. reloading stored runs) + NDJSON parser
npm run test:e2e     # playwright against the real backend and agents; skips without a key
npm run build        # -> out/
```

## Stack and layout

Next.js 16 (App Router, `output: "export"`), React 19, TypeScript strict, TanStack Query for
the read-only server state, Tailwind v4 + vendored shadcn primitives, inline SVG charts.

```
src/
  app/                       layout (fonts, providers, shell), page
  components/layout/         AppShell (sidebar + top bar), Sidebar (section nav, collapse, drawer,
                             agent status card), Topbar (publisher search), search-context
  components/ui/             shadcn primitives (vendored)
  features/campaign/
    components/              dash-card, stat-cards (4 KPIs), charts (score columns, allocation
                             bars, confidence gauge), composer, pipeline strip, clarify banner,
                             publisher ranking table, persona / creative / config panels,
                             run-history (stored runs, click to reload), trace, stopped + error
    hooks/                   use-campaign-run (NDJSON stream -> reducer, load a stored run),
                             use-examples, use-health, use-runs
    lib/                     run-reducer (pure state machine), stages (step vocabulary)
  lib/api/                   fetch wrapper + NDJSON reader, endpoint client, query keys
  types/api.ts               wire types mirroring the backend's app/schemas.py
```
