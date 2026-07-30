import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayOfWeekForDate,
  isoWeekNumber,
  localDateString,
  localDateTimeToUtc,
  localDatesBetween,
  parseDateOnly,
  parseTimeOfDay,
  utcToWallTime,
  wallTimeToUtc,
  zoneOffsetMs,
} from '../src/timezone.js';

const TZ = 'Europe/Zagreb';
const HOUR = 3_600_000;

/**
 * Croatia observes CET (UTC+1) in winter and CEST (UTC+2) in summer.
 * In 2026 the clocks move on 29 March (02:00 → 03:00) and 25 October
 * (03:00 → 02:00). Both are last Sundays, per EU rules.
 */
describe('zone offsets', () => {
  it('is UTC+1 in winter', () => {
    expect(zoneOffsetMs(Date.UTC(2026, 0, 15, 12, 0), TZ)).toBe(HOUR);
  });

  it('is UTC+2 in summer', () => {
    expect(zoneOffsetMs(Date.UTC(2026, 6, 15, 12, 0), TZ)).toBe(2 * HOUR);
  });

  it('is UTC+0 for UTC itself', () => {
    expect(zoneOffsetMs(Date.UTC(2026, 6, 15, 12, 0), 'UTC')).toBe(0);
  });
});

describe('utcToWallTime', () => {
  it('converts a UTC instant into Zagreb wall-clock parts', () => {
    expect(utcToWallTime(Date.UTC(2026, 7, 12, 10, 30), TZ)).toEqual({
      year: 2026,
      month: 8,
      day: 12,
      hour: 12, // +2 in August
      minute: 30,
      second: 0,
    });
  });

  it('renders local midnight as hour 0, never 24', () => {
    // 22:00 UTC in July is 00:00 the next day in Zagreb.
    const w = utcToWallTime(Date.UTC(2026, 6, 14, 22, 0), TZ);
    expect(w.hour).toBe(0);
    expect(w.day).toBe(15);
  });
});

describe('wallTimeToUtc — ordinary days', () => {
  it('round-trips a summer time', () => {
    const instant = wallTimeToUtc(
      { year: 2026, month: 8, day: 12, hour: 9, minute: 0 },
      TZ,
    );
    expect(instant).toBe(Date.UTC(2026, 7, 12, 7, 0));
  });

  it('round-trips a winter time', () => {
    const instant = wallTimeToUtc(
      { year: 2026, month: 1, day: 12, hour: 9, minute: 0 },
      TZ,
    );
    expect(instant).toBe(Date.UTC(2026, 0, 12, 8, 0));
  });
});

describe('wallTimeToUtc — DST spring forward (29 March 2026)', () => {
  it('handles the hour before the transition as CET', () => {
    const instant = wallTimeToUtc(
      { year: 2026, month: 3, day: 29, hour: 1, minute: 30 },
      TZ,
    );
    expect(instant).toBe(Date.UTC(2026, 2, 29, 0, 30));
  });

  it('handles the hour after the transition as CEST', () => {
    const instant = wallTimeToUtc(
      { year: 2026, month: 3, day: 29, hour: 3, minute: 30 },
      TZ,
    );
    expect(instant).toBe(Date.UTC(2026, 2, 29, 1, 30));
  });

  it('places a non-existent local time immediately after the gap, never before it', () => {
    // 02:30 never happens on this date. It must not silently become 01:30.
    const instant = wallTimeToUtc(
      { year: 2026, month: 3, day: 29, hour: 2, minute: 30 },
      TZ,
    );
    const wall = utcToWallTime(instant, TZ);
    expect(wall.hour).toBe(3);
    expect(wall.minute).toBe(30);
    expect(instant).toBeGreaterThan(Date.UTC(2026, 2, 29, 0, 59));
  });

  it('yields a 23-hour day', () => {
    const dayStart = localDateTimeToUtc('2026-03-29', '00:00', TZ);
    const nextStart = localDateTimeToUtc('2026-03-30', '00:00', TZ);
    expect(nextStart - dayStart).toBe(23 * HOUR);
  });
});

