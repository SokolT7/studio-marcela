/**
 * The availability engine.
 *
 * Answers one question: given a salon, a stylist roster, a basket of services
 * and everything already in the diary, which start times can a client actually
 * book?
 *
 * The rules are enumerated in IMPLEMENTATION_PLAN.md §9.5. The one that earns
 * its keep is processing-time overlap: a colour releases the stylist while it
 * develops, and that released time is real, sellable capacity. Handling it
 * correctly is worth roughly 20–30% more throughput per stylist, and handling
 * it *incorrectly* means double-booking a human being, so every rule below is
 * conservative by default and every relaxation is explicit.
 */

import {
  type Interval,
  HOUR_MS,
  MINUTE_MS,
  candidateStarts,
  fitsWithinAny,
  maxConcurrencyWithin,
  overlaps,
  overlapsAny,
} from './interval.js';
import { buildServicePlan, projectPlan, type ServicePlan } from './segments.js';
import { computeWorkingWindows } from './workingWindows.js';
import { localDateString } from './timezone.js';
import type {
  AvailabilityRequest,
  AvailableSlot,
  ExistingAppointment,
  RejectionReason,
  ResourcePool,
  Stylist,
} from './types.js';

export const DEFAULT_SLOT_GRANULARITY_MIN = 15;
export const DEFAULT_MIN_GAP_BETWEEN_OVERLAPPING_STARTS_MIN = 15;

export type CandidateEvaluation =
  | { readonly ok: true; readonly usesOverlap: boolean }
  | { readonly ok: false; readonly reason: RejectionReason };

/**
 * Whether a stylist is cleared for every service in the basket.
 *
 * `IN_TRAINING` is deliberately excluded from online booking: a trainee may
 * only be scheduled by a manager who can confirm a trainer is on the floor
 * (IMPLEMENTATION_PLAN.md §10.5). An expired certification is treated as no
 * certification.
 */
export function hasRequiredSkills(
  stylist: Stylist,
  serviceIds: readonly string[],
  onDate: string,
): boolean {
  return serviceIds.every((serviceId) => {
    const skill = stylist.skills.find((s) => s.serviceId === serviceId);
    if (!skill) return false;
    if (skill.level !== 'CERTIFIED' && skill.level !== 'TRAINER') return false;
    if (skill.expiresAt && skill.expiresAt < onDate) return false;
    return true;
  });
}

function resourceCapacity(resources: readonly ResourcePool[], type: string): number {
  return resources.find((r) => r.type === type)?.quantity ?? 0;
}

/**
 * Is overlap permitted between a proposed booking and one already in the diary?
 *
 * Every party has a veto: the stylist's own setting, the new basket, the
 * existing appointment, and the concurrency cap.
 */
function overlapPermitted(
  stylist: Stylist,
  plan: ServicePlan,
  existing: ExistingAppointment,
): boolean {
  return (
    stylist.allowOverlap &&
    plan.allowOverlap &&
    existing.allowOverlap &&
    stylist.maxConcurrentClients > 1
  );
}

/**
 * Active work with its buffers attached.
 *
 * A buffer is setup time before an appointment and clearing-down time after it,
 * so it belongs to the outer edges of the stylist's active work — not to every
 * phase, and not to the passive middle. Extending only the first and last
 * active segments keeps buffers meaningful in overlap mode: a second client may
 * still be slotted into a development window, but not butted up against the
 * moment the stylist puts their scissors down.
 */
function activeIntervalsWithBuffers(
  activeIntervals: readonly Interval[],
  bufferBeforeMs: number,
  bufferAfterMs: number,
): Interval[] {
  if (activeIntervals.length === 0) return [];
  const ordered = [...activeIntervals].sort((a, b) => a.start - b.start);
  const first = ordered[0]!;
  const last = ordered[ordered.length - 1]!;

  return ordered.map((interval) => ({
    start: interval === first ? interval.start - bufferBeforeMs : interval.start,
    end: interval === last ? interval.end + bufferAfterMs : interval.end,
  }));
}

