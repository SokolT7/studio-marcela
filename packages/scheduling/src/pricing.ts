/**
 * Price and duration engine (IMPLEMENTATION_PLAN.md §9.4).
 *
 * All money is handled in integer **cents**. Floating-point euros produce
 * 40.99999999 on a quote, and a client who is quoted the wrong number is a
 * client who argues at the till.
 *
 * The rule the whole brand rests on — *"stilist će vam reći točan iznos prije
 * početka rada, nikad nakon"* — means a quote must be either exact or honestly
 * labelled as a range. `isExact` carries that distinction to the UI.
 */

import type { HairLength } from './types.js';

export interface PricedService {
  readonly serviceId: string;
  readonly nameHr: string;
  readonly nameEn: string;
  /** Cents. Per-location overrides are resolved before reaching here. */
  readonly basePriceCents: number;
  readonly baseDurationMin: number;
  readonly lengthModifiers: readonly LengthModifier[];
  /** When true this is an all-inclusive package (the 95 € / 55 € offers). */
  readonly isPackage: boolean;
  /** Services this package replaces, for the "book these separately" comparison. */
  readonly packageServiceIds: readonly string[];
}

export interface LengthModifier {
  readonly hairLength: HairLength;
  readonly priceDeltaCents: number;
  readonly durationDeltaMin: number;
}

export interface PricedAddOn {
  readonly addOnId: string;
  readonly nameHr: string;
  readonly priceCents: number;
  readonly durationMin: number;
}

export type StylistTier = 'STANDARD' | 'SENIOR' | 'MASTER';

export interface QuoteRequest {
  readonly services: readonly PricedService[];
  readonly addOns?: readonly PricedAddOn[];
  /** Undefined until the client picks — the quote stays a range until then. */
  readonly hairLength?: HairLength;
  readonly stylistTier?: StylistTier;
  readonly tierSurchargeCents?: Partial<Record<StylistTier, number>>;
}

export interface QuoteLine {
  readonly label: string;
  readonly amountCents: number;
  readonly durationMin: number;
  readonly kind: 'service' | 'length' | 'tier' | 'addon' | 'discount';
}

export interface Quote {
  readonly lines: readonly QuoteLine[];
  readonly totalCents: number;
  readonly totalDurationMin: number;
  /** Cheapest possible total, used for "od X €" before hair length is known. */
  readonly minimumTotalCents: number;
  readonly maximumTotalCents: number;
  /** True once nothing can still move the number. */
  readonly isExact: boolean;
  /** Set when the basket would be cheaper as a package. */
  readonly packageSuggestion?: PackageSuggestion;
}

export interface PackageSuggestion {
  readonly packageServiceId: string;
  readonly packageNameHr: string;
  readonly packagePriceCents: number;
  readonly savingCents: number;
}

const DEFAULT_TIER_SURCHARGE: Record<StylistTier, number> = {
  STANDARD: 0,
  SENIOR: 0,
  MASTER: 0,
};

function modifierFor(
  service: PricedService,
  hairLength: HairLength | undefined,
): LengthModifier | undefined {
  if (!hairLength) return undefined;
  return service.lengthModifiers.find((m) => m.hairLength === hairLength);
}

/** Format cents as Croatian currency: `1.234,56 €`. */
export function formatEur(cents: number, locale: 'hr' | 'en' = 'hr'): string {
  return new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Human duration: `2 h 45 min`, `45 min`. */
export function formatDuration(totalMinutes: number, locale: 'hr' | 'en' = 'hr'): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hourLabel = 'h';
  const minLabel = locale === 'hr' ? 'min' : 'min';
  if (hours === 0) return `${mins} ${minLabel}`;
  if (mins === 0) return `${hours} ${hourLabel}`;
  return `${hours} ${hourLabel} ${mins} ${minLabel}`;
}

/**
 * Build a quote.
 *
 * Until a hair length is chosen the total is a range, and `isExact` is false so
 * the UI shows *"od 50 €"* rather than a number it may have to revise.
 */
