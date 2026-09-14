"use client";

/** Small inline SVG charts. No chart library: three shapes, each a few lines, fully styled
 *  by the palette. */

import { cn } from "@/lib/utils";
import type { PublisherAllocation, PublisherAssessment } from "@/types/api";

/** Every publisher's score as a column, recommended ones in the brand colour. */
export function ScoreColumns({
  publishers,
}: {
  publishers: PublisherAssessment[];
}) {
  const height = 120;
  const columnWidth = 100 / Math.max(publishers.length, 1);
  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label="Publisher scores"
      >
        {[25, 50, 75].map((line) => (
          <line
            key={line}
            x1="0"
            x2="100"
            y1={height - (line / 100) * height}
            y2={height - (line / 100) * height}
            stroke="var(--color-line)"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {publishers.map((p, i) => {
          const barHeight = (Math.max(p.score, 2) / 100) * height;
          const fill =
            p.verdict === "recommend"
              ? "var(--color-brand)"
              : p.verdict === "consider"
                ? "var(--color-brand-line)"
                : "var(--color-line)";
          return (
            <rect
              key={p.publisher_id}
              x={i * columnWidth + columnWidth * 0.2}
              y={height - barHeight}
              width={columnWidth * 0.6}
              height={barHeight}
              rx="1"
              fill={fill}
            >
              <title>{`#${p.rank} ${p.publisher_name}: ${Math.round(p.score)}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-soft">
        <span>#1 best fit</span>
        <span>score 0–100</span>
        <span>#{publishers.length}</span>
      </div>
    </div>
  );
}

/** Budget share per publisher as vertical bars with the share printed above the tallest. */
export function AllocationBars({
  allocation,
}: {
  allocation: PublisherAllocation[];
}) {
  if (allocation.length === 0) {
    return (
      <p className="py-8 text-center text-[12.5px] text-soft">
        No budget allocated.
      </p>
    );
  }
  const max = Math.max(...allocation.map((a) => a.share_pct));
  return (
    <div className="flex h-40 items-end gap-2">
      {allocation.map((a) => {
        const tallest = a.share_pct === max;
        return (
          <div
            key={a.publisher_id}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums",
                tallest ? "text-brand" : "text-soft",
              )}
            >
              {a.share_pct}%
            </span>
            <div className="flex h-24 w-full items-end rounded-md bg-panel2">
              <div
                className={cn(
                  "w-full rounded-md",
                  tallest ? "bg-brand" : "bg-brand-line",
                )}
                style={{ height: `${(a.share_pct / max) * 100}%` }}
                title={`${a.publisher_name}: ${a.share_pct}% · $${a.budget_usd}`}
              />
            </div>
            <span
              className="w-full truncate text-center text-[10.5px] text-soft"
              title={a.publisher_name}
            >
              {shortName(a.publisher_name)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** A half-ring gauge for a 0–1 value, drawn as tick marks that fill in the brand colour. */
export function Gauge({
  value,
  label,
  caption,
}: {
  value: number;
  label: string;
  caption: string;
}) {
  const ticks = 32;
  const filled = Math.round(Math.max(0, Math.min(1, value)) * ticks);
  const radius = 44;
  const center = 55;
  const marks = Array.from({ length: ticks }, (_, i) => {
    const angle = Math.PI + (i / (ticks - 1)) * Math.PI; // left to right over the top
    const inner = radius - 8;
    const x1 = center + inner * Math.cos(angle);
    const y1 = center + inner * Math.sin(angle);
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    return { x1, y1, x2, y2, on: i < filled };
  });
  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 110 62"
        className="w-44"
        role="img"
        aria-label={`${label} ${Math.round(value * 100)}%`}
      >
        {marks.map((m, i) => (
          <line
            key={i}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke={m.on ? "var(--color-brand)" : "var(--color-line)"}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ))}
        <text
          x={center}
          y="54"
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          {label}
        </text>
      </svg>
      <div className="-mt-1 text-[11.5px] text-soft">{caption}</div>
    </div>
  );
}

function shortName(name: string): string {
  return name.length > 9 ? `${name.slice(0, 8)}…` : name;
}
