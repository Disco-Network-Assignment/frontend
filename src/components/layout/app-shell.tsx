"use client";

import { Asterisk, FolderGit2 } from "lucide-react";
import { useHealth } from "@/features/campaign/hooks/use-examples";
import { cn } from "@/lib/utils";

export const REPOS_URL = "https://github.com/AbhisekOmkar/disco-backend";

/**
 * The persistent app frame: neutral canvas, a slim header (brand, backend mode, repos), and
 * the routed page inside a bordered rounded panel. One page today; the shell stays put if
 * more are added.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col gap-2 bg-bg p-2">
      <header className="flex h-11 shrink-0 items-center gap-3 px-2">
        <span className="h-display flex items-center gap-1.5 text-lg">
          <Asterisk className="size-5" />
          disco<span className="text-violet">brain</span>
        </span>
        <span className="hidden text-[12px] text-soft sm:inline">
          describe a business → publishers, personas, creatives, campaign config
        </span>
        <span className="ml-auto flex items-center gap-2">
          <ModeBadge />
          <a
            href={REPOS_URL}
            className="grid size-8 place-items-center rounded-lg text-soft hover:bg-panel2 hover:text-foreground"
            aria-label="Repositories"
            title="Repositories"
          >
            <FolderGit2 className="size-4" />
          </a>
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
        {children}
      </div>
    </div>
  );
}

/** Whether the backend can run its agents: it needs an OpenAI key, and says so when missing. */
function ModeBadge() {
  const health = useHealth();
  const ready = health.data?.llm_configured;
  const label = health.isError ? "backend offline" : ready === true ? "agents ready" : ready === false ? "no API key" : "…";
  return (
    <span
      data-testid="mode-badge"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-0.5 text-[11px] font-medium"
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          health.isError ? "bg-fail" : ready ? "bg-violet" : "bg-amber-500",
        )}
      />
      {label}
    </span>
  );
}
