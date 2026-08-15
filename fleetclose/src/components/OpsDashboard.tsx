"use client";

import type { Alert, FleetMetrics, Truck, WorkOrder, ActivityEvent } from "@/lib/types";
import { actionLabel } from "@/lib/agent";
import { formatMoney, metricCards } from "@/lib/copy";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  RefreshCw,
  Siren,
  Truck as TruckIcon,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Snapshot {
  trucks: Truck[];
  alerts: Alert[];
  workOrders: WorkOrder[];
  activity: ActivityEvent[];
  metrics: FleetMetrics;
  startedAt: string;
}

async function postAction(action: string, extra: Record<string, unknown> = {}) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  if (!res.ok) throw new Error("Action failed");
  return (await res.json()) as Snapshot;
}

export function OpsDashboard() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState<false | string>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fleet", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load fleet");
        return (await res.json()) as Snapshot;
      })
      .then((snapshot) => {
        if (!cancelled) setData(snapshot);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load fleet");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setError(null);
    try {
      const next = await postAction(action, extra);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--muted)]">
        Loading live fleet…
      </div>
    );
  }

  const cards = metricCards(data.metrics);
  const openAlerts = data.alerts.filter((a) => a.status === "open");
  const escalated = data.alerts.filter((a) => a.status === "escalated");
  const recentClosed = data.alerts.filter(
    (a) => a.status === "auto_closed" || a.status === "human_closed",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--amber)]">
            Live ops console
          </p>
          <h1
            className="mt-1 text-4xl font-semibold tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Trucks running. Exceptions closing.
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Watch alerts come in, hit <strong className="text-[var(--text)]">Run agent</strong>,
            and see FleetClose create work orders, notify people, and escalate only the dangerous
            stuff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-ghost"
            disabled={!!busy}
            onClick={() => run("inject_alert")}
          >
            <Siren size={16} /> Inject alert
          </button>
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => run("tick")}>
            <RefreshCw size={16} className={busy === "tick" ? "animate-spin" : ""} /> Simulate tick
          </button>
          <button
            className="btn btn-primary"
            disabled={!!busy}
            onClick={() => run("run_agent")}
          >
            <Bot size={16} /> {busy === "run_agent" ? "Running…" : "Run agent"}
          </button>
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => run("reset")}>
            Reset demo
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[rgba(255,107,90,0.35)] bg-[rgba(255,107,90,0.1)] px-4 py-3 text-sm text-[#ffd2cc]">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="panel amber-glow p-4"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {card.label}
            </p>
            <p
              className="mt-2 text-3xl font-semibold"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {card.value}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{card.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel p-4 xl:col-span-2">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TruckIcon size={18} className="text-[var(--amber)]" /> Fleet map list
            </h2>
            <span className="text-sm text-[var(--muted)]">
              Avg action {data.metrics.avgTimeToActionMinutes || "—"} min
            </span>
          </header>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {data.trucks.map((truck) => (
              <div
                key={truck.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div>
                  <p className="font-semibold">{truck.unit}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {truck.driver} · {truck.route}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold capitalize status-${truck.status}`}>
                    {truck.status}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {truck.speedMph} mph · {truck.depot}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <header className="mb-3 flex items-center gap-2">
            <Activity size={18} className="text-[var(--info)]" />
            <h2 className="text-lg font-semibold">Live activity</h2>
          </header>
          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            <AnimatePresence initial={false}>
              {data.activity.slice(0, 18).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-l-2 border-[rgba(245,198,92,0.35)] pl-3"
                >
                  <p className="text-sm">{event.message}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDistanceToNow(new Date(event.at), { addSuffix: true })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle size={18} className="text-[var(--amber)]" /> Open alerts
              <span className="pill severity-high">{openAlerts.length}</span>
            </h2>
          </header>
          <div className="space-y-2">
            {openAlerts.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                No open alerts. Inject one or simulate a tick.
              </p>
            )}
            {openAlerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <header className="mb-3 flex items-center gap-2">
            <Zap size={18} className="text-[var(--danger)]" />
            <h2 className="text-lg font-semibold">Human escalation queue</h2>
            <span className="pill severity-critical">{escalated.length}</span>
          </header>
          <div className="space-y-3">
            {escalated.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                Nothing escalated. Critical / safety alerts land here.
              </p>
            )}
            {escalated.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-[rgba(255,107,90,0.25)] bg-[rgba(255,107,90,0.06)] p-3"
              >
                <AlertRow alert={alert} />
                {alert.decision && (
                  <p className="mt-2 text-sm text-[var(--muted)]">{alert.decision.reason}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn btn-mint"
                    disabled={!!busy}
                    onClick={() =>
                      run("resolve", { alertId: alert.id, resolution: "approve" })
                    }
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={!!busy}
                    onClick={() =>
                      run("resolve", { alertId: alert.id, resolution: "reject" })
                    }
                  >
                    Reject plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <header className="mb-3 flex items-center gap-2">
            <Wrench size={18} className="text-[var(--mint)]" />
            <h2 className="text-lg font-semibold">Work orders</h2>
          </header>
          <div className="max-h-[320px] space-y-2 overflow-auto">
            {data.workOrders.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                Run the agent to auto-create work orders from alerts.
              </p>
            )}
            {data.workOrders.map((wo) => (
              <div
                key={wo.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {wo.unit} · {wo.title}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {wo.shop} · created by {wo.createdBy}
                    </p>
                  </div>
                  <span className={`pill severity-${wo.priority}`}>{wo.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <header className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[var(--mint)]" />
            <h2 className="text-lg font-semibold">Recently closed</h2>
          </header>
          <div className="max-h-[320px] space-y-2 overflow-auto">
            {recentClosed.slice(0, 12).map((alert) => (
              <div key={alert.id} className="rounded-xl border border-white/5 px-3 py-2.5">
                <AlertRow alert={alert} />
                {alert.decision && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {actionLabel(alert.decision.action)} · conf{" "}
                    {Math.round(alert.decision.confidence * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Demo ROI model: ~{formatMoney(280)} avoided delay per meaningful auto-close + labor
            minutes saved. Replace with your pilot customer’s real numbers.
          </p>
        </section>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold">
          {alert.unit} · {alert.title}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {alert.code} · {alert.detail}
        </p>
      </div>
      <div className="text-right">
        <span className={`pill severity-${alert.severity}`}>{alert.severity}</span>
        <p className="mt-1 text-xs capitalize text-[var(--muted)]">
          {alert.status.replaceAll("_", " ")}
        </p>
      </div>
    </div>
  );
}
