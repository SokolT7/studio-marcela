# Studio Marcela

Rebuild of [studiomarcela.hr](https://studiomarcela.hr) — a chain of seven hair salons, five
in Zagreb and two inside Dubrovnik hotels.

Three deliverables: a marketing site that ranks per neighbourhood, a booking engine that
confirms appointments instantly, and a staff dashboard that replaces the phone, the paper
diary and the WhatsApp threads.

**Full specification: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)** — 26 sections
covering brand, design system, page-by-page copy, the booking flow, the dashboard, the data
model, SEO, GDPR and Croatian fiscal obligations.

---

## Getting started

```bash
npm install
npm run dev
```

The site runs at <http://localhost:3100>.

```bash
npm test          # 189 tests
npm run typecheck
npm run build
```

> **Do not run `npm run build` while the dev server is running.** They share `.next/` and the
> build corrupts the dev server's state, producing 500s that look like application bugs.

## Layout

```
apps/web              Next.js 15 — public site and (later) dashboard
packages/scheduling   Availability and pricing engine — pure logic, no I/O
packages/db           Prisma schema and migrations
docs/photo-references Photography brief and reference library
```

`packages/scheduling` is deliberately separate and dependency-free. It is the highest-risk
code in the system, so it is also the most testable: no database, no framework, deterministic
given its inputs.

## What works today

| | |
|---|---|
| Scheduling engine | 189 tests, 99.5% statements / 96% branches |
| Prisma schema | Complete and validated |
| Homepage | Built, real Croatian copy |
| Location pages | All 7, per-location `HairSalon` schema, district in H1 and H2 |
| Booking flow | Location → service → time, live availability from the engine |
| Production build | Passes; 111 kB first load (budget is 140 kB) |

**Not built yet:** the dashboard, the confirm/deposit step, the English tree, the CMS.

### Processing-time overlap

The feature the project turns on. A colour is modelled as phases —
`ACTIVE 45min → PASSIVE 35min → ACTIVE 40min` — and the engine sells that middle window,
where the client occupies a chair but the stylist is free, to a second client.

Most booking systems block the whole appointment and throw that capacity away.

See [`packages/scheduling/test/capacity.test.ts`](./packages/scheduling/test/capacity.test.ts).
It measures **+60%** on an all-colour day, which is the best possible case — quote
**20–30%** as the realistic mixed-day figure, since cuts and blow-dries carry no passive time
and dilute it.

The invariant that a stylist is never double-booked is enforced in PostgreSQL with an
exclusion constraint, not only in application code. See the migration note at the bottom of
[`schema.prisma`](./packages/db/prisma/schema.prisma).

## Before this ships

Two items block real use, and no amount of code removes them:

1. **Opening hours for all seven salons.** Published nowhere on the current site. Everything
   in the scheduler currently runs on invented shifts.
2. **The staff roster** — who works where, and which services each is certified for.

The rest are tracked as `[CLIENT]` and `[VERIFY]` markers in the plan (§25).

### Placeholders

- Every photograph carries a `REFERENCE — NOT FOR PRODUCTION` watermark. They are Unsplash
  images used for art direction only and **none may ship** — the whole premise of the redesign
  is that the site shows the real studio.
- [`apps/web/lib/seed.ts`](./apps/web/lib/seed.ts) is invented staff and shifts. It matches the
  Prisma schema exactly, so replacing it with real queries is substitution, not a rewrite.

## Conventions

- Money is integer **cents**, never floats.
- Instants are stored **UTC**; conversion to `Europe/Zagreb` happens at the edge.
  Croatia observes DST, and both transitions are explicitly tested.
- Croatian place names are **declined by hand**. Place names take the locative after a
  preposition — "u Prečkom", "na Ilici", never "u Prečko". Each location carries its own
  `locative`; it cannot be derived from the nominative.
