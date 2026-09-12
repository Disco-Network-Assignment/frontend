"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonView } from "@/features/campaign/components/json-view";
import { PanelSkeleton } from "@/features/campaign/components/publisher-panel";
import type { CampaignConfig, CampaignSummary } from "@/types/api";

type Props = { config?: CampaignConfig; summary: CampaignSummary | null };

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const compact = (n: number) => Intl.NumberFormat(undefined, { notation: "compact" }).format(n);

/** The draft campaign config: the numbers a marketer reviews, then the JSON a system ingests. */
export function ConfigPanel({ config, summary }: Props) {
  if (!config) return <PanelSkeleton title="Campaign config" rows={2} />;
  const notRecommended = config.status === "not_recommended";

  return (
    <Card className="gap-0 py-4" data-testid="config">
      <CardContent className="px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[15px] font-semibold">Campaign config</div>
          <Badge variant={notRecommended ? "destructive" : "default"} className="font-mono">
            {config.status.replaceAll("_", " ")}
          </Badge>
          <Badge variant="outline">{config.objective.replaceAll("_", " ")}</Badge>
          <span className="ml-auto font-mono text-[11px] text-soft">confidence {config.confidence.toFixed(2)}</span>
        </div>

        {summary && (
          <div className="mt-3 rounded-lg bg-panel2 px-3 py-2 text-[13.5px]" data-testid="summary">
            <p>{summary.strategy_summary}</p>
            {summary.risks.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12px] text-soft">
                {summary.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Tabs defaultValue="plan" className="mt-3">
          <TabsList>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            {config.publisher_allocation.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="mt-1 w-full text-[12px]">
                  <thead className="text-left text-[11px] tracking-wide text-soft uppercase">
                    <tr>
                      <th className="py-1 pr-3 font-medium">Publisher</th>
                      <th className="py-1 pr-3 font-medium">Share</th>
                      <th className="py-1 pr-3 font-medium">Budget</th>
                      <th className="py-1 pr-3 font-medium">CPM band</th>
                      <th className="py-1 pr-3 font-medium">Est. impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.publisher_allocation.map((a) => (
                      <tr key={a.publisher_id} className="border-t border-line align-top">
                        <td className="py-1.5 pr-3">
                          <div className="font-medium">{a.publisher_name}</div>
                          <div className="text-[11px] text-soft">{a.rationale}</div>
                        </td>
                        <td className="py-1.5 pr-3 font-mono">{a.share_pct}%</td>
                        <td className="py-1.5 pr-3 font-mono">{usd(a.budget_usd)}</td>
                        <td className="py-1.5 pr-3 font-mono">
                          ${a.suggested_cpm_range_usd[0]}–{a.suggested_cpm_range_usd[1]}
                        </td>
                        <td className="py-1.5 pr-3 font-mono">{compact(a.est_impressions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-1 text-[13.5px] text-soft">No budget allocated: nothing was recommended.</p>
            )}

            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-2">
              <Row label="Bid strategy">
                {config.bid_strategy.model} · start CPM {usd(config.bid_strategy.starting_cpm_usd)}
                {config.bid_strategy.target_cpa_usd !== null && ` · target CPA ${usd(config.bid_strategy.target_cpa_usd)}`}
                {config.bid_strategy.max_cpc_usd !== null && ` · max CPC $${config.bid_strategy.max_cpc_usd}`}
                <div className="text-soft">{config.bid_strategy.rationale}</div>
              </Row>
              <Row label="Budget">
                {usd(config.budget.total_usd)} over {config.budget.flight_days} days · {usd(config.budget.daily_cap_usd)}/day · pacing {config.budget.pacing}
              </Row>
              <Row label="KPIs">
                primary {config.kpis.primary}
                {config.kpis.secondary.length > 0 && ` · secondary ${config.kpis.secondary.join(", ")}`}
                <div className="font-mono text-soft">
                  {Object.entries(config.kpis.targets).map(([k, v]) => `${k}=${v}`).join("  ")}
                </div>
              </Row>
              <Row label="Forecast">
                {compact(config.forecast.impressions)} impressions · {compact(config.forecast.clicks)} clicks ·{" "}
                {config.forecast.conversions} conversions
                {config.forecast.cpa_usd !== null && ` · CPA ${usd(config.forecast.cpa_usd)}`}
              </Row>
              <Row label="Hygiene">
                frequency cap {config.frequency_cap.impressions}/{config.frequency_cap.per_days}d · rotation{" "}
                {config.creative_rotation.mode.replaceAll("_", " ")} after {compact(config.creative_rotation.optimize_after_impressions)}
              </Row>
            </dl>
          </TabsContent>

          <TabsContent value="targeting">
            <dl className="mt-1 grid gap-y-1.5 text-[12px]">
              <Row label="Demographics">
                {config.targeting.demographics.age_range ?? "any age"} · {config.targeting.demographics.gender_skew} ·{" "}
                {config.targeting.demographics.income_tiers.join(", ") || "any income"}
              </Row>
              <Row label="Interests">{config.targeting.interests.join(", ") || "—"}</Row>
              <Row label="Contextual">{config.targeting.contextual.join(", ") || "—"}</Row>
              <Row label="Geo">{config.targeting.geo.join(", ") || "—"}</Row>
              <Row label="Personas">{config.targeting.persona_ids.join(", ") || "—"}</Row>
              <Row label="Exclusions">{config.targeting.exclusions.join(" · ") || "—"}</Row>
            </dl>
          </TabsContent>

          <TabsContent value="assumptions">
            <div className="mt-1 grid gap-3 md:grid-cols-2 text-[12px]">
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">Assumptions</div>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {config.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-soft uppercase">Open questions</div>
                {config.open_questions.length ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {config.open_questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-soft">None.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="mt-1">
              <JsonView value={config} filename="campaign-config.json" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-wide text-soft uppercase">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
