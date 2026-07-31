/**
 * Booking availability — the public site's entry point into `@sm/scheduling`.
 *
 * This runs on the server. Availability is never computed in the browser: the
 * client does not have the diary, and slot arithmetic done client-side is
 * slot arithmetic that can be lied to.
 */

import {
  type AvailableSlot,
  type ExistingAppointment,
  computeAvailability,
  localDateString,
  localDateTimeToUtc,
  mergeSlotsAcrossStylists,
  MINUTE_MS,
  utcToWallTime,
} from '@sm/scheduling';
import {
  BOOKABLE_SERVICES,
  RESOURCES,
  SALON_HOURS,
  TIMEZONE,
  stylistsForLocation,
  type SeedStylist,
} from './seed';

export { TIMEZONE };

/**
 * A deterministic pseudo-diary.
 *
 * Real appointments come from Postgres. Until then this fabricates a plausible
 * day so the flow can be exercised — deterministic by date and stylist, so the
 * same day always renders the same way and screenshots stay stable.
 */
function seededDiary(dateKey: string, stylists: SeedStylist[]): ExistingAppointment[] {
  const appointments: ExistingAppointment[] = [];

  // Cheap stable hash of the date, so "today" looks the same all day.
  let hash = 0;
  for (const char of dateKey) hash = (hash * 31 + char.charCodeAt(0)) % 9973;

  stylists.forEach((stylist, index) => {
    const seed = (hash + index * 977) % 9973;
    // One or two appointments per stylist per day.
    //
    // Tuned down from two-or-three: with the previous density a colour showed
    // two bookable slots a day, which reads as "this salon is full" rather
    // than "this booking system works". A demo diary should look like a
    // healthy Tuesday, not a fully-committed one.
    const count = 1 + (seed % 2);

    for (let n = 0; n < count; n++) {
      const slotSeed = (seed + n * 613) % 9973;
      const startHour = 9 + (slotSeed % 7); // 09:00–15:00
      const startMinute = (slotSeed % 2) * 30;
      const start = localDateTimeToUtc(
        dateKey,
        `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        TIMEZONE,
      );

      // Every third booking is a colour, so the diary contains real developing
      // windows for the overlap logic to work with.
      const isColour = slotSeed % 3 === 0;
      const activeSegments = isColour
        ? [
            { start, end: start + 45 * MINUTE_MS },
            { start: start + 80 * MINUTE_MS, end: start + 120 * MINUTE_MS },
          ]
        : [{ start, end: start + 60 * MINUTE_MS }];
      const span = {
        start,
        end: isColour ? start + 120 * MINUTE_MS : start + 60 * MINUTE_MS,
      };

      appointments.push({
        id: `${stylist.id}-${dateKey}-${n}`,
        stylistId: stylist.id,
        span,
        activeSegments,
        blockedSpan: { start: span.start, end: span.end + 10 * MINUTE_MS },
        resourceUsage: isColour
          ? [{ type: 'COLOUR_BAR', interval: { start, end: start + 45 * MINUTE_MS } }]
          : [],
        allowOverlap: true,
      });
    }
  });

  return appointments;
}

export interface DayAvailability {
  date: string;
  slots: AvailableSlot[];
  /** One entry per distinct start time, for the "any stylist" default. */
  merged: AvailableSlot[];
}

export interface AvailabilityQuery {
  locationSlug: string;
  serviceSlug: string;
  date: string;
  stylistId?: string;
  now?: number;
}

export function getAvailability(query: AvailabilityQuery): DayAvailability | null {
  const service = BOOKABLE_SERVICES[query.serviceSlug];
  if (!service) return null;

  const stylists = stylistsForLocation(query.locationSlug);
  const now = query.now ?? Date.now();

  const slots = computeAvailability({
    from: localDateTimeToUtc(query.date, '00:00', TIMEZONE),
    to: localDateTimeToUtc(query.date, '23:59', TIMEZONE),
    now,
    timeZone: TIMEZONE,
    salonHours: SALON_HOURS,
    salonExceptions: [],
    stylists,
    services: [service],
    resources: RESOURCES,
    existingAppointments: seededDiary(query.date, stylists),
    slotGranularityMin: 15,
    ...(query.stylistId ? { stylistId: query.stylistId } : {}),
  });

  return { date: query.date, slots, merged: mergeSlotsAcrossStylists(slots) };
}

/**
 * The first bookable slot across the next `days` days.
 * Powers "Prvi slobodan termin: danas 16:30" — the highest-converting element
 * in the flow (plan §9.3).
 */
export function findFirstAvailable(
  locationSlug: string,
  serviceSlug: string,
  days = 14,
  now = Date.now(),
): { date: string; slot: AvailableSlot } | null {
  let cursor = localDateString(now, TIMEZONE);
  for (let i = 0; i < days; i++) {
    const day = getAvailability({ locationSlug, serviceSlug, date: cursor, now });
    const first = day?.merged[0];
    if (first) return { date: cursor, slot: first };
    cursor = addDays(cursor, 1);
  }
  return null;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(y!, m! - 1, d! + days));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** `HH:MM` in the salon's timezone. */
export function slotTime(instant: number): string {
  const w = utcToWallTime(instant, TIMEZONE);
  return `${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')}`;
}

const WEEKDAYS_SHORT = ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'];
const MONTHS_GENITIVE = [
  'siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja',
  'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca',
];

/** "sri, 12. kolovoza" — Croatian dates take the genitive month. */
export function formatDateHr(date: string, options: { withWeekday?: boolean } = {}): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS_SHORT[new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()];
  const month = MONTHS_GENITIVE[m! - 1];
  return options.withWeekday ? `${weekday}, ${d}. ${month}` : `${d}. ${month}`;
}

/** Group slots into morning / afternoon / evening, per plan §9.3. */
export function groupSlotsByPartOfDay(slots: AvailableSlot[]) {
  const groups: { label: string; slots: AvailableSlot[] }[] = [
    { label: 'Jutro', slots: [] },
    { label: 'Popodne', slots: [] },
    { label: 'Navečer', slots: [] },
  ];
  for (const slot of slots) {
    const hour = utcToWallTime(slot.start, TIMEZONE).hour;
    const index = hour < 12 ? 0 : hour < 17 ? 1 : 2;
    groups[index]!.slots.push(slot);
  }
  return groups.filter((g) => g.slots.length > 0);
}
