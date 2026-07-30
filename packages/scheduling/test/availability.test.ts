import { describe, expect, it } from 'vitest';
import {
  computeAvailability,
  evaluateCandidate,
  firstAvailableSlot,
  hasRequiredSkills,
  mergeSlotsAcrossStylists,
} from '../src/availability.js';
import { buildServicePlan } from '../src/segments.js';
import { computeWorkingWindows } from '../src/workingWindows.js';
import type { AvailabilityRequest } from '../src/types.js';
import {
  TZ,
  at,
  colourService,
  existingAppointment,
  pattern,
  salonHours,
  segment,
  simpleService,
  skill,
  stylist,
  timeOf,
} from './fixtures.js';

/** 2026-08-12, a Wednesday. */
const DAY = '2026-08-12';

function request(overrides: Partial<AvailabilityRequest> = {}): AvailabilityRequest {
  return {
    from: at(DAY, '09:00'),
    to: at(DAY, '17:00'),
    now: at('2026-08-01', '09:00'), // well clear of any minimum notice
    timeZone: TZ,
    salonHours: salonHours(),
    salonExceptions: [],
    stylists: [stylist('ana')],
    services: [simpleService('sisanje', 60)],
    resources: [],
    existingAppointments: [],
    ...overrides,
  };
}

const times = (r: AvailabilityRequest): string[] =>
  computeAvailability(r).map((s) => timeOf(s.start));

describe('an empty diary', () => {
  it('offers every aligned start that fits before the shift ends', () => {
    const slots = times(request());
    expect(slots[0]).toBe('09:00');
    // A 60-minute service in a 09:00–17:00 shift can start no later than 16:00.
    expect(slots.at(-1)).toBe('16:00');
    expect(slots).toHaveLength(29); // 09:00 → 16:00 at 15-minute steps
  });

  it('honours a custom granularity', () => {
    const slots = times(request({ slotGranularityMin: 60 }));
    expect(slots).toEqual([
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
    ]);
  });

  it('reports the first available slot', () => {
    const first = firstAvailableSlot(request());
    expect(first).not.toBeNull();
    expect(timeOf(first!.start)).toBe('09:00');
    expect(first!.usesOverlap).toBe(false);
  });

  it('returns null when nothing is available', () => {
    expect(firstAvailableSlot(request({ stylists: [] }))).toBeNull();
  });
});

describe('minimum notice', () => {
  it('excludes slots inside the notice period', () => {
    const slots = times(
      request({
        now: at(DAY, '10:00'),
        services: [simpleService('bojanje', 60, { minimumNoticeHours: 4 })],
      }),
    );
    // 4 hours' notice from 10:00 means nothing before 14:00.
    expect(slots[0]).toBe('14:00');
  });

  it('allows same-moment booking when no notice is required', () => {
    const slots = times(request({ now: at(DAY, '11:00') }));
    expect(slots[0]).toBe('11:00');
  });
});

describe('skills', () => {
  it('excludes a stylist not certified for a service in the basket', () => {
    const untrained = stylist('marko', { skills: [skill('sisanje')] });
    expect(
      computeAvailability(
        request({ stylists: [untrained], services: [colourService()] }),
      ),
    ).toEqual([]);
  });

  it('excludes a trainee from online booking', () => {
    const trainee = stylist('junior', { skills: [skill('sisanje', 'IN_TRAINING')] });
    expect(computeAvailability(request({ stylists: [trainee] }))).toEqual([]);
  });

  it('accepts a trainer', () => {
    const trainer = stylist('senior', { skills: [skill('sisanje', 'TRAINER')] });
    expect(computeAvailability(request({ stylists: [trainer] })).length).toBeGreaterThan(0);
  });

  it('treats a lapsed certification as no certification', () => {
    const lapsed = stylist('ana', {
      skills: [skill('sisanje', 'CERTIFIED', '2026-01-01')],
    });
    expect(computeAvailability(request({ stylists: [lapsed] }))).toEqual([]);
  });

  it('checks every service in a multi-service basket', () => {
    const partial = stylist('ana', { skills: [skill('sisanje')] });
    expect(
      hasRequiredSkills(partial, ['sisanje'], DAY),
    ).toBe(true);
    expect(
      hasRequiredSkills(partial, ['sisanje', 'bojanje'], DAY),
    ).toBe(false);
  });
});

