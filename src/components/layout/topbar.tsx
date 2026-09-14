"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/components/layout/search-context";
import { useHealth } from "@/features/campaign/hooks/use-examples";
import { cn } from "@/lib/utils";

/** Search (filters the publisher table), the backend status dot, and the workspace avatar. */
export function Topbar() {
  const { query, setQuery } = useSearch();
  const health = useHealth();
  const ready = health.data?.llm_configured;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4 sm:px-6">
      <label className="flex h-9 w-full max-w-md items-center gap-2 rounded-full border border-line bg-panel2 px-3 text-[12.5px] text-soft focus-within:border-brand-line focus-within:bg-panel">
        <Search className="size-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search publishers…"
          className="w-full bg-transparent text-ink outline-none placeholder:text-soft"
          aria-label="Search publishers"
        />
        <kbd className="hidden rounded-md border border-line bg-panel px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          filter
        </kbd>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium sm:inline-flex">
          <span
            className={cn(
              "size-1.5 rounded-full",
              health.isError ? "bg-fail" : ready ? "bg-pass" : "bg-amber-500",
            )}
          />
          {health.isError
            ? "backend offline"
            : ready
              ? "agents ready"
              : ready === false
                ? "no API key"
                : "…"}
        </span>
        <span
          className="grid size-8 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white"
          title="Demo workspace"
        >
          DC
        </span>
      </div>
    </header>
  );
}
