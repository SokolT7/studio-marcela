/**
 * Demonstration data for the dashboard.
 *
 * Frontend-only build: there is no database yet, so a day's worth of salon
 * traffic is generated deterministically from the date. The same day always
 * produces the same diary, which keeps screenshots and demos stable.
 *
 * **Every client, appointment and colour formula here is invented.** The
 * shapes match `packages/db/prisma/schema.prisma`, so replacing this module
 * with Prisma queries is a substitution rather than a rewrite — the same
 * discipline as `lib/seed.ts`.
 */

import { MINUTE_MS } from '@sm/scheduling';
import { BOOKABLE_SERVICES, STYLISTS, type SeedStylist } from '../seed';
import { rosteredStylists, shiftFor } from './day';
import { ALL_SERVICES, type ServiceContent } from '../content/services';

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export interface DemoSegment {
  type: 'ACTIVE' | 'PASSIVE';
  startsAt: number;
  endsAt: number;
}

export interface DemoAppointment {
  id: string;
  reference: string;
  locationId: string;
  stylistId: string;
  clientId: string;
  serviceSlug: string;
  startsAt: number;
  endsAt: number;
  segments: DemoSegment[];
  status: AppointmentStatus;
  priceCents: number;
  source: 'ONLINE' | 'PHONE' | 'WALK_IN';
  clientNote?: string;
  staffNote?: string;
}

export interface DemoColourFormula {
  id: string;
  appliedAt: number;
  stylistId: string;
  productLine: string;
  shades: { shade: string; grams: number }[];
  developer: string;
  developerVolume: string;
  ratio: string;
  processingMin: number;
  resultNote?: string;
  /** What to change next time — the field that makes the record valuable. */
  nextTimeNote?: string;
}

export interface DemoClient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  since: string;
  visits: number;
  noShows: number;
  lifetimeValueCents: number;
  allergies?: string;
  notes?: string;
  preferredStylistId?: string;
  formulas: DemoColourFormula[];
}

export interface DemoAbsence {
  id: string;
  userId: string;
  type: 'ANNUAL' | 'SICK' | 'TRAINING' | 'UNPAID';
  startDate: string;
  endDate: string;
  status: 'REQUESTED' | 'APPROVED' | 'DECLINED';
  note?: string;
}

