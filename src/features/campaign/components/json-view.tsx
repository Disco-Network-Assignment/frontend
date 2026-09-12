"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { value: unknown; filename: string };

/** Pretty JSON with copy and download; the "hand it to a downstream system" affordance. */
export function JsonView({ value, filename }: Props) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex gap-2">
        <Button variant="outline" size="xs" onClick={copy}>
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="xs" onClick={download}>
          <Download className="size-3" /> Download
        </Button>
      </div>
      <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-panel2 p-3 font-mono text-[11px] leading-relaxed">
        {text}
      </pre>
    </div>
  );
}