export interface EvaluateCandidateOptions {
  readonly stylist: Stylist;
  readonly plan: ServicePlan;
  readonly start: number;
  readonly now: number;
  readonly workingWindows: readonly Interval[];
  readonly stylistAppointments: readonly ExistingAppointment[];
  readonly allAppointments: readonly ExistingAppointment[];
  readonly resources: readonly ResourcePool[];
  readonly minGapBetweenOverlappingStartsMin: number;
}

/**
 * Evaluate one candidate start time against every rule.
 * Returns the first failure, which makes rejections explainable in the UI and
 * precise in tests.
 */
export function evaluateCandidate(options: EvaluateCandidateOptions): CandidateEvaluation {
  const {
    stylist,
    plan,
    start,
    now,
    workingWindows,
    stylistAppointments,
    allAppointments,
    resources,
    minGapBetweenOverlappingStartsMin,
  } = options;

  // 1. Minimum notice. A colour cannot be booked for twenty minutes' time.
  if (start - now < plan.minimumNoticeHours * HOUR_MS) {
    return { ok: false, reason: 'MINIMUM_NOTICE' };
  }

  const projected = projectPlan(plan, start);

  // 2. The whole appointment must sit inside a single stretch of working time.
  //    Working windows already have salon hours, absences and blocks removed,
  //    so this one check covers all of them.
  if (!fitsWithinAny(workingWindows, projected.span)) {
    return { ok: false, reason: 'OUTSIDE_WORKING_HOURS' };
  }

  const minGapMs = minGapBetweenOverlappingStartsMin * MINUTE_MS;

  const candidateActiveBuffered = activeIntervalsWithBuffers(
    projected.activeIntervals,
    plan.bufferBeforeMin * MINUTE_MS,
    plan.bufferAfterMin * MINUTE_MS,
  );

  // 3. Compare against everything already booked for this stylist.
  for (const existing of stylistAppointments) {
    const sharesTime = overlaps(existing.blockedSpan, projected.blockedSpan);
    if (!sharesTime) continue;

    if (overlapPermitted(stylist, plan, existing)) {
      // Overlap mode: the stylist's hands may only be in one place at a time,
      // but the chairs may both be full. Buffers still apply to the edges of
      // each party's active work.
      const existingActiveBuffered = activeIntervalsWithBuffers(
        existing.activeSegments,
        existing.span.start - existing.blockedSpan.start,
        existing.blockedSpan.end - existing.span.end,
      );

      if (
        candidateActiveBuffered.some((candidateActive) =>
          overlapsAny(existingActiveBuffered, candidateActive),
        )
      ) {
        return { ok: false, reason: 'STYLIST_BUSY' };
      }

      // Two clients starting within moments of each other is technically legal
      // and practically chaos.
      if (
        overlaps(existing.span, projected.span) &&
        Math.abs(existing.span.start - projected.span.start) < minGapMs
      ) {
        return { ok: false, reason: 'MIN_GAP' };
      }
    } else {
      // No overlap: buffered spans must not touch at all.
      return {
        ok: false,
        reason:
          stylist.allowOverlap && plan.allowOverlap && existing.allowOverlap
            ? 'STYLIST_BUSY'
            : 'OVERLAP_NOT_ALLOWED',
      };
    }
  }

  // 4. Concurrency cap — how many clients this stylist may hold at once.
  const existingSpans = stylistAppointments.map((a) => a.span);
  const peakExisting = maxConcurrencyWithin(existingSpans, projected.span);
  if (peakExisting + 1 > stylist.maxConcurrentClients) {
    return { ok: false, reason: 'CONCURRENCY_LIMIT' };
  }

  // 5. Shared equipment — basins, the colour bar, the AirTouch dryer. Contended
  //    across the whole salon, not just this stylist.
  for (const usage of projected.resourceUsage) {
    const capacity = resourceCapacity(resources, usage.type);
    if (capacity <= 0) return { ok: false, reason: 'RESOURCE_UNAVAILABLE' };

    const competing: Interval[] = [];
    for (const appointment of allAppointments) {
      for (const otherUsage of appointment.resourceUsage) {
        if (otherUsage.type === usage.type) competing.push(otherUsage.interval);
      }
    }
    if (maxConcurrencyWithin(competing, usage.interval) + 1 > capacity) {
      return { ok: false, reason: 'RESOURCE_UNAVAILABLE' };
    }
  }

  const usesOverlap = stylistAppointments.some((a) => overlaps(a.span, projected.span));
  return { ok: true, usesOverlap };
}

