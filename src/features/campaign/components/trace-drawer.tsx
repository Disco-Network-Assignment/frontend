"use client";

import { JsonView } from "@/features/campaign/components/json-view";
import type { CampaignPlan } from "@/types/api";

/** Per-stage timings, models, prompt versions and tokens, then the raw plan: the audit trail. */
export function TraceDrawer({ plan }: { plan: CampaignPlan }) {
  const tokens = plan.trace.reduce(
    (acc, m) => ({
      input: acc.input + (m.input_tokens ?? 0),
      output: acc.output + (m.output_tokens ?? 0),
    }),
    { input: 0, output: 0 },
  );
  return (
    <details className="dash-card" data-testid="trace" id="trace">
      <summary className="cursor-pointer px-4 py-3 text-[13.5px] font-medium">
        Trace · run {plan.run_id} · {plan.trace.length} stage calls
        {tokens.input > 0 &&
          ` · ${tokens.input} in / ${tokens.output} out tokens`}
      </summary>
      <div className="px-4 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-left text-[11px] tracking-wide text-soft uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Stage</th>
                <th className="py-1 pr-3 font-medium">Agent</th>
                <th className="py-1 pr-3 font-medium">ms</th>
                <th className="py-1 pr-3 font-medium">Model · effort</th>
                <th className="py-1 pr-3 font-medium">Prompt</th>
                <th className="py-1 pr-3 font-medium">Tokens</th>
                <th className="py-1 pr-3 font-medium">Tools · handoffs</th>
                <th className="py-1 pr-3 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {plan.trace.map((m, i) => (
                <tr key={`${m.stage}-${i}`} className="border-t border-line">
                  <td className="py-1 pr-3">{m.stage}</td>
                  <td className="py-1 pr-3">{m.agent ?? "code"}</td>
                  <td className="py-1 pr-3">{m.ms}</td>
                  <td className="py-1 pr-3">
                    {m.model ?? "—"}
                    {m.reasoning_effort ? ` · ${m.reasoning_effort}` : ""}
                  </td>
                  <td className="py-1 pr-3">
                    {m.prompt_version ? `v${m.prompt_version}` : "—"}
                  </td>
                  <td className="py-1 pr-3">
                    {m.input_tokens != null
                      ? `${m.input_tokens}/${m.output_tokens}`
                      : "—"}
                  </td>
                  <td className="py-1 pr-3">
                    {m.tool_calls || m.handoffs
                      ? `${m.tool_calls} · ${m.handoffs}`
                      : "—"}
                  </td>
                  <td className="py-1 pr-3">{m.retried ? "retried" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <JsonView
            value={plan}
            filename={`campaign-plan-${plan.run_id}.json`}
          />
        </div>
      </div>
    </details>
  );
}
