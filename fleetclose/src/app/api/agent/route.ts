import {
  getSnapshot,
  injectDemoAlert,
  processOpenAlerts,
  resetStore,
  resolveEscalation,
  tickFleet,
} from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: string;
    alertId?: string;
    resolution?: "approve" | "reject";
    limit?: number;
  };

  switch (body.action) {
    case "run_agent":
      processOpenAlerts(body.limit ?? 10);
      break;
    case "inject_alert":
      injectDemoAlert();
      break;
    case "tick":
      tickFleet();
      break;
    case "resolve":
      if (!body.alertId || !body.resolution) {
        return NextResponse.json({ error: "Missing alertId/resolution" }, { status: 400 });
      }
      resolveEscalation(body.alertId, body.resolution);
      break;
    case "reset":
      resetStore();
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json(getSnapshot());
}