describe('an existing appointment in the diary', () => {
  const booked = existingAppointment({
    id: 'a1',
    stylistId: 'ana',
    date: DAY,
    startTime: '10:00',
    segments: [['ACTIVE', 60]],
  });

  it('blocks the time it occupies', () => {
    const slots = times(request({ existingAppointments: [booked] }));
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('09:30'); // a 60-min service would run into it
  });

  it('allows a booking that finishes exactly as it begins', () => {
    expect(times(request({ existingAppointments: [booked] }))).toContain('09:00');
  });

  it('allows a booking that starts exactly as it ends', () => {
    expect(times(request({ existingAppointments: [booked] }))).toContain('11:00');
  });

  it('respects buffers around the existing appointment', () => {
    const buffered = existingAppointment({
      id: 'a1',
      stylistId: 'ana',
      date: DAY,
      startTime: '10:00',
      segments: [['ACTIVE', 60]],
      bufferBeforeMin: 15,
      bufferAfterMin: 15,
    });
    const slots = times(request({ existingAppointments: [buffered] }));
    expect(slots).not.toContain('09:00'); // would end at 10:00, inside the buffer
    expect(slots).not.toContain('11:00'); // starts inside the trailing buffer
    expect(slots).toContain('11:15');
  });

  it('ignores appointments belonging to a different stylist', () => {
    const other = { ...booked, stylistId: 'marko' };
    expect(times(request({ existingAppointments: [other] }))).toContain('10:00');
  });
});

/**
 * Processing-time overlap — IMPLEMENTATION_PLAN.md §9.5.
 *
 * A colour releases the stylist while it develops. Selling that released time
 * is the single most valuable behaviour in this engine, so it is pinned down
 * from every direction.
 */
describe('processing-time overlap', () => {
  // Colour for client A: apply 09:00–09:45, develop 09:45–10:20, finish 10:20–11:00.
  const colourInProgress = existingAppointment({
    id: 'colour-a',
    stylistId: 'ana',
    date: DAY,
    startTime: '09:00',
    segments: [
      ['ACTIVE', 45],
      ['PASSIVE', 35],
      ['ACTIVE', 40],
    ],
  });

  const cutRequest = (overrides: Partial<AvailabilityRequest> = {}) =>
    request({
      services: [simpleService('sisanje', 30)],
      existingAppointments: [colourInProgress],
      ...overrides,
    });

  it('sells the development window to a second client', () => {
    const slots = times(cutRequest());
    // 09:45–10:15 sits entirely inside the 35-minute developing phase.
    expect(slots).toContain('09:45');
  });

  it('marks such a slot as relying on overlap', () => {
    const slot = computeAvailability(cutRequest()).find(
      (s) => timeOf(s.start) === '09:45',
    );
    expect(slot?.usesOverlap).toBe(true);
  });

  it('still refuses to put the stylist in two places at once', () => {
    const slots = times(cutRequest());
    expect(slots).not.toContain('09:00'); // during application
    expect(slots).not.toContain('10:30'); // during the finish
  });

  it('refuses a slot that would run past the end of the development window', () => {
    // A 45-minute cut cannot fit inside a 35-minute gap.
    const slots = times(cutRequest({ services: [simpleService('sisanje', 45)] }));
    expect(slots).not.toContain('09:45');
  });

  it('is disabled by the stylist-level switch', () => {
    const noOverlap = stylist('ana', { allowOverlap: false });
    expect(times(cutRequest({ stylists: [noOverlap] }))).not.toContain('09:45');
  });

  it('is disabled by a concurrency cap of one', () => {
    const soloOnly = stylist('ana', { maxConcurrentClients: 1 });
    expect(times(cutRequest({ stylists: [soloOnly] }))).not.toContain('09:45');
  });

  it('is disabled when the incoming service forbids it', () => {
    const bridal = simpleService('vjencana', 30, { allowOverlap: false });
    expect(times(cutRequest({ services: [bridal] }))).not.toContain('09:45');
  });

  it('is disabled when the existing appointment forbids it', () => {
    const protectedColour = { ...colourInProgress, allowOverlap: false };
    expect(
      times(cutRequest({ existingAppointments: [protectedColour] })),
    ).not.toContain('09:45');
  });

  it('will not stack a third client beyond the cap', () => {
    // Two clients already overlapping; a cap of 2 forbids a third.
    const second = existingAppointment({
      id: 'cut-b',
      stylistId: 'ana',
      date: DAY,
      startTime: '09:45',
      segments: [['ACTIVE', 30]],
    });
    const slots = times(
      cutRequest({ existingAppointments: [colourInProgress, second] }),
    );
    expect(slots).not.toContain('09:45');
    expect(slots).not.toContain('10:00');
  });

  it('keeps two clients from starting on top of each other', () => {
    // A colour whose application is very short, leaving a long passive window
    // immediately after it.
    const quickApply = existingAppointment({
      id: 'colour-c',
      stylistId: 'ana',
      date: DAY,
      startTime: '09:00',
      segments: [
        ['ACTIVE', 10],
        ['PASSIVE', 50],
        ['ACTIVE', 30],
      ],
    });
    const slots = times(
      cutRequest({
        existingAppointments: [quickApply],
        services: [simpleService('sisanje', 30)],
        slotGranularityMin: 5,
      }),
    );
    // 09:10 is free of active work but only ten minutes after the other client
    // sat down — too close together to run well.
    expect(slots).not.toContain('09:10');
    expect(slots).toContain('09:15');
  });
});

