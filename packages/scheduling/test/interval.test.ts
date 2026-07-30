import { describe, expect, it } from 'vitest';
import {
  candidateStarts,
  contains,
  containsInstant,
  duration,
  fitsWithinAny,
  intersectIntervals,
  isEmpty,
  maxConcurrencyWithin,
  mergeIntervals,
  minutes,
  overlaps,
  overlapsAny,
  subtractIntervals,
} from '../src/interval.js';

const i = (start: number, end: number) => ({ start, end });

describe('basic predicates', () => {
  it('treats zero-length and inverted intervals as empty', () => {
    expect(isEmpty(i(5, 5))).toBe(true);
    expect(isEmpty(i(5, 4))).toBe(true);
    expect(isEmpty(i(4, 5))).toBe(false);
  });

  it('never reports a negative duration', () => {
    expect(duration(i(10, 4))).toBe(0);
    expect(duration(i(4, 10))).toBe(6);
  });

  it('treats ranges as half-open, so touching intervals do not overlap', () => {
    expect(overlaps(i(0, 10), i(10, 20))).toBe(false);
    expect(overlaps(i(0, 10), i(9, 20))).toBe(true);
    expect(overlaps(i(10, 20), i(0, 10))).toBe(false);
  });

  it('containsInstant excludes the end boundary', () => {
    expect(containsInstant(i(0, 10), 0)).toBe(true);
    expect(containsInstant(i(0, 10), 9)).toBe(true);
    expect(containsInstant(i(0, 10), 10)).toBe(false);
  });

  it('contains requires full enclosure', () => {
    expect(contains(i(0, 10), i(2, 8))).toBe(true);
    expect(contains(i(0, 10), i(0, 10))).toBe(true);
    expect(contains(i(0, 10), i(2, 11))).toBe(false);
  });

  it('converts minutes to milliseconds', () => {
    expect(minutes(90)).toBe(5_400_000);
  });
});

describe('mergeIntervals', () => {
  it('sorts, merges overlapping and joins touching intervals', () => {
    expect(mergeIntervals([i(10, 20), i(0, 5), i(4, 12)])).toEqual([i(0, 20)]);
  });

  it('joins intervals that merely touch, because busy time is continuous', () => {
    expect(mergeIntervals([i(0, 5), i(5, 9)])).toEqual([i(0, 9)]);
  });

  it('keeps genuinely separate intervals apart', () => {
    expect(mergeIntervals([i(0, 5), i(6, 9)])).toEqual([i(0, 5), i(6, 9)]);
  });

  it('drops empty intervals', () => {
    expect(mergeIntervals([i(0, 0), i(3, 3), i(1, 2)])).toEqual([i(1, 2)]);
  });

  it('absorbs a fully nested interval', () => {
    expect(mergeIntervals([i(0, 100), i(20, 30)])).toEqual([i(0, 100)]);
  });

  it('returns an empty array for no input', () => {
    expect(mergeIntervals([])).toEqual([]);
  });
});

describe('subtractIntervals', () => {
  it('punches a hole in the middle', () => {
    expect(subtractIntervals([i(0, 100)], [i(40, 60)])).toEqual([i(0, 40), i(60, 100)]);
  });

  it('trims from the start and the end', () => {
    expect(subtractIntervals([i(0, 100)], [i(0, 20)])).toEqual([i(20, 100)]);
    expect(subtractIntervals([i(0, 100)], [i(80, 100)])).toEqual([i(0, 80)]);
  });

  it('removes an interval entirely when fully covered', () => {
    expect(subtractIntervals([i(10, 20)], [i(0, 100)])).toEqual([]);
  });

  it('ignores holes that do not intersect', () => {
    expect(subtractIntervals([i(0, 10)], [i(50, 60)])).toEqual([i(0, 10)]);
  });

  it('handles multiple holes across multiple bases', () => {
    expect(
      subtractIntervals([i(0, 50), i(100, 150)], [i(10, 20), i(120, 130)]),
    ).toEqual([i(0, 10), i(20, 50), i(100, 120), i(130, 150)]);
  });

  it('handles overlapping holes without producing gaps', () => {
    expect(subtractIntervals([i(0, 100)], [i(10, 50), i(40, 70)])).toEqual([
      i(0, 10),
      i(70, 100),
    ]);
  });
});

