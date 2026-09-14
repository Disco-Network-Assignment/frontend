"use client";

import {
  FolderGit2,
  KeyRound,
  LayoutDashboard,
  ListTree,
  PenLine,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useHealth } from "@/features/campaign/hooks/use-examples";
import { cn } from "@/lib/utils";

export const REPOS_URL = "https://github.com/AbhisekOmkar/disco-backend";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** The page is one long dashboard; each entry scrolls to its section. */
const SECTIONS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "publishers", label: "Publishers", icon: Store },
  { id: "personas", label: "Personas", icon: Users },
  { id: "creatives", label: "Creatives", icon: PenLine },
  { id: "config", label: "Campaign config", icon: SlidersHorizontal },
  { id: "trace", label: "Trace", icon: ListTree },
];

export function Sidebar() {
  const [active, setActive] = useState("dashboard");

  const jump = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-panel lg:flex">
      <div className="flex h-14 items-center gap-2 px-5">
        <span className="grid size-7 place-items-center rounded-lg bg-brand text-white">
          <span className="size-2.5 rounded-full border-2 border-white" />
        </span>
        <span className="h-display text-[15px]">Disco</span>
        <span className="text-[11px] font-medium text-soft">
          campaign brain
        </span>
      </div>

      <nav className="thin-scroll flex-1 overflow-y-auto px-3 pt-2">
        <ul className="space-y-0.5">
          {SECTIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => jump(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium",
                  active === item.id
                    ? "bg-brand-soft text-brand"
                    : "text-ink hover:bg-panel2",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 px-3 text-[11px] font-semibold tracking-wide text-soft uppercase">
          Workspace
        </div>
        <ul className="mt-1 space-y-0.5">
          <li>
            <a
              href={REPOS_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink hover:bg-panel2"
            >
              <FolderGit2 className="size-4" />
              Repository &amp; prompts
            </a>
          </li>
        </ul>
      </nav>

      <div className="p-3">
        <AgentStatusCard />
      </div>
    </aside>
  );
}

/** Takes the "upgrade" slot of a typical dashboard: whether the backend can run its agents. */
function AgentStatusCard() {
  const health = useHealth();
  const ready = health.data?.llm_configured;
  const offline = health.isError;

  let title = "Checking backend…";
  let body = "Waiting for /health.";
  if (offline) {
    title = "Backend offline";
    body = "Start the API on port 8000 to run the agents.";
  } else if (ready === true) {
    title = "Agents ready";
    body = "Every stage runs through the OpenAI Agents SDK.";
  } else if (ready === false) {
    title = "No API key";
    body = "Add OPENAI_API_KEY to backend/.env and restart.";
  }

  return (
    <div
      data-testid="mode-badge"
      className="rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2f6bff] p-4 text-white"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-white/15">
        <KeyRound className="size-4" />
      </span>
      <div className="mt-3 text-[13.5px] font-semibold">{title}</div>
      <p className="mt-1 text-[11.5px] leading-snug text-white/80">{body}</p>
      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            offline ? "bg-red-300" : ready ? "bg-emerald-300" : "bg-amber-300",
          )}
        />
        {offline
          ? "offline"
          : ready
            ? "agents ready"
            : ready === false
              ? "no API key"
              : "…"}
      </span>
    </div>
  );
}
