import type { Alert, Truck } from "./types";

const DEPOTS = ["Austin Hub", "Dallas Yard", "Houston South", "San Antonio"];
const ROUTES = [
  "I-35 Austin → Dallas",
  "I-10 Houston → SA",
  "US-290 Local",
  "I-45 Houston → Dallas",
  "Loop 610 Metro",
  "I-20 West Freight",
];
const DRIVERS = [
  "Maria Lopez",
  "James Nguyen",
  "Chris Patel",
  "Aisha Khan",
  "Diego Morales",
  "Sam Ortiz",
  "Priya Shah",
  "Ben Carter",
  "Elena Ruiz",
  "Omar Haddad",
  "Nina Brooks",
  "Tyrell Jackson",
];

const FAULT_CATALOG: Array<{
  code: string;
  title: string;
  detail: string;
  severity: Alert["severity"];
}> = [
  {
    code: "P0217",
    title: "Engine overheating risk",
    detail: "Coolant temp trending above threshold for 8 minutes.",
    severity: "high",
  },
  {
    code: "P0302",
    title: "Cylinder misfire detected",
    detail: "Intermittent misfire on cylinder 2 under load.",
    severity: "medium",
  },
  {
    code: "C0035",
    title: "ABS wheel speed sensor",
    detail: "Left front wheel speed signal intermittent.",
    severity: "high",
  },
  {
    code: "U0100",
    title: "ECM communication loss",
    detail: "Brief loss of communication with engine control module.",
    severity: "critical",
  },
  {
    code: "P0420",
    title: "Catalyst efficiency low",
    detail: "Bank 1 catalyst below efficiency threshold.",
    severity: "low",
  },
  {
    code: "B1342",
    title: "TPMS pressure drop",
    detail: "Trailer axle 2 pressure dropped 12 PSI in 20 minutes.",
    severity: "medium",
  },
  {
    code: "P0562",
    title: "System voltage low",
    detail: "Alternator output below 12.4V at cruise.",
    severity: "medium",
  },
  {
    code: "F-BRAKE",
    title: "Brake pad wear warning",
    detail: "Front brake wear sensor triggered.",
    severity: "high",
  },
  {
    code: "OIL-DUE",
    title: "Oil service overdue",
    detail: "Service interval exceeded by 180 miles.",
    severity: "low",
  },
  {
    code: "REEFER-ALM",
    title: "Reefer temp excursion",
    detail: "Cargo bay 4°F above setpoint for 11 minutes.",
    severity: "critical",
  },
];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildInitialTrucks(count = 24): Truck[] {
  const rand = seededRand(42);
  const trucks: Truck[] = [];

  for (let i = 1; i <= count; i++) {
    const statusRoll = rand();
    const status: Truck["status"] =
      statusRoll > 0.88
        ? "down"
        : statusRoll > 0.78
          ? "service"
          : statusRoll > 0.18
            ? "running"
            : "idle";

    trucks.push({
      id: `trk_${String(i).padStart(3, "0")}`,
      unit: `TX-${2400 + i}`,
      driver: DRIVERS[(i - 1) % DRIVERS.length],
      route: ROUTES[(i - 1) % ROUTES.length],
      status,
      lat: 29.4 + rand() * 2.2,
      lng: -98.6 + rand() * 4.2,
      speedMph: status === "running" ? Math.round(45 + rand() * 30) : 0,
      lastPing: new Date(Date.now() - Math.round(rand() * 120000)).toISOString(),
      depot: DEPOTS[(i - 1) % DEPOTS.length],
    });
  }

  return trucks;
}

export function createRandomAlert(trucks: Truck[], now = Date.now()): Alert {
  const active = trucks.filter((t) => t.status !== "service");
  const truck = active[Math.floor(Math.random() * active.length)] ?? trucks[0];
  const fault = FAULT_CATALOG[Math.floor(Math.random() * FAULT_CATALOG.length)];

  return {
    id: `alt_${now}_${Math.floor(Math.random() * 9999)}`,
    truckId: truck.id,
    unit: truck.unit,
    code: fault.code,
    title: fault.title,
    detail: fault.detail,
    severity: fault.severity,
    status: "open",
    createdAt: new Date(now).toISOString(),
  };
}

export function seedStarterAlerts(trucks: Truck[]): Alert[] {
  const starters: Alert[] = [];
  const now = Date.now();
  const picks = [0, 2, 5, 8, 11, 14];

  picks.forEach((idx, i) => {
    const truck = trucks[idx % trucks.length];
    const fault = FAULT_CATALOG[i % FAULT_CATALOG.length];
    starters.push({
      id: `alt_seed_${i + 1}`,
      truckId: truck.id,
      unit: truck.unit,
      code: fault.code,
      title: fault.title,
      detail: fault.detail,
      severity: fault.severity,
      status: "open",
      createdAt: new Date(now - (i + 1) * 7 * 60_000).toISOString(),
    });
  });

  return starters;
}

export { DEPOTS, FAULT_CATALOG };
