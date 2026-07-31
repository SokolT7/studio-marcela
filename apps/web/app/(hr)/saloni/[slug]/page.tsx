import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaLink, Eyebrow, RefImage, Section, VerifyBadge } from '@/components/ui';
import { LOCATIONS, getLocation, nearbyLocations } from '@/lib/content/locations';
import { SERVICES, formatDurationRange, formatPrice } from '@/lib/content/services';
import { MissingPrice } from '@/components/ui';

/**
 * Location page — IMPLEMENTATION_PLAN.md §7.2.
 *
 * The most important pages on the site. Seven salons currently share one
 * contact page and compete as a single entity; each of these can win its own
 * neighbourhood instead.
 *
 * Two rules are non-negotiable and enforced by the content model:
 *   1. The district appears in the `<h1>` **and** the first `<h2>`.
 *   2. Every page carries its own HairSalon schema — never one block copied
 *      seven times with the city swapped, which triggers the same suppression
 *      as duplicate content.
 */

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};

  return {
    // `absolute` bypasses the root layout's "%s | Studio Marcela" template —
    // these titles already carry the brand, and the template was doubling it
    // and pushing the title well past 60 characters.
    title: { absolute: location.metaTitle },
    description: location.metaDescription,
    alternates: {
      canonical: `/saloni/${location.slug}`,
      languages: {
        hr: `/saloni/${location.slug}`,
        en: `/en/salons/${location.slug}`,
      },
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      url: `/saloni/${location.slug}`,
    },
  };
}

