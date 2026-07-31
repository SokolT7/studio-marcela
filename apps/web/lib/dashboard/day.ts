/**
 * Day arithmetic for the dashboard.
 *
 * Kept separate from the components so the interesting logic — where the gaps
 * are, what a stylist's next appointment is — is testable and reusable.
 */

import { localDateTimeToUtc } from '@sm/scheduling';
import { SALON_HOURS, STYLISTS, TIMEZONE, type SeedStylist } from '../seed';
import type { DemoAppointment } from './demo-data';

export interface Gap {
  stylistId: string;
  startsAt: number;
  endsAt: number;
  minutes: number;
}

const DAY_MS = 86_400_000;

/** The salon's opening interval for a local date, or null when closed. */
export function salonWindow(date: string): { start: number; end: number } | null {
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
  const hours = SALON_HOURS.find((h) => h.dayOfWeek === dow);
  if (!hours || hours.isClosed) return null;
  return {
    start: localDateTimeToUtc(date, hours.opensAt, TIMEZONE),
    end: localDateTimeToUtc(date, hours.closesAt, TIMEZONE),
  };
}

/** A stylist's rostered interval on a date, clipped to salon hours. */
export function shiftFor(stylist: SeedStylist, date: string): { start: number; end: number } | null {
  const salon = salonWindow(date);
  if (!salon) return null;

  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
  const pattern = stylist.patterns.find((p) => p.dayOfWeek === dow);
  if (!pattern) return null;

  const start = Math.max(localDateTimeToUtc(date, pattern.startsAt, TIMEZONE), salon.start);
  const end = Math.min(localDateTimeToUtc(date, pattern.endsAt, TIMEZONE), salon.end);
  return end > start ? { start, end } : null;
}

/** Stylists rostered on this date at this salon. */
export function rosteredStylists(date: string): SeedStylist[] {
  return STYLISTS.filter((s) => shiftFor(s, date) !== null);
}

/**
 * Idle windows in a stylist's day.
 *
 * Only gaps of `minMinutes` or more count — a fifteen-minute hole between two
 * clients is a breather, not a lost booking. These drive the "gaps worth
 * filling" panel, which is the most directly profitable thing on the screen.
 */
export function findGaps(
  appointments: DemoAppointment[],
  date: string,
  minMinutes = 45,
): Gap[] {
  const gaps: Gap[] = [];

  for (const stylist of rosteredStylists(date)) {
    const shift = shiftFor(stylist, date);
    if (!shift) continue;

    const booked = appointments
      .filter((a) => a.stylistId === stylist.id && a.status !== 'CANCELLED')
      .map((a) => ({ start: a.startsAt, end: a.endsAt }))
      .sort((a, b) => a.start - b.start);

    let cursor = shift.start;
    for (const slot of booked) {
      if (slot.start > cursor) {
        const minutes = Math.round((slot.start - cursor) / 60_000);
        if (minutes >= minMinutes) {
          gaps.push({ stylistId: stylist.id, startsAt: cursor, endsAt: slot.start, minutes });
        }
      }
      cursor = Math.max(cursor, slot.end);
    }
    if (shift.end > cursor) {
      const minutes = Math.round((shift.end - cursor) / 60_000);
      if (minutes >= minMinutes) {
        gaps.push({ stylistId: stylist.id, startsAt: cursor, endsAt: shift.end, minutes });
      }
    }
  }

  return gaps.sort((a, b) => a.startsAt - b.startsAt);
}

export interface DaySummary {
  total: number;
  completed: number;
  remaining: number;
  noShows: number;
  awaitingArrival: number;
  revenueCents: number;
  /** Booked minutes over rostered minutes. The number that governs profit. */
  utilisation: number;
}

export function summarise(appointments: DemoAppointment[], date: string): DaySummary {
  const live = appointments.filter((a) => a.status !== 'CANCELLED');
  const bookedMinutes = live.reduce((t, a) => t + (a.endsAt - a.startsAt) / 60_000, 0);

  const rosteredMinutes = rosteredStylists(date).reduce((t, s) => {
    const shift = shiftFor(s, date);
    return t + (shift ? (shift.end - shift.start) / 60_000 : 0);
  }, 0);

  return {
    total: live.length,
    completed: live.filter((a) => a.status === 'COMPLETED').length,
    remaining: live.filter((a) => a.status === 'CONFIRMED' || a.status === 'ARRIVED' || a.status === 'IN_PROGRESS').length,
    noShows: live.filter((a) => a.status === 'NO_SHOW').length,
    awaitingArrival: live.filter((a) => a.status === 'CONFIRMED').length,
    revenueCents: live
      .filter((a) => a.status !== 'NO_SHOW')
      .reduce((t, a) => t + a.priceCents, 0),
    utilisation: rosteredMinutes > 0 ? Math.round((bookedMinutes / rosteredMinutes) * 100) : 0,
  };
}

/** Yesterday / tomorrow, for the date stepper. */
export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y!, m! - 1, d!) + days * DAY_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}
