/**
 * Service catalogue — prices from the current published price list
 * (IMPLEMENTATION_PLAN.md §26), pending per-location confirmation.
 *
 * Prices are integer cents. Durations are honest ranges, never a single
 * optimistic number.
 *
 * The rule from §7.3: **every service states its price.** The current site
 * says "contact us for pricing" on /usluge while publishing a full list on
 * /cjenik. That contradiction does not survive here.
 *
 * `bookable: false` means the engine cannot schedule it yet — either the price
 * is unpublished or it needs a consultation first. Those services are still
 * listed and described, but they route to a phone call rather than to a
 * booking URL that would dead-end.
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
  /** Whether the scheduling engine can currently offer this online. */
  bookable: boolean;

  // ── Detail-page content (§7.3 template) ──────────────────────────
  /** "Što je to" — 2–3 paragraphs, plain language. */
  bodyHr?: string[];
  /** Who it suits, and honestly who it does not. */
  suitsHr?: string[];
  notSuitsHr?: string;
  /** Numbered steps with realistic timings. */
  stepsHr?: { title: string; detail: string }[];
  aftercareHr?: string;
  faqHr?: { q: string; a: string }[];
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
    includesHr: ['Pranje kose', 'Njega kose', 'Šišanje', 'Pramenovi', 'Preljev', 'Fen frizura'],
    imageRef: 'SVC-FOILS-01',
    isPackage: true,
    bookable: true,
    bodyHr: [
      'Paket pokriva cijeli posjet: pranje, njegu, šišanje, pramenove, preljev i fen frizuru. Cijena je fiksna, pa na kraju plaćate točno ono što ste vidjeli prije nego ste sjeli u stolicu.',
      'Ako radite pramenove nekoliko puta godišnje, ovo je gotovo uvijek povoljnije od pojedinačnih usluga — a i jednostavnije, jer ne morate slagati što uzeti, a što preskočiti.',
    ],
  },
  {
    slug: 'paket-bojanje',
    nameHr: 'Bojanje — sve uključeno',
    nameEn: 'Colour — all inclusive',
    category: 'boja',
    fromPriceCents: 5500,
    durationMinFrom: 120,
    durationMinTo: 180,
    summaryHr: 'Cijela usluga bojanja s njegom, šišanjem i fen frizurom u jednoj cijeni.',
    includesHr: ['Pranje kose', 'Njega kose', 'Šišanje', 'Bojanje', 'Preljev', 'Fen frizura'],
    imageRef: 'SVC-COLOR-02',
    isPackage: true,
    bookable: true,
    bodyHr: [
      'Sve što ide uz bojanje — pranje, njega, šišanje, boja, preljev i fen frizura — u jednoj fiksnoj cijeni.',
      'Cijena vrijedi za kosu do ramena. Za dužu ili gušću kosu stilist će vam reći točan iznos prije početka rada, nikad nakon.',
    ],
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
    bookable: true,
    bodyHr: [
      'Šišanje kod nas počinje razgovorom, ne škarama. Prije nego išta odrežemo, pogledamo kako vam kosa pada, koliko je gusta i koliko vremena realno imate za nju ujutro.',
      'Rez koji izgleda dobro samo dok ste u salonu nije dobar rez. Cilj je frizura koju možete sami održati — pa vam stilist pokaže kako, dok radi.',
    ],
    suitsHr: [
      'Redovito održavanje oblika, svakih 6 do 10 tjedana',
      'Promjena dužine ili potpuno nova frizura',
      'Kosu koju je teško posložiti ujutro',
    ],
    stepsHr: [
      { title: 'Konzultacija', detail: '5–10 minuta. Što želite, što vaša kosa dopušta i koliko vremena imate za održavanje.' },
      { title: 'Pranje i njega', detail: 'Silky šampon i njega prilagođena tipu kose.' },
      { title: 'Šišanje', detail: 'Rez u skladu s dogovorenim oblikom i strukturom kose.' },
      { title: 'Fen frizura', detail: 'Oblikovanje i savjet kako to ponoviti kod kuće.' },
    ],
    aftercareHr:
      'Za održavanje oblika preporučujemo šišanje svakih 6 do 10 tjedana, ovisno o dužini i tipu kose.',
    faqHr: [
      { q: 'Mogu li doći samo na fen frizuru?', a: 'Da. Fen frizura se naručuje zasebno i traje 30 do 60 minuta ovisno o dužini kose.' },
      { q: 'Koliko unaprijed se trebam naručiti?', a: 'Za šišanje najčešće nađemo termin unutar nekoliko dana, a često i isti dan.' },
    ],
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
    bookable: true,
    bodyHr: [
      'Bojanje cijele dužine ili samo izrasta, ovisno o tome koliko je boje izraslo i u kakvom su stanju vrhovi. Radimo Silky bojama koje naručujemo izravno iz tvornice u Milanu.',
      'Svaku formulu zapisujemo — nijansu, razvijač, omjer i vrijeme stajanja. To znači da sljedeći put boja izgleda isto, i kad vas iznimno preuzme druga kolegica.',
    ],
    suitsHr: ['Pokrivanje sijedih', 'Promjenu nijanse unutar dva tona', 'Osvježavanje boje koja je izblijedjela'],
    notSuitsHr:
      'Ako želite ići više od dva tona svjetlije, ili je kosa ranije bojana bojom iz drogerije, vjerojatno je prvo potrebna korekcija. Recite nam to pri naručivanju — bolje je odvojiti duži termin nego stati na pola.',
    stepsHr: [
      { title: 'Konzultacija i formula', detail: '10 minuta. Dogovaramo nijansu i provjeravamo stanje kose.' },
      { title: 'Nanošenje', detail: '30–45 minuta, ovisno o dužini i gustoći.' },
      { title: 'Stajanje', detail: '30–40 minuta. Boja radi, a vi imate pauzu.' },
      { title: 'Pranje, njega i fen', detail: '40 minuta. Ispiranje, njega i oblikovanje.' },
    ],
    aftercareHr:
      'Bojanu kosu perite šamponom bez sulfata i koristite masku jednom tjedno. Izrast se najčešće osvježava svakih 4 do 6 tjedana.',
    faqHr: [
      { q: 'Pokriva li boja sijede?', a: 'Da. Za veći postotak sijedih koristimo formulu s većim udjelom baznih nijansi i nešto duljim vremenom stajanja.' },
      { q: 'Trebam li test na alergiju?', a: 'Ako kod nas bojite kosu prvi put, preporučujemo test 48 sati unaprijed. Javite nam pri naručivanju i dogovorit ćemo termin.' },
    ],
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
    bookable: true,
    bodyHr: [
      'Klasična tehnika na folije, kojom se posvjetljuju odvojeni pramenovi po cijeloj glavi. Daje ravnomjeran, predvidljiv rezultat i najviše svjetline oko lica.',
      'Nakon posvjetljivanja gotovo uvijek slijedi preljev — on neutralizira žute tonove i daje boji dubinu. Bez njega pramenovi izgledaju sirovo.',
    ],
    suitsHr: ['Ravnomjerno posvjetljenje cijele kose', 'Pokrivanje sijedih uz posvjetljenje', 'Jasan, definiran kontrast'],
    notSuitsHr:
      'Ako želite prijelaz koji raste bez vidljive linije izrasta, balayage je bolji izbor — pramenovi se obnavljaju svakih 6 do 8 tjedana.',
    stepsHr: [
      { title: 'Konzultacija', detail: '10 minuta. Dogovaramo koliko svjetline i koji ton.' },
      { title: 'Folije', detail: '45–60 minuta odvajanja i nanošenja.' },
      { title: 'Stajanje', detail: '30–45 minuta.' },
      { title: 'Pranje, preljev i fen', detail: '45–50 minuta.' },
    ],
    aftercareHr:
      'Ljubičasti šampon jednom do dvaput tjedno drži ton hladnim. Preljev se osvježava između dva termina pramenova.',
    faqHr: [
      { q: 'Koliko traju pramenovi?', a: 'Ovisno o dužini i gustoći, od dva do tri i pol sata.' },
      { q: 'Mogu li dobiti pramenove ako je kosa bojana?', a: 'Najčešće da, ali stanje kose provjeravamo prije početka. Ponekad je potrebno raditi u dva navrata.' },
    ],
  },
  {
    slug: 'balayage',
    nameHr: 'Balayage',
    nameEn: 'Balayage',
    category: 'boja',
    fromPriceCents: 5000,
    durationMinFrom: 120,
    durationMinTo: 240,
    summaryHr: 'Ručno slikana tehnika s mekim prijelazom — raste bez oštre linije izrasta.',
    imageRef: 'SVC-COLOR-01',
    bookable: true,
    bodyHr: [
      'Balayage je tehnika kod koje boju nanosimo slobodnom rukom, bez folija, tako da prijelaz prema svjetlijem ide postupno. Rezultat izgleda kao kosa posvijetljena suncem — i, što je praktičnije, raste bez oštre linije izrasta.',
      'Zbog toga se balayage obnavlja rjeđe nego klasični pramenovi: umjesto svakih šest do osam tjedana, obično svakih tri do četiri mjeseca. Skuplji je po posjetu, jeftiniji kroz godinu.',
    ],
    suitsHr: [
      'Kosu koju ne želite održavati svakih mjesec dana',
      'Prirodan, mekan prijelaz bez oštre granice',
      'Dužu kosu, gdje prijelaz ima prostora',
    ],
    notSuitsHr:
      'Vrlo tamnu, ranije bojanu ili oštećenu kosu ponekad prvo treba korigirati. To ćemo vam reći na konzultaciji, prije nego što išta počnemo — bolje odgoditi nego napraviti nešto što ne možemo dovršiti.',
    stepsHr: [
      { title: 'Konzultacija', detail: '10–15 minuta. Gledamo strukturu kose i dogovaramo realan cilj.' },
      { title: 'Slikanje boje', detail: '60–75 minuta ručnog nanošenja.' },
      { title: 'Stajanje', detail: '40–45 minuta.' },
      { title: 'Pranje, preljev i fen', detail: '50–60 minuta.' },
    ],
    aftercareHr:
      'Preljev osvježite svaka dva do tri mjeseca, a sam balayage obnavljajte svaka tri do četiri mjeseca.',
    faqHr: [
      { q: 'Koliko dugo traje balayage?', a: 'Od dva do četiri sata, ovisno o dužini, gustoći i početnoj boji.' },
      { q: 'Je li balayage skuplji od pramenova?', a: 'Po posjetu jest, ali se obnavlja dvostruko rjeđe — kroz godinu najčešće izađe povoljnije.' },
    ],
  },
  {
    slug: 'airtouch',
    nameHr: 'AirTouch',
    nameEn: 'AirTouch',
    category: 'boja',
    fromPriceCents: 0,
    durationMinFrom: 180,
    durationMinTo: 300,
    summaryHr: 'Tehnika kod koje se kraći pramenovi izdvoje zrakom prije nanošenja boje.',
    imageRef: 'SVC-COLOR-01',
    priceMissing: true,
    bookable: false,
    bodyHr: [
      'Kod AirToucha svaki se pramen prije nanošenja boje propuše fenom, tako da kraće i tanje dlake ispadnu. Boja ide samo na duže dlake, pa je prijelaz izuzetno mekan.',
      'Tehnika je spora — traje tri do pet sati — ali daje najprirodniji prijelaz od svih tehnika posvjetljivanja i najduže izgleda uredno dok raste.',
    ],
    notSuitsHr:
      'Traži puno vremena u stolici. Ako imate manje od tri sata, balayage daje sličan dojam u kraćem terminu.',
    faqHr: [
      { q: 'Zašto ne mogu rezervirati AirTouch online?', a: 'Cijena i trajanje ovise o dužini i gustoći kose više nego kod drugih tehnika, pa termin dogovaramo telefonski nakon kratke konzultacije.' },
    ],
  },
  {
    slug: 'preljev',
    nameHr: 'Preljev',
    nameEn: 'Gloss and toner',
    category: 'boja',
    fromPriceCents: 3500,
    durationMinFrom: 30,
    durationMinTo: 60,
    summaryHr: 'Neutralizira neželjene tonove i vraća sjaj bez trajne promjene boje.',
    imageRef: 'SVC-COLOR-01',
    bookable: false,
    bodyHr: [
      'Preljev ne mijenja dubinu boje — mijenja ton. Neutralizira žute i narančaste odsjaje nakon posvjetljivanja i vraća kosi sjaj koji se izgubi pranjem.',
      'To je najbrža i najjeftinija usluga s najvidljivijim rezultatom, i najbolji način da razmak između dva bojanja produžite za nekoliko tjedana.',
    ],
    faqHr: [
      { q: 'Koliko traje učinak preljeva?', a: 'Obično četiri do šest tjedana, ovisno o tome koliko često perete kosu.' },
    ],
  },
  {
    slug: 'keratinski-tretman',
    nameHr: 'Keratinski tretman',
    nameEn: 'Keratin treatment',
    category: 'njega',
    fromPriceCents: 0,
    durationMinFrom: 120,
    durationMinTo: 210,
    summaryHr: 'Smiruje kovrče i skraćuje jutarnje feniranje na nekoliko minuta.',
    imageRef: 'SVC-WASH-01',
    priceMissing: true,
    bookable: false,
    bodyHr: [
      'Keratinski tretman ne ispravlja kosu trajno — smiruje je. Kovrče postaju mekše i predvidljivije, a feniranje traje bitno kraće.',
      'Učinak drži dva do četiri mjeseca, ovisno o tipu kose i o tome kako je perete.',
    ],
    faqHr: [
      { q: 'Hoće li mi kosa biti potpuno ravna?', a: 'Ne. Tretman smanjuje volumen i kovrčavost, ali zadržava prirodan pokret. Za potpuno ravnu kosu potreban je drugi postupak.' },
    ],
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
    bookable: true,
    bodyHr: [
      'Njega nije dodatak koji vam prodajemo na kraju — to je ono što određuje kako će boja izgledati za tri tjedna. Suha kosa boju ispire brže.',
      'Radimo Silky tretmanima: maskom, ampulama i arganovim uljem, uz masažu vlasišta koja pomaže prokrvljenosti.',
    ],
    faqHr: [
      { q: 'Mogu li tretman dodati uz bojanje?', a: 'Da, i tada je najučinkovitiji. Recite stilistu pri dolasku.' },
    ],
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
    bookable: true,
    bodyHr: [
      'Klasično šišanje škarama ili mašinicom, s prijelazima koliko god oštrim ili mekim želite.',
      'Termini su kratki i drže se rasporeda — ako ste naručeni u 17:30, u 17:30 i sjedate.',
    ],
    faqHr: [
      { q: 'Radite li i bradu?', a: 'Da, oblikovanje brade radimo uz šišanje ili zasebno.' },
    ],
  },
  {
    slug: 'djecje-sisanje',
    nameHr: 'Dječje šišanje',
    nameEn: "Children's cut",
    category: 'sisanje',
    fromPriceCents: 1000,
    durationMinFrom: 20,
    durationMinTo: 40,
    summaryHr: 'Za djecu do 10 godina, bez žurbe i bez drame.',
    imageRef: 'SVC-CUT-01',
    bookable: false,
    bodyHr: [
      'Djecu šišamo bez žurbe. Ako prvi put sjedaju u stolicu, uzmite raniji termin kad je u salonu mirnije — reći ćemo vam koji je to.',
      'Roditelji mogu sjediti uz stolicu koliko god treba.',
    ],
  },
  {
    slug: 'svecane-frizure',
    nameHr: 'Svečane frizure',
    nameEn: 'Formal styling',
    category: 'prigode',
    fromPriceCents: 4000,
    durationMinFrom: 45,
    durationMinTo: 90,
    summaryHr: 'Za vjenčanja, krstitke, maturalne i sve prigode s fotografijom.',
    imageRef: 'BRIDAL-03',
    bookable: false,
    bodyHr: [
      'Podignute, polupodignute ili raspuštene frizure koje izdrže cijelu večer — i, jednako važno, dobro izgledaju na fotografijama.',
      'Ako imate haljinu ili nakit koji ide uz frizuru, pošaljite fotografiju unaprijed.',
    ],
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
    bookable: true,
    bodyHr: [
      'Vjenčana frizura uvijek ide uz probu. Na probi složimo izgled, izmjerimo koliko traje i provjerimo kako se drži kroz dan.',
      'Za vjenčanja slažemo raspored unatrag od sata kad svi moraju biti gotovi, i pošaljemo vam ga po satima — mladenka, majke, kume i djeveruše.',
    ],
    stepsHr: [
      { title: 'Proba', detail: '60–90 minuta, obično 4 do 8 tjedana prije.' },
      { title: 'Raspored', detail: 'Slažemo satnicu unatrag od trenutka kad morate biti spremni.' },
      { title: 'Na dan vjenčanja', detail: 'U salonu ili na vašoj adresi.' },
    ],
    faqHr: [
      { q: 'Dolazite li na lokaciju?', a: 'Da. Vjenčana frizura to go stoji 80 €, uz nadoplatu za putovanje izvan grada.' },
      { q: 'Koliko unaprijed se trebam javiti?', a: 'Za termine u sezoni preporučujemo tri do šest mjeseci unaprijed.' },
    ],
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
    bookable: true,
    bodyHr: [
      'Šminka koja izdrži cijeli dan i dobro izgleda i uživo i na fotografiji — dvije stvari koje ne idu automatski zajedno.',
      'Ako imate osjetljivu kožu ili alergiju, javite nam unaprijed i prilagodit ćemo proizvode.',
    ],
    faqHr: [
      { q: 'Radite li ugradnju trepavica?', a: 'Da, uz šminkanje ili zasebno.' },
    ],
  },
  {
    slug: 'ekstenzije',
    nameHr: 'Ekstenzije',
    nameEn: 'Extensions',
    category: 'njega',
    fromPriceCents: 400,
    durationMinFrom: 90,
    durationMinTo: 240,
    summaryHr: 'Ugradnja i podizanje ekstenzija, cijena po komadu.',
    imageRef: 'RESULT-01',
    bookable: false,
    bodyHr: [
      'Ugradnja se naplaćuje po komadu, pa konačna cijena ovisi o tome koliko ih treba za željenu gustoću i dužinu.',
      'Na konzultaciji ćemo procijeniti broj i reći vam točan iznos prije nego što išta počnemo.',
    ],
  },
];

export const ALL_SERVICES = [...PACKAGES, ...SERVICES];

export function getService(slug: string): ServiceContent | undefined {
  return ALL_SERVICES.find((s) => s.slug === slug);
}

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
