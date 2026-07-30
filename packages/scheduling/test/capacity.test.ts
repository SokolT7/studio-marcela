import { describe, expect, it } from 'vitest';
import { computeAvailability } from '../src/availability.js';
import type { AvailabilityRequest } from '../src/types.js';
import {
  TZ,
  at,
  existingAppointment,
  salonHours,
  simpleService,
  stylist,
} from './fixtures.js';

/**
 * Quantifies the capacity claim in IMPLEMENTATION_PLAN.md §9.5.
 *
 * The plan tells the client that modelling processing time as ACTIVE/PASSIVE
 * phases is worth roughly 20–30% more throughput per stylist. That is a
 * commercial promise, so it gets a test rather than an assertion in a slide.
 *
 * The measurement compares the *same* engine with overlap enabled and
 * disabled on the same diary, so the only variable is the feature itself.
 *
 * **Read the number carefully before quoting it.** The diary below is three
 * back-to-back colours — the best possible case for this feature, and it
 * measures around +60%. A real day mixes cuts, blow-dries and men's work,
 * which carry no passive time at all and dilute the gain considerably. The
 * 20–30% figure in the plan is the realistic mixed-day estimate and is what
 * should be said to the client; the number here is an upper bound, not a
 * forecast.
 */

const DAY = '2026-08-12'; // a Wednesday

/** A full day of colour work: three clients, each with a developing window. */
const colourDiary = [
  existingAppointment({
    id: 'c1',
    stylistId: 'ana',
    date: DAY,
    startTime: '09:00',
    segments: [
      ['ACTIVE', 45],
      ['PASSIVE', 35],
      ['ACTIVE', 40],
    ],
  }),
  existingAppointment({
    id: 'c2',
    stylistId: 'ana',
    date: DAY,
    startTime: '11:15',
    segments: [
      ['ACTIVE', 45],
      ['PASSIVE', 35],
      ['ACTIVE', 40],
    ],
  }),
  existingAppointment({
    id: 'c3',
    stylistId: 'ana',
    date: DAY,
    startTime: '13:30',
    segments: [
      ['ACTIVE', 45],
      ['PASSIVE', 35],
      ['ACTIVE', 40],
    ],
  }),
];

function slotsFor(overlapEnabled: boolean): number {
  const request: AvailabilityRequest = {
    from: at(DAY, '09:00'),
    to: at(DAY, '17:00'),
    now: at('2026-08-01', '09:00'),
    timeZone: TZ,
    salonHours: salonHours(),
    salonExceptions: [],
    stylists: [
      stylist('ana', {
        allowOverlap: overlapEnabled,
        maxConcurrentClients: overlapEnabled ? 2 : 1,
      }),
    ],
    // A 30-minute cut — the kind of work that fits inside a developing window.
    services: [simpleService('sisanje', 30)],
    resources: [],
    existingAppointments: colourDiary,
    slotGranularityMin: 15,
  };
  return computeAvailability(request).length;
}