export function buildQuote(request: QuoteRequest): Quote {
  const { services, addOns = [], hairLength, stylistTier = 'STANDARD' } = request;
  const tierSurcharges = { ...DEFAULT_TIER_SURCHARGE, ...request.tierSurchargeCents };

  const lines: QuoteLine[] = [];
  let total = 0;
  let duration = 0;

  for (const service of services) {
    lines.push({
      label: service.nameHr,
      amountCents: service.basePriceCents,
      durationMin: service.baseDurationMin,
      kind: 'service',
    });
    total += service.basePriceCents;
    duration += service.baseDurationMin;

    const modifier = modifierFor(service, hairLength);
    if (modifier && (modifier.priceDeltaCents !== 0 || modifier.durationDeltaMin !== 0)) {
      lines.push({
        label: `Nadoplata za dužinu/gustoću kose — ${service.nameHr}`,
        amountCents: modifier.priceDeltaCents,
        durationMin: modifier.durationDeltaMin,
        kind: 'length',
      });
      total += modifier.priceDeltaCents;
      duration += modifier.durationDeltaMin;
    }
  }

  const tierSurcharge = tierSurcharges[stylistTier] ?? 0;
  if (tierSurcharge > 0) {
    lines.push({
      label: `Nadoplata za stilista (${stylistTier.toLowerCase()})`,
      amountCents: tierSurcharge,
      durationMin: 0,
      kind: 'tier',
    });
    total += tierSurcharge;
  }

  for (const addOn of addOns) {
    lines.push({
      label: addOn.nameHr,
      amountCents: addOn.priceCents,
      durationMin: addOn.durationMin,
      kind: 'addon',
    });
    total += addOn.priceCents;
    duration += addOn.durationMin;
  }

  // Range across every hair length, for display before the client chooses.
  const deltasByLength = new Map<HairLength, number>();
  for (const service of services) {
    for (const modifier of service.lengthModifiers) {
      deltasByLength.set(
        modifier.hairLength,
        (deltasByLength.get(modifier.hairLength) ?? 0) + modifier.priceDeltaCents,
      );
    }
  }
  const possibleDeltas = [0, ...deltasByLength.values()];
  const baseWithoutLength = services.reduce((sum, s) => sum + s.basePriceCents, 0)
    + tierSurcharge
    + addOns.reduce((sum, a) => sum + a.priceCents, 0);

  const isExact = hairLength !== undefined || deltasByLength.size === 0;

  return {
    lines,
    totalCents: total,
    totalDurationMin: duration,
    minimumTotalCents: isExact ? total : baseWithoutLength + Math.min(...possibleDeltas),
    maximumTotalCents: isExact ? total : baseWithoutLength + Math.max(...possibleDeltas),
    isExact,
  };
}

/**
 * Would this basket be cheaper as one of the all-inclusive packages?
 *
 * Surfacing this costs a little revenue per booking and buys a great deal of
 * trust — and the packages carry a higher average ticket than the à la carte
 * services they replace, so it usually pays for itself.
 */
export function findPackageSuggestion(
  basket: readonly PricedService[],
  availablePackages: readonly PricedService[],
  hairLength?: HairLength,
): PackageSuggestion | undefined {
  const basketIds = new Set(basket.map((s) => s.serviceId));
  if (basket.some((s) => s.isPackage)) return undefined;

  const basketTotal = buildQuote({ services: basket, ...(hairLength ? { hairLength } : {}) })
    .totalCents;

  let best: PackageSuggestion | undefined;

  for (const pkg of availablePackages) {
    if (!pkg.isPackage || pkg.packageServiceIds.length === 0) continue;
    // The package must cover everything in the basket.
    const covers = [...basketIds].every((id) => pkg.packageServiceIds.includes(id));
    if (!covers) continue;

    const packageTotal = buildQuote({
      services: [pkg],
      ...(hairLength ? { hairLength } : {}),
    }).totalCents;
    const saving = basketTotal - packageTotal;
    if (saving > 0 && (!best || saving > best.savingCents)) {
      best = {
        packageServiceId: pkg.serviceId,
        packageNameHr: pkg.nameHr,
        packagePriceCents: packageTotal,
        savingCents: saving,
      };
    }
  }

  return best;
}

/**
 * Deposit due for a basket, per the policy in IMPLEMENTATION_PLAN.md §9.6.
 * `clientRequiresDeposit` implements the rule that targets repeat no-shows
 * rather than taxing reliable clients.
 */
export function calculateDeposit(options: {
  readonly totalCents: number;
  readonly serviceDeposits: readonly {
    readonly amountCents?: number;
    readonly percent?: number;
  }[];
  readonly clientRequiresDeposit: boolean;
  readonly fallbackPercentForFlaggedClients?: number;
}): number {
  const {
    totalCents,
    serviceDeposits,
    clientRequiresDeposit,
    fallbackPercentForFlaggedClients = 30,
  } = options;

  let deposit = 0;
  for (const rule of serviceDeposits) {
    if (rule.amountCents) deposit += rule.amountCents;
    else if (rule.percent) deposit += Math.round((totalCents * rule.percent) / 100);
  }

  if (deposit === 0 && clientRequiresDeposit) {
    deposit = Math.round((totalCents * fallbackPercentForFlaggedClients) / 100);
  }

  return Math.min(deposit, totalCents);
}