describe('intersectIntervals', () => {
  it('returns the shared portion', () => {
    expect(intersectIntervals([i(0, 50)], [i(20, 80)])).toEqual([i(20, 50)]);
  });

  it('returns nothing when there is no shared time', () => {
    expect(intersectIntervals([i(0, 10)], [i(20, 30)])).toEqual([]);
  });

  it('handles many-to-many intersection', () => {
    expect(
      intersectIntervals([i(0, 30), i(40, 80)], [i(10, 50), i(60, 100)]),
    ).toEqual([i(10, 30), i(40, 50), i(60, 80)]);
  });

  it('excludes touching-only boundaries', () => {
    expect(intersectIntervals([i(0, 10)], [i(10, 20)])).toEqual([]);
  });
});

describe('fitsWithinAny / overlapsAny', () => {
  it('requires a probe to fit inside one single window, not a union', () => {
    // Two touching windows merge conceptually but are separate entries here.
    expect(fitsWithinAny([i(0, 10), i(10, 20)], i(5, 15))).toBe(false);
    expect(fitsWithinAny([i(0, 20)], i(5, 15))).toBe(true);
  });

  it('detects any overlap in a set', () => {
    expect(overlapsAny([i(0, 10), i(50, 60)], i(55, 70))).toBe(true);
    expect(overlapsAny([i(0, 10), i(50, 60)], i(20, 30))).toBe(false);
  });
});

describe('maxConcurrencyWithin', () => {
  it('returns zero when nothing overlaps the window', () => {
    expect(maxConcurrencyWithin([i(0, 10)], i(50, 60))).toBe(0);
  });

  it('counts a single overlapping span', () => {
    expect(maxConcurrencyWithin([i(0, 100)], i(10, 20))).toBe(1);
  });

  it('finds the peak of stacked spans', () => {
    expect(maxConcurrencyWithin([i(0, 100), i(10, 90), i(20, 30)], i(0, 100))).toBe(3);
  });

  it('does not count spans that only touch the window', () => {
    expect(maxConcurrencyWithin([i(0, 10)], i(10, 20))).toBe(0);
  });

  it('does not stack spans that merely hand over', () => {
    // 0–10 ends exactly as 10–20 begins: never two at once.
    expect(maxConcurrencyWithin([i(0, 10), i(10, 20)], i(0, 20))).toBe(1);
  });

  it('ignores empty spans', () => {
    expect(maxConcurrencyWithin([i(5, 5), i(0, 10)], i(0, 10))).toBe(1);
  });
});

describe('candidateStarts', () => {
  it('steps through a window at the given granularity', () => {
    const out = [...candidateStarts([i(0, 50)], 15, 0)];
    expect(out).toEqual([0, 15, 30, 45]);
  });

  it('aligns to the anchor rather than to the window start', () => {
    // Anchor 0, step 15, window starting at 7 → first aligned start is 15.
    expect([...candidateStarts([i(7, 50)], 15, 0)]).toEqual([15, 30, 45]);
  });

  it('yields nothing for a window shorter than one step', () => {
    expect([...candidateStarts([i(1, 5)], 15, 0)]).toEqual([]);
  });

  it('walks multiple windows', () => {
    expect([...candidateStarts([i(0, 20), i(60, 80)], 10, 0)]).toEqual([0, 10, 60, 70]);
  });

  it('handles an anchor later than the window without going negative', () => {
    expect([...candidateStarts([i(0, 40)], 10, 100)]).toEqual([0, 10, 20, 30]);
  });

  it('rejects a non-positive step rather than looping forever', () => {
    expect(() => [...candidateStarts([i(0, 10)], 0, 0)]).toThrow(RangeError);
  });
});