const DAY_NAMES = [
  'Nedjelja',
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
];

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  const nearby = nearbyLocations(slug);
  // Only offer services the engine can actually schedule. Linking an
  // unbookable service into the booking flow produced a 404 for AirTouch.
  const offered = SERVICES.filter((s) => s.bookable).slice(0, 6);

  /** This salon's own structured data — its address, its geo, its phone. */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `https://studiomarcela.hr/saloni/${location.slug}#salon`,
    name: `Studio Marcela ${location.displayName}`,
    parentOrganization: { '@id': 'https://studiomarcela.hr/#salon' },
    url: `https://studiomarcela.hr/saloni/${location.slug}`,
    telephone: `+385${location.phoneHref.replace('+385', '')}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.addressStreet,
      addressLocality: location.addressCity,
      postalCode: location.addressPostal,
      addressCountry: 'HR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude,
    },
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    // openingHoursSpecification is deliberately omitted until the client
    // supplies real hours (§25.1 item 1). Publishing invented hours would be
    // worse than publishing none.
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://studiomarcela.hr/' },
      { '@type': 'ListItem', position: 2, name: 'Saloni', item: 'https://studiomarcela.hr/saloni' },
      {
        '@type': 'ListItem',
        position: 3,
        name: location.displayName,
        item: `https://studiomarcela.hr/saloni/${location.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <RefImage
            refId={location.heroRef}
            alt={`Frizerski salon Studio Marcela ${location.displayName}`}
            ratio="h-full"
            className="h-full rounded-none [&>img]:opacity-45"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40"
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1360px] px-5 py-24 md:px-8 md:py-32 lg:px-12">
          <nav aria-label="Staza" className="mb-4 flex flex-wrap items-center text-[0.8125rem] text-ink-300">
            <Link href="/" className="flex min-h-[44px] items-center pr-1 hover:text-paper-050">
              Početna
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/saloni" className="flex min-h-[44px] items-center px-1 hover:text-paper-050">
              Saloni
            </Link>
            <span aria-hidden="true">/</span>
            <span className="flex min-h-[44px] items-center px-1 text-paper-200">{location.displayName}</span>
          </nav>

          <div className="max-w-[48rem]">
            {/* District in the H1 — the strongest on-page signal for
                "frizer + [kvart]" queries. */}
            <h1 className="t-display-lg text-paper-050">{location.h1}</h1>
            {/* And again in the first H2. */}
            <h2 className="t-body-lg measure mt-6 font-normal text-paper-200">
              {location.h2}
            </h2>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.9375rem] text-paper-200">
              <span>{location.addressStreet}</span>
              <a
                href={`tel:${location.phoneHref}`}
                className="tabular inline-flex min-h-[44px] items-center underline decoration-gold-400 underline-offset-4 hover:text-paper-050"
              >
                {location.phone}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <CtaLink href={`/narucivanje/${location.slug}`} size="lg">
                Naruči se {location.locative}
              </CtaLink>
              <CtaLink
                href={`tel:${location.phoneHref}`}
                variant="secondary"
                size="lg"
                className="border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
              >
                Nazovi salon
              </CtaLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro + practicalities ─────────────────────────────── */}
      <Section tone="paper">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.6fr] lg:gap-20">
          <div>
            <Eyebrow>O ovom studiju</Eyebrow>
            {/* Unique copy per salon — never a template with the district
                swapped in. */}
            {location.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="t-body-lg measure mt-5 text-ink-700">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-8">
            <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-7">
              <h3 className="t-heading-md">Kako do nas</h3>
              <dl className="mt-5 space-y-4">
                {location.gettingHere.map((item) => (
                  <div key={item.label}>
                    <dt className="t-caption text-ink-500">{item.label}</dt>
                    <dd className="mt-1 text-[0.9375rem] text-ink-900">
                      {item.value}
                      {item.verify && <VerifyBadge />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-7">
              <h3 className="t-heading-md">Radno vrijeme</h3>
              {location.hours ? (
                <table className="mt-5 w-full text-[0.9375rem]">
                  <tbody>
                    {location.hours.map((h) => (
                      <tr key={h.day}>
                        <th scope="row" className="py-1.5 text-left font-normal text-ink-700">
                          {DAY_NAMES[h.day]}
                        </th>
                        <td className="tabular py-1.5 text-right text-ink-900">
                          {h.closed ? 'Zatvoreno' : `${h.opens} – ${h.closes}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-4 rounded-[8px] bg-warning-600/10 p-4 text-[0.875rem] text-warning-600">
                  <strong>Podatak nedostaje.</strong> Radno vrijeme nije objavljeno
                  nigdje na postojećoj stranici i mora se zatražiti od klijenta prije
                  objave — vidi plan §25.1.
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Services here ──────────────────────────────────────── */}
      <Section tone="tint">
        <div className="max-w-[44rem]">
          <Eyebrow>Usluge</Eyebrow>
          <h2 className="t-display-md">Što radimo {location.locative}</h2>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offered.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/narucivanje/${location.slug}/${service.slug}`}
                className="group flex h-full flex-col rounded-[16px] border border-paper-200 bg-paper-000 p-6 transition-colors hover:border-gold-500/55"
              >
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
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── The room ───────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="max-w-[44rem]">
          <Eyebrow>Studio</Eyebrow>
          <h2 className="t-display-md">Kako izgleda kod nas</h2>
          <p className="t-body-lg mt-6 text-ink-700">
            Svaka fotografija bit će snimljena upravo u ovom studiju, s našim
            timom i našim gostima.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <RefImage refId="INTERIOR-01" alt={`Prostor salona ${location.displayName}`} sizes="33vw" />
          <RefImage refId="SVC-WASH-02" alt="Dio za pranje kose" sizes="33vw" />
          <RefImage refId="TOOLS-01" alt="Radno mjesto stilista" sizes="33vw" />
        </div>
      </Section>

      {/* ── Nearby — captures "the other one was full" ─────────── */}
      {nearby.length > 0 && (
        <Section tone="tint">
          <h2 className="t-display-md">Drugi studiji u blizini</h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {nearby.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/saloni/${other.slug}`}
                  className="group flex items-center justify-between gap-6 rounded-[16px] border border-paper-200 bg-paper-000 p-7 transition-colors hover:border-gold-500/55"
                >
                  <div>
                    <h3 className="t-heading-md">{other.displayName}</h3>
                    <p className="mt-1.5 text-[0.9375rem] text-ink-700">
                      {other.addressStreet}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-gold-700 transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <Section tone="ink">
        <div className="mx-auto max-w-[42rem] text-center">
          <h2 className="t-display-md text-paper-050">
            Rezervirajte termin {location.locative}
          </h2>
          <p className="t-body-lg mt-6 text-paper-200">
            Odaberite uslugu i vrijeme koje vam odgovara. Potvrda stiže odmah.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CtaLink href={`/narucivanje/${location.slug}`} size="lg">
              Naruči se
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  );
}
