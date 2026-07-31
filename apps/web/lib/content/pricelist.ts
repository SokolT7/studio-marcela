/**
 * The full published price list — IMPLEMENTATION_PLAN.md §26.
 *
 * Taken verbatim from studiomarcela.hr/cjenik. Prices are integer cents.
 * A `to` value means the price varies with hair length or density.
 *
 * `missing: true` marks a service the salon markets but has never published a
 * price for. It renders as "cijena na upit" with a visible flag rather than an
 * invented number — see §7.5.
 */

export interface PriceRow {
  nameHr: string;
  fromCents: number;
  toCents?: number;
  noteHr?: string;
  missing?: boolean;
  /** Surcharges read differently from services; shown with a leading plus. */
  isSurcharge?: boolean;
  highlight?: boolean;
}

export interface PriceGroup {
  slug: string;
  titleHr: string;
  rows: PriceRow[];
}

export const PRICE_LIST: PriceGroup[] = [
  {
    slug: 'sisanje',
    titleHr: 'Šišanje i oblikovanje kose',
    rows: [
      { nameHr: 'Žensko šišanje', fromCents: 1500, toCents: 2500 },
      { nameHr: 'Fen frizura', fromCents: 1400, toCents: 2500 },
      { nameHr: 'Šišanje i fen frizura', fromCents: 2900, toCents: 5000 },
      { nameHr: 'Muško šišanje', fromCents: 1500 },
      { nameHr: 'Muško šišanje mašinicom', fromCents: 1000 },
      { nameHr: 'Dječje šišanje — muško (do 10 g.)', fromCents: 1000 },
      { nameHr: 'Dječje šišanje — žensko (do 10 g.)', fromCents: 2000 },
      { nameHr: 'Dječje šišanje i fen frizura — žensko (do 10 g.)', fromCents: 3000 },
      { nameHr: 'Pranje kose — žensko', fromCents: 500 },
      { nameHr: 'Pranje kose — muško', fromCents: 500 },
      { nameHr: 'Šišanje šiški', fromCents: 500 },
      { nameHr: 'Sušenje kose', fromCents: 500 },
      { nameHr: 'Pletenica', fromCents: 500 },
      { nameHr: 'Tanjenje kose', fromCents: 1000 },
      { nameHr: 'Korištenje figara', fromCents: 800 },
    ],
  },
  {
    slug: 'boja',
    titleHr: 'Bojanje i kemijski procesi',
    rows: [
      {
        nameHr: 'Paket pramenovi — sve uključeno',
        fromCents: 9500,
        noteHr: 'Pranje, njega, šišanje, pramenovi, preljev i fen frizura',
        highlight: true,
      },
      {
        nameHr: 'Paket bojanje — sve uključeno',
        fromCents: 5500,
        noteHr: 'Pranje, njega, šišanje, bojanje, preljev i fen frizura',
        highlight: true,
      },
      { nameHr: 'Bojanje', fromCents: 4000 },
      { nameHr: 'Bojanje izrasta', fromCents: 4000 },
      { nameHr: 'Pramenovi', fromCents: 5000 },
      { nameHr: 'Balayage pramenovi', fromCents: 5000 },
      { nameHr: 'Preljev', fromCents: 4000 },
      { nameHr: 'Preljev uz pramenove', fromCents: 3500 },
      { nameHr: 'Preljev za vrhove', fromCents: 3500 },
      { nameHr: 'AirTouch', fromCents: 0, missing: true },
      { nameHr: 'Flamboyage', fromCents: 0, missing: true },
      {
        nameHr: 'Nadoplata za bojanje izrasta uz pramenove',
        fromCents: 1500,
        isSurcharge: true,
      },
      { nameHr: 'Nadoplata za dvobojne pramenove', fromCents: 1500, isSurcharge: true },
      { nameHr: 'Nadoplata za dužinu / gustoću kose', fromCents: 700, isSurcharge: true },
    ],
  },
  {
    slug: 'njega',
    titleHr: 'Njega kose i tretmani',
    rows: [
      { nameHr: 'Silky njega kose', fromCents: 2500 },
      { nameHr: 'Silky tretman — šampon i maska', fromCents: 1500 },
      { nameHr: 'Silky argan tretman', fromCents: 1500 },
      { nameHr: 'Silky maska', fromCents: 600 },
      { nameHr: 'Silky ampula', fromCents: 500 },
      { nameHr: 'Silky arganovo ulje', fromCents: 200 },
      { nameHr: 'Masaža vlasišta', fromCents: 700 },
      { nameHr: 'pH-C5 tretman', fromCents: 4000 },
      { nameHr: 'pH-C5 tretman i frizura', fromCents: 5000 },
      { nameHr: 'Ugradnja ekstenzija (po komadu)', fromCents: 400 },
      { nameHr: 'Podizanje ekstenzija (po komadu)', fromCents: 100 },
    ],
  },
  {
    slug: 'prigode',
    titleHr: 'Svečane prigode',
    rows: [
      { nameHr: 'Svečana frizura', fromCents: 4000 },
      { nameHr: 'Svečana frizura Hollywood', fromCents: 6000 },
      { nameHr: 'Vjenčana frizura', fromCents: 5000 },
      { nameHr: 'Probna vjenčana frizura', fromCents: 4000 },
    ],
  },
  {
    slug: 'makeup',
    titleHr: 'Šminkanje',
    rows: [
      { nameHr: 'Make up', fromCents: 5200 },
      { nameHr: 'Svečani make up', fromCents: 6000 },
      { nameHr: 'Ugradnja trepavica', fromCents: 1500 },
      { nameHr: 'Bojanje obrva', fromCents: 1000 },
    ],
  },
  {
    slug: 'to-go',
    titleHr: 'Usluge to go — dolazimo na vašu adresu',
    rows: [
      { nameHr: 'Frizura to go', fromCents: 7000 },
      { nameHr: 'Vjenčana frizura to go', fromCents: 8000 },
      { nameHr: 'Makeup to go', fromCents: 9500 },
    ],
  },
];

/** Length bands the price list uses. */
export const HAIR_LENGTHS = [
  'kratka',
  'poluduga',
  'duga',
  'extra duga',
  'ekstenzije',
] as const;
