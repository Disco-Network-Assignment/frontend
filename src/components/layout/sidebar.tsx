"use client";

import {
  FolderGit2,
  KeyRound,
  LayoutDashboard,
  PanelLeftClose,
  PenLine,
  SlidersHorizontal,
  Store,
  Users,
  X,
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

/** The page is one long dashboard; each entry scrolls to its section once it exists. */
const SECTIONS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "publishers", label: "Publishers", icon: Store },
  { id: "personas", label: "Personas", icon: Users },
  { id: "creatives", label: "Creatives", icon: PenLine },
  { id: "config", label: "Campaign config", icon: SlidersHorizontal },
];

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  drawerOpen,
  onCloseDrawer,
}: Props) {
  const [active, setActive] = useState("dashboard");

  const jump = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onCloseDrawer();
  };

  return (
    <>
      {/* backdrop for the small-screen drawer */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseDrawer}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
        />
      )}

      <aside
        data-collapsed={collapsed}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-line bg-panel transition-[width,transform] duration-200",
          "lg:static lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-[68px]",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center gap-2",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand text-white">
            <span className="size-2.5 rounded-full border-2 border-white" />
          </span>
          {!collapsed && (
            <>
              <span className="h-display text-[15px]">Disco</span>
              <span className="text-[11px] font-medium text-soft">
                campaign brain
              </span>
            </>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="ml-auto hidden size-8 place-items-center rounded-lg text-soft hover:bg-panel2 hover:text-ink lg:grid"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Close menu"
            className="ml-auto grid size-8 place-items-center rounded-lg text-soft hover:bg-panel2 lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="thin-scroll flex-1 overflow-y-auto px-3 pt-2">
          <ul className="space-y-0.5">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => jump(item.id)}
                  title={item.label}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg py-2 text-left text-[13px] font-medium",
                    collapsed ? "justify-center px-0" : "px-3",
                    active === item.id
                      ? "bg-brand-soft text-brand"
                      : "text-ink hover:bg-panel2",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && item.label}
                </button>
              </li>
            ))}
          </ul>

          {!collapsed && (
            <div className="mt-6 px-3 text-[11px] font-semibold tracking-wide text-soft uppercase">
              Workspace
            </div>
          )}
          <ul className={cn("space-y-0.5", collapsed ? "mt-4" : "mt-1")}>
            <li>
              <a
                href={REPOS_URL}
                target="_blank"
                rel="noreferrer"
                title="Repository & prompts"
                className={cn(
                  "flex items-center gap-2.5 rounded-lg py-2 text-[13px] font-medium text-ink hover:bg-panel2",
                  collapsed ? "justify-center px-0" : "px-3",
                )}
              >
                <FolderGit2 className="size-4 shrink-0" />
                {!collapsed && <>Repository &amp; prompts</>}
              </a>
            </li>
          </ul>
        </nav>

        <div className={cn("p-3", collapsed && "px-2")}>
          <AgentStatusCard collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

/** Takes the "upgrade" slot of a typical dashboard: whether the backend can run its agents. */
function AgentStatusCard({ collapsed }: { collapsed: boolean }) {
  const health = useHealth();
  const ready = health.data?.llm_configured;
  const offline = health.isError;

  let title = "Checking backend…";
  let body = "Waiting for /health.";
  let label = "…";
  if (offline) {
    title = "Backend offline";
    body = "Start the API on port 8000 to run the agents.";
    label = "offline";
  } else if (ready === true) {
    title = "Agents ready";
    body = "Every stage runs through the OpenAI Agents SDK.";
    label = "agents ready";
  } else if (ready === false) {
    title = "No API key";
    body = "Add OPENAI_API_KEY to backend/.env and restart.";
    label = "no API key";
  }
  const dot = offline
    ? "bg-red-300"
    : ready
      ? "bg-emerald-300"
      : "bg-amber-300";

  if (collapsed) {
    return (
      <div
        data-testid="mode-badge"
        title={`${title}: ${body}`}
        className="grid h-12 place-items-center rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#2f6bff] text-white"
      >
        <span className="relative">
          <KeyRound className="size-4" />
          <span
            className={cn(
              "absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-[#2a55d6]",
              dot,
            )}
          />
        </span>
        <span className="sr-only">{label}</span>
      </div>
    );
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
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
        <span className={cn("size-1.5 rounded-full", dot)} />
        {label}
      </span>
    </div>
  );
}