/* ── Invented clients ──────────────────────────────────────────────
   Croatian names, plausible histories. None of these people exist. */

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: 'c-marina',
    firstName: 'Marina',
    lastName: 'Horvat',
    phone: '+385 91 234 5678',
    email: 'marina.horvat@example.hr',
    since: '2021-03',
    visits: 24,
    noShows: 0,
    lifetimeValueCents: 168000,
    preferredStylistId: 'ana-k',
    notes: 'Voli hladnije tonove. Ne voli previše volumena na tjemenu.',
    formulas: [
      {
        id: 'f-marina-3',
        appliedAt: Date.now() - 62 * 24 * 3600_000,
        stylistId: 'ana-k',
        productLine: 'Silky TechnoBasic',
        shades: [
          { shade: '8.1', grams: 30 },
          { shade: '9.1', grams: 20 },
        ],
        developer: 'Silky oxi',
        developerVolume: '20 vol',
        ratio: '1:1.5',
        processingMin: 35,
        resultNote: 'Izrast pokriven, ton hladan kako je tražila.',
        nextTimeNote: '5 g manje 9.1 — zadnji put je bilo na granici presvijetlog.',
      },
      {
        id: 'f-marina-2',
        appliedAt: Date.now() - 132 * 24 * 3600_000,
        stylistId: 'ana-k',
        productLine: 'Silky TechnoBasic',
        shades: [{ shade: '8.1', grams: 30 }, { shade: '9.1', grams: 25 }],
        developer: 'Silky oxi',
        developerVolume: '20 vol',
        ratio: '1:1.5',
        processingMin: 35,
        resultNote: 'Dobro, ali malo svjetlije nego prošli put.',
      },
    ],
  },
  {
    id: 'c-petra',
    firstName: 'Petra',
    lastName: 'Kovačević',
    phone: '+385 98 876 5432',
    email: 'petra.k@example.hr',
    since: '2023-09',
    visits: 7,
    noShows: 1,
    lifetimeValueCents: 52000,
    allergies: 'Osjetljivo vlasište — bez amonijaka.',
    formulas: [
      {
        id: 'f-petra-1',
        appliedAt: Date.now() - 48 * 24 * 3600_000,
        stylistId: 'ana-k',
        productLine: 'Silky TechnoBasic',
        shades: [{ shade: '7.3', grams: 40 }],
        developer: 'Silky oxi bez amonijaka',
        developerVolume: '10 vol',
        ratio: '1:2',
        processingMin: 30,
        resultNote: 'Bez reakcije na vlasištu.',
        nextTimeNote: 'Držati se linije bez amonijaka.',
      },
    ],
  },
  {
    id: 'c-ivan',
    firstName: 'Ivan',
    lastName: 'Babić',
    phone: '+385 95 111 2233',
    since: '2022-01',
    visits: 31,
    noShows: 0,
    lifetimeValueCents: 46500,
    notes: 'Uvijek isto — mašinica 3 sa strane, škare gore.',
    formulas: [],
  },
  {
    id: 'c-lucija',
    firstName: 'Lucija',
    lastName: 'Novak',
    phone: '+385 91 555 0099',
    email: 'lucija.novak@example.hr',
    since: '2024-06',
    visits: 4,
    noShows: 2,
    lifetimeValueCents: 21000,
    notes: 'Dva nedolaska — traži se akontacija.',
    formulas: [],
  },
  {
    id: 'c-ana-m',
    firstName: 'Ana',
    lastName: 'Marić',
    phone: '+385 99 321 6547',
    email: 'ana.maric@example.hr',
    since: '2020-11',
    visits: 42,
    noShows: 0,
    lifetimeValueCents: 312000,
    preferredStylistId: 'ivana-p',
    notes: 'Vjenčanje u rujnu — proba dogovorena.',
    formulas: [],
  },
  {
    id: 'c-tomislav',
    firstName: 'Tomislav',
    lastName: 'Jurić',
    phone: '+385 92 777 8899',
    since: '2023-02',
    visits: 12,
    noShows: 0,
    lifetimeValueCents: 18000,
    formulas: [],
  },
  {
    id: 'c-dora',
    firstName: 'Dora',
    lastName: 'Vuković',
    phone: '+385 91 404 5050',
    email: 'dora.v@example.hr',
    since: '2022-08',
    visits: 18,
    noShows: 0,
    lifetimeValueCents: 141000,
    preferredStylistId: 'petra-m',
    formulas: [
      {
        id: 'f-dora-1',
        appliedAt: Date.now() - 90 * 24 * 3600_000,
        stylistId: 'petra-m',
        productLine: 'Silky TechnoBasic',
        shades: [{ shade: '6.0', grams: 35 }, { shade: '7.4', grams: 15 }],
        developer: 'Silky oxi',
        developerVolume: '30 vol',
        ratio: '1:1',
        processingMin: 40,
        nextTimeNote: 'Bakrenasti ton se brzo ispire — predložiti preljev za 6 tjedana.',
      },
    ],
  },
  {
    id: 'c-maja',
    firstName: 'Maja',
    lastName: 'Šimić',
    phone: '+385 98 202 3040',
    since: '2024-01',
    visits: 6,
    noShows: 0,
    lifetimeValueCents: 39000,
    formulas: [],
  },
];

export const DEMO_ABSENCES: DemoAbsence[] = [
  {
    id: 'a-1',
    userId: 'marko-b',
    type: 'ANNUAL',
    startDate: '2026-08-17',
    endDate: '2026-08-28',
    status: 'REQUESTED',
    note: 'Godišnji — dogovoreno s Anom za zamjenu.',
  },
  {
    id: 'a-2',
    userId: 'petra-m',
    type: 'TRAINING',
    startDate: '2026-08-11',
    endDate: '2026-08-11',
    status: 'REQUESTED',
    note: 'Silky edukacija — AirTouch napredni.',
  },
  {
    id: 'a-3',
    userId: 'ivana-p',
    type: 'ANNUAL',
    startDate: '2026-09-07',
    endDate: '2026-09-18',
    status: 'APPROVED',
  },
];

/* ── Generated diary ─────────────────────────────────────────────── */

function serviceFor(slug: string): ServiceContent | undefined {
  return ALL_SERVICES.find((s) => s.slug === slug);
}

