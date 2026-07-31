import Link from 'next/link';
import { CtaLink, Eyebrow, RefImage, Section } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';
import {
  PACKAGES,
  SERVICES,
  formatDurationRange,
  formatPrice,
} from '@/lib/content/services';
import { MissingPrice } from '@/components/ui';

/**
 * Homepage — IMPLEMENTATION_PLAN.md §7.1.
 *
 * Answers the four questions from §3.4 in order, above the fold where it can:
 * what is this and is it near me · what will it cost and how long · who will
 * do it · can I book it now without phoning anyone.
 */

const FAQ = [
  {
    q: 'Trebam li platiti unaprijed?',
    a: 'Za većinu usluga ne. Kod bojanja, pramenova i vjenčanih frizura tražimo manju akontaciju koja se odbija od konačnog računa — tako termini ostaju slobodni za ljude koji stvarno dolaze.',
  },
  {
    q: 'Koliko traje bojanje?',
    a: 'Ovisi o dužini i gustoći kose, ali računajte na dva do tri sata. Točno trajanje vidite prije nego potvrdite termin, a ne tek kad sjednete u stolicu.',
  },
  {
    q: 'Mogu li odabrati stilista?',
    a: 'Da. Svaki član tima ima svoj kalendar, svoj portfolio i svoju specijalnost. Ako nemate preferenciju, odaberite „prvi slobodni” i dobit ćete najraniji termin.',
  },
  {
    q: 'Što ako moram otkazati?',
    a: 'Otkazivanje je besplatno do 24 sata prije termina, izravno preko poveznice iz potvrde. Bez poziva i bez objašnjavanja.',
  },
  {
    q: 'Radite li vikendom?',
    a: 'Subotom da, u većini studija. Točno radno vrijeme svakog salona nalazi se na njegovoj stranici.',
  },
  {
    q: 'Dolazite li na kućnu adresu?',
    a: 'Da — usluga Frizer to Go pokriva Zagreb. Stilist donosi svu opremu i profesionalne proizvode, a vi trebate samo stolicu, utičnicu i vodu.',
  },
];

