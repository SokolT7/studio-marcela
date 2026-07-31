/**
 * Demonstration roster.
 *
 * Stands in for the database until the client supplies the real staff roster
 * and opening hours (IMPLEMENTATION_PLAN.md §25.1, items 1 and 2). The shape
 * matches `packages/db/prisma/schema.prisma` exactly, so replacing this module
 * with Prisma queries is a substitution rather than a rewrite.
 *
 * **Every name and every shift here is invented.** Nothing in this file may
 * reach production. It exists so the booking flow can be exercised against the
 * real scheduling engine rather than against a mock.
 */

import type {
  Absence,
  SalonHours,
  Service,
  Stylist,
  StylistSkill,
} from '@sm/scheduling';

export const TIMEZONE = 'Europe/Zagreb';

/** Salon hours — invented, pending §25.1 item 1. */
export const SALON_HOURS: SalonHours[] = [
  { dayOfWeek: 0, opensAt: '00:00', closesAt: '00:00', isClosed: true },
  { dayOfWeek: 1, opensAt: '08:00', closesAt: '20:00', isClosed: false },
  { dayOfWeek: 2, opensAt: '08:00', closesAt: '20:00', isClosed: false },
  { dayOfWeek: 3, opensAt: '08:00', closesAt: '20:00', isClosed: false },
  { dayOfWeek: 4, opensAt: '08:00', closesAt: '20:00', isClosed: false },
  { dayOfWeek: 5, opensAt: '08:00', closesAt: '20:00', isClosed: false },
  { dayOfWeek: 6, opensAt: '08:00', closesAt: '14:00', isClosed: false },
];

/**
 * Services, expressed as ACTIVE/PASSIVE phases.
 *
 * The colour services are the ones that matter: their developing phase
 * releases the stylist, and the engine sells that time to a second client.
 */
export const BOOKABLE_SERVICES: Record<string, Service> = {
  'sisanje-i-fen': {
    id: 'sisanje-i-fen',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 15, requiresStylist: true, requiresChair: true, resourceType: 'BASIN' },
      { sequence: 2, type: 'ACTIVE', durationMin: 45, requiresStylist: true, requiresChair: true },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 10,
    minimumNoticeHours: 2,
    allowOverlap: true,
  },
  bojanje: {
    id: 'bojanje',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 45, requiresStylist: true, requiresChair: true, resourceType: 'COLOUR_BAR' },
      // The stylist is free here. This is the capacity the old system threw away.
      { sequence: 2, type: 'PASSIVE', durationMin: 35, requiresStylist: false, requiresChair: true },
      { sequence: 3, type: 'ACTIVE', durationMin: 40, requiresStylist: true, requiresChair: true, resourceType: 'BASIN' },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 10,
    minimumNoticeHours: 4,
    allowOverlap: true,
  },
  pramenovi: {
    id: 'pramenovi',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 60, requiresStylist: true, requiresChair: true, resourceType: 'COLOUR_BAR' },
      { sequence: 2, type: 'PASSIVE', durationMin: 40, requiresStylist: false, requiresChair: true },
      { sequence: 3, type: 'ACTIVE', durationMin: 50, requiresStylist: true, requiresChair: true, resourceType: 'BASIN' },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 10,
    minimumNoticeHours: 4,
    allowOverlap: true,
  },
  balayage: {
    id: 'balayage',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 75, requiresStylist: true, requiresChair: true, resourceType: 'COLOUR_BAR' },
      { sequence: 2, type: 'PASSIVE', durationMin: 45, requiresStylist: false, requiresChair: true },
      { sequence: 3, type: 'ACTIVE', durationMin: 60, requiresStylist: true, requiresChair: true, resourceType: 'BASIN' },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 15,
    minimumNoticeHours: 24,
    allowOverlap: true,
  },
  'musko-sisanje': {
    id: 'musko-sisanje',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 30, requiresStylist: true, requiresChair: true },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 5,
    minimumNoticeHours: 1,
    allowOverlap: true,
  },
  'njega-i-tretmani': {
    id: 'njega-i-tretmani',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 20, requiresStylist: true, requiresChair: true, resourceType: 'BASIN' },
      { sequence: 2, type: 'PASSIVE', durationMin: 15, requiresStylist: false, requiresChair: true },
      { sequence: 3, type: 'ACTIVE', durationMin: 15, requiresStylist: true, requiresChair: true },
    ],
    bufferBeforeMin: 0,
    bufferAfterMin: 5,
    minimumNoticeHours: 2,
    allowOverlap: true,
  },
  sminkanje: {
    id: 'sminkanje',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 60, requiresStylist: true, requiresChair: true },
    ],
    bufferBeforeMin: 5,
    bufferAfterMin: 10,
    minimumNoticeHours: 24,
    allowOverlap: true,
  },
  'vjencana-frizura': {
    id: 'vjencana-frizura',
    segments: [
      { sequence: 1, type: 'ACTIVE', durationMin: 90, requiresStylist: true, requiresChair: true },
    ],
    bufferBeforeMin: 15,
    bufferAfterMin: 15,
    minimumNoticeHours: 72,
    // A bride never shares her stylist. See plan §9.5.
    allowOverlap: false,
  },
};

