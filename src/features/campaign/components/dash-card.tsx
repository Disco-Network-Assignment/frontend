import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<"section">, "title">;

/** The one card every dashboard block uses: white, soft border, title row, content. */
export function DashCard({
  title,
  subtitle,
  action,
  className,
  children,
  ...rest
}: Props) {
  return (
    <section className={cn("dash-card p-4", className)} {...rest}>
      {(title || action) && (
        <div className="mb-3 flex items-start gap-2">
          <div className="min-w-0">
            {title && (
              <div className="text-[13.5px] font-semibold">{title}</div>
            )}
            {subtitle && (
              <div className="mt-0.5 text-[12px] text-soft">{subtitle}</div>
            )}
          </div>
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A small rounded delta/label chip, green for good, amber for caution, grey for neutral. */
export function DeltaChip({
  tone = "neutral",
  children,
}: {
  tone?: "good" | "warn" | "neutral" | "bad";
  children: React.ReactNode;
}) {
  const toneClass = {
    good: "bg-pass-soft text-pass",
    warn: "bg-warn-soft text-warn",
    bad: "bg-fail-soft text-fail",
    neutral: "bg-panel2 text-soft",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}