export default function HomePage() {
  const featured = SERVICES.slice(0, 6);

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────
          The H1 names the service, the city and the differentiator,
          in Croatian, on the Croatian page. The current site's H1 is
          "OUR SALONS". */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <RefImage
            refId="INTERIOR-01"
            alt="Unutrašnjost frizerskog salona Studio Marcela s prirodnim svjetlom"
            ratio="h-full"
            className="h-full rounded-none [&>img]:opacity-55"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/25"
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1360px] px-5 py-24 md:px-8 md:py-28 lg:px-12">
          <div className="max-w-[42rem]">
            <p className="t-caption reveal mb-5 text-gold-400">
              Zagreb · Dubrovnik — od 2010.
            </p>
            <h1 className="t-display-xl reveal reveal-1 text-paper-050">
              Frizerski salon u Zagrebu — sedam studija, jedan standard
            </h1>
            <p className="t-body-lg reveal reveal-2 measure mt-6 text-paper-200">
              Šišanje, bojanje i pramenovi kod stilista kojeg birate vi.
              Vidite cijenu i trajanje prije nego potvrdite termin.
            </p>
            <div className="reveal reveal-3 mt-8 flex flex-wrap gap-3">
              <CtaLink href="/narucivanje" size="lg">
                Naruči se
              </CtaLink>
              <CtaLink
                href="/cjenik"
                variant="secondary"
                size="lg"
                className="border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
              >
                Pogledaj cjenik
              </CtaLink>
            </div>
            <p className="mt-5 text-[0.875rem] text-ink-300">
              Potvrda termina stiže odmah — bez čekanja na poziv.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Trust bar ───────────────────────────────────────── */}
      <div className="border-b border-paper-200 bg-paper-100">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-[0.875rem] text-ink-700 md:px-8 lg:px-12">
          <span>16 godina iskustva</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold-400 sm:block" aria-hidden="true" />
          <span>7 studija</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold-400 sm:block" aria-hidden="true" />
          <span>Silky TechnoBasic iz Milana</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold-400 sm:block" aria-hidden="true" />
          <span>174+ recenzija</span>
        </div>
      </div>

      {/* ── 3. All-inclusive offer ─────────────────────────────── */}
      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <Eyebrow>Sve uključeno</Eyebrow>
            <h2 className="t-display-lg">Sve uključeno. Bez iznenađenja na kraju.</h2>
            <p className="t-body-lg measure mt-6 text-ink-700">
              Dvije najtraženije usluge s fiksnom cijenom u koju ulazi baš sve —
              pranje, njega kose, šišanje, boja ili pramenovi, preljev i fen frizura.
            </p>

            <div className="mt-10 space-y-3">
              {PACKAGES.map((pkg) => (
                <Link
                  key={pkg.slug}
                  href={`/narucivanje?paket=${pkg.slug}`}
                  className="group flex items-center gap-5 rounded-[16px] border border-paper-200 bg-paper-000 p-6 transition-colors hover:border-gold-500/55"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="t-heading-md">{pkg.nameHr}</h3>
                    <p className="mt-1.5 text-[0.875rem] text-ink-500">
                      {pkg.includesHr?.join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="t-display-md tabular text-gold-700">
                      {formatPrice(pkg.fromPriceCents)}
                    </p>
                    <p className="tabular text-[0.8125rem] text-ink-500">
                      {formatDurationRange(pkg.durationMinFrom, pkg.durationMinTo)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Answers the single biggest anxiety in salon pricing (§8.4). */}
            <p className="measure mt-7 border-l-2 border-gold-500 pl-5 text-[0.9375rem] text-ink-700">
              Cijena vrijedi za kosu do ramena. Za dužu ili gušću kosu stilist će vam
              reći točan iznos prije početka rada. <strong>Nikad nakon.</strong>
            </p>
          </div>

          <RefImage
            refId="RESULT-02"
            alt="Rezultat bojanja — duga kosa s mekim prijelazom boje"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </Section>

      {/* ── 4. Locations ───────────────────────────────────────── */}
      <Section tone="tint" id="saloni">
        <div className="max-w-[46rem]">
          <Eyebrow>Naši studiji</Eyebrow>
          <h2 className="t-display-lg">Sedam studija. Odaberite onaj koji vam je najbliži.</h2>
          <p className="t-body-lg mt-6 text-ink-700">
            Pet u Zagrebu, dva u Dubrovniku. Isti standard, isti proizvodi, ista
            edukacija — kroz koja god vrata uđete.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((location) => (
            <li key={location.slug}>
              <Link
                href={`/saloni/${location.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000 transition-colors hover:border-gold-500/55"
              >
                <RefImage
                  refId={location.heroRef}
                  alt={`Frizerski salon Studio Marcela ${location.displayName}`}
                  ratio="aspect-[3/2]"
                  className="rounded-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="t-caption text-ink-500">{location.city}</p>
                  <h3 className="t-heading-lg mt-1.5">{location.displayName}</h3>
                  <p className="mt-2 text-[0.9375rem] text-ink-700">
                    {location.addressStreet}
                  </p>
                  <p className="tabular mt-1 text-[0.9375rem] text-ink-500">
                    {location.phone}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-gold-700">
                    Pogledaj salon
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 5. Services ────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[40rem]">
            <Eyebrow>Usluge</Eyebrow>
            <h2 className="t-display-lg">Usluge — s cijenom i trajanjem, unaprijed</h2>
            <p className="t-body-lg mt-6 text-ink-700">
              Znate što plaćate i koliko traje prije nego sjednete u stolicu.
            </p>
          </div>
          <Link
            href="/cjenik"
            className="inline-flex min-h-[44px] items-center text-[0.9375rem] font-medium text-gold-700 underline-offset-4 hover:underline"
          >
            Cijeli cjenik →
          </Link>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/narucivanje?usluga=${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000 transition-colors hover:border-gold-500/55"
              >
                <RefImage
                  refId={service.imageRef}
                  alt={service.nameHr}
                  ratio="aspect-[16/10]"
                  className="rounded-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="t-heading-md">{service.nameHr}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] text-ink-700">
                    {service.summaryHr}
                  </p>
                  <p className="tabular mt-5 flex items-baseline gap-2 text-[0.9375rem]">
                    <span className="font-semibold text-gold-700">
                      {service.priceMissing ? (
                        <MissingPrice />
                      ) : (
                        `od ${formatPrice(service.fromPriceCents)}`
                      )}
                    </span>
                    <span className="text-ink-500">·</span>
                    <span className="text-ink-500">
                      {formatDurationRange(service.durationMinFrom, service.durationMinTo)}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 6. Silky ───────────────────────────────────────────── */}
      <Section tone="ink">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <RefImage
            refId="PRODUCT-01"
            alt="Silky TechnoBasic profesionalna kozmetika"
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div>
            <p className="t-caption mb-4 text-gold-400">Silky TechnoBasic</p>
            <h2 className="t-display-lg text-paper-050">
              Iz Milana, izravno u naše studije
            </h2>
            <div className="measure mt-7 space-y-5 text-paper-200">
              <p className="t-body-lg">
                Naša osnivačica Jadranka Pezo direktorica je Silkyja za Hrvatsku.
                Proizvode koje koristimo naručujemo izravno iz tvornice H.S.A. u
                Milanu, bez posrednika i bez dugog stajanja u skladištima.
              </p>
              <p className="t-body-lg">
                Zato u svih sedam studija radimo istom linijom, iste svježine — i
                zato boja izgleda jednako i na Ilici i u Dubrovniku.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. Founder ─────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
          <RefImage
            refId="STYLIST-PORTRAIT-01"
            alt="Jadranka Pezo, osnivačica Studija Marcela"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <figure>
            <blockquote className="t-display-md measure text-ink-900">
              „Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja.”
            </blockquote>
            <figcaption className="mt-7 text-[0.9375rem] text-ink-500">
              <span className="font-medium text-ink-900">Jadranka Pezo</span>
              <span className="mx-2 text-ink-300" aria-hidden="true">
                ·
              </span>
              osnivačica Studija Marcela
            </figcaption>
            <CtaLink href="/o-nama" variant="secondary" className="mt-9">
              Naša priča
            </CtaLink>
          </figure>
        </div>
      </Section>

      {/* ── 8. Team ────────────────────────────────────────────── */}
      <Section tone="tint">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Naš tim</Eyebrow>
            <h2 className="t-display-lg">Iza svake frizure stoji netko s imenom</h2>
            <p className="t-body-lg measure mt-6 text-ink-700">
              Birajte stilista, ne salon. Svaki član tima ima svoj portfolio, svoju
              specijalnost i svoj kalendar — i možete ga rezervirati izravno.
            </p>
            <CtaLink href="/tim" variant="secondary" className="mt-9">
              Upoznajte tim
            </CtaLink>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RefImage
              refId="STYLIST-ATWORK-01"
              alt="Stilist Studija Marcela u radu"
              ratio="aspect-[4/5]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <RefImage
              refId="SVC-CUT-01"
              alt="Šišanje u Studiju Marcela"
              ratio="aspect-[4/5]"
              className="mt-10"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </Section>

      {/* ── 9. FAQ ─────────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="grid gap-14 lg:grid-cols-[0.55fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>Česta pitanja</Eyebrow>
            <h2 className="t-display-md">Prije nego se naručite</h2>
          </div>
          <dl className="divide-y divide-paper-200 border-y border-paper-200">
            {FAQ.map((item) => (
              <div key={item.q} className="py-7">
                <dt className="t-heading-md">{item.q}</dt>
                <dd className="measure mt-3 text-ink-700">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* FAQPage structured data (§14.3). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />

      {/* ── 10. Closing CTA ────────────────────────────────────── */}
      <Section tone="ink">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="t-display-lg text-paper-050">Slobodni termini već ovaj tjedan</h2>
          <p className="t-body-lg mt-6 text-paper-200">
            Odaberite salon, uslugu i vrijeme. Potvrda stiže odmah — bez čekanja na
            poziv i bez poruka koje nitko ne pročita.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CtaLink href="/narucivanje" size="lg">
              Naruči se
            </CtaLink>
          </div>
          <p className="mt-7 text-[0.875rem] text-ink-300">
            Radije biste telefonom?{' '}
            <Link href="/kontakt" className="text-paper-200 underline underline-offset-4">
              Nazovite svoj salon
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
