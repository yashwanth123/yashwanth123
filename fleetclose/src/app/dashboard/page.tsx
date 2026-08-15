import Link from "next/link";
import { OpsDashboard } from "@/components/OpsDashboard";

export default function DashboardPage() {
  return (
    <div className="grid-noise min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0e12]/0.8] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--amber)] text-sm font-bold text-[#1a1205]">
              FC
            </span>
            <span
              className="text-xl font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              FleetClose
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/#pilot" className="text-[var(--muted)] hover:text-[var(--text)]">
              Pilot offer
            </Link>
            <Link href="/" className="btn btn-ghost !py-2 !px-3">
              Marketing site
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <OpsDashboard />
      </main>
    </div>
  );
}
