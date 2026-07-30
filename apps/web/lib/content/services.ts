/**
 * Service catalogue — prices taken verbatim from the current published price
 * list (IMPLEMENTATION_PLAN.md §26), pending per-location confirmation.
 *
 * Prices are integer cents throughout. Durations are honest ranges, never a
 * single optimistic number.
 *
 * The rule from §7.3: **every service states its price.** The current site
 * says "contact us for pricing" on /usluge while publishing a full list on
 * /cjenik. That contradiction does not survive here.
 */

export interface ServiceContent {
  slug: string;
  nameHr: string;
  nameEn: string;
  category: string;
  /** Cents. `from` because hair length can still move it. */
  fromPriceCents: number;
  durationMinFrom: number;
  durationMinTo: number;
  summaryHr: string;
  includesHr?: string[];
  /** Reference photo standing in until the shoot. */
  imageRef: string;
  isPackage?: boolean;
  /** Prices the client has never published — flagged rather than invented. */
  priceMissing?: boolean;
}

export const CATEGORIES = [
  { slug: 'sisanje', nameHr: 'Šišanje i oblikovanje' },
  { slug: 'boja', nameHr: 'Bojanje i pramenovi' },
  { slug: 'njega', nameHr: 'Njega i tretmani' },
  { slug: 'prigode', nameHr: 'Svečane prigode' },
  { slug: 'makeup', nameHr: 'Šminkanje' },
] as const;

export const PACKAGES: ServiceContent[] = [
  {
    slug: 'paket-pramenovi',
    nameHr: 'Pramenovi — sve uključeno',
    nameEn: 'Highlights — all inclusive',
    category: 'boja',
    fromPriceCents: 9500,
    durationMinFrom: 150,
    durationMinTo: 240,
    summaryHr:
      'Fiksna cijena u koju ulazi baš sve — bez doplata na kraju i bez iznenađenja.',
    includesHr: [
      'Pranje kose',
      'Njega kose',
      'Šišanje',
      'Pramenovi',
      'Preljev',
      'Fen frizura',
    ],
    imageRef: 'SVC-FOILS-01',
    isPackage: true,
  },
  {
    slug: 'paket-bojanje',
    nameHr: 'Bojanje — sve uključeno',
    nameEn: 'Colour — all inclusive',
    category: 'boja',
    fromPriceCents: 5500,
    durationMinFrom: 120,
    durationMinTo: 180,
    summaryHr:
      'Cijela usluga bojanja s njegom, šišanjem i fen frizurom u jednoj cijeni.',
    includesHr: [
      'Pranje kose',
      'Njega kose',
      'Šišanje',
      'Bojanje',
      'Preljev',
      'Fen frizura',
    ],
    imageRef: 'SVC-COLOR-02',
    isPackage: true,
  },
];

export const SERVICES: ServiceContent[] = [
  {
    slug: 'sisanje-i-fen',
    nameHr: 'Šišanje i fen frizura',
    nameEn: 'Cut and blow-dry',
    category: 'sisanje',
    fromPriceCents: 2900,
    durationMinFrom: 45,
    durationMinTo: 90,
    summaryHr: 'Šišanje prilagođeno strukturi kose, uz oblikovanje i fen frizuru.',
    imageRef: 'SVC-CUT-01',
  },
  {
    slug: 'bojanje',
    nameHr: 'Bojanje',
    nameEn: 'Colour',
    category: 'boja',
    fromPriceCents: 4000,
    durationMinFrom: 90,
    durationMinTo: 150,
    summaryHr: 'Bojanje cijele dužine ili izrasta, Silky bojama iz Milana.',
    imageRef: 'SVC-COLOR-02',
  },
  {
    slug: 'pramenovi',
    nameHr: 'Pramenovi',
    nameEn: 'Highlights',
    category: 'boja',
    fromPriceCents: 5000,
    durationMinFrom: 120,
    durationMinTo: 210,
    summaryHr: 'Klasični pramenovi na folije, s preljevom po želji.',
    imageRef: 'SVC-FOILS-01',
  },
  {
    slug: 'balayage',
    nameHr: 'Balayage',
    nameEn: 'Balayage',
    category: 'boja',
    fromPriceCents: 5000,
    durationMinFrom: 120,
    durationMinTo: 240,
    summaryHr:
      'Ručno slikana tehnika s mekim prijelazom — raste bez oštre linije izrasta.',
    imageRef: 'SVC-COLOR-01',
  },
  {
    slug: 'airtouch',
    nameHr: 'AirTouch',
    nameEn: 'AirTouch',
    category: 'boja',
    fromPriceCents: 0,
    durationMinFrom: 180,
    durationMinTo: 300,
    summaryHr:
      'Tehnika kod koje se kraći pramenovi izdvoje zrakom prije nanošenja boje.',
    imageRef: 'SVC-COLOR-01',
    priceMissing: true,
  },
  {
    slug: 'njega-i-tretmani',
    nameHr: 'Njega i tretmani',
    nameEn: 'Treatments',
    category: 'njega',
    fromPriceCents: 1500,
    durationMinFrom: 20,
    durationMinTo: 60,
    summaryHr: 'Silky tretmani, maske, ampule i masaža vlasišta.',
    imageRef: 'SVC-WASH-01',
  },
  {
    slug: 'musko-sisanje',
    nameHr: 'Muško šišanje',
    nameEn: "Men's cut",
    category: 'sisanje',
    fromPriceCents: 1000,
    durationMinFrom: 20,
    durationMinTo: 45,
    summaryHr: 'Šišanje škarama ili mašinicom, uz oblikovanje brade po želji.',
    imageRef: 'SVC-MENS-01',
  },
  {
    slug: 'sminkanje',
    nameHr: 'Profesionalno šminkanje',
    nameEn: 'Professional makeup',
    category: 'makeup',
    fromPriceCents: 5200,
    durationMinFrom: 45,
    durationMinTo: 90,
    summaryHr: 'Dnevna, večernja i svečana šminka, uz ugradnju trepavica.',
    imageRef: 'SVC-MAKEUP-01',
  },
  {
    slug: 'vjencana-frizura',
    nameHr: 'Vjenčana frizura',
    nameEn: 'Bridal hair',
    category: 'prigode',
    fromPriceCents: 5000,
    durationMinFrom: 60,
    durationMinTo: 120,
    summaryHr: 'Vjenčana frizura uz probu unaprijed i raspored po satima.',
    imageRef: 'BRIDAL-03',
  },
];

/** Format cents in Croatian convention: `1.234,56 €`, whole euros bare. */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDurationRange(from: number, to: number): string {
  const render = (m: number): string => {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (h === 0) return `${rest} min`;
    if (rest === 0) return `${h} h`;
    return `${h} h ${rest} min`;
  };
  return from === to ? render(from) : `${render(from)} – ${render(to)}`;
}
