# FleetClose

**Turn truck alerts into closed work.**

FleetClose is an MVP for mid-market trucking companies (roughly 50–500 trucks). It watches maintenance/ops exceptions, decides what to do, creates work orders, notifies the right people, escalates only unsafe cases, and shows ROI.

## What problem this solves

Trucking companies already have telematics. Alerts still sit. Humans copy them into tickets. Trucks wait. Deliveries slip.

FleetClose closes that gap:

`alert → decide → work order + notify → escalate if critical → prove savings`

## Who pays

- **Buyer:** Fleet / Ops / Maintenance manager
- **Company:** regional trucking, delivery, cold-chain, construction fleets
- **Not day-1:** Amazon/UPS-scale enterprises

## How we make money

| Offer | Price | What they get |
|---|---|---|
| 30-day pilot | **$3,500** | up to 100 trucks, ROI readout |
| Ongoing | **~$12/truck/mo** (~$1,200 for 100) | continuous exception closing |

Success metric for pilot: **≥60% routine auto-resolve** and **time-to-action under 15 minutes**.

## Run locally

```bash
cd fleetclose
npm install
npm run dev
```

Open:
- Marketing + offer: [http://localhost:3000](http://localhost:3000)
- Live ops demo: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Demo controls

On `/dashboard`:
1. **Inject alert** — create a new truck exception
2. **Run agent** — auto decide / close / escalate open alerts
3. **Approve / Reject** — human queue for critical cases
4. **Simulate tick** — nudge fleet + occasional new alert
5. **Reset demo** — restore starter fleet

## What’s in this MVP (powerful v1)

- 24-truck simulated Texas fleet
- Alert catalog (overheat, ABS, reefer, oil due, etc.)
- Rule-based agent with confidence + reason (swap-in LLM later)
- Work order creation + notifications log
- Human escalation queue
- ROI metrics (auto-close rate, time-to-action, est. savings)

## What’s intentionally NOT in v1

- Real Samsara/Geotab OAuth (plug in after first pilot conversation)
- Predictive ML failure models
- Routing / load optimization
- Mobile apps

## Next build steps after first pilot interest

1. Connect one real telematics API
2. Create tickets in one real system (email/Slack/Jira/ServiceNow)
3. Replace rule engine with LangGraph agent + audit traces
4. Price from their measured downtime savings

## One-line pitch

> We help trucking companies fix problems faster so trucks don’t sit idle and teams don’t waste time chasing alerts.
