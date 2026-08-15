import { decideAlert } from "./agent";
import { buildInitialTrucks, createRandomAlert, seedStarterAlerts } from "./mock-fleet";
import type {
  ActivityEvent,
  Alert,
  FleetMetrics,
  Truck,
  WorkOrder,
} from "./types";

interface FleetStore {
  trucks: Truck[];
  alerts: Alert[];
  workOrders: WorkOrder[];
  activity: ActivityEvent[];
  actionDurationsMinutes: number[];
  startedAt: string;
}

const globalForStore = globalThis as unknown as {
  __fleetcloseStore?: FleetStore;
};

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function createStore(): FleetStore {
  const trucks = buildInitialTrucks(24);
  const alerts = seedStarterAlerts(trucks);
  return {
    trucks,
    alerts,
    workOrders: [],
    activity: [
      {
        id: uid("act"),
        at: new Date().toISOString(),
        kind: "metric",
        message: "FleetClose online — monitoring 24 trucks across 4 Texas depots.",
      },
    ],
    actionDurationsMinutes: [],
    startedAt: new Date().toISOString(),
  };
}

export function getStore(): FleetStore {
  if (!globalForStore.__fleetcloseStore) {
    globalForStore.__fleetcloseStore = createStore();
  }
  return globalForStore.__fleetcloseStore;
}

export function resetStore(): FleetStore {
  globalForStore.__fleetcloseStore = createStore();
  return globalForStore.__fleetcloseStore;
}

function pushActivity(
  store: FleetStore,
  event: Omit<ActivityEvent, "id" | "at"> & { at?: string },
) {
  store.activity.unshift({
    id: uid("act"),
    at: event.at ?? new Date().toISOString(),
    kind: event.kind,
    message: event.message,
    alertId: event.alertId,
    truckId: event.truckId,
  });
  store.activity = store.activity.slice(0, 80);
}

export function getMetrics(store = getStore()): FleetMetrics {
  const autoClosed = store.alerts.filter((a) => a.status === "auto_closed").length;
  const escalated = store.alerts.filter((a) => a.status === "escalated").length;
  const humanClosed = store.alerts.filter((a) => a.status === "human_closed").length;
  const resolved = autoClosed + humanClosed;
  const openAlerts = store.alerts.filter(
    (a) => a.status === "open" || a.status === "processing" || a.status === "escalated",
  ).length;

  const avgTimeToActionMinutes =
    store.actionDurationsMinutes.length === 0
      ? 0
      : Math.round(
          (store.actionDurationsMinutes.reduce((a, b) => a + b, 0) /
            store.actionDurationsMinutes.length) *
            10,
        ) / 10;

  const autoResolveRate =
    resolved + escalated === 0
      ? 0
      : Math.round((autoClosed / (autoClosed + escalated + humanClosed || 1)) * 100);

  // Rough ROI model for demo: each auto-closed high+ saves ~$280 avoided delay
  const savingsEvents = store.alerts.filter(
    (a) =>
      a.status === "auto_closed" &&
      (a.severity === "high" || a.severity === "medium" || a.severity === "critical"),
  ).length;

  return {
    trucksTotal: store.trucks.length,
    trucksRunning: store.trucks.filter((t) => t.status === "running").length,
    trucksDown: store.trucks.filter((t) => t.status === "down").length,
    openAlerts,
    autoClosed,
    escalated,
    avgTimeToActionMinutes,
    estimatedSavingsUsd: savingsEvents * 280 + autoClosed * 40,
    humanHoursSaved: Math.round(autoClosed * 0.45 * 10) / 10,
    autoResolveRate,
  };
}

