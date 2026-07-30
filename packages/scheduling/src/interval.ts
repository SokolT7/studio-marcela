/**
 * Interval arithmetic over absolute time.
 *
 * Every interval is a half-open range of UTC epoch milliseconds: `[start, end)`.
 * Half-open is deliberate — an appointment ending at 10:00 and one starting at
 * 10:00 do not overlap, which is exactly how a salon diary behaves.
 *
 * This module is pure: no dates, no timezones, no I/O. Timezone handling lives
 * in `timezone.ts` and never leaks in here.
 */

export interface Interval {
  /** Inclusive start, UTC epoch milliseconds. */
  readonly start: number;
  /** Exclusive end, UTC epoch milliseconds. */
  readonly end: number;
}

export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

export function minutes(n: number): number {
  return n * MINUTE_MS;
}

/** An interval with zero or negative length is empty and carries no time. */
export function isEmpty(i: Interval): boolean {
  return i.end <= i.start;
}

export function duration(i: Interval): number {
  return Math.max(0, i.end - i.start);
}

/** True when the two intervals share at least one instant. */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** True when `inner` lies entirely within `outer`. */
export function contains(outer: Interval, inner: Interval): boolean {
  return inner.start >= outer.start && inner.end <= outer.end;
}

export function containsInstant(i: Interval, t: number): boolean {
  return t >= i.start && t < i.end;
}

/**
 * Sort, merge and normalise a set of intervals into the smallest equivalent
 * set of non-overlapping, ascending intervals. Adjacent intervals that merely
 * touch (`[0,5)` and `[5,9)`) are joined, because as *busy* time they are
 * continuous.
 */
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  const sorted = intervals
    .filter((i) => !isEmpty(i))
    .slice()
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: Interval[] = [];
  for (const current of sorted) {
    const last = merged[merged.length - 1];
    if (last && current.start <= last.end) {
      if (current.end > last.end) {
        merged[merged.length - 1] = { start: last.start, end: current.end };
      }
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }
  return merged;
}

/**
 * Remove `holes` from `base`, returning what remains.
 * Used to carve absences, breaks and existing work out of working hours.
 */
export function subtractIntervals(
  base: readonly Interval[],
  holes: readonly Interval[],
): Interval[] {
  const normalisedHoles = mergeIntervals(holes);
  const result: Interval[] = [];

  for (const segment of mergeIntervals(base)) {
    let cursor = segment.start;

    for (const hole of normalisedHoles) {
      if (hole.end <= cursor) continue;
      if (hole.start >= segment.end) break;

      if (hole.start > cursor) {
        result.push({ start: cursor, end: Math.min(hole.start, segment.end) });
      }
      cursor = Math.max(cursor, hole.end);
      if (cursor >= segment.end) break;
    }

    if (cursor < segment.end) {
      result.push({ start: cursor, end: segment.end });
    }
  }

  return result.filter((i) => !isEmpty(i));
}

/** The set of instants present in both inputs. */
export function intersectIntervals(
  a: readonly Interval[],
  b: readonly Interval[],
): Interval[] {
  const left = mergeIntervals(a);
  const right = mergeIntervals(b);
  const result: Interval[] = [];

  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    const l = left[i]!;
    const r = right[j]!;
    const start = Math.max(l.start, r.start);
    const end = Math.min(l.end, r.end);
    if (start < end) result.push({ start, end });

    if (l.end < r.end) i++;
    else j++;
  }

  return result;
}

/** True when `probe` fits entirely inside any single interval of `windows`. */
export function fitsWithinAny(
  windows: readonly Interval[],
  probe: Interval,
): boolean {
  return windows.some((w) => contains(w, probe));
}

/** True when `probe` overlaps any interval in the set. */
export function overlapsAny(
  intervals: readonly Interval[],
  probe: Interval,
): boolean {
  return intervals.some((i) => overlaps(i, probe));
}

/**
 * The greatest number of `spans` overlapping at any single instant inside
 * `window`. Drives the concurrent-client cap for processing-time overlap
 * (IMPLEMENTATION_PLAN.md §9.5).
 */
export function maxConcurrencyWithin(
  spans: readonly Interval[],
  window: Interval,
): number {
  const relevant = spans.filter((s) => !isEmpty(s) && overlaps(s, window));
  if (relevant.length === 0) return 0;

  // Sweep line: +1 at each start, -1 at each end. Ends are processed before
  // starts at the same instant, because ranges are half-open.
  const events: Array<{ at: number; delta: number }> = [];
  for (const s of relevant) {
    events.push({ at: Math.max(s.start, window.start), delta: 1 });
    events.push({ at: Math.min(s.end, window.end), delta: -1 });
  }
  events.sort((a, b) => a.at - b.at || a.delta - b.delta);

  let current = 0;
  let peak = 0;
  for (const e of events) {
    current += e.delta;
    if (current > peak) peak = current;
  }
  return peak;
}

/**
 * Walk `windows` in `stepMs` increments, yielding every candidate start time
 * aligned to `alignTo` (an absolute epoch anchor, so alignment survives DST).
 */
export function* candidateStarts(
  windows: readonly Interval[],
  stepMs: number,
  alignTo: number,
): Generator<number> {
  if (stepMs <= 0) throw new RangeError('stepMs must be positive');

  for (const w of windows) {
    const offset = ((w.start - alignTo) % stepMs + stepMs) % stepMs;
    let t = offset === 0 ? w.start : w.start + (stepMs - offset);
    while (t < w.end) {
      yield t;
      t += stepMs;
    }
  }
}
