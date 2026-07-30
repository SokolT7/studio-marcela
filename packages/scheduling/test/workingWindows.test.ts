import { describe, expect, it } from 'vitest';
import {
  absenceIntervalsForDate,
  computeWorkingWindows,
  rosteredWindowsForDate,
  salonWindowForDate,
} from '../src/workingWindows.js';
import { TZ, at, pattern, salonHours, stylist, timeOf } from './fixtures.js';

/** 2026-08-12 is a Wednesday; 2026-08-16 is a Sunday. */
const WED = '2026-08-12';
const SUN = '2026-08-16';

function windowsOn(date: string, s = stylist('ana')) {
  return computeWorkingWindows({
    stylist: s,
    from: at(date, '00:00'),
    to: at(date, '23:59'),
    timeZone: TZ,
    salonHours: salonHours(),
    salonExceptions: [],
  });
}

describe('salonWindowForDate', () => {
  it('returns the weekly opening hours', () => {
    const w = salonWindowForDate(WED, salonHours(), [], TZ);
    expect(w).not.toBeNull();
    expect(timeOf(w!.start)).toBe('08:00');
    expect(timeOf(w!.end)).toBe('20:00');
  });

  it('returns null on a day the salon is closed', () => {
    expect(salonWindowForDate(SUN, salonHours(), [], TZ)).toBeNull();
  });

  it('lets an exception close an ordinarily open day', () => {
    const w = salonWindowForDate(
      WED,
      salonHours(),
      [{ date: WED, isClosed: true }],
      TZ,
    );
    expect(w).toBeNull();
  });

  it('lets an exception change the hours', () => {
    const w = salonWindowForDate(
      WED,
      salonHours(),
      [{ date: WED, isClosed: false, opensAt: '10:00', closesAt: '14:00' }],
      TZ,
    );
    expect(timeOf(w!.start)).toBe('10:00');
    expect(timeOf(w!.end)).toBe('14:00');
  });

  it('falls back to weekly hours when an exception names no times', () => {
    const w = salonWindowForDate(WED, salonHours(), [{ date: WED, isClosed: false }], TZ);
    expect(timeOf(w!.start)).toBe('08:00');
  });

  it('returns null when the day has no weekly entry at all', () => {
    expect(salonWindowForDate(WED, [], [], TZ)).toBeNull();
  });
});

describe('rosteredWindowsForDate', () => {
  const weekday = [pattern(3, '09:00', '17:00')]; // Wednesday

  it('applies the recurring pattern', () => {
    const [w] = rosteredWindowsForDate(WED, weekday, [], TZ);
    expect(timeOf(w!.start)).toBe('09:00');
    expect(timeOf(w!.end)).toBe('17:00');
  });

  it('returns nothing on a day with no pattern', () => {
    expect(rosteredWindowsForDate('2026-08-13', weekday, [], TZ)).toEqual([]);
  });

  it('respects the effective-from date, so historic rotas stay intact', () => {
    const future = [pattern(3, '09:00', '17:00', { effectiveFrom: '2026-09-01' })];
    expect(rosteredWindowsForDate(WED, future, [], TZ)).toEqual([]);
  });

  it('respects the effective-to date', () => {
    const ended = [pattern(3, '09:00', '17:00', { effectiveTo: '2026-07-31' })];
    expect(rosteredWindowsForDate(WED, ended, [], TZ)).toEqual([]);
  });

  it('honours alternating-week rotas', () => {
    // 2026-08-12 falls in ISO week 33 — odd.
    const odd = [pattern(3, '09:00', '17:00', { weekParity: 'ODD' })];
    const even = [pattern(3, '09:00', '17:00', { weekParity: 'EVEN' })];
    expect(rosteredWindowsForDate(WED, odd, [], TZ)).toHaveLength(1);
    expect(rosteredWindowsForDate(WED, even, [], TZ)).toHaveLength(0);
    // The following Wednesday flips.
    expect(rosteredWindowsForDate('2026-08-19', odd, [], TZ)).toHaveLength(0);
    expect(rosteredWindowsForDate('2026-08-19', even, [], TZ)).toHaveLength(1);
  });

  it('lets a date-specific override replace the pattern', () => {
    const [w] = rosteredWindowsForDate(
      WED,
      weekday,
      [{ date: WED, isWorking: true, startsAt: '12:00', endsAt: '20:00' }],
      TZ,
    );
    expect(timeOf(w!.start)).toBe('12:00');
    expect(timeOf(w!.end)).toBe('20:00');
  });

  it('lets an override remove a working day entirely', () => {
    expect(
      rosteredWindowsForDate(WED, weekday, [{ date: WED, isWorking: false }], TZ),
    ).toEqual([]);
  });

  it('falls back to the pattern when an override says "working" without times', () => {
    const [w] = rosteredWindowsForDate(
      WED,
      weekday,
      [{ date: WED, isWorking: true }],
      TZ,
    );
    expect(timeOf(w!.start)).toBe('09:00');
  });

  it('merges two patterns on the same day into one continuous window', () => {
    const split = [pattern(3, '09:00', '13:00'), pattern(3, '13:00', '17:00')];
    const windows = rosteredWindowsForDate(WED, split, [], TZ);
    expect(windows).toHaveLength(1);
    expect(timeOf(windows[0]!.end)).toBe('17:00');
  });
});

