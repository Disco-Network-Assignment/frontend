"use client";

import { useState } from "react";
import { PageBody } from "@/components/layout/page-body";
import { AdvertiserComposer } from "@/features/campaign/components/advertiser-composer";
import { ClarifyBanner } from "@/features/campaign/components/clarify-banner";
import { ConfigPanel } from "@/features/campaign/components/config-panel";
import { CreativePanel } from "@/features/campaign/components/creative-panel";
import { ErrorCard } from "@/features/campaign/components/error-card";
import { PersonaPanel } from "@/features/campaign/components/persona-panel";
import { PipelineStepper } from "@/features/campaign/components/pipeline-stepper";
import { PublisherPanel } from "@/features/campaign/components/publisher-panel";
import { StoppedView } from "@/features/campaign/components/stopped-view";
import { TraceDrawer } from "@/features/campaign/components/trace-drawer";
import { useCampaignRun } from "@/features/campaign/hooks/use-campaign-run";
import { useExamples } from "@/features/campaign/hooks/use-examples";
import type { PlanOptions } from "@/types/api";

/** The one page: composer + live stepper on the left, the results filling in on the right. */
export function CampaignView() {
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PlanOptions>({ force_exploratory: false });
  const examples = useExamples();
  const { state, start, cancel } = useCampaignRun();

  const running = state.status === "running";
  const submit = (text = description) => {
    const trimmed = text.trim();
    if (!trimmed || running) return;
    setDescription(trimmed);
    start(trimmed, options);
  };

  return (
    <PageBody>
      <div className="grid gap-6 pt-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
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
        </div>

        <div className="min-w-0 space-y-4" data-testid="results">
          {state.status === "idle" && !state.brief && (
            <p className="pt-10 text-center text-[13.5px] text-soft">
              Describe a business, or pick one of the sample advertisers, and the plan fills in
              here stage by stage.
            </p>
          )}
          {state.error && <ErrorCard error={state.error} onRetry={() => submit()} />}
          {state.stopped && <StoppedView stopped={state.stopped} onPickExample={submit} />}
          {state.brief && state.status !== "stopped" && (
            <ClarifyBanner
              brief={state.brief}
              onInterpretation={(patch) => submit(`${state.description} ${patch}`)}
            />
          )}
          {(state.publishers || state.stages.match.status === "running") && (
            <PublisherPanel publishers={state.publishers} />
          )}
          {(state.personas || state.stages.personas.status === "running") && (
            <PersonaPanel personas={state.personas ?? null} />
          )}
          {(state.creatives.length > 0 || state.stages.creative.status === "running") && (
            <CreativePanel
              creatives={state.creatives}
              progress={state.stages.creative.progress}
              running={state.stages.creative.status === "running"}
            />
          )}
          {(state.config || state.stages.config.status === "running") && (
            <ConfigPanel config={state.config} summary={state.summary ?? null} />
          )}
          {state.plan && <TraceDrawer plan={state.plan} />}
        </div>
      </div>
    </PageBody>
  );
}