/** Deterministic pseudo-random from a string seed. */
function seedFrom(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const BOOKABLE = Object.keys(BOOKABLE_SERVICES);

/**
 * A plausible day's diary for one salon.
 *
 * Deliberately leaves gaps — a fully-booked demo hides the "gaps worth
 * filling" panel, which is one of the more persuasive things on the screen.
 */
export function generateDay(dateKey: string, locationId: string): DemoAppointment[] {
  const rand = seedFrom(`${dateKey}:${locationId}`);
  const out: DemoAppointment[] = [];
  let n = 0;

  // Only people actually on the rota get appointments. Generating for the
  // whole team regardless of the day produced Saturday diaries fuller than the
  // Saturday rota, and a utilisation figure of 386%.
  for (const stylist of rosteredStylists(dateKey)) {
    const shift = shiftFor(stylist, dateKey);
    if (!shift) continue;

    const skills = stylist.skills.map((s) => s.serviceId).filter((s) => BOOKABLE.includes(s));
    if (skills.length === 0) continue;

    // Three to five appointments each — busy enough to look real, open
    // enough to show the scheduler working.
    const count = 3 + Math.floor(rand() * 3);
    let cursor = shift.start + Math.floor(rand() * 2) * 30 * MINUTE_MS;

    for (let i = 0; i < count; i++) {
      const slug = skills[Math.floor(rand() * skills.length)]!;
      const engineService = BOOKABLE_SERVICES[slug]!;
      const content = serviceFor(slug);
      const totalMin = engineService.segments.reduce((t, s) => t + s.durationMin, 0);

      // Never run past the end of the shift.
      if (cursor + totalMin * MINUTE_MS > shift.end) break;
      const start = cursor;

      let offset = 0;
      const segments: DemoSegment[] = engineService.segments.map((seg) => {
        const s = { type: seg.type, startsAt: start + offset * MINUTE_MS, endsAt: start + (offset + seg.durationMin) * MINUTE_MS };
        offset += seg.durationMin;
        return s;
      });

      const client = DEMO_CLIENTS[Math.floor(rand() * DEMO_CLIENTS.length)]!;
      const roll = rand();
      const status: AppointmentStatus =
        roll > 0.93 ? 'NO_SHOW' : roll > 0.72 ? 'COMPLETED' : 'CONFIRMED';

      out.push({
        id: `d-${locationId}-${dateKey}-${n}`,
        reference: `SM-${dateKey.slice(5).replace('-', '')}${String(n).padStart(2, '0')}`,
        locationId,
        stylistId: stylist.id,
        clientId: client.id,
        serviceSlug: slug,
        startsAt: start,
        endsAt: start + totalMin * MINUTE_MS,
        segments,
        status,
        priceCents: content?.fromPriceCents ?? 3000,
        source: rand() > 0.45 ? 'ONLINE' : rand() > 0.5 ? 'PHONE' : 'WALK_IN',
        ...(rand() > 0.85 ? { clientNote: 'Molim termin do 15 h, imam let.' } : {}),
      });

      n++;
      // Leave a gap sometimes — that is what the gaps panel is for.
      cursor = start + (totalMin + (rand() > 0.6 ? 60 : 15)) * MINUTE_MS;
    }
  }

  return withOverlapBookings(out, rand).sort((a, b) => a.startsAt - b.startsAt);
}

/**
 * Slot a short service into a colour's developing window.
 *
 * Without this the calendar never actually shows the feature the whole
 * capacity argument rests on — the diary reads as ordinary back-to-back
 * bookings. One per stylist per day, mirroring exactly what the engine
 * permits: the second client's active work sits entirely inside the first
 * client's passive phase.
 */
function withOverlapBookings(
  appointments: DemoAppointment[],
  rand: () => number,
): DemoAppointment[] {
  const extra: DemoAppointment[] = [];
  const used = new Set<string>();

  for (const host of appointments) {
    if (used.has(host.stylistId)) continue;
    const passive = host.segments.find((s) => s.type === 'PASSIVE');
    if (!passive) continue;

    const windowMin = (passive.endsAt - passive.startsAt) / MINUTE_MS;
    const fillMin = 30;
    if (windowMin < fillMin + 5) continue;

    const start = passive.startsAt + 5 * MINUTE_MS;
    const end = start + fillMin * MINUTE_MS;
    const client = DEMO_CLIENTS[Math.floor(rand() * DEMO_CLIENTS.length)]!;

    extra.push({
      id: `${host.id}-overlap`,
      reference: `${host.reference}-P`,
      locationId: host.locationId,
      stylistId: host.stylistId,
      clientId: client.id,
      serviceSlug: 'musko-sisanje',
      startsAt: start,
      endsAt: end,
      segments: [{ type: 'ACTIVE', startsAt: start, endsAt: end }],
      status: 'CONFIRMED',
      priceCents: 1000,
      source: 'ONLINE',
      staffNote: 'Uklopljeno dok boja odstoji.',
    });
    used.add(host.stylistId);
  }

  return [...appointments, ...extra];
}

export function clientById(id: string): DemoClient | undefined {
  return DEMO_CLIENTS.find((c) => c.id === id);
}

export function stylistById(id: string): SeedStylist | undefined {
  return STYLISTS.find((s) => s.id === id);
}

export function serviceNameHr(slug: string): string {
  return serviceFor(slug)?.nameHr ?? slug;
}