describe('shared resources', () => {
  const basinService = {
    ...simpleService('pranje', 30),
    segments: [segment(1, 'ACTIVE', 30, 'BASIN')],
  };
  // The default fixture stylist is not certified for `pranje`.
  const washer = stylist('ana', {
    skills: [skill('sisanje'), skill('bojanje'), skill('fen'), skill('pranje')],
  });

  it('allows a booking when a basin is free', () => {
    const slots = times(
      request({
        stylists: [washer],
        services: [basinService],
        resources: [{ type: 'BASIN', quantity: 1 }],
      }),
    );
    expect(slots).toContain('09:00');
  });

  it('refuses when the only basin is already in use', () => {
    const usingBasin = existingAppointment({
      id: 'wash',
      stylistId: 'marko',
      date: DAY,
      startTime: '09:00',
      segments: [['ACTIVE', 30, 'BASIN']],
    });
    const slots = times(
      request({
        stylists: [washer],
        services: [basinService],
        resources: [{ type: 'BASIN', quantity: 1 }],
        existingAppointments: [usingBasin],
      }),
    );
    expect(slots).not.toContain('09:00');
    expect(slots).toContain('09:30');
  });

  it('allows contention up to the pool size', () => {
    const usingBasin = existingAppointment({
      id: 'wash',
      stylistId: 'marko',
      date: DAY,
      startTime: '09:00',
      segments: [['ACTIVE', 30, 'BASIN']],
    });
    const slots = times(
      request({
        stylists: [washer],
        services: [basinService],
        resources: [{ type: 'BASIN', quantity: 2 }],
        existingAppointments: [usingBasin],
      }),
    );
    expect(slots).toContain('09:00');
  });

  it('refuses outright when the salon has no such resource', () => {
    expect(
      times(request({ stylists: [washer], services: [basinService], resources: [] })),
    ).toEqual([]);
  });
});

describe('filtering and merging', () => {
  const ana = stylist('ana');
  const marko = stylist('marko');

  it('returns slots for every eligible stylist', () => {
    const slots = computeAvailability(request({ stylists: [ana, marko] }));
    expect(new Set(slots.map((s) => s.stylistId))).toEqual(new Set(['ana', 'marko']));
  });

  it('can be narrowed to one stylist', () => {
    const slots = computeAvailability(
      request({ stylists: [ana, marko], stylistId: 'marko' }),
    );
    expect(slots.every((s) => s.stylistId === 'marko')).toBe(true);
  });

  it('sorts by time, then by stylist', () => {
    const slots = computeAvailability(request({ stylists: [marko, ana] }));
    expect(slots[0]!.stylistId).toBe('ana');
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i]!.start).toBeGreaterThanOrEqual(slots[i - 1]!.start);
    }
  });

  it('collapses to one slot per start time when merging', () => {
    const merged = mergeSlotsAcrossStylists(
      computeAvailability(request({ stylists: [ana, marko] })),
    );
    expect(new Set(merged.map((s) => s.start)).size).toBe(merged.length);
  });

  it('prefers a stylist with a clear diary over one relying on overlap', () => {
    const merged = mergeSlotsAcrossStylists([
      { start: 100, end: 200, stylistId: 'busy', usesOverlap: true },
      { start: 100, end: 200, stylistId: 'free', usesOverlap: false },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.stylistId).toBe('free');
  });

  it('skips a stylist marked not bookable', () => {
    const reception = stylist('reception', { isBookable: false });
    expect(computeAvailability(request({ stylists: [reception] }))).toEqual([]);
  });
});

describe('closures and absence', () => {
  it('offers nothing on a day the salon is shut', () => {
    expect(
      computeAvailability(
        request({
          from: at('2026-08-16', '09:00'), // Sunday
          to: at('2026-08-16', '17:00'),
        }),
      ),
    ).toEqual([]);
  });

  it('offers nothing on a public-holiday exception', () => {
    expect(
      computeAvailability(
        request({ salonExceptions: [{ date: DAY, isClosed: true }] }),
      ),
    ).toEqual([]);
  });

  it('offers nothing while the stylist is on approved leave', () => {
    const onLeave = stylist('ana', { absences: [{ startDate: DAY, endDate: DAY }] });
    expect(computeAvailability(request({ stylists: [onLeave] }))).toEqual([]);
  });

  it('works around a lunch break', () => {
    const withLunch = stylist('ana', {
      timeBlocks: [{ startsAt: at(DAY, '12:00'), endsAt: at(DAY, '13:00') }],
    });
    const slots = times(request({ stylists: [withLunch] }));
    expect(slots).not.toContain('11:30'); // would run into lunch
    expect(slots).toContain('11:00');
    expect(slots).toContain('13:00');
  });
});

