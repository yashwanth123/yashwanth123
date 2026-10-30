export type TruckStatus = "running" | "idle" | "down" | "service";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus =
  | "open"
  | "processing"
  | "auto_closed"
  | "escalated"
  | "human_closed";
export type DecisionAction =
  | "ignore"
  | "watch"
  | "create_work_order"
  | "emergency_escalate";

export interface Truck {
  id: string;
  unit: string;
  driver: string;
  route: string;
  status: TruckStatus;
  lat: number;
  lng: number;
  speedMph: number;
  lastPing: string;
  depot: string;
}

export interface Alert {
  id: string;
  truckId: string;
  unit: string;
  code: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  decision?: AgentDecision;
  workOrderId?: string;
}

export interface AgentDecision {
  action: DecisionAction;
  confidence: number;
  reason: string;
  recommendedShop?: string;
  notify: string[];
  estimatedDowntimeHours: number;
  riskIfIgnored: string;
}

export interface WorkOrder {
  id: string;
  alertId: string;
  truckId: string;
  unit: string;
  title: string;
  priority: AlertSeverity;
  shop: string;
  status: "scheduled" | "in_progress" | "done" | "cancelled";
  createdAt: string;
  createdBy: "agent" | "human";
  notes: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  kind: "alert" | "decision" | "work_order" | "notify" | "escalate" | "metric";
  message: string;
  alertId?: string;
  truckId?: string;
}

export interface FleetMetrics {
  trucksTotal: number;
  trucksRunning: number;
  trucksDown: number;
  openAlerts: number;
  autoClosed: number;
  escalated: number;
  avgTimeToActionMinutes: number;
  estimatedSavingsUsd: number;
  humanHoursSaved: number;
  autoResolveRate: number;
}

export interface PilotOffer {
  name: string;
  vehicles: number;
  days: number;
  priceUsd: number;
  monthlyAfterUsd: number;
  successMetric: string;
}
