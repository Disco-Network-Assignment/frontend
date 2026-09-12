import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Exported to out/404.html for static hosts. */
export default function NotFound() {
  return (
    <div className="grid min-h-[60dvh] place-items-center text-center">
      <div>
        <p className="h-display text-2xl">This page does not exist.</p>
        <p className="mt-2 text-[13.5px] text-soft">The link may be out of date.</p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