export function processAlert(alertId: string, store = getStore()) {
  const alert = store.alerts.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  if (alert.status !== "open" && alert.status !== "escalated") {
    return { alert, workOrder: store.workOrders.find((w) => w.id === alert.workOrderId) };
  }

  alert.status = "processing";
  const truck = store.trucks.find((t) => t.id === alert.truckId);
  const decision = decideAlert(alert, truck);
  alert.decision = decision;

  const createdAtMs = new Date(alert.createdAt).getTime();
  const actionMinutes = Math.max(0.2, (Date.now() - createdAtMs) / 60000);
  store.actionDurationsMinutes.push(Math.round(actionMinutes * 10) / 10);

  pushActivity(store, {
    kind: "decision",
    alertId: alert.id,
    truckId: alert.truckId,
    message: `Agent decided: ${decision.action.replaceAll("_", " ")} for ${alert.unit} (${alert.code}) — ${decision.confidence * 100}% confidence.`,
  });

  let workOrder: WorkOrder | undefined;

  if (
    decision.action === "create_work_order" ||
    decision.action === "emergency_escalate"
  ) {
    workOrder = {
      id: uid("wo"),
      alertId: alert.id,
      truckId: alert.truckId,
      unit: alert.unit,
      title: `${alert.code}: ${alert.title}`,
      priority: alert.severity,
      shop: decision.recommendedShop ?? "Nearest depot",
      status: decision.action === "emergency_escalate" ? "scheduled" : "scheduled",
      createdAt: new Date().toISOString(),
      createdBy: "agent",
      notes: decision.reason,
    };
    store.workOrders.unshift(workOrder);
    alert.workOrderId = workOrder.id;

    pushActivity(store, {
      kind: "work_order",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Work order ${workOrder.id} created at ${workOrder.shop} for ${alert.unit}.`,
    });

    pushActivity(store, {
      kind: "notify",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Notified: ${decision.notify.join(", ")}`,
    });
  }

  if (decision.action === "emergency_escalate") {
    alert.status = "escalated";
    if (truck && truck.status === "running") truck.status = "idle";
    pushActivity(store, {
      kind: "escalate",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Escalated ${alert.unit} to human queue — ${decision.riskIfIgnored}`,
    });
  } else if (decision.action === "create_work_order") {
    alert.status = "auto_closed";
    alert.resolvedAt = new Date().toISOString();
    if (truck && alert.severity === "high") truck.status = "service";
    pushActivity(store, {
      kind: "alert",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Auto-closed ${alert.unit} alert ${alert.code}. Routine exception handled without human.`,
    });
  } else if (decision.action === "watch") {
    alert.status = "auto_closed";
    alert.resolvedAt = new Date().toISOString();
    pushActivity(store, {
      kind: "alert",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Marked ${alert.unit} / ${alert.code} as watch — no work order needed yet.`,
    });
  } else {
    alert.status = "auto_closed";
    alert.resolvedAt = new Date().toISOString();
  }

  return { alert, workOrder };
}

export function processOpenAlerts(limit = 10, store = getStore()) {
  const open = store.alerts
    .filter((a) => a.status === "open")
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .slice(0, limit);

  return open.map((a) => processAlert(a.id, store));
}

export function resolveEscalation(
  alertId: string,
  resolution: "approve" | "reject",
  store = getStore(),
) {
  const alert = store.alerts.find((a) => a.id === alertId);
  if (!alert || alert.status !== "escalated") {
    throw new Error("Escalated alert not found");
  }

  const truck = store.trucks.find((t) => t.id === alert.truckId);
  const wo = store.workOrders.find((w) => w.id === alert.workOrderId);

  if (resolution === "approve") {
    alert.status = "human_closed";
    alert.resolvedAt = new Date().toISOString();
    if (wo) wo.status = "in_progress";
    if (truck) truck.status = "service";
    pushActivity(store, {
      kind: "escalate",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Human approved escalation for ${alert.unit}. Service in progress.`,
    });
  } else {
    alert.status = "human_closed";
    alert.resolvedAt = new Date().toISOString();
    if (wo) wo.status = "cancelled";
    pushActivity(store, {
      kind: "escalate",
      alertId: alert.id,
      truckId: alert.truckId,
      message: `Human rejected auto plan for ${alert.unit}. Alert closed manually.`,
    });
  }

  return alert;
}

export function injectDemoAlert(store = getStore()) {
  const alert = createRandomAlert(store.trucks);
  store.alerts.unshift(alert);
  pushActivity(store, {
    kind: "alert",
    alertId: alert.id,
    truckId: alert.truckId,
    message: `New alert: ${alert.unit} — ${alert.title} (${alert.severity})`,
  });
  return alert;
}

export function tickFleet(store = getStore()) {
  // Soft simulation: nudge speeds / pings
  for (const truck of store.trucks) {
    truck.lastPing = new Date().toISOString();
    if (truck.status === "running") {
      truck.speedMph = Math.max(
        35,
        Math.min(75, truck.speedMph + Math.round((Math.random() - 0.5) * 6)),
      );
      truck.lat += (Math.random() - 0.5) * 0.01;
      truck.lng += (Math.random() - 0.5) * 0.01;
    }
  }

  // Occasionally inject a new alert (~35% chance per tick call)
  if (Math.random() < 0.35) {
    injectDemoAlert(store);
  }

  return getSnapshot(store);
}

export function getSnapshot(store = getStore()) {
  return {
    trucks: store.trucks,
    alerts: store.alerts,
    workOrders: store.workOrders,
    activity: store.activity,
    metrics: getMetrics(store),
    startedAt: store.startedAt,
  };
}
