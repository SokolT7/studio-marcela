import { describe, expect, it } from 'vitest';
import {
  buildQuote,
  calculateDeposit,
  findPackageSuggestion,
  formatDuration,
  formatEur,
  type PricedService,
} from '../src/pricing.js';

/** Prices taken from the published price list — IMPLEMENTATION_PLAN.md §26. */
function service(
  id: string,
  nameHr: string,
  priceCents: number,
  durationMin: number,
  overrides: Partial<PricedService> = {},
): PricedService {
  return {
    serviceId: id,
    nameHr,
    nameEn: nameHr,
    basePriceCents: priceCents,
    baseDurationMin: durationMin,
    lengthModifiers: [],
    isPackage: false,
    packageServiceIds: [],
    ...overrides,
  };
}

const LENGTH_SURCHARGE = [
  { hairLength: 'KRATKA' as const, priceDeltaCents: 0, durationDeltaMin: 0 },
  { hairLength: 'POLUDUGA' as const, priceDeltaCents: 0, durationDeltaMin: 15 },
  { hairLength: 'DUGA' as const, priceDeltaCents: 700, durationDeltaMin: 30 },
  { hairLength: 'EXTRA_DUGA' as const, priceDeltaCents: 1400, durationDeltaMin: 45 },
];

const sisanje = service('sisanje', 'Žensko šišanje', 2000, 45);
const bojanje = service('bojanje', 'Bojanje', 4000, 120, {
  lengthModifiers: LENGTH_SURCHARGE,
});
const fen = service('fen', 'Fen frizura', 1500, 30);

describe('buildQuote', () => {
  it('totals a single service', () => {
    const quote = buildQuote({ services: [sisanje] });
    expect(quote.totalCents).toBe(2000);
    expect(quote.totalDurationMin).toBe(45);
    expect(quote.lines).toHaveLength(1);
  });

  it('totals a basket', () => {
    const quote = buildQuote({ services: [sisanje, fen] });
    expect(quote.totalCents).toBe(3500);
    expect(quote.totalDurationMin).toBe(75);
  });

  it('is exact when nothing can still change the number', () => {
    expect(buildQuote({ services: [sisanje] }).isExact).toBe(true);
  });

  it('is a range while hair length is unknown', () => {
    const quote = buildQuote({ services: [bojanje] });
    expect(quote.isExact).toBe(false);
    expect(quote.minimumTotalCents).toBe(4000);
    expect(quote.maximumTotalCents).toBe(5400);
  });

  it('becomes exact once hair length is chosen', () => {
    const quote = buildQuote({ services: [bojanje], hairLength: 'DUGA' });
    expect(quote.isExact).toBe(true);
    expect(quote.totalCents).toBe(4700);
    expect(quote.minimumTotalCents).toBe(4700);
    expect(quote.maximumTotalCents).toBe(4700);
  });

  it('adds the duration cost of longer hair, not just the price', () => {
    const quote = buildQuote({ services: [bojanje], hairLength: 'EXTRA_DUGA' });
    expect(quote.totalDurationMin).toBe(165);
  });

  it('omits a zero-value length line rather than showing "+0 €"', () => {
    const quote = buildQuote({ services: [bojanje], hairLength: 'KRATKA' });
    expect(quote.lines.filter((l) => l.kind === 'length')).toHaveLength(0);
    expect(quote.totalCents).toBe(4000);
  });

  it('keeps a length line that changes only the duration', () => {
    const quote = buildQuote({ services: [bojanje], hairLength: 'POLUDUGA' });
    expect(quote.lines.filter((l) => l.kind === 'length')).toHaveLength(1);
    expect(quote.totalCents).toBe(4000);
    expect(quote.totalDurationMin).toBe(135);
  });

  it('applies a stylist tier surcharge', () => {
    const quote = buildQuote({
      services: [sisanje],
      stylistTier: 'MASTER',
      tierSurchargeCents: { MASTER: 1000 },
    });
    expect(quote.totalCents).toBe(3000);
    expect(quote.lines.some((l) => l.kind === 'tier')).toBe(true);
  });

  it('adds no tier line when the surcharge is zero', () => {
    const quote = buildQuote({ services: [sisanje], stylistTier: 'SENIOR' });
    expect(quote.lines.some((l) => l.kind === 'tier')).toBe(false);
  });

  it('adds add-ons to price and duration', () => {
    const quote = buildQuote({
      services: [sisanje],
      addOns: [
        { addOnId: 'masaza', nameHr: 'Masaža vlasišta', priceCents: 700, durationMin: 10 },
      ],
    });
    expect(quote.totalCents).toBe(2700);
    expect(quote.totalDurationMin).toBe(55);
  });

  it('accumulates length surcharges across several services', () => {
    const pramenovi = service('pramenovi', 'Pramenovi', 5000, 150, {
      lengthModifiers: LENGTH_SURCHARGE,
    });
    const quote = buildQuote({ services: [bojanje, pramenovi], hairLength: 'DUGA' });
    expect(quote.totalCents).toBe(4000 + 5000 + 700 + 700);
  });
});

