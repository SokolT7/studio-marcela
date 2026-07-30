/**
 * The seven salons.
 *
 * Copy, H1s and H2s come straight from IMPLEMENTATION_PLAN.md §7.2. Two rules
 * are load-bearing and must survive any edit:
 *
 *   1. The district appears in the `h1` **and** in the `h2`.
 *   2. `intro` is genuinely unique per salon. A template with the district
 *      swapped in triggers the same suppression as duplicate content and the
 *      whole seven-page strategy fails.
 *
 * Anything marked `verify: true` is inferred from the address and must be
 * confirmed with the client before publication (plan §25.1 item 16). A wrong
 * tram number on a location page is worse than no tram number, so unverified
 * facts render with a visible marker in development and are omitted in
 * production until confirmed.
 */

export interface OpeningHour {
  /** 0 = Sunday, matching the database. */
  day: number;
  opens: string;
  closes: string;
  closed?: boolean;
}

export interface LocationContent {
  slug: string;
  /** District name — never "Studio Marcela IV". Nobody searches for that. */
  displayName: string;
  city: 'Zagreb' | 'Dubrovnik';
  h1: string;
  h2: string;
  /**
   * Croatian locative phrase for this salon, e.g. "u Prečkom", "na Ilici".
   * Croatian declines place names and the correct case cannot be derived from
   * the nominative, so each salon carries its own. Interpolating a bare
   * `displayName` after a preposition produces "Naruči se u Prečko", which
   * reads as machine translation to any Croatian speaker.
   */
  locative: string;
  metaTitle: string;
  metaDescription: string;
  addressStreet: string;
  addressPostal: string;
  addressCity: string;
  phone: string;
  /** Tel-URI form. */
  phoneHref: string;
  latitude: number;
  longitude: number;
  /** 120–180 words, specific to this room and this neighbourhood. */
  intro: string[];
  gettingHere: { label: string; value: string; verify?: boolean }[];
  /** `[CLIENT]` — no hours are published anywhere on the current site. */
  hours: OpeningHour[] | null;
  keywords: string[];
  isHotelSalon: boolean;
  primaryLocale: 'hr' | 'en';
  /** Reference photo standing in for LOC-02 until the shoot. */
  heroRef: string;
}

