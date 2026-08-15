import type { AgentDecision, Alert, Truck } from "./types";
import { DEPOTS } from "./mock-fleet";

const SAFETY_CODES = new Set(["C0035", "F-BRAKE", "U0100", "REEFER-ALM"]);

export function decideAlert(alert: Alert, truck?: Truck): AgentDecision {
  const depot = truck?.depot ?? DEPOTS[0];
  const notify = [
    truck?.driver ? `driver:${truck.driver}` : "driver:unknown",
    `ops:${depot}`,
  ];

  // Safety-critical: always escalate with recommended work order path
  if (alert.severity === "critical" || SAFETY_CODES.has(alert.code)) {
    return {
      action: "emergency_escalate",
      confidence: 0.93,
      reason: `${alert.code} is safety/cargo critical. Human confirmation required before roadside action.`,
      recommendedShop: depot,
      notify: [...notify, "supervisor:on-call"],
      estimatedDowntimeHours: alert.code === "REEFER-ALM" ? 2 : 4,
      riskIfIgnored: "Safety incident, cargo loss, or roadside failure likely.",
    };
  }

  if (alert.severity === "low") {
    return {
      action: alert.code === "OIL-DUE" ? "create_work_order" : "watch",
      confidence: 0.86,
      reason:
        alert.code === "OIL-DUE"
          ? "Routine service overdue — schedule at next depot window."
          : "Low severity. Monitor for recurrence over next 50 miles.",
      recommendedShop: depot,
      notify: alert.code === "OIL-DUE" ? notify : [`ops:${depot}`],
      estimatedDowntimeHours: alert.code === "OIL-DUE" ? 1.5 : 0.2,
      riskIfIgnored:
        alert.code === "OIL-DUE"
          ? "Warranty risk and accelerated engine wear."
          : "May escalate if ignored across multiple trips.",
    };
  }

  if (alert.severity === "medium") {
    return {
      action: "create_work_order",
      confidence: 0.88,
      reason: `${alert.title} can be handled at ${depot} without taking the truck out of service immediately.`,
      recommendedShop: depot,
      notify,
      estimatedDowntimeHours: 2,
      riskIfIgnored: "Likely roadside delay within 1–3 days.",
    };
  }

  // high
  return {
    action: "create_work_order",
    confidence: 0.91,
    reason: `High severity ${alert.code}. Auto-schedule service at ${depot} and notify driver + ops.`,
    recommendedShop: depot,
    notify,
    estimatedDowntimeHours: 3,
    riskIfIgnored: "Unplanned downtime and missed delivery windows.",
  };
}

export function actionLabel(action: AgentDecision["action"]): string {
  switch (action) {
    case "ignore":
      return "Ignore / noise";
    case "watch":
      return "Watch closely";
    case "create_work_order":
      return "Create work order";
    case "emergency_escalate":
      return "Escalate to human";
  }
}
