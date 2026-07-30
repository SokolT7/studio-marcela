/**
 * Test fixtures.
 *
 * Times are written as Zagreb wall-clock strings so the tests read like a
 * salon diary rather than a list of epoch numbers.
 */

import { localDateTimeToUtc } from '../src/timezone.js';
import type {
  ExistingAppointment,
  SalonHours,
  Service,
  ServiceSegment,
  Stylist,
  StylistSkill,
  WorkPattern,
} from '../src/types.js';
import { MINUTE_MS } from '../src/interval.js';

export const TZ = 'Europe/Zagreb';

/** `at('2026-08-12', '09:00')` → the UTC instant for that Zagreb wall time. */
export function at(date: string, time: string): number {
  return localDateTimeToUtc(date, time, TZ);
}

export function segment(
  sequence: number,
  type: 'ACTIVE' | 'PASSIVE',
  durationMin: number,
  resourceType?: string,
): ServiceSegment {
  return {
    sequence,
    type,
    durationMin,
    requiresStylist: type === 'ACTIVE',
    requiresChair: true,
    ...(resourceType ? { resourceType } : {}),
  };
}

/** A simple one-phase service — a cut, a blow-dry. */
export function simpleService(
  id: string,
  durationMin: number,
  overrides: Partial<Service> = {},
): Service {
  return {
    id,
    segments: [segment(1, 'ACTIVE', durationMin)],
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    minimumNoticeHours: 0,
    allowOverlap: true,
    ...overrides,
  };
}

/**
 * A colour: apply → develop → finish.
 * The middle phase releases the stylist, which is the whole point.
 */
export function colourService(
  id = 'bojanje',
  overrides: Partial<Service> = {},
): Service {
  return {
    id,
    segments: [
      segment(1, 'ACTIVE', 45),
      segment(2, 'PASSIVE', 35),
      segment(3, 'ACTIVE', 40),
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    minimumNoticeHours: 0,
    allowOverlap: true,
    ...overrides,
  };
}

export function skill(
  serviceId: string,
  level: StylistSkill['level'] = 'CERTIFIED',
  expiresAt?: string,
): StylistSkill {
  return { serviceId, level, ...(expiresAt ? { expiresAt } : {}) };
}

export function pattern(
  dayOfWeek: number,
  startsAt: string,
  endsAt: string,
  overrides: Partial<WorkPattern> = {},
): WorkPattern {
  return {
    dayOfWeek,
    startsAt,
    endsAt,
    weekParity: 'EVERY',
    effectiveFrom: '2020-01-01',
    effectiveTo: null,
    ...overrides,
  };
}

export function stylist(id: string, overrides: Partial<Stylist> = {}): Stylist {
  return {
    id,
    locationId: 'precko',
    // Monday–Friday 09:00–17:00 by default.
    patterns: [1, 2, 3, 4, 5].map((d) => pattern(d, '09:00', '17:00')),
    overrides: [],
    absences: [],
    timeBlocks: [],
    skills: [skill('sisanje'), skill('bojanje'), skill('fen')],
    maxConcurrentClients: 2,
    allowOverlap: true,
    isBookable: true,
    ...overrides,
  };
}

/** Salon open 08:00–20:00 Monday–Saturday, closed Sunday. */
export function salonHours(): SalonHours[] {
  return [
    { dayOfWeek: 0, opensAt: '00:00', closesAt: '00:00', isClosed: true },
    ...[1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      dayOfWeek,
      opensAt: '08:00',
      closesAt: '20:00',
      isClosed: false,
    })),
  ];
}

/**
 * Build an existing appointment from a plain description, projecting its
 * segments onto absolute time the same way the engine does.
 */
export function existingAppointment(options: {
  id: string;
  stylistId: string;
  date: string;
  startTime: string;
  /** `[type, minutes, resourceType?]` in order. */
  segments: Array<['ACTIVE' | 'PASSIVE', number, string?]>;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  allowOverlap?: boolean;
}): ExistingAppointment {
  const start = at(options.date, options.startTime);
  const activeSegments: ExistingAppointment['activeSegments'] extends readonly (infer T)[]
    ? T[]
    : never = [];
  const resourceUsage: { type: string; interval: { start: number; end: number } }[] = [];

  let cursor = start;
  for (const [type, mins, resourceType] of options.segments) {
    const interval = { start: cursor, end: cursor + mins * MINUTE_MS };
    if (type === 'ACTIVE') activeSegments.push(interval);
    if (resourceType) resourceUsage.push({ type: resourceType, interval });
    cursor = interval.end;
  }

  const span = { start, end: cursor };
  return {
    id: options.id,
    stylistId: options.stylistId,
    span,
    activeSegments,
    blockedSpan: {
      start: span.start - (options.bufferBeforeMin ?? 0) * MINUTE_MS,
      end: span.end + (options.bufferAfterMin ?? 0) * MINUTE_MS,
    },
    resourceUsage,
    allowOverlap: options.allowOverlap ?? true,
  };
}

/** Render a slot as a Zagreb wall-clock time, for readable assertions. */
export function timeOf(instant: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(instant));
}