export const LOCATIONS: LocationContent[] = [
  {
    slug: 'ilica',
    locative: 'na Ilici',
    displayName: 'Ilica',
    city: 'Zagreb',
    h1: 'Frizerski salon Ilica 49, Zagreb — Studio Marcela Centar',
    h2: 'Šišanje, bojanje i pramenovi u samom centru Zagreba',
    metaTitle: 'Frizerski salon Ilica, Zagreb | Studio Marcela Centar',
    metaDescription:
      'Frizerski salon na Ilici 49 u centru Zagreba. Šišanje, bojanje, pramenovi i balayage. Naručite se online — potvrda odmah.',
    addressStreet: 'Ilica 49',
    addressPostal: '10000',
    addressCity: 'Zagreb',
    phone: '092 / 1816 736',
    phoneHref: '+385921816736',
    latitude: 45.8123,
    longitude: 15.9668,
    intro: [
      'Naš studio na Ilici 49 nalazi se u samom centru grada, nekoliko minuta pješice od Trga bana Jelačića. To je salon u koji se najčešće dolazi između dvije obaveze — pa smo ga tako i posložili: termini kreću na vrijeme, a prije rezervacije točno vidite koliko usluga traje.',
      'Ovdje radimo cijeli raspon usluga, od šišanja i fen frizure do zahtjevnih tehnika bojanja, balayagea i AirToucha. Ako niste sigurni što vaša kosa treba, naručite se na kratku konzultaciju — ona je besplatna i ne obvezuje vas ni na što.',
    ],
    gettingHere: [
      { label: 'Tramvaj', value: 'Linije koje voze Ilicom', verify: true },
      { label: 'Parking', value: 'Javna garaža u blizini', verify: true },
      { label: 'Ulaz', value: 'Iz Ilice, prizemlje', verify: true },
    ],
    hours: null,
    keywords: ['frizerski salon centar Zagreb', 'frizer Ilica', 'frizerski salon Ilica 49'],
    isHotelSalon: false,
    primaryLocale: 'hr',
    heroRef: 'INTERIOR-01',
  },
  {
    slug: 'precko',
    locative: 'u Prečkom',
    displayName: 'Prečko',
    city: 'Zagreb',
    h1: 'Frizerski salon Prečko — Studio Marcela u SC Prečko',
    h2: 'Frizer u Prečkom: šišanje, bojanje i pramenovi uz besplatan parking',
    metaTitle: 'Frizerski salon Prečko | Studio Marcela, SC Prečko',
    metaDescription:
      'Frizerski salon u Shopping centru Prečko, 2. kat. Šišanje, bojanje, pramenovi i njega kose. Besplatan parking. Naručite se online.',
    addressStreet: 'Josipa Slavenskog 1, SC Prečko, 2. kat',
    addressPostal: '10000',
    addressCity: 'Zagreb',
    phone: '098 / 1666 353',
    phoneHref: '+385981666353',
    latitude: 45.7876,
    longitude: 15.9163,
    intro: [
      'Studio u Shopping centru Prečko je salon za ljude koji ne žele planirati cijeli dan oko frizure. Parkirate ispred centra, obavite što ste naumili i sjednete u stolicu — sve na jednom mjestu.',
      'Nalazimo se na drugom katu centra. Ovo je i naš najobiteljskiji studio: dječje šišanje radimo bez žurbe i bez drame, a roditelji mogu sjediti uz stolicu koliko god treba.',
    ],
    gettingHere: [
      { label: 'Kat', value: '2. kat Shopping centra Prečko' },
      { label: 'Parking', value: 'Besplatan parking u sklopu centra', verify: true },
      { label: 'Javni prijevoz', value: 'Autobusne linije do SC Prečko', verify: true },
    ],
    hours: null,
    keywords: ['frizer Prečko', 'frizerski salon Prečko', 'frizer SC Prečko'],
    isHotelSalon: false,
    primaryLocale: 'hr',
    heroRef: 'RECEPTION-01',
  },
  {
    slug: 'sigecica',
    locative: 'na Sigečici',
    displayName: 'Sigečica',
    city: 'Zagreb',
    h1: 'Frizerski salon Sigečica — Studio Marcela, Hvarska 10',
    h2: 'Frizer na Sigečici: šišanje, bojanje, pramenovi i njega kose',
    metaTitle: 'Frizerski salon Sigečica, Zagreb | Studio Marcela, Hvarska 10',
    metaDescription:
      'Frizerski salon na Hvarskoj 10, Sigečica. Šišanje, bojanje, pramenovi i tretmani njege kose. Online naručivanje s trenutnom potvrdom.',
    addressStreet: 'Hvarska 10',
    addressPostal: '10000',
    addressCity: 'Zagreb',
    phone: '092 / 3193 701',
    phoneHref: '+385923193701',
    latitude: 45.8009,
    longitude: 15.9976,
    intro: [
      'Sigečica je naš kvartovski studio — mjesto na koje se ljudi vraćaju godinama, kod istog stilista, s istom bojom. Upravo zato ovdje vodimo pisanu evidenciju svake formule boje: koja nijansa, koji razvijač, koliko je stajala i što bismo sljedeći put promijenili.',
      'To znači da vaša boja izgleda isto i kad dođete za tri mjeseca, i kad vas iznimno preuzme kolegica. Ne morate pamtiti, ne morate objašnjavati — piše kod nas.',
    ],
    gettingHere: [
      { label: 'Ulaz', value: 'Hvarska 10, ulica', verify: true },
      { label: 'Parking', value: 'Ulično parkiranje u blizini', verify: true },
      { label: 'Tramvaj', value: 'Stanica u blizini Hvarske', verify: true },
    ],
    hours: null,
    keywords: ['frizer Sigečica', 'frizerski salon Sigečica', 'frizer Hvarska'],
    isHotelSalon: false,
    primaryLocale: 'hr',
    heroRef: 'INTERIOR-01',
  },
  {
    slug: 'novi-zagreb',
    locative: 'u Novom Zagrebu',
    displayName: 'Novi Zagreb',
    city: 'Zagreb',
    h1: 'Frizerski salon Novi Zagreb — Studio Marcela, Jaruščica 9A',
    h2: 'Frizer u Novom Zagrebu: šišanje, bojanje, pramenovi i balayage',
    metaTitle: 'Frizerski salon Novi Zagreb | Studio Marcela, Jaruščica 9A',
    metaDescription:
      'Frizerski salon u Novom Zagrebu, Jaruščica 9A. Šišanje, bojanje, pramenovi, balayage i šminkanje. Naručite se online.',
    addressStreet: 'Jaruščica 9A',
    addressPostal: '10020',
    addressCity: 'Zagreb',
    phone: '092 / 341 5473',
    phoneHref: '+385923415473',
    latitude: 45.7717,
    longitude: 15.9556,
    intro: [
      'Studio na Jaruščici pokriva najveći dio grada od svih naših salona — i po tome se vidi. Ovdje je najviše termina za bojanje i balayage, pa držimo i najduže radne dane kako bi se stiglo i poslije posla.',
      'Ako dolazite prvi put i niste sigurni koja vam tehnika odgovara, recite to pri naručivanju. Odvojit ćemo deset minuta prije same usluge da pogledamo kosu, dogovorimo realan cilj i kažemo vam točnu cijenu — prije nego što se išta počne raditi.',
    ],
    gettingHere: [
      { label: 'Ulaz', value: 'Jaruščica 9A', verify: true },
      { label: 'Parking', value: 'Parking ispred zgrade', verify: true },
      { label: 'Javni prijevoz', value: 'Tramvajske i autobusne linije Novog Zagreba', verify: true },
    ],
    hours: null,
    keywords: ['frizer Novi Zagreb', 'frizerski salon Novi Zagreb', 'frizer Jaruščica'],
    isHotelSalon: false,
    primaryLocale: 'hr',
    heroRef: 'INTERIOR-01',
  },
  {
    slug: 'galleria-iblerov-trg',
    locative: 'na Iblerovom trgu',
    displayName: 'Iblerov trg',
    city: 'Zagreb',
    h1: 'Frizerski salon Iblerov trg — Studio Marcela u Galleria Business Centru',
    h2: 'Frizer u centru Zagreba, na Iblerovom trgu 10',
    metaTitle: 'Frizerski salon Iblerov trg | Studio Marcela, Galleria BC',
    metaDescription:
      'Frizerski salon u Galleria Business Centru, Trg Drage Iblera 10. Brzi termini prije i poslije posla. Naručite se online.',
    addressStreet: 'Trg Drage Iblera 10, Galleria Business Center',
    addressPostal: '10000',
    addressCity: 'Zagreb',
    phone: '099 / 6772 719',
    phoneHref: '+385996772719',
    latitude: 45.8114,
    longitude: 15.9855,
    intro: [
      'Studio u Galleria Business Centru radi po ritmu poslovnog dana. Većina naših gostiju ovdje dolazi prije prvog sastanka ili u pauzi, pa smo raspored složili oko toga: kratki termini počinju točno na vrijeme i završavaju kad piše da završavaju.',
      'Fen frizura, brzo muško šišanje, sređivanje boje prije putovanja ili prezentacije — sve to ovdje radimo bez čekanja. Za veće zahvate poput balayagea preporučujemo raniji ili kasniji termin, kad imamo više prostora.',
    ],
    gettingHere: [
      { label: 'Zgrada', value: 'Galleria Business Center, Trg Drage Iblera 10' },
      { label: 'Parking', value: 'Garaža poslovnog centra', verify: true },
      { label: 'Tramvaj', value: 'Stanice u blizini Iblerovog trga', verify: true },
    ],
    hours: null,
    keywords: ['frizer Iblerov trg', 'frizerski salon Galleria', 'frizerski salon centar Zagreb'],
    isHotelSalon: false,
    primaryLocale: 'hr',
    heroRef: 'RECEPTION-01',
  },
  {
    slug: 'dubrovnik-rixos',
    locative: 'u Dubrovniku',
    displayName: 'Dubrovnik — Rixos Premium',
    city: 'Dubrovnik',
    h1: 'Frizerski salon Dubrovnik — Studio Marcela u hotelu Rixos Premium',
    h2: 'Frizer u Dubrovniku: šišanje, bojanje, svečane i vjenčane frizure',
    metaTitle: 'Frizerski salon Dubrovnik | Studio Marcela, Rixos Premium',
    metaDescription:
      'Frizerski salon u hotelu Rixos Premium Dubrovnik. Šišanje, bojanje, svečane i vjenčane frizure te šminkanje. Naručite se online.',
    addressStreet: 'Liechtensteinov put 3, Hotel Rixos Premium',
    addressPostal: '20000',
    addressCity: 'Dubrovnik',
    phone: '099 / 5258 154',
    phoneHref: '+385995258154',
    latitude: 42.6549,
    longitude: 18.0708,
    intro: [
      'Studio u hotelu Rixos Premium radi za goste hotela, ali i za sve ostale — ne morate biti smješteni kod nas da biste rezervirali termin.',
      'Ljeti je ovdje najviše svečanih i vjenčanih frizura te šminkanja, pa termine za posebne prigode preporučujemo dogovoriti unaprijed. Za fen frizuru i šišanje najčešće nađemo mjesto i isti dan.',
    ],
    gettingHere: [
      { label: 'Ulaz', value: 'Unutar hotela Rixos Premium Dubrovnik' },
      { label: 'Gosti drugih hotela', value: 'Dobrodošli — rezervacija je dovoljna' },
      { label: 'Parking', value: 'Hotelski parking', verify: true },
    ],
    hours: null,
    keywords: ['hairdresser Dubrovnik', 'hair salon Dubrovnik', 'wedding hair Dubrovnik'],
    isHotelSalon: true,
    primaryLocale: 'en',
    heroRef: 'INTERIOR-MOOD-01',
  },
  {
    slug: 'dubrovnik-sheraton',
    locative: 'na Srebrenom',
    displayName: 'Srebreno — Sheraton Dubrovnik Riviera',
    city: 'Dubrovnik',
    h1: 'Frizerski salon Srebreno — Studio Marcela u hotelu Sheraton Dubrovnik Riviera',
    h2: 'Frizer u Župi dubrovačkoj: vjenčane frizure, šminkanje i njega kose',
    metaTitle: 'Frizerski salon Srebreno | Studio Marcela, Sheraton Dubrovnik Riviera',
    metaDescription:
      'Frizerski salon u hotelu Sheraton Dubrovnik Riviera, Srebreno. Vjenčane frizure, šminkanje i njega kose. Naručite se online.',
    addressStreet: 'Šetalište Dr. F. Tuđmana 17, Sheraton Dubrovnik Riviera',
    addressPostal: '20207',
    addressCity: 'Srebreno',
    phone: '099 / 1644 508',
    phoneHref: '+385991644508',
    latitude: 42.6339,
    longitude: 18.1811,
    intro: [
      'Studio u Sheratonu na Srebrenom prije svega je studio za vjenčanja. Radimo cijele svadbene grupe — mladenku, majke, kume i djeveruše — i slažemo raspored unatrag od sata kad svi moraju biti gotovi.',
      'Ako planirate vjenčanje u Župi dubrovačkoj ili okolici, javite nam se i prije nego što imate sve detalje. Dogovorit ćemo probnu frizuru, izračunati koliko vremena treba za vašu grupu i poslati vam raspored po satima.',
    ],
    gettingHere: [
      { label: 'Ulaz', value: 'Unutar hotela Sheraton Dubrovnik Riviera' },
      { label: 'Vjenčanja', value: 'Dolazimo i na lokaciju vjenčanja' },
      { label: 'Parking', value: 'Hotelski parking', verify: true },
    ],
    hours: null,
    keywords: ['hair salon Srebreno', 'wedding hair Dubrovnik Riviera', 'bridal hair Dubrovnik'],
    isHotelSalon: true,
    primaryLocale: 'en',
    heroRef: 'INTERIOR-MOOD-01',
  },
];

export function getLocation(slug: string): LocationContent | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

/** The two nearest other salons — captures "the other one was full". */
export function nearbyLocations(slug: string, count = 2): LocationContent[] {
  const current = getLocation(slug);
  if (!current) return [];
  return LOCATIONS.filter((l) => l.slug !== slug && l.city === current.city).slice(0, count);
}
