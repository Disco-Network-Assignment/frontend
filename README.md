# disco-frontend

Web app for the Disco take-home: type what a business sells, watch the campaign brain fill in
ranked publishers (with exclusions), persona-tuned creatives and a draft campaign config, stage
by stage, with every reason visible.

## Stack

- **Next.js 16** (App Router) with `output: "export"`: every route is prerendered to static
  HTML; all data is fetched in the browser from the FastAPI backend.
- **React 19** · **TypeScript** (strict, `noUnusedLocals`)
- **TanStack Query v5** for the read-only server state (examples, health); the pipeline run is
  a streamed `POST` consumed by a `useReducer` state machine (`features/campaign/lib/run-reducer.ts`)
- **Tailwind v4** + **shadcn/ui** primitives (vendored, unmodified) + lucide icons
- **Vitest** for the reducer and the NDJSON parser; **Playwright** for the end-to-end flow
  against the real backend

## Layout

```
src/
  app/                 routes only: layout (fonts, providers, shell), page, not-found
  components/
    layout/            AppShell (header with the backend mode badge), PageBody
    ui/                shadcn primitives (vendored)
  features/campaign/
    components/        composer, stepper, clarify banner, publisher / persona / creative /
                       config panels, trace drawer, stopped + error states
    hooks/             use-campaign-run (NDJSON stream -> reducer), use-examples, use-health
    lib/               run-reducer (pure state machine), stages (step vocabulary)
  lib/api/             typed fetch wrapper + NDJSON reader, endpoint client, query keys
  types/api.ts         wire types mirroring the backend's app/schemas.py
```

## Run

```bash
npm install
npm run dev          # http://localhost:5173 (the backend's CORS allowlist knows this port)
```

`.env.development` already points at `http://localhost:8000`; copy `.env.example` to `.env` to
target something else. Start the backend first (`uvicorn app.main:app` in `../backend`); it runs
without an OpenAI key in heuristic mode, which is enough to click through everything.

```bash
npm run typecheck
npm run lint
npm test             # vitest: reducer + NDJSON parser
npm run test:e2e     # playwright: starts backend (heuristic) + frontend, drives the installed Edge
npm run build        # -> out/  (static export)
```
