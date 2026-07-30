/**
 * Timezone conversion for scheduling.
 *
 * Everything the engine computes on is a UTC instant. Everything a human sets —
 * "Ana works 09:00–17:00 on Tuesdays" — is local wall-clock time in the salon's
 * zone. This module is the only place those two representations meet, so DST
 * bugs have exactly one place to hide.
 *
 * Croatia observes CET/CEST, so the clock moves twice a year. A naive
 * implementation silently produces an hour of phantom or missing availability
 * on those two days; see `test/timezone.test.ts`.
 *
 * Implemented with `Intl` rather than a date library: it uses the platform IANA
 * database, so it stays correct when the rules change without us shipping an
 * update.
 */

export interface WallTime {
  year: number;
  /** 1–12, not the JavaScript 0–11. */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let dtf = partsCache.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsCache.set(timeZone, dtf);
  }
  return dtf;
}

/** Break a UTC instant into local wall-clock parts for the given zone. */
export function utcToWallTime(instant: number, timeZone: string): Required<WallTime> {
  const parts = formatterFor(timeZone).formatToParts(new Date(instant));
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`Missing "${type}" for timezone "${timeZone}"`);
    return Number(part.value);
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

/**
 * The zone's UTC offset in milliseconds at a specific instant.
 * Positive east of Greenwich: Zagreb returns +1h in winter, +2h in summer.
 */
export function zoneOffsetMs(instant: number, timeZone: string): number {
  const w = utcToWallTime(instant, timeZone);
  const asIfUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  // Drop sub-second precision on both sides so the difference is a clean offset.
  return asIfUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * Convert local wall-clock time to a UTC instant.
 *
 * Two edge cases exist twice a year and both are resolved deliberately:
 *
 * - **Spring forward** (Zagreb: 02:00 → 03:00, last Sunday in March). Times in
 *   the skipped hour do not exist. We return the instant produced by the
 *   pre-transition offset, which lands just after the gap — 02:30 becomes
 *   03:30 local. Nothing is silently dropped.
 * - **Autumn back** (Zagreb: 03:00 → 02:00, last Sunday in October). Times in
 *   the repeated hour happen twice. We return the **first** (still-DST)
 *   occurrence, which is the ECMAScript convention and the safer choice for a
 *   diary: it never moves an appointment later than the client expects.
 */
export function wallTimeToUtc(wall: WallTime, timeZone: string): number {
  const naive = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second ?? 0,
  );

  // Sample the offset on both sides of the requested time. Half a day either
  // way is enough to straddle any transition falling on this date, and the two
  // samples differ only when one does.
  const HALF_DAY = 43_200_000;
  const offsetBefore = zoneOffsetMs(naive - HALF_DAY, timeZone);
  const offsetAfter = zoneOffsetMs(naive + HALF_DAY, timeZone);

  const candidates =
    offsetBefore === offsetAfter
      ? [naive - offsetBefore]
      : [naive - offsetBefore, naive - offsetAfter];

  const roundTrips = (instant: number): boolean => {
    const w = utcToWallTime(instant, timeZone);
    return (
      w.year === wall.year &&
      w.month === wall.month &&
      w.day === wall.day &&
      w.hour === wall.hour &&
      w.minute === wall.minute
    );
  };

  const valid = candidates.filter(roundTrips);
  // Ambiguous (autumn): both candidates are real. Take the earlier one.
  if (valid.length > 0) return Math.min(...valid);

  // Gap (spring): neither is real. The pre-transition offset yields the later
  // instant, which lands just after the gap instead of an hour before it.
  return Math.max(...candidates);
}

/** Parse `"HH:MM"` into hours and minutes. Throws on anything malformed. */
export function parseTimeOfDay(value: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) throw new RangeError(`Invalid time of day: "${value}" (expected "HH:MM")`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 24 || minute > 59) throw new RangeError(`Time out of range: "${value}"`);
  // "24:00" is accepted as an end-of-day marker for salons closing at midnight.
  if (hour === 24 && minute !== 0) throw new RangeError(`Time out of range: "${value}"`);
  return { hour, minute };
}

/** Parse `"YYYY-MM-DD"` into calendar parts. */
export function parseDateOnly(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) throw new RangeError(`Invalid date: "${value}" (expected "YYYY-MM-DD")`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * The UTC instant for a local time-of-day on a local calendar date.
 * `"24:00"` resolves to midnight at the start of the following day.
 */
export function localDateTimeToUtc(
  date: string,
  timeOfDay: string,
  timeZone: string,
): number {
  const { year, month, day } = parseDateOnly(date);
  const { hour, minute } = parseTimeOfDay(timeOfDay);

  if (hour === 24) {
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
    return wallTimeToUtc(
      {
        year: nextDay.getUTCFullYear(),
        month: nextDay.getUTCMonth() + 1,
        day: nextDay.getUTCDate(),
        hour: 0,
        minute: 0,
      },
      timeZone,
    );
  }

  return wallTimeToUtc({ year, month, day, hour, minute }, timeZone);
}

/** The local calendar date of an instant, as `"YYYY-MM-DD"`. */
export function localDateString(instant: number, timeZone: string): string {
  const w = utcToWallTime(instant, timeZone);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
}

/** Day of week for a local calendar date. 0 = Sunday, matching the schema. */
export function dayOfWeekForDate(date: string): number {
  const { year, month, day } = parseDateOnly(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Advance a `"YYYY-MM-DD"` string by whole days, staying calendar-correct. */
export function addDays(date: string, days: number): string {
  const { year, month, day } = parseDateOnly(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** Inclusive list of local dates spanning two instants. */
export function localDatesBetween(
  fromInstant: number,
  toInstant: number,
  timeZone: string,
): string[] {
  const first = localDateString(fromInstant, timeZone);
  const last = localDateString(toInstant, timeZone);
  const dates: string[] = [];
  let cursor = first;
  // Guard against a pathological range rather than looping forever.
  for (let i = 0; i < 1000; i++) {
    dates.push(cursor);
    if (cursor >= last) break;
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * ISO-8601 week number, used to resolve alternating (A/B) week rotas.
 * Weeks start Monday; week 1 contains the year's first Thursday.
 */
export function isoWeekNumber(date: string): number {
  const { year, month, day } = parseDateOnly(date);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7; // Sunday becomes 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // shift to the week's Thursday
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
}
