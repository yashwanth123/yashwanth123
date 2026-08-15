import Link from "next/link";
import { PILOT, formatMoney } from "@/lib/copy";
import {
  ArrowRight,
  Bot,
  Clock3,
  Gauge,
  ShieldCheck,
  Truck,
  Workflow,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="grid-noise min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--amber)] text-sm font-bold text-[#1a1205]">
            FC
          </span>
          <span
            className="text-2xl font-semibold tracking-wide"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            FleetClose
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn btn-ghost !py-2">
            Open demo
          </Link>
          <a href="#pilot" className="btn btn-primary !py-2">
            Start pilot
          </a>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-16">
          <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-[420px] max-w-4xl rounded-full bg-[radial-gradient(circle,rgba(245,198,92,0.16),transparent_70%)] blur-2xl" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--amber)]">
            For trucking companies
          </p>
          <h1
            className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            FleetClose
          </h1>
          <p className="mt-5 max-w-2xl text-xl text-[var(--muted)] md:text-2xl">
            Your trucks already send alerts. We turn those alerts into closed work — so units keep
            running and your team stops chasing dashboards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn btn-primary">
              See live demo <ArrowRight size={16} />
            </Link>
            <a href="#problem" className="btn btn-ghost">
              What we solve
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <Truck size={16} className="text-[var(--amber)]" /> Mid-market fleets 50–500 trucks
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} className="text-[var(--amber)]" /> Minutes to action, not hours
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--amber)]" /> Humans only for dangerous cases
            </span>
          </div>
        </section>

        <section id="problem" className="border-y border-white/5 bg-black/20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
            <div>
              <h2
                className="text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                The problem we solve
              </h2>
              <p className="mt-4 text-lg text-[var(--muted)]">
                Telematics tells you something is wrong. It does not create the work order, notify
                the driver, book the shop, or prove ROI. Alerts sit. Trucks wait. Money leaks.
              </p>
            </div>
            <div className="panel p-6">
              <ul className="space-y-4 text-[var(--text)]">
                <li className="flex gap-3">
                  <Gauge className="mt-1 shrink-0 text-[var(--danger)]" size={18} />
                  <span>
                    <strong>Downtime:</strong> fault at 9am, action at 2pm → missed loads.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Workflow className="mt-1 shrink-0 text-[var(--amber)]" size={18} />
                  <span>
                    <strong>Busywork:</strong> ops copy alerts into tickets, Slack, and spreadsheets.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Bot className="mt-1 shrink-0 text-[var(--mint)]" size={18} />
                  <span>
                    <strong>No closer:</strong> software shows problems; nobody auto-closes them.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2
            className="text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            What you get
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            One powerful workflow: alert → decide → work order + notify → escalate only if unsafe →
            show savings.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Auto-close routine exceptions",
                body: "Oil due, medium faults, non-critical codes become scheduled work without a human babysitter.",
              },
              {
                title: "Escalate safety cases",
                body: "Brakes, ABS, ECM loss, reefer alarms go to a human queue with full context and a recommended plan.",
              },
              {
                title: "Prove money saved",
                body: "Track time-to-action, auto-resolve rate, and estimated avoided delay dollars for your pilot readout.",
              },
            ].map((item) => (
              <div key={item.title} className="panel p-5">
                <h3
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pilot" className="border-t border-white/5 bg-black/25">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <div className="panel amber-glow overflow-hidden p-6 md:p-10">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--amber)]">
                How we make money
              </p>
              <h2
                className="mt-2 text-3xl font-semibold md:text-5xl"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {PILOT.name}
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
                {PILOT.successMetric}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Pilot</p>
                  <p className="mt-2 text-3xl font-semibold">{formatMoney(PILOT.priceUsd)}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {PILOT.days} days · up to {PILOT.vehicles} trucks
                  </p>
                </div>
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    After pilot
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatMoney(PILOT.monthlyAfterUsd)}
                  </p>
                  <p className="text-sm text-[var(--muted)]">per month for ~100 trucks</p>
                </div>
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Buyer</p>
                  <p className="mt-2 text-3xl font-semibold">Ops lead</p>
                  <p className="text-sm text-[var(--muted)]">Fleet / maintenance manager</p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn btn-primary">
                  Try the ops console
                </Link>
                <a
                  className="btn btn-ghost"
                  href="mailto:yashwanthsai525@gmail.com?subject=FleetClose%2030-day%20pilot"
                >
                  Email to book a pilot
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-8 text-center text-sm text-[var(--muted)] md:px-6">
        FleetClose MVP · Built to sell a paid pilot to trucking companies · Not a telematics
        replacement — a closer on top of the alerts you already have.
      </footer>
    </div>
  );
}
