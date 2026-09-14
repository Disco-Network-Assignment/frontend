"use client";

import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashCard } from "@/features/campaign/components/dash-card";
import { cn } from "@/lib/utils";
import type { ExampleAdvertiser, PlanOptions } from "@/types/api";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  running: boolean;
  examples: ExampleAdvertiser[];
  options: PlanOptions;
  onOptionsChange: (options: PlanOptions) => void;
};

/** The advertiser's one-liner, the 15 sample chips, and the run controls. */
export function AdvertiserComposer({
  value,
  onChange,
  onSubmit,
  onCancel,
  running,
  examples,
  options,
  onOptionsChange,
}: Props) {
  return (
    <DashCard
      title="Describe the business"
      subtitle="A sentence or two, the way an advertiser would type it. Vague or off-topic input is handled honestly."
      action={
        <span className="hidden font-mono text-[11px] text-soft sm:inline">
          ⌘/Ctrl + Enter
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Textarea
            data-testid="description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
            }}
            placeholder="We sell premium dog food for senior dogs, targeting owners who care about joint health…"
            className="min-h-24 rounded-xl bg-panel2 text-[13.5px] focus-visible:bg-panel"
            maxLength={2000}
            disabled={running}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {running ? (
              <Button
                variant="outline"
                onClick={onCancel}
                data-testid="cancel"
                className="rounded-full"
              >
                <Square className="size-3.5" /> Stop
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={!value.trim()}
                data-testid="generate"
                className="rounded-full px-5"
              >
                <Sparkles className="size-4" /> Generate campaign
              </Button>
            )}
            <label className="flex items-center gap-2 text-[12px] text-soft">
              <input
                type="checkbox"
                checked={Boolean(options.force_exploratory)}
                onChange={(e) =>
                  onOptionsChange({
                    ...options,
                    force_exploratory: e.target.checked,
                  })
                }
                disabled={running}
              />
              Write personas and creatives even when no publisher fits
            </label>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">
            Sample advertisers
          </div>
          <div
            className="thin-scroll mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1"
            data-testid="examples"
          >
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                disabled={running}
                onClick={() => onChange(example.description)}
                title={example.description}
                className={cn(
                  "max-w-full truncate rounded-full border border-line bg-panel px-2.5 py-1 text-left text-[12px]",
                  "hover:border-brand-line hover:bg-brand-soft disabled:opacity-50",
                  value === example.description &&
                    "border-brand bg-brand-soft text-brand",
                )}
              >
                {example.number}. {chipLabel(example.description)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashCard>
  );
}

function chipLabel(description: string): string {
  const words = description
    .replace(/[.,;:!?]/g, "")
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
  return words.length < description.length ? `${words}…` : words;
}
