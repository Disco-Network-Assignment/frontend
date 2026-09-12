import { describe, expect, it } from "vitest";
import {
  initialRunState,
  runReducer,
  stepState,
  type RunState,
} from "@/features/campaign/lib/run-reducer";
import type { PipelineEvent } from "@/types/api";

const play = (events: PipelineEvent[], from: RunState = runReducer(initialRunState, { type: "start", description: "x" })) =>
  events.reduce((state, event) => runReducer(state, { type: "event", event }), from);

describe("runReducer", () => {
  it("starts a run with every stage idle", () => {
    const state = runReducer(initialRunState, { type: "start", description: "dog food" });
    expect(state.status).toBe("running");
    expect(state.description).toBe("dog food");
    expect(Object.values(state.stages).every((s) => s.status === "idle")).toBe(true);
  });

  it("tracks started and completed stages with their payloads", () => {
    const brief = { input_quality: "clear" };
    const state = play([
      { stage: "intake", status: "started" },
      { stage: "intake", status: "completed", ms: 120, data: brief },
      { stage: "match", status: "started" },
    ]);
    expect(state.stages.intake).toEqual({ status: "done", ms: 120 });
    expect(state.brief).toEqual(brief);
    expect(state.stages.match.status).toBe("running");
    expect(stepState(state)).toEqual({ done: new Set(["intake"]), active: "match" });
  });

  it("appends creatives as progress events arrive, then takes the completed list", () => {
    const a = { id: "a" };
    const b = { id: "b" };
    const state = play([
      { stage: "creative", status: "started" },
      { stage: "creative", status: "progress", completed: 1, total: 2, data: a },
      { stage: "creative", status: "progress", completed: 2, total: 2, data: b },
    ]);
    expect(state.creatives).toEqual([a, b]);
    expect(state.stages.creative.progress).toEqual({ completed: 2, total: 2 });
    const done = play([{ stage: "creative", status: "completed", ms: 5, data: [b, a] }], state);
    expect(done.creatives).toEqual([b, a]);
  });

  it("finishes on done with the plan", () => {
    const plan = { run_id: "r1" };
    const state = play([{ stage: "done", status: "completed", data: plan }]);
    expect(state.status).toBe("done");
    expect(state.plan).toEqual(plan);
  });

  it("stops on a stopped event", () => {
    const state = play([{ stage: "stopped", status: "completed", data: { reason: "thin" } }]);
    expect(state.status).toBe("stopped");
    expect(state.stopped).toEqual({ reason: "thin" });
  });

  it("marks the failing stage and keeps earlier results", () => {
    const state = play([
      { stage: "intake", status: "completed", ms: 1, data: { ok: true } },
      { stage: "match", status: "started" },
      { stage: "match", status: "failed", message: "rate limited", kind: "rate_limit" },
    ]);
    expect(state.status).toBe("error");
    expect(state.error).toEqual({ stage: "match", message: "rate limited", kind: "rate_limit" });
    expect(state.stages.match.status).toBe("failed");
    expect(state.brief).toEqual({ ok: true });
  });

  it("cancel only affects a running run", () => {
    const running = runReducer(initialRunState, { type: "start", description: "x" });
    expect(runReducer(running, { type: "cancel" }).status).toBe("idle");
    const done = play([{ stage: "done", status: "completed", data: {} }]);
    expect(runReducer(done, { type: "cancel" }).status).toBe("done");
  });

  it("reports transport errors", () => {
    const state = runReducer(initialRunState, { type: "transport_error", message: "offline" });
    expect(state.status).toBe("error");
    expect(state.error?.message).toBe("offline");
  });
});
