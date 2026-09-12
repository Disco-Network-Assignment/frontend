import { cn } from "@/lib/utils";

/** A 0-100 score as a thin bar with the number beside it. */
export function ScoreBar({ value, className }: { value: number; className?: string }) {
  const tone = value >= 70 ? "bg-pass" : value >= 50 ? "bg-amber-500" : "bg-line";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-panel2">
        <span className={cn("block h-full rounded-full", tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </span>
      <span className="font-mono text-[11px] tabular-nums">{Math.round(value)}</span>
    </span>
  );
}
