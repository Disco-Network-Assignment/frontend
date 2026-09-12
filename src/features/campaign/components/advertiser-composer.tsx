"use client";

import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="text-[15px] font-semibold">Describe the business</div>
        <p className="mt-1 text-[12px] text-soft">
          A sentence or two, the way an advertiser would type it. Vague or off-topic input is
          handled honestly.
        </p>

        <Textarea
          data-testid="description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
          }}
          placeholder="We sell premium dog food for senior dogs, targeting owners who care about joint health…"
          className="mt-3 min-h-28 text-[13.5px]"
          maxLength={2000}
          disabled={running}
        />

        <div className="mt-3 flex items-center gap-2">
          {running ? (
            <Button variant="outline" onClick={onCancel} data-testid="cancel">
              <Square className="size-3.5" /> Stop
            </Button>
          ) : (
            <Button onClick={onSubmit} disabled={!value.trim()} data-testid="generate">
              <Sparkles className="size-4" /> Generate campaign
            </Button>
          )}
          <span className="text-[11px] text-soft">⌘/Ctrl + Enter</span>
        </div>

        <label className="mt-3 flex items-center gap-2 text-[12px] text-soft">
          <input
            type="checkbox"
            checked={Boolean(options.force_exploratory)}
            onChange={(e) => onOptionsChange({ ...options, force_exploratory: e.target.checked })}
            disabled={running}
          />
          Write personas and creatives even when no publisher fits (exploratory)
        </label>

        <div className="mt-4 text-[11px] font-semibold tracking-wide text-soft uppercase">
          Sample advertisers
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5" data-testid="examples">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              disabled={running}
              onClick={() => onChange(example.description)}
              title={example.description}
              className={cn(
                "max-w-full truncate rounded-full border border-line bg-panel px-2.5 py-1 text-left text-[12px]",
                "hover:border-lilac-line hover:bg-lilac disabled:opacity-50",
                value === example.description && "border-violet bg-lilac",
              )}
            >
              {example.number}. {chipLabel(example.description)}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function chipLabel(description: string): string {
  const words = description.replace(/[.,;:!?]/g, "").split(/\s+/).slice(0, 5).join(" ");
  return words.length < description.length ? `${words}…` : words;
}
