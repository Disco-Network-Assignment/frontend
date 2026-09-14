"use client";

import { History, RotateCcw } from "lucide-react";
import { useState } from "react";
import { DashCard, DeltaChip } from "@/features/campaign/components/dash-card";
import { useRuns } from "@/features/campaign/hooks/use-runs";
import { campaignApi } from "@/lib/api/campaign";
import { cn } from "@/lib/utils";
import type { RunRecord, RunSummary } from "@/types/api";

const usd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const STATUS: Record<
  RunSummary["status"],
  { label: string; tone: "good" | "warn" | "bad" }
> = {
  done: { label: "done", tone: "good" },
  stopped: { label: "needs input", tone: "warn" },
  failed: { label: "failed", tone: "bad" },
};

type Props = {
  currentRunId?: string;
  onLoad: (record: RunRecord) => void;
};

/** Every run the backend has kept, newest first. Clicking a row reloads it into the dashboard. */
export function RunHistory({ currentRunId, onLoad }: Props) {
  const runs = useRuns();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (run: RunSummary) => {
    setLoadingId(run.run_id);
    setLoadError(null);
    try {
      onLoad(await campaignApi.run(run.run_id));
      document
        .getElementById("dashboard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DashCard
      id="history"
      data-testid="history"
      title="Recent runs"
      subtitle="every run is stored in Postgres; click one to bring it back"
      action={
        <button
          type="button"
          onClick={() => runs.refetch()}
          title="Refresh"
          className="grid size-7 place-items-center rounded-lg border border-line text-soft hover:bg-panel2"
        >
          <RotateCcw
            className={cn("size-3.5", runs.isFetching && "animate-spin")}
          />
        </button>
      }
    >
      {runs.isError && (
        <p className="text-[12.5px] text-soft">
          History is unavailable: the backend could not reach its database.
        </p>
      )}
      {loadError && (
        <p className="mb-2 text-[12px] text-fail">
          Could not load that run: {loadError}
        </p>
      )}
      {runs.data && runs.data.length === 0 && (
        <p className="flex items-center gap-2 py-4 text-[12.5px] text-soft">
          <History className="size-4" /> No runs stored yet. The first one you
          generate lands here.
        </p>
      )}
      {runs.data && runs.data.length > 0 && (
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead className="text-left text-[11px] tracking-wide text-soft uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Advertiser</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Input</th>
                <th className="py-2 pr-3 font-medium">Publishers</th>
                <th className="py-2 pr-3 font-medium">Personas</th>
                <th className="py-2 pr-3 font-medium">Creatives</th>
                <th className="py-2 font-medium">Budget</th>
              </tr>
            </thead>
            <tbody>
              {runs.data.map((run) => {
                const status = STATUS[run.status];
                const current = run.run_id === currentRunId;
                return (
                  <tr
                    key={run.run_id}
                    data-testid="history-row"
                    onClick={() => load(run)}
                    className={cn(
                      "cursor-pointer border-t border-line align-middle hover:bg-panel2/60",
                      current && "bg-brand-soft/60",
                      loadingId === run.run_id && "opacity-60",
                    )}
                  >
                    <td className="py-2.5 pr-3 font-mono text-[11px] whitespace-nowrap text-soft">
                      {when(run.created_at)}
                    </td>
                    <td className="max-w-[360px] py-2.5 pr-3">
                      <span
                        className="line-clamp-1 font-medium"
                        title={run.description}
                      >
                        {run.description}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <DeltaChip tone={status.tone}>{status.label}</DeltaChip>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[11px]">
                      {run.input_quality ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">
                      {run.status === "done" ? run.recommended : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">
                      {run.status === "done" ? run.personas : "—"}
                    </td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">
                      {run.status === "done" ? run.creatives : "—"}
                    </td>
                    <td className="py-2.5 font-mono tabular-nums">
                      {run.status === "done" ? usd(run.budget_usd) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  );
}

/** "14:02" today, otherwise "12 Sep 14:02". */
function when(iso: string): string {
  const date = new Date(iso);
  const today = new Date().toDateString() === date.toDateString();
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (today) return time;
  return `${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })} ${time}`;
}
