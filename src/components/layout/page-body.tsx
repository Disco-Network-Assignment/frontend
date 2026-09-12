import { cn } from "@/lib/utils";

/** Scrollable content area of the panel. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className={cn("mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6", className)}>{children}</div>
    </main>
  );
}