/**
 * Every bookable start time in the requested range.
 *
 * Results are ordered by time, then by stylist, so the caller can present
 * "first available" without re-sorting.
 */
export function computeAvailability(request: AvailabilityRequest): AvailableSlot[] {
  const plan = buildServicePlan(request.services);
  const serviceIds = request.services.map((s) => s.id);

  const granularityMs =
    (request.slotGranularityMin ?? DEFAULT_SLOT_GRANULARITY_MIN) * MINUTE_MS;
  const minGap =
    request.minGapBetweenOverlappingStartsMin ??
    DEFAULT_MIN_GAP_BETWEEN_OVERLAPPING_STARTS_MIN;

  const stylists = request.stylistId
    ? request.stylists.filter((s) => s.id === request.stylistId)
    : request.stylists;

  const slots: AvailableSlot[] = [];

  for (const stylist of stylists) {
    if (!stylist.isBookable) continue;

    // Skills are checked against the start of the range. A certification that
    // expires mid-range is re-checked per candidate below.
    if (!hasRequiredSkills(stylist, serviceIds, localDateString(request.from, request.timeZone))) {
      continue;
    }

    const workingWindows = computeWorkingWindows({
      stylist,
      from: request.from,
      to: request.to,
      timeZone: request.timeZone,
      salonHours: request.salonHours,
      salonExceptions: request.salonExceptions,
    });
    if (workingWindows.length === 0) continue;

    const stylistAppointments = request.existingAppointments.filter(
      (a) => a.stylistId === stylist.id,
    );

    for (const start of candidateStarts(workingWindows, granularityMs, request.from)) {
      // Re-check skills on the candidate's own date so an expiry inside the
      // range takes effect on the right day rather than the whole range.
      if (!hasRequiredSkills(stylist, serviceIds, localDateString(start, request.timeZone))) {
        continue;
      }

      const evaluation = evaluateCandidate({
        stylist,
        plan,
        start,
        now: request.now,
        workingWindows,
        stylistAppointments,
        allAppointments: request.existingAppointments,
        resources: request.resources,
        minGapBetweenOverlappingStartsMin: minGap,
      });

      if (evaluation.ok) {
        slots.push({
          start,
          end: start + plan.totalDurationMin * MINUTE_MS,
          stylistId: stylist.id,
          usesOverlap: evaluation.usesOverlap,
        });
      }
    }
  }

  return slots.sort((a, b) => a.start - b.start || a.stylistId.localeCompare(b.stylistId));
}

/**
 * The earliest bookable slot, or null. Powers the "Prvi slobodan termin: danas
 * 16:30" line on location cards — the highest-converting element in the flow
 * (IMPLEMENTATION_PLAN.md §9.3).
 */
export function firstAvailableSlot(request: AvailabilityRequest): AvailableSlot | null {
  return computeAvailability(request)[0] ?? null;
}

/**
 * Collapse per-stylist slots into distinct start times for the "any stylist"
 * default, keeping one representative stylist per time.
 */
export function mergeSlotsAcrossStylists(slots: readonly AvailableSlot[]): AvailableSlot[] {
  const byStart = new Map<number, AvailableSlot>();
  for (const slot of slots) {
    const existing = byStart.get(slot.start);
    // Prefer a slot that does not rely on overlap — a stylist with a clear
    // diary gives the client a calmer appointment.
    if (!existing || (existing.usesOverlap && !slot.usesOverlap)) {
      byStart.set(slot.start, slot);
    }
  }
  return [...byStart.values()].sort((a, b) => a.start - b.start);
}
