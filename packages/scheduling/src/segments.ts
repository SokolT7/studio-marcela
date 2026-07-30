/**
 * Turns a basket of services into a single timeline of phases, then projects
 * that timeline onto absolute time.
 *
 * Services in a basket run **sequentially** — one client, one chair, one thing
 * after another. The interesting structure is *within* a service: a colour is
 * apply → develop → finish, and only the apply and finish phases hold the
 * stylist. That is what `availability.ts` exploits.
 */

import { type Interval, MINUTE_MS } from './interval.js';
import type { SegmentType, Service } from './types.js';

export interface PlannedSegment {
  readonly serviceId: string;
  readonly type: SegmentType;
  /** Minutes from the start of the appointment. */
  readonly offsetStartMin: number;
  readonly offsetEndMin: number;
  readonly requiresStylist: boolean;
  readonly requiresChair: boolean;
  readonly resourceType?: string;
}

export interface ServicePlan {
  readonly segments: readonly PlannedSegment[];
  readonly totalDurationMin: number;
  readonly bufferBeforeMin: number;
  readonly bufferAfterMin: number;
  readonly minimumNoticeHours: number;
  /** The whole basket may overlap only if every service in it may. */
  readonly allowOverlap: boolean;
}

export class EmptyBasketError extends Error {
  constructor() {
    super('Cannot build a plan from an empty basket of services');
    this.name = 'EmptyBasketError';
  }
}

export class InvalidServiceError extends Error {
  constructor(serviceId: string, detail: string) {
    super(`Service "${serviceId}" is invalid: ${detail}`);
    this.name = 'InvalidServiceError';
  }
}

/**
 * Flatten services into one ordered timeline.
 *
 * Buffers take the maximum across the basket rather than summing: they express
 * the room a service needs around it, not work to be performed. Minimum notice
 * takes the maximum too — a basket is only as spontaneous as its most demanding
 * service.
 */
export function buildServicePlan(services: readonly Service[]): ServicePlan {
  if (services.length === 0) throw new EmptyBasketError();

  const segments: PlannedSegment[] = [];
  let cursor = 0;

  for (const service of services) {
    if (service.segments.length === 0) {
      throw new InvalidServiceError(service.id, 'it has no segments');
    }

    const ordered = [...service.segments].sort((a, b) => a.sequence - b.sequence);
    for (const segment of ordered) {
      if (segment.durationMin <= 0) {
        throw new InvalidServiceError(
          service.id,
          `segment ${segment.sequence} has a non-positive duration`,
        );
      }
      segments.push({
        serviceId: service.id,
        type: segment.type,
        offsetStartMin: cursor,
        offsetEndMin: cursor + segment.durationMin,
        requiresStylist: segment.requiresStylist,
        requiresChair: segment.requiresChair,
        ...(segment.resourceType !== undefined
          ? { resourceType: segment.resourceType }
          : {}),
      });
      cursor += segment.durationMin;
    }
  }

  return {
    segments,
    totalDurationMin: cursor,
    bufferBeforeMin: Math.max(...services.map((s) => s.bufferBeforeMin)),
    bufferAfterMin: Math.max(...services.map((s) => s.bufferAfterMin)),
    minimumNoticeHours: Math.max(...services.map((s) => s.minimumNoticeHours)),
    allowOverlap: services.every((s) => s.allowOverlap),
  };
}

export interface ProjectedAppointment {
  /** Chair occupancy — start to finish, buffers excluded. */
  readonly span: Interval;
  /** Span widened by buffers; what must be clear of other clients. */
  readonly blockedSpan: Interval;
  /** Only the phases that hold the stylist. */
  readonly activeIntervals: readonly Interval[];
  /** Phases that release the stylist while the client waits. */
  readonly passiveIntervals: readonly Interval[];
  readonly resourceUsage: readonly { type: string; interval: Interval }[];
}

/** Place a plan at an absolute start instant. */
export function projectPlan(plan: ServicePlan, startInstant: number): ProjectedAppointment {
  const span: Interval = {
    start: startInstant,
    end: startInstant + plan.totalDurationMin * MINUTE_MS,
  };

  const activeIntervals: Interval[] = [];
  const passiveIntervals: Interval[] = [];
  const resourceUsage: { type: string; interval: Interval }[] = [];

  for (const segment of plan.segments) {
    const interval: Interval = {
      start: startInstant + segment.offsetStartMin * MINUTE_MS,
      end: startInstant + segment.offsetEndMin * MINUTE_MS,
    };
    if (segment.requiresStylist) activeIntervals.push(interval);
    else passiveIntervals.push(interval);

    if (segment.resourceType) {
      resourceUsage.push({ type: segment.resourceType, interval });
    }
  }

  return {
    span,
    blockedSpan: {
      start: span.start - plan.bufferBeforeMin * MINUTE_MS,
      end: span.end + plan.bufferAfterMin * MINUTE_MS,
    },
    activeIntervals,
    passiveIntervals,
    resourceUsage,
  };
}

/** Total minutes the stylist is actually occupied — the real cost of a basket. */
export function activeMinutes(plan: ServicePlan): number {
  return plan.segments
    .filter((s) => s.requiresStylist)
    .reduce((total, s) => total + (s.offsetEndMin - s.offsetStartMin), 0);
}

/** Minutes the client waits while the stylist is free. The capacity dividend. */
export function passiveMinutes(plan: ServicePlan): number {
  return plan.totalDurationMin - activeMinutes(plan);
}