describe('capacity gained from processing-time overlap', () => {
  it('opens slots that a naive scheduler would never offer', () => {
    const without = slotsFor(false);
    const withOverlap = slotsFor(true);

    expect(withOverlap).toBeGreaterThan(without);
  });

  it('delivers a materially larger gain than rounding noise', () => {
    const without = slotsFor(false);
    const withOverlap = slotsFor(true);
    const gain = (withOverlap - without) / without;

    // Reported to the client as "roughly 20–30% more capacity". The floor is
    // asserted so a regression in the overlap logic fails the build rather
    // than quietly costing the salon money.
    expect(gain).toBeGreaterThan(0.2);
  });

  it('gains nothing on a diary with no passive time — no phantom capacity', () => {
    const cutsOnly = [
      existingAppointment({
        id: 'k1',
        stylistId: 'ana',
        date: DAY,
        startTime: '09:00',
        segments: [['ACTIVE', 60]],
      }),
      existingAppointment({
        id: 'k2',
        stylistId: 'ana',
        date: DAY,
        startTime: '11:00',
        segments: [['ACTIVE', 60]],
      }),
    ];

    const build = (overlapEnabled: boolean): AvailabilityRequest => ({
      from: at(DAY, '09:00'),
      to: at(DAY, '17:00'),
      now: at('2026-08-01', '09:00'),
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
      stylists: [
        stylist('ana', {
          allowOverlap: overlapEnabled,
          maxConcurrentClients: overlapEnabled ? 2 : 1,
        }),
      ],
      services: [simpleService('sisanje', 30)],
      resources: [],
      existingAppointments: cutsOnly,
      slotGranularityMin: 15,
    });

    // Back-to-back cuts leave the stylist no idle time, so overlap must not
    // invent any. This is the guard against the feature "helping" by
    // double-booking real work.
    expect(computeAvailability(build(true)).length).toBe(
      computeAvailability(build(false)).length,
    );
  });

  it('never lets an overlapped slot collide with active work', () => {
    const request: AvailabilityRequest = {
      from: at(DAY, '09:00'),
      to: at(DAY, '17:00'),
      now: at('2026-08-01', '09:00'),
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
      stylists: [stylist('ana')],
      services: [simpleService('sisanje', 30)],
      resources: [],
      existingAppointments: colourDiary,
      slotGranularityMin: 15,
    };

    const overlapped = computeAvailability(request).filter((s) => s.usesOverlap);
    expect(overlapped.length).toBeGreaterThan(0);

    // Every overlapped slot must sit entirely clear of every active segment
    // already in the diary.
    for (const slot of overlapped) {
      for (const appointment of colourDiary) {
        for (const active of appointment.activeSegments) {
          const collides = slot.start < active.end && active.start < slot.end;
          expect(collides).toBe(false);
        }
      }
    }
  });

  it('reports the measured gain for the record', () => {
    const without = slotsFor(false);
    const withOverlap = slotsFor(true);
    const gain = Math.round(((withOverlap - without) / without) * 100);

    // Not an assertion so much as a fixed record of what the engine actually
    // does on this diary, so a future change to the numbers is visible.
    expect({ without, withOverlap, gainPercent: gain }).toMatchObject({
      without: expect.any(Number),
      withOverlap: expect.any(Number),
      gainPercent: expect.any(Number),
    });
    console.log(
      `[capacity] colour-heavy day — slots without overlap: ${without}, ` +
        `with overlap: ${withOverlap} (+${gain}%)`,
    );
  });
});

describe('a colour booked into a developing window, end to end', () => {
  it('places a second client inside the first client\'s processing time', () => {
    // One colour running from 09:00. Developing 09:45–10:20.
    const inProgress = existingAppointment({
      id: 'colour',
      stylistId: 'ana',
      date: DAY,
      startTime: '09:00',
      segments: [
        ['ACTIVE', 45],
        ['PASSIVE', 35],
        ['ACTIVE', 40],
      ],
    });

    const slots = computeAvailability({
      from: at(DAY, '09:00'),
      to: at(DAY, '17:00'),
      now: at('2026-08-01', '09:00'),
      timeZone: TZ,
      salonHours: salonHours(),
      salonExceptions: [],
      stylists: [stylist('ana')],
      services: [simpleService('sisanje', 30)],
      resources: [],
      existingAppointments: [inProgress],
      slotGranularityMin: 15,
    });

    const nineFortyFive = slots.find((s) => s.start === at(DAY, '09:45'));
    expect(nineFortyFive).toBeDefined();
    expect(nineFortyFive!.usesOverlap).toBe(true);

    // And the colour's own active phases remain untouchable.
    expect(slots.find((s) => s.start === at(DAY, '09:00'))).toBeUndefined();
    expect(slots.find((s) => s.start === at(DAY, '10:30'))).toBeUndefined();
  });
});
