/**
 * Domain types for the scheduling engine.
 *
 * These mirror the database model in IMPLEMENTATION_PLAN.md §11 but are
 * deliberately decoupled from Prisma: the engine is pure logic with no I/O, so
 * it can be exhaustively tested without a database, and so the persistence
 * layer can change without touching the algorithm.
 */

import type { Interval } from './interval.js';

export type SegmentType = 'ACTIVE' | 'PASSIVE';

export type SkillLevel = 'NOT_TRAINED' | 'IN_TRAINING' | 'CERTIFIED' | 'TRAINER';

export type WeekParity = 'EVERY' | 'ODD' | 'EVEN';

export type HairLength = 'KRATKA' | 'POLUDUGA' | 'DUGA' | 'EXTRA_DUGA' | 'EKSTENZIJE';

/**
 * One phase of a service.
 *
 * The distinction between ACTIVE and PASSIVE is what makes processing-time
 * overlap possible (IMPLEMENTATION_PLAN.md §9.5). During the development phase
 * of a colour the client occupies a chair but the stylist is free, and that
 * freedom is real capacity.
 */
export interface ServiceSegment {
  readonly sequence: number;
  readonly type: SegmentType;
  readonly durationMin: number;
  /** ACTIVE segments hold the stylist; PASSIVE ones release them. */
  readonly requiresStylist: boolean;
  /** Almost always true — the client is sitting somewhere. */
  readonly requiresChair: boolean;
  /** e.g. `"BASIN"`, `"COLOUR_BAR"`, `"AIRTOUCH_DRYER"`. */
  readonly resourceType?: string;
}

export interface Service {
  readonly id: string;
  readonly segments: readonly ServiceSegment[];
  readonly bufferBeforeMin: number;
  readonly bufferAfterMin: number;
  /** How far ahead this must be booked. Colour needs more warning than a cut. */
  readonly minimumNoticeHours: number;
  /** `false` on services that must never share a stylist — bridal, for example. */
  readonly allowOverlap: boolean;
}

export interface ResourcePool {
  readonly type: string;
  readonly quantity: number;
}

/** A recurring weekly working slot for one person at one salon. */
export interface WorkPattern {
  readonly dayOfWeek: number; // 0 = Sunday
  readonly startsAt: string; // "09:00"
  readonly endsAt: string; // "17:00"
  readonly weekParity: WeekParity;
  /** Inclusive `"YYYY-MM-DD"`. */
  readonly effectiveFrom: string;
  /** Inclusive `"YYYY-MM-DD"`, or null for open-ended. */
  readonly effectiveTo?: string | null;
}

/** A date-specific instruction that beats the recurring pattern. */
export interface WorkOverride {
  readonly date: string;
  readonly isWorking: boolean;
  readonly startsAt?: string | null;
  readonly endsAt?: string | null;
}

/** Approved leave. Whole days; half-days are expressed by `period`. */
export interface Absence {
  readonly startDate: string;
  readonly endDate: string;
  readonly isHalfDay?: boolean;
  readonly halfDayPeriod?: 'AM' | 'PM' | null;
}

/** Lunch, admin, training — anything blocked out inside a working day. */
export interface TimeBlock {
  readonly startsAt: number;
  readonly endsAt: number;
}

export interface SalonHours {
  readonly dayOfWeek: number;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly isClosed: boolean;
}

export interface SalonHoursException {
  readonly date: string;
  readonly isClosed: boolean;
  readonly opensAt?: string | null;
  readonly closesAt?: string | null;
}

export interface StylistSkill {
  readonly serviceId: string;
  readonly level: SkillLevel;
  /** `"YYYY-MM-DD"`. A lapsed certification stops being bookable. */
  readonly expiresAt?: string | null;
}

export interface Stylist {
  readonly id: string;
  readonly locationId: string;
  readonly patterns: readonly WorkPattern[];
  readonly overrides: readonly WorkOverride[];
  readonly absences: readonly Absence[];
  readonly timeBlocks: readonly TimeBlock[];
  readonly skills: readonly StylistSkill[];
  /** Cap on clients whose chair-time may overlap. 1 disables overlap. */
  readonly maxConcurrentClients: number;
  /** Master switch — juniors typically run without overlap. */
  readonly allowOverlap: boolean;
  readonly isBookable: boolean;
}

/** A booked appointment, already projected onto absolute time. */
export interface ExistingAppointment {
  readonly id: string;
  readonly stylistId: string;
  /** Full chair occupancy, buffers excluded. */
  readonly span: Interval;
  /** Only the phases that hold the stylist. */
  readonly activeSegments: readonly Interval[];
  /** Buffered span, used to keep breathing room between clients. */
  readonly blockedSpan: Interval;
  readonly resourceUsage: readonly { type: string; interval: Interval }[];
  /** When false, this appointment refuses to share its stylist. */
  readonly allowOverlap: boolean;
}

export interface AvailabilityRequest {
  /** Search window, UTC epoch ms. */
  readonly from: number;
  readonly to: number;
  /** "Now", for minimum-notice checks. Injected so tests are deterministic. */
  readonly now: number;
  readonly timeZone: string;
  readonly salonHours: readonly SalonHours[];
  readonly salonExceptions: readonly SalonHoursException[];
  readonly stylists: readonly Stylist[];
  /** The client's basket, in the order it will be performed. */
  readonly services: readonly Service[];
  readonly resources: readonly ResourcePool[];
  readonly existingAppointments: readonly ExistingAppointment[];
  /** Candidate start times are aligned to this. Defaults to 15 minutes. */
  readonly slotGranularityMin?: number;
  /**
   * When a new client is slotted *inside* another client's appointment, their
   * active phases must start at least this far apart. Stops a stylist being
   * double-booked to the second. Defaults to 15 minutes.
   */
  readonly minGapBetweenOverlappingStartsMin?: number;
  /** Optional filter to a single stylist. */
  readonly stylistId?: string;
}

export interface AvailableSlot {
  readonly start: number;
  readonly end: number;
  readonly stylistId: string;
  /** True when this slot only exists because of processing-time overlap. */
  readonly usesOverlap: boolean;
}

/** Why a specific candidate was rejected. Powers diagnostics and tests. */
export type RejectionReason =
  | 'OUTSIDE_WORKING_HOURS'
  | 'OUTSIDE_SALON_HOURS'
  | 'ABSENCE'
  | 'TIME_BLOCK'
  | 'STYLIST_BUSY'
  | 'CONCURRENCY_LIMIT'
  | 'RESOURCE_UNAVAILABLE'
  | 'MINIMUM_NOTICE'
  | 'OVERLAP_NOT_ALLOWED'
  | 'MIN_GAP';
