import { describe, expect, it } from 'vitest';
import {
  EmptyBasketError,
  InvalidServiceError,
  activeMinutes,
  buildServicePlan,
  passiveMinutes,
  projectPlan,
} from '../src/segments.js';
import { MINUTE_MS } from '../src/interval.js';
import { colourService, segment, simpleService } from './fixtures.js';

describe('buildServicePlan', () => {
  it('lays a single service out from zero', () => {
    const plan = buildServicePlan([simpleService('sisanje', 45)]);
    expect(plan.totalDurationMin).toBe(45);
    expect(plan.segments).toHaveLength(1);
    expect(plan.segments[0]).toMatchObject({ offsetStartMin: 0, offsetEndMin: 45 });
  });

  it('runs a basket sequentially', () => {
    const plan = buildServicePlan([
      simpleService('sisanje', 45),
      simpleService('fen', 30),
    ]);
    expect(plan.totalDurationMin).toBe(75);
    expect(plan.segments.map((s) => [s.offsetStartMin, s.offsetEndMin])).toEqual([
      [0, 45],
      [45, 75],
    ]);
  });

  it('preserves the active/passive structure of a colour', () => {
    const plan = buildServicePlan([colourService()]);
    expect(plan.totalDurationMin).toBe(120);
    expect(plan.segments.map((s) => s.type)).toEqual(['ACTIVE', 'PASSIVE', 'ACTIVE']);
    expect(plan.segments.map((s) => s.requiresStylist)).toEqual([true, false, true]);
  });

  it('orders segments by sequence, not by array position', () => {
    const scrambled = {
      ...colourService(),
      segments: [segment(3, 'ACTIVE', 40), segment(1, 'ACTIVE', 45), segment(2, 'PASSIVE', 35)],
    };
    const plan = buildServicePlan([scrambled]);
    expect(plan.segments.map((s) => s.type)).toEqual(['ACTIVE', 'PASSIVE', 'ACTIVE']);
    expect(plan.segments.map((s) => s.offsetStartMin)).toEqual([0, 45, 80]);
  });

  it('takes the maximum buffer across the basket, not the sum', () => {
    const plan = buildServicePlan([
      simpleService('a', 30, { bufferBeforeMin: 5, bufferAfterMin: 10 }),
      simpleService('b', 30, { bufferBeforeMin: 15, bufferAfterMin: 0 }),
    ]);
    expect(plan.bufferBeforeMin).toBe(15);
    expect(plan.bufferAfterMin).toBe(10);
  });

  it('takes the most demanding minimum notice in the basket', () => {
    const plan = buildServicePlan([
      simpleService('a', 30, { minimumNoticeHours: 2 }),
      simpleService('b', 30, { minimumNoticeHours: 24 }),
    ]);
    expect(plan.minimumNoticeHours).toBe(24);
  });

  it('refuses overlap for the whole basket if any one service refuses it', () => {
    expect(
      buildServicePlan([simpleService('a', 30), simpleService('b', 30)]).allowOverlap,
    ).toBe(true);
    expect(
      buildServicePlan([
        simpleService('a', 30),
        simpleService('vjencana', 90, { allowOverlap: false }),
      ]).allowOverlap,
    ).toBe(false);
  });

  it('rejects an empty basket', () => {
    expect(() => buildServicePlan([])).toThrow(EmptyBasketError);
  });

  it('rejects a service with no segments', () => {
    expect(() => buildServicePlan([{ ...simpleService('x', 30), segments: [] }])).toThrow(
      InvalidServiceError,
    );
  });

  it('rejects a segment with a non-positive duration', () => {
    const broken = { ...simpleService('x', 30), segments: [segment(1, 'ACTIVE', 0)] };
    expect(() => buildServicePlan([broken])).toThrow(InvalidServiceError);
  });
});

describe('projectPlan', () => {
  const start = Date.UTC(2026, 7, 12, 7, 0);

  it('places the chair span across the whole appointment', () => {
    const plan = buildServicePlan([colourService()]);
    const projected = projectPlan(plan, start);
    expect(projected.span).toEqual({ start, end: start + 120 * MINUTE_MS });
  });

  it('exposes only the phases that hold the stylist as active', () => {
    const projected = projectPlan(buildServicePlan([colourService()]), start);
    expect(projected.activeIntervals).toEqual([
      { start, end: start + 45 * MINUTE_MS },
      { start: start + 80 * MINUTE_MS, end: start + 120 * MINUTE_MS },
    ]);
    expect(projected.passiveIntervals).toEqual([
      { start: start + 45 * MINUTE_MS, end: start + 80 * MINUTE_MS },
    ]);
  });

  it('widens the blocked span by the buffers', () => {
    const plan = buildServicePlan([
      simpleService('a', 60, { bufferBeforeMin: 10, bufferAfterMin: 20 }),
    ]);
    const projected = projectPlan(plan, start);
    expect(projected.blockedSpan).toEqual({
      start: start - 10 * MINUTE_MS,
      end: start + 80 * MINUTE_MS,
    });
  });

  it('records resource usage only for the segments that need it', () => {
    const withBasin = {
      ...simpleService('pranje', 40),
      segments: [segment(1, 'ACTIVE', 15, 'BASIN'), segment(2, 'ACTIVE', 25)],
    };
    const projected = projectPlan(buildServicePlan([withBasin]), start);
    expect(projected.resourceUsage).toEqual([
      { type: 'BASIN', interval: { start, end: start + 15 * MINUTE_MS } },
    ]);
  });
});

describe('capacity accounting', () => {
  it('separates the stylist cost of a colour from its elapsed time', () => {
    const plan = buildServicePlan([colourService()]);
    expect(plan.totalDurationMin).toBe(120);
    expect(activeMinutes(plan)).toBe(85);
    // 35 minutes per colour that a naive scheduler would throw away.
    expect(passiveMinutes(plan)).toBe(35);
  });

  it('reports no passive time for a straightforward cut', () => {
    const plan = buildServicePlan([simpleService('sisanje', 45)]);
    expect(passiveMinutes(plan)).toBe(0);
  });
});