describe('evaluateCandidate rejection reasons', () => {
  const ana = stylist('ana');
  const plan = buildServicePlan([simpleService('sisanje', 60)]);
  const workingWindows = computeWorkingWindows({
    stylist: ana,
    from: at(DAY, '00:00'),
    to: at(DAY, '23:59'),
    timeZone: TZ,
    salonHours: salonHours(),
    salonExceptions: [],
  });

  const evaluate = (start: number, overrides = {}) =>
    evaluateCandidate({
      stylist: ana,
      plan,
      start,
      now: at('2026-08-01', '09:00'),
      workingWindows,
      stylistAppointments: [],
      allAppointments: [],
      resources: [],
      minGapBetweenOverlappingStartsMin: 15,
      ...overrides,
    });

  it('accepts a clean candidate', () => {
    expect(evaluate(at(DAY, '10:00'))).toEqual({ ok: true, usesOverlap: false });
  });

  it('reports MINIMUM_NOTICE', () => {
    const result = evaluateCandidate({
      stylist: ana,
      plan: buildServicePlan([simpleService('x', 60, { minimumNoticeHours: 48 })]),
      start: at(DAY, '10:00'),
      now: at(DAY, '09:00'),
      workingWindows,
      stylistAppointments: [],
      allAppointments: [],
      resources: [],
      minGapBetweenOverlappingStartsMin: 15,
    });
    expect(result).toEqual({ ok: false, reason: 'MINIMUM_NOTICE' });
  });

  it('reports OUTSIDE_WORKING_HOURS before the shift', () => {
    expect(evaluate(at(DAY, '07:00'))).toEqual({
      ok: false,
      reason: 'OUTSIDE_WORKING_HOURS',
    });
  });

  it('reports OUTSIDE_WORKING_HOURS when the service overruns the shift', () => {
    expect(evaluate(at(DAY, '16:30'))).toEqual({
      ok: false,
      reason: 'OUTSIDE_WORKING_HOURS',
    });
  });

  it('reports STYLIST_BUSY on a direct clash', () => {
    const clash = existingAppointment({
      id: 'x',
      stylistId: 'ana',
      date: DAY,
      startTime: '10:00',
      segments: [['ACTIVE', 60]],
    });
    expect(evaluate(at(DAY, '10:00'), { stylistAppointments: [clash] })).toEqual({
      ok: false,
      reason: 'STYLIST_BUSY',
    });
  });

  it('reports OVERLAP_NOT_ALLOWED when a party has vetoed overlap', () => {
    const protectedAppt = existingAppointment({
      id: 'x',
      stylistId: 'ana',
      date: DAY,
      startTime: '10:00',
      segments: [['ACTIVE', 60]],
      allowOverlap: false,
    });
    expect(evaluate(at(DAY, '10:30'), { stylistAppointments: [protectedAppt] })).toEqual({
      ok: false,
      reason: 'OVERLAP_NOT_ALLOWED',
    });
  });

  it('reports RESOURCE_UNAVAILABLE when the salon has no such equipment', () => {
    const needsBasin = buildServicePlan([
      { ...simpleService('pranje', 30), segments: [segment(1, 'ACTIVE', 30, 'BASIN')] },
    ]);
    const result = evaluateCandidate({
      stylist: ana,
      plan: needsBasin,
      start: at(DAY, '10:00'),
      now: at('2026-08-01', '09:00'),
      workingWindows,
      stylistAppointments: [],
      allAppointments: [],
      resources: [],
      minGapBetweenOverlappingStartsMin: 15,
    });
    expect(result).toEqual({ ok: false, reason: 'RESOURCE_UNAVAILABLE' });
  });
});

describe('daylight saving', () => {
  it('produces a normal working day on the Monday after the clocks go back', () => {
    const slots = times(
      request({
        from: at('2026-10-26', '09:00'),
        to: at('2026-10-26', '17:00'),
        stylists: [stylist('ana', { patterns: [pattern(1, '09:00', '17:00')] })],
      }),
    );
    expect(slots[0]).toBe('09:00');
    expect(slots.at(-1)).toBe('16:00');
    expect(slots).toHaveLength(29);
  });

  it('produces a normal working day on the Monday after the clocks go forward', () => {
    const slots = times(
      request({
        from: at('2026-03-30', '09:00'),
        to: at('2026-03-30', '17:00'),
        now: at('2026-03-01', '09:00'),
        stylists: [stylist('ana', { patterns: [pattern(1, '09:00', '17:00')] })],
      }),
    );
    expect(slots[0]).toBe('09:00');
    expect(slots).toHaveLength(29);
  });
});