describe('package suggestion', () => {
  // "Paket bojanje — sve uključeno", 55 €, replacing colour + cut + blow-dry.
  const paket = service('paket-bojanje', 'Paket bojanje — sve uključeno', 5500, 180, {
    isPackage: true,
    packageServiceIds: ['bojanje', 'sisanje', 'fen'],
  });

  it('suggests the package when it beats the basket', () => {
    // 40 + 20 + 15 = 75 € à la carte, against 55 € as a package.
    const suggestion = findPackageSuggestion([bojanje, sisanje, fen], [paket]);
    expect(suggestion).toBeDefined();
    expect(suggestion!.packageServiceId).toBe('paket-bojanje');
    expect(suggestion!.savingCents).toBe(2000);
  });

  it('suggests a package that covers a subset of its contents', () => {
    const suggestion = findPackageSuggestion([bojanje, sisanje], [paket]);
    expect(suggestion).toBeDefined();
  });

  it('does not suggest a package that fails to cover the basket', () => {
    const extras = service('keratin', 'Keratinski tretman', 8000, 180);
    expect(findPackageSuggestion([bojanje, extras], [paket])).toBeUndefined();
  });

  it('does not suggest a package that costs more', () => {
    expect(findPackageSuggestion([sisanje], [paket])).toBeUndefined();
  });

  it('does not suggest anything when the basket is already a package', () => {
    expect(findPackageSuggestion([paket], [paket])).toBeUndefined();
  });

  it('picks the largest saving when several packages qualify', () => {
    const cheaper = service('paket-super', 'Super paket', 4900, 180, {
      isPackage: true,
      packageServiceIds: ['bojanje', 'sisanje', 'fen'],
    });
    const suggestion = findPackageSuggestion([bojanje, sisanje, fen], [paket, cheaper]);
    expect(suggestion!.packageServiceId).toBe('paket-super');
    expect(suggestion!.savingCents).toBe(2600);
  });
});

describe('deposits', () => {
  it('takes nothing when no service requires one', () => {
    expect(
      calculateDeposit({
        totalCents: 2000,
        serviceDeposits: [],
        clientRequiresDeposit: false,
      }),
    ).toBe(0);
  });

  it('takes a fixed amount', () => {
    expect(
      calculateDeposit({
        totalCents: 5500,
        serviceDeposits: [{ amountCents: 2000 }],
        clientRequiresDeposit: false,
      }),
    ).toBe(2000);
  });

  it('takes a percentage', () => {
    expect(
      calculateDeposit({
        totalCents: 10000,
        serviceDeposits: [{ percent: 30 }],
        clientRequiresDeposit: false,
      }),
    ).toBe(3000);
  });

  it('sums deposits across a basket', () => {
    expect(
      calculateDeposit({
        totalCents: 9000,
        serviceDeposits: [{ amountCents: 1500 }, { amountCents: 2500 }],
        clientRequiresDeposit: false,
      }),
    ).toBe(4000);
  });

  it('never exceeds the total', () => {
    expect(
      calculateDeposit({
        totalCents: 1000,
        serviceDeposits: [{ amountCents: 5000 }],
        clientRequiresDeposit: false,
      }),
    ).toBe(1000);
  });

  it('applies a deposit to a flagged client even on a service that needs none', () => {
    // The rule targets repeat no-shows rather than taxing reliable clients.
    expect(
      calculateDeposit({
        totalCents: 2000,
        serviceDeposits: [],
        clientRequiresDeposit: true,
      }),
    ).toBe(600);
  });

  it('does not double-charge a flagged client on a service that already has a deposit', () => {
    expect(
      calculateDeposit({
        totalCents: 9500,
        serviceDeposits: [{ amountCents: 2000 }],
        clientRequiresDeposit: true,
      }),
    ).toBe(2000);
  });
});

describe('formatting', () => {
  it('formats whole euros without decimals', () => {
    expect(formatEur(5500)).toContain('55');
    expect(formatEur(5500)).not.toContain(',00');
  });

  it('formats part-euros with decimals', () => {
    expect(formatEur(5550)).toContain('55,50');
  });

  it('formats durations in hours and minutes', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(165)).toBe('2 h 45 min');
  });
});