describe('absenceIntervalsForDate', () => {
  it('removes a whole day', () => {
    const [a] = absenceIntervalsForDate(
      WED,
      [{ startDate: WED, endDate: WED }],
      TZ,
    );
    expect(timeOf(a!.start)).toBe('00:00');
  });

  it('covers every day of a multi-day absence', () => {
    const absence = [{ startDate: '2026-08-10', endDate: '2026-08-14' }];
    expect(absenceIntervalsForDate(WED, absence, TZ)).toHaveLength(1);
    expect(absenceIntervalsForDate('2026-08-15', absence, TZ)).toHaveLength(0);
  });

  it('removes only the morning for an AM half-day', () => {
    const [a] = absenceIntervalsForDate(
      WED,
      [{ startDate: WED, endDate: WED, isHalfDay: true, halfDayPeriod: 'AM' }],
      TZ,
    );
    expect(timeOf(a!.start)).toBe('00:00');
    expect(timeOf(a!.end)).toBe('13:00');
  });

  it('removes only the afternoon for a PM half-day', () => {
    const [a] = absenceIntervalsForDate(
      WED,
      [{ startDate: WED, endDate: WED, isHalfDay: true, halfDayPeriod: 'PM' }],
      TZ,
    );
    expect(timeOf(a!.start)).toBe('13:00');
  });
});

describe('computeWorkingWindows', () => {
  it('clips the stylist rota to the salon opening hours', () => {
    // Stylist rostered 07:00–22:00 but the salon opens 08:00–20:00.
    const eager = stylist('ana', { patterns: [pattern(3, '07:00', '22:00')] });
    const [w] = windowsOn(WED, eager);
    expect(timeOf(w!.start)).toBe('08:00');
    expect(timeOf(w!.end)).toBe('20:00');
  });

  it('returns nothing when the salon is closed, whatever the rota says', () => {
    const sundayWorker = stylist('ana', { patterns: [pattern(0, '09:00', '17:00')] });
    expect(windowsOn(SUN, sundayWorker)).toEqual([]);
  });

  it('returns nothing for a stylist who is not bookable', () => {
    expect(windowsOn(WED, stylist('reception', { isBookable: false }))).toEqual([]);
  });

  it('removes approved absence', () => {
    const onLeave = stylist('ana', {
      absences: [{ startDate: WED, endDate: WED }],
    });
    expect(windowsOn(WED, onLeave)).toEqual([]);
  });

  it('leaves the afternoon bookable after an AM half-day', () => {
    const halfDay = stylist('ana', {
      absences: [{ startDate: WED, endDate: WED, isHalfDay: true, halfDayPeriod: 'AM' }],
    });
    const [w] = windowsOn(WED, halfDay);
    expect(timeOf(w!.start)).toBe('13:00');
    expect(timeOf(w!.end)).toBe('17:00');
  });

  it('carves out a lunch break, splitting the day in two', () => {
    const withLunch = stylist('ana', {
      timeBlocks: [{ startsAt: at(WED, '12:00'), endsAt: at(WED, '13:00') }],
    });
    const windows = windowsOn(WED, withLunch);
    expect(windows).toHaveLength(2);
    expect(timeOf(windows[0]!.end)).toBe('12:00');
    expect(timeOf(windows[1]!.start)).toBe('13:00');
  });

  it('clips results to the requested range', () => {
    const windows = computeWorkingWindows({
      stylist: stylist('ana'),
      from: at(WED, '10:00'),
      to: at(WED, '12:00'),
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
    });
    expect(timeOf(windows[0]!.start)).toBe('10:00');
    expect(timeOf(windows[0]!.end)).toBe('12:00');
  });

  it('spans several days in one call', () => {
    const windows = computeWorkingWindows({
      stylist: stylist('ana'),
      from: at('2026-08-10', '00:00'), // Monday
      to: at('2026-08-14', '23:59'), // Friday
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
    });
    expect(windows).toHaveLength(5);
  });

  it('keeps a shift eight hours long across the autumn clock change', () => {
    // 2026-10-25 is the Sunday the clocks go back; check the Monday after.
    const windows = computeWorkingWindows({
      stylist: stylist('ana'),
      from: at('2026-10-26', '00:00'),
      to: at('2026-10-26', '23:59'),
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
    });
    expect(windows).toHaveLength(1);
    expect(windows[0]!.end - windows[0]!.start).toBe(8 * 3_600_000);
    expect(timeOf(windows[0]!.start)).toBe('09:00');
  });
});