export interface SeedStylist extends Stylist {
  firstName: string;
  lastInitial: string;
  title: string;
  specialities: string[];
  portraitRef: string;
}

function everyWeekday(startsAt: string, endsAt: string) {
  return [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    startsAt,
    endsAt,
    weekParity: 'EVERY' as const,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
  }));
}

function certified(...serviceIds: string[]): StylistSkill[] {
  return serviceIds.map((serviceId) => ({ serviceId, level: 'CERTIFIED' as const }));
}

const NO_ABSENCE: Absence[] = [];

/** Invented staff. Names, shifts and specialities are all placeholders. */
export const STYLISTS: SeedStylist[] = [
  {
    id: 'ana-k',
    firstName: 'Ana',
    lastInitial: 'K.',
    title: 'Senior stilist — boja',
    specialities: ['Balayage', 'Pramenovi', 'Korekcija boje'],
    portraitRef: 'STYLIST-PORTRAIT-01',
    locationId: 'precko',
    patterns: everyWeekday('09:00', '17:00'),
    overrides: [],
    absences: NO_ABSENCE,
    timeBlocks: [],
    skills: certified(
      'sisanje-i-fen',
      'bojanje',
      'pramenovi',
      'balayage',
      'njega-i-tretmani',
    ),
    maxConcurrentClients: 2,
    allowOverlap: true,
    isBookable: true,
  },
  {
    id: 'marko-b',
    firstName: 'Marko',
    lastInitial: 'B.',
    title: 'Stilist — šišanje',
    specialities: ['Muško šišanje', 'Oblikovanje brade', 'Šišanje'],
    portraitRef: 'SVC-MENS-01',
    locationId: 'precko',
    patterns: everyWeekday('12:00', '20:00'),
    overrides: [],
    absences: NO_ABSENCE,
    timeBlocks: [],
    skills: certified('sisanje-i-fen', 'musko-sisanje', 'njega-i-tretmani'),
    maxConcurrentClients: 1,
    allowOverlap: false, // deliberately conservative — cutting only
    isBookable: true,
  },
  {
    id: 'ivana-p',
    firstName: 'Ivana',
    lastInitial: 'P.',
    title: 'Stilist — svečane prigode',
    specialities: ['Vjenčane frizure', 'Šminkanje', 'Svečane frizure'],
    portraitRef: 'CLIENT-01',
    locationId: 'precko',
    patterns: [
      ...everyWeekday('09:00', '17:00'),
      {
        dayOfWeek: 6,
        startsAt: '08:00',
        endsAt: '14:00',
        weekParity: 'ODD' as const, // alternating Saturdays
        effectiveFrom: '2024-01-01',
        effectiveTo: null,
      },
    ],
    overrides: [],
    absences: NO_ABSENCE,
    timeBlocks: [],
    skills: certified(
      'sisanje-i-fen',
      'sminkanje',
      'vjencana-frizura',
      'njega-i-tretmani',
      'bojanje',
      'pramenovi',
    ),
    maxConcurrentClients: 2,
    allowOverlap: true,
    isBookable: true,
  },
  {
    id: 'petra-m',
    firstName: 'Petra',
    lastInitial: 'M.',
    title: 'Stilist — boja i njega',
    specialities: ['Bojanje', 'AirTouch', 'Njega kose'],
    portraitRef: 'STYLIST-ATWORK-01',
    locationId: 'precko',
    patterns: everyWeekday('10:00', '18:00'),
    overrides: [],
    absences: NO_ABSENCE,
    timeBlocks: [],
    skills: certified(
      'sisanje-i-fen',
      'bojanje',
      'pramenovi',
      'balayage',
      'njega-i-tretmani',
    ),
    maxConcurrentClients: 2,
    allowOverlap: true,
    isBookable: true,
  },
];

/** Every salon runs the same demonstration roster. */
export function stylistsForLocation(locationId: string): SeedStylist[] {
  return STYLISTS.map((s) => ({ ...s, locationId }));
}

/** Equipment pools — contended across the salon, not per stylist. */
export const RESOURCES = [
  { type: 'BASIN', quantity: 3 },
  { type: 'COLOUR_BAR', quantity: 2 },
  { type: 'AIRTOUCH_DRYER', quantity: 1 },
];