describe('wallTimeToUtc — DST autumn back (25 October 2026)', () => {
  it('resolves an ambiguous local time to the first (still-DST) occurrence', () => {
    // 02:30 happens twice. The earlier instant is 00:30 UTC (CEST, +2).
    const instant = wallTimeToUtc(
      { year: 2026, month: 10, day: 25, hour: 2, minute: 30 },
      TZ,
    );
    expect(instant).toBe(Date.UTC(2026, 9, 25, 0, 30));
  });

  it('yields a 25-hour day', () => {
    const dayStart = localDateTimeToUtc('2026-10-25', '00:00', TZ);
    const nextStart = localDateTimeToUtc('2026-10-26', '00:00', TZ);
    expect(nextStart - dayStart).toBe(25 * HOUR);
  });

  it('keeps a normal 9-to-5 shift exactly eight hours long across the change', () => {
    // The transition happens before opening, so the working day is unaffected.
    const open = localDateTimeToUtc('2026-10-25', '09:00', TZ);
    const close = localDateTimeToUtc('2026-10-25', '17:00', TZ);
    expect(close - open).toBe(8 * HOUR);
  });
});

describe('parsing', () => {
  it('parses times of day', () => {
    expect(parseTimeOfDay('09:30')).toEqual({ hour: 9, minute: 30 });
    expect(parseTimeOfDay('9:05')).toEqual({ hour: 9, minute: 5 });
  });

  it('accepts 24:00 as an end-of-day marker', () => {
    expect(parseTimeOfDay('24:00')).toEqual({ hour: 24, minute: 0 });
  });

  it('rejects malformed and out-of-range times', () => {
    expect(() => parseTimeOfDay('9')).toThrow(RangeError);
    expect(() => parseTimeOfDay('09:60')).toThrow(RangeError);
    expect(() => parseTimeOfDay('25:00')).toThrow(RangeError);
    expect(() => parseTimeOfDay('24:30')).toThrow(RangeError);
  });

  it('parses dates and rejects malformed ones', () => {
    expect(parseDateOnly('2026-08-12')).toEqual({ year: 2026, month: 8, day: 12 });
    expect(() => parseDateOnly('12/08/2026')).toThrow(RangeError);
  });

  it('resolves 24:00 to midnight starting the next day', () => {
    expect(localDateTimeToUtc('2026-08-12', '24:00', TZ)).toBe(
      localDateTimeToUtc('2026-08-13', '00:00', TZ),
    );
  });
});

describe('calendar helpers', () => {
  it('reports the local date of an instant', () => {
    // 23:30 UTC in August is already the next day in Zagreb.
    expect(localDateString(Date.UTC(2026, 7, 12, 23, 30), TZ)).toBe('2026-08-13');
  });

  it('computes day of week with Sunday as 0', () => {
    expect(dayOfWeekForDate('2026-08-16')).toBe(0); // Sunday
    expect(dayOfWeekForDate('2026-08-17')).toBe(1); // Monday
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('lists local dates inclusively between two instants', () => {
    const from = localDateTimeToUtc('2026-08-12', '10:00', TZ);
    const to = localDateTimeToUtc('2026-08-15', '10:00', TZ);
    expect(localDatesBetween(from, to, TZ)).toEqual([
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
    ]);
  });

  it('returns a single date when both instants share a day', () => {
    const from = localDateTimeToUtc('2026-08-12', '08:00', TZ);
    const to = localDateTimeToUtc('2026-08-12', '18:00', TZ);
    expect(localDatesBetween(from, to, TZ)).toEqual(['2026-08-12']);
  });

  it('computes ISO week numbers, including the year boundary', () => {
    expect(isoWeekNumber('2026-01-01')).toBe(1);
    expect(isoWeekNumber('2026-08-12')).toBe(33);
    // 2026-12-31 is a Thursday, so it belongs to week 53.
    expect(isoWeekNumber('2026-12-31')).toBe(53);
  });

  it('gives consecutive weeks alternating parity', () => {
    const a = isoWeekNumber('2026-08-10'); // Monday
    const b = isoWeekNumber('2026-08-17'); // the following Monday
    expect(b).toBe(a + 1);
    expect(a % 2).not.toBe(b % 2);
  });
});
