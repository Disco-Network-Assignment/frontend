"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StopResult } from "@/types/api";

type Props = { stopped: StopResult; onPickExample: (description: string) => void };

/** Input too thin to plan anything: say why, ask, and offer the samples. Nothing is invented. */
export function StoppedView({ stopped, onPickExample }: Props) {
  return (
    <Card className="gap-0 py-4" data-testid="stopped">
      <CardContent className="px-4">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <MessageCircleQuestion className="size-4 text-warn" /> Tell us a little more
        </div>
        <p className="mt-1 text-[13.5px]">{stopped.reason}</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[13.5px]">
          {stopped.clarifying_questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <div className="mt-4 text-[11px] font-semibold tracking-wide text-soft uppercase">
          Or try one of these
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {stopped.examples.slice(0, 6).map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onPickExample(example)}
              className="max-w-full truncate rounded-full border border-line bg-panel px-2.5 py-1 text-[12px] hover:bg-lilac"
              title={example}
            >
              {example.slice(0, 48)}…
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
