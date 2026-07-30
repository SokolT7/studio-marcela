/**
 * Resolves "when can this person actually work" into absolute UTC intervals.
 *
 * Precedence, highest first:
 *   1. Date-specific override  (`WorkOverride`)
 *   2. Recurring weekly pattern (`WorkPattern`, honouring A/B week parity)
 *   3. Nothing — not working
 *
 * The result is then intersected with the salon's own opening hours and has
 * approved absences and time blocks carved out of it. A stylist can never be
 * bookable when the salon is shut, however their pattern reads.
 */

import {
  type Interval,
  mergeIntervals,
  subtractIntervals,
  intersectIntervals,
} from './interval.js';
import {
  addDays,
  dayOfWeekForDate,
  isoWeekNumber,
  localDateTimeToUtc,
  localDatesBetween,
} from './timezone.js';
import type {
  Absence,
  SalonHours,
  SalonHoursException,
  Stylist,
  TimeBlock,
  WorkOverride,
  WorkPattern,
} from './types.js';

/**
 * Local time at which a half-day absence divides. A morning (`AM`) absence
 * removes everything before this; an afternoon (`PM`) absence removes
 * everything from it onwards.
 */
export const HALF_DAY_BOUNDARY = '13:00';

function isWithinEffectiveRange(pattern: WorkPattern, date: string): boolean {
  if (date < pattern.effectiveFrom) return false;
  if (pattern.effectiveTo && date > pattern.effectiveTo) return false;
  return true;
}

function matchesParity(pattern: WorkPattern, date: string): boolean {
  if (pattern.weekParity === 'EVERY') return true;
  const week = isoWeekNumber(date);
  return pattern.weekParity === 'ODD' ? week % 2 === 1 : week % 2 === 0;
}

/** The salon's opening interval for a local date, or null when closed. */
export function salonWindowForDate(
  date: string,
  hours: readonly SalonHours[],
  exceptions: readonly SalonHoursException[],
  timeZone: string,
): Interval | null {
  const exception = exceptions.find((e) => e.date === date);
  if (exception) {
    if (exception.isClosed) return null;
    if (exception.opensAt && exception.closesAt) {
      return {
        start: localDateTimeToUtc(date, exception.opensAt, timeZone),
        end: localDateTimeToUtc(date, exception.closesAt, timeZone),
      };
    }
    // An exception that opens the salon but names no times is meaningless;
    // fall through to the weekly pattern rather than inventing hours.
  }

  const dow = dayOfWeekForDate(date);
  const weekly = hours.find((h) => h.dayOfWeek === dow);
  if (!weekly || weekly.isClosed) return null;

  return {
    start: localDateTimeToUtc(date, weekly.opensAt, timeZone),
    end: localDateTimeToUtc(date, weekly.closesAt, timeZone),
  };
}

/** The stylist's own rostered interval for a local date, before any deductions. */
export function rosteredWindowsForDate(
  date: string,
  patterns: readonly WorkPattern[],
  overrides: readonly WorkOverride[],
  timeZone: string,
): Interval[] {
  const override = overrides.find((o) => o.date === date);
  if (override) {
    if (!override.isWorking) return [];
    if (override.startsAt && override.endsAt) {
      return [
        {
          start: localDateTimeToUtc(date, override.startsAt, timeZone),
          end: localDateTimeToUtc(date, override.endsAt, timeZone),
        },
      ];
    }
    // "Working, times unspecified" falls back to the pattern below.
  }

  const dow = dayOfWeekForDate(date);
  const applicable = patterns.filter(
    (p) =>
      p.dayOfWeek === dow && isWithinEffectiveRange(p, date) && matchesParity(p, date),
  );

  return mergeIntervals(
    applicable.map((p) => ({
      start: localDateTimeToUtc(date, p.startsAt, timeZone),
      end: localDateTimeToUtc(date, p.endsAt, timeZone),
    })),
  );
}

/** Intervals removed by approved absence on a given local date. */
export function absenceIntervalsForDate(
  date: string,
  absences: readonly Absence[],
  timeZone: string,
): Interval[] {
  const dayStart = localDateTimeToUtc(date, '00:00', timeZone);
  const dayEnd = localDateTimeToUtc(addDays(date, 1), '00:00', timeZone);
  const boundary = localDateTimeToUtc(date, HALF_DAY_BOUNDARY, timeZone);

  const out: Interval[] = [];
  for (const absence of absences) {
    if (date < absence.startDate || date > absence.endDate) continue;

    if (absence.isHalfDay && absence.halfDayPeriod) {
      out.push(
        absence.halfDayPeriod === 'AM'
          ? { start: dayStart, end: boundary }
          : { start: boundary, end: dayEnd },
      );
    } else {
      out.push({ start: dayStart, end: dayEnd });
    }
  }
  return mergeIntervals(out);
}

function timeBlockIntervals(blocks: readonly TimeBlock[]): Interval[] {
  return blocks.map((b) => ({ start: b.startsAt, end: b.endsAt }));
}

export interface WorkingWindowsRequest {
  readonly stylist: Stylist;
  readonly from: number;
  readonly to: number;
  readonly timeZone: string;
  readonly salonHours: readonly SalonHours[];
  readonly salonExceptions: readonly SalonHoursException[];
}

/**
 * The stylist's bookable time across the requested range, as merged UTC
 * intervals with absences and blocks already removed.
 */
export function computeWorkingWindows(request: WorkingWindowsRequest): Interval[] {
  const { stylist, from, to, timeZone, salonHours, salonExceptions } = request;
  if (!stylist.isBookable) return [];

  // Widen by a day at each end so a shift that straddles local midnight, or a
  // range boundary that lands mid-shift, is still considered.
  const dates = localDatesBetween(from - 86_400_000, to + 86_400_000, timeZone);

  const windows: Interval[] = [];
  for (const date of dates) {
    const salon = salonWindowForDate(date, salonHours, salonExceptions, timeZone);
    if (!salon) continue;

    const rostered = rosteredWindowsForDate(
      date,
      stylist.patterns,
      stylist.overrides,
      timeZone,
    );
    if (rostered.length === 0) continue;

    const withinSalon = intersectIntervals(rostered, [salon]);
    if (withinSalon.length === 0) continue;

    const absent = absenceIntervalsForDate(date, stylist.absences, timeZone);
    windows.push(...subtractIntervals(withinSalon, absent));
  }

  const merged = mergeIntervals(windows);
  const withoutBlocks = subtractIntervals(merged, timeBlockIntervals(stylist.timeBlocks));

  // Finally clip to the requested range.
  return intersectIntervals(withoutBlocks, [{ start: from, end: to }]);
}
