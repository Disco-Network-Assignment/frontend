"use client";

import { Bot, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdvertiserComposer } from "@/features/campaign/components/advertiser-composer";
import { AllocationBars, Gauge } from "@/features/campaign/components/charts";
import { ClarifyBanner } from "@/features/campaign/components/clarify-banner";
import { ConfigPanel } from "@/features/campaign/components/config-panel";
import { CreativePanel } from "@/features/campaign/components/creative-panel";
import { DashCard } from "@/features/campaign/components/dash-card";
import { ErrorCard } from "@/features/campaign/components/error-card";
import { PersonaPanel } from "@/features/campaign/components/persona-panel";
import { PipelineStepper } from "@/features/campaign/components/pipeline-stepper";
import { PublisherPanel } from "@/features/campaign/components/publisher-panel";
import { StatCards } from "@/features/campaign/components/stat-cards";
import { StoppedView } from "@/features/campaign/components/stopped-view";
import { TraceDrawer } from "@/features/campaign/components/trace-drawer";
import { useCampaignRun } from "@/features/campaign/hooks/use-campaign-run";
import { useExamples } from "@/features/campaign/hooks/use-examples";
import type { PlanOptions } from "@/types/api";

/**
 * The dashboard, top to bottom: header, composer, pipeline strip, the four KPI cards, then a
 * two-column grid (publisher ranking on the left; allocation, confidence and the strategy
 * summary on the right), then personas, creatives, config and the trace.
 */
export function CampaignView() {
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PlanOptions>({
    force_exploratory: false,
  });
  const examples = useExamples();
  const { state, start, cancel } = useCampaignRun();

  const running = state.status === "running";
  const submit = (text = description) => {
    const trimmed = text.trim();
    if (!trimmed || running) return;
    setDescription(trimmed);
    start(trimmed, options);
  };

  const showPublishers =
    state.publishers || state.stages.match.status === "running";
  const showPersonas =
    state.personas || state.stages.personas.status === "running";
  const showCreatives =
    state.creatives.length > 0 || state.stages.creative.status === "running";
  const showConfig = state.config || state.stages.config.status === "running";

  return (
    <div className="space-y-4 pt-5" id="dashboard">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="h-display text-[22px]">Dashboard</h1>
          <p className="text-[12.5px] text-soft">
            One advertiser sentence in; ranked publishers, persona-tuned
            creatives and a campaign config out.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {state.plan && (
            <span className="hidden rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-[11px] text-soft sm:inline">
              run {state.plan.run_id}
            </span>
          )}
          <Button
            variant="outline"
            className="rounded-full"
            disabled={!state.plan}
            onClick={() =>
              state.plan &&
              downloadJson(
                state.plan,
                `campaign-plan-${state.plan.run_id}.json`,
              )
            }
          >
            <Download className="size-4" /> Export JSON
          </Button>
        </div>
      </div>

      <AdvertiserComposer
        value={description}
        onChange={setDescription}
        onSubmit={() => submit()}
        onCancel={cancel}
        running={running}
        examples={examples.data ?? []}
        options={options}
        onOptionsChange={setOptions}
      />

      <PipelineStepper state={state} />

      {state.error && (
        <ErrorCard error={state.error} onRetry={() => submit()} />
      )}
      {state.stopped && (
        <StoppedView stopped={state.stopped} onPickExample={submit} />
      )}
      {state.brief && state.status !== "stopped" && (
        <ClarifyBanner
          brief={state.brief}
          onInterpretation={(patch) => submit(`${state.description} ${patch}`)}
        />
      )}

      <StatCards state={state} />

      {state.status === "idle" && !state.brief && !state.stopped && (
        <DashCard className="py-10 text-center">
          <p className="text-[13.5px] text-soft">
            Describe a business, or pick a sample advertiser, and the dashboard
            fills in stage by stage.
          </p>
        </DashCard>
      )}

      {(showPublishers || showConfig) && (
        <div
          className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
          data-testid="results"
        >
          <div className="min-w-0">
            {showPublishers && <PublisherPanel publishers={state.publishers} />}
          </div>
          <div className="space-y-4">
            <DashCard
              title="Budget allocation"
              subtitle="share of the pilot by publisher"
            >
              {state.config ? (
                <AllocationBars
                  allocation={state.config.publisher_allocation}
                />
              ) : (
                <WaitingNote text="after the config stage" />
              )}
            </DashCard>
            <DashCard
              title="Plan confidence"
              subtitle="how much of the brief was stated, not assumed"
            >
              {state.config ? (
                <Gauge
                  value={state.config.confidence}
                  label={`${Math.round(state.config.confidence * 100)}%`}
                  caption={`input ${state.brief?.input_quality ?? "unknown"} · ${state.config.status.replaceAll("_", " ")}`}
                />
              ) : (
                <WaitingNote text="after the config stage" />
              )}
            </DashCard>
            <DashCard
              title="Strategy summary"
              subtitle="written by the summariser agent"
              action={
                <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Bot className="size-3.5" />
                </span>
              }
            >
              {state.summary ? (
                <div data-testid="summary">
                  <p className="text-[13px] leading-relaxed">
                    {state.summary.strategy_summary}
                  </p>
                  {state.summary.risks.length > 0 && (
                    <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[12px] text-soft">
                      {state.summary.risks.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <WaitingNote
                  text={
                    state.stages.summary.status === "running"
                      ? "writing…"
                      : "after the plan is assembled"
                  }
                />
              )}
            </DashCard>
          </div>
        </div>
      )}

      {showPersonas && <PersonaPanel personas={state.personas ?? null} />}
      {showCreatives && (
        <CreativePanel
          creatives={state.creatives}
          progress={state.stages.creative.progress}
          running={state.stages.creative.status === "running"}
        />
      )}
      {showConfig && <ConfigPanel config={state.config} />}
      {state.plan && <TraceDrawer plan={state.plan} />}
    </div>
  );
}

function WaitingNote({ text }: { text: string }) {
  return <p className="py-6 text-center text-[12.5px] text-soft">{text}</p>;
}

function downloadJson(value: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
