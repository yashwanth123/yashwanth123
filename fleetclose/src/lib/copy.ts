import type { FleetMetrics } from "@/lib/types";

export const PILOT = {
  name: "30-Day FleetClose Pilot",
  vehicles: 100,
  days: 30,
  priceUsd: 3500,
  monthlyAfterUsd: 1200,
  successMetric:
    "Auto-resolve ≥60% routine exceptions and cut median time-to-action under 15 minutes.",
};

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function metricCards(metrics: FleetMetrics) {
  return [
    {
      label: "Trucks running",
      value: `${metrics.trucksRunning}/${metrics.trucksTotal}`,
      hint: `${metrics.trucksDown} down`,
    },
    {
      label: "Open exceptions",
      value: String(metrics.openAlerts),
      hint: "Needs attention",
    },
    {
      label: "Auto-closed",
      value: String(metrics.autoClosed),
      hint: `${metrics.autoResolveRate}% resolve rate`,
    },
    {
      label: "Est. savings",
      value: formatMoney(metrics.estimatedSavingsUsd),
      hint: `${metrics.humanHoursSaved}h saved`,
    },
  ];
}
