import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClosingCta } from '@/components/page-shell';
import { CtaLink, Eyebrow, MissingPrice, RefImage, Section } from '@/components/ui';
import {
  ALL_SERVICES,
  formatDurationRange,
  formatPrice,
  getService,
} from '@/lib/content/services';
import { LOCATIONS } from '@/lib/content/locations';

/**
 * Service detail page — IMPLEMENTATION_PLAN.md §7.3.
 *
 * These win the high-intent commercial searches: someone typing "balayage
 * Zagreb cijena" is far closer to booking than someone typing "frizer".
 *
 * Sales rules enforced here: the price is visible without scrolling on mobile,
 * duration is a realistic range, and the primary CTA books *this* service
 * pre-selected. Never "contact us for pricing".
 */

export function generateStaticParams() {
  return ALL_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const price = service.priceMissing
    ? ''
    : ` od ${formatPrice(service.fromPriceCents)}.`;

  return {
    title: { absolute: `${service.nameHr} u Zagrebu — cijena i termini | Studio Marcela` },
    description: `${service.summaryHr}${price} Vidite trajanje i naručite se online u jednom od sedam studija.`,
    alternates: { canonical: `/usluge/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = ALL_SERVICES.filter(
    (s) => s.category === service.category && s.slug !== service.slug,
  ).slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.nameHr,
    serviceType: service.nameEn,
    provider: { '@id': 'https://studiomarcela.hr/#salon' },
    areaServed: [
      { '@type': 'City', name: 'Zagreb' },
      { '@type': 'City', name: 'Dubrovnik' },
    ],
    ...(service.priceMissing
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            price: (service.fromPriceCents / 100).toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        }),
  };

  const faqSchema = service.faqHr?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: service.faqHr.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* ── Hero: price and duration above the fold ─────────────── */}
      <Section tone="paper">
        <nav aria-label="Staza" className="mb-4 flex flex-wrap items-center text-[0.8125rem] text-ink-500">
          <Link href="/" className="flex min-h-[44px] items-center pr-1 hover:text-ink-900">
            Početna
          </Link>
          <span className="px-1 text-ink-300" aria-hidden="true">/</span>
          <Link href="/usluge" className="flex min-h-[44px] items-center px-1 hover:text-ink-900">
            Usluge
          </Link>
          <span className="px-1 text-ink-300" aria-hidden="true">/</span>
          <span className="flex min-h-[44px] items-center px-1 text-ink-900">{service.nameHr}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <h1 className="t-display-lg">{service.nameHr} u Zagrebu</h1>
            <p className="t-body-lg measure mt-6 text-ink-700">{service.summaryHr}</p>

            <div className="tabular mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="t-display-md text-gold-700">
                {service.priceMissing ? (
                  <MissingPrice />
                ) : service.isPackage ? (
                  formatPrice(service.fromPriceCents)
                ) : (
                  `od ${formatPrice(service.fromPriceCents)}`
                )}
              </span>
              <span className="text-ink-300" aria-hidden="true">
                ·
              </span>
              <span className="text-ink-500">
                {formatDurationRange(service.durationMinFrom, service.durationMinTo)}
              </span>
            </div>

            {service.includesHr && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {service.includesHr.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-paper-200 bg-paper-000 px-3.5 py-1.5 text-[0.875rem] text-ink-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              {service.bookable ? (
                <CtaLink href={`/narucivanje?usluga=${service.slug}`} size="lg">
                  Rezerviraj {service.nameHr.toLowerCase()}
                </CtaLink>
              ) : (
                // Never link to a booking URL the engine cannot fulfil.
                <CtaLink href="/kontakt" size="lg">
                  Dogovorite termin telefonom
                </CtaLink>
              )}
              <CtaLink href="/cjenik" variant="secondary" size="lg">
                Cijeli cjenik
              </CtaLink>
            </div>

            {!service.bookable && (
              <p className="mt-5 rounded-[8px] bg-paper-100 px-4 py-3 text-[0.875rem] text-ink-700">
                Ovu uslugu dogovaramo osobno — cijena i trajanje previše ovise o
                stanju i dužini kose da bismo ih pošteno prikazali unaprijed.
              </p>
            )}
          </div>

          <RefImage
            refId={service.imageRef}
            alt={service.nameHr}
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </div>
      </Section>

      {/* ── What it is ──────────────────────────────────────────── */}
      {service.bodyHr && (
        <Section tone="tint">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <Eyebrow>Što je to</Eyebrow>
            <div className="measure space-y-5">
              {service.bodyHr.map((paragraph) => (
                <p key={paragraph.slice(0, 30)} className="t-body-lg text-ink-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Who it suits, and who it doesn't ────────────────────── */}
      {(service.suitsHr || service.notSuitsHr) && (
        <Section tone="paper">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <Eyebrow>Kome odgovara</Eyebrow>
            <div>
              {service.suitsHr && (
                <ul className="space-y-3">
                  {service.suitsHr.map((item) => (
                    <li key={item} className="flex gap-3 text-ink-700">
                      <span aria-hidden="true" className="mt-1.5 text-gold-700">
                        —
                      </span>
                      <span className="t-body-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {service.notSuitsHr && (
                // Being honest here prevents the worst kind of appointment:
                // one that cannot deliver what was expected (§7.3).
                <p className="measure mt-8 border-l-2 border-gold-500 pl-5 text-ink-700">
                  {service.notSuitsHr}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── How it works ───────────────────────────────────────── */}
      {service.stepsHr && (
        <Section tone="tint">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <Eyebrow>Kako izgleda</Eyebrow>
            <ol className="divide-y divide-paper-200 border-y border-paper-200">
              {service.stepsHr.map((step, index) => (
                <li key={step.title} className="flex gap-5 py-6">
                  <span className="tabular text-[0.875rem] font-semibold text-gold-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="t-heading-md">{step.title}</h3>
                    <p className="mt-1.5 text-ink-700">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      )}

      {/* ── Aftercare ──────────────────────────────────────────── */}
      {service.aftercareHr && (
        <Section tone="paper">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <Eyebrow>Njega poslije</Eyebrow>
            <p className="t-body-lg measure text-ink-700">{service.aftercareHr}</p>
          </div>
        </Section>
      )}

      {/* ── Available at ───────────────────────────────────────── */}
      <Section tone="tint">
        <h2 className="t-display-md">Dostupno u našim studijima</h2>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {LOCATIONS.map((location) => (
            <li key={location.slug}>
              <Link
                href={`/saloni/${location.slug}`}
                className="inline-flex min-h-[44px] items-center rounded-[8px] border border-paper-200 bg-paper-000 px-4 text-[0.9375rem] text-ink-700 transition-colors hover:border-gold-500/55 hover:text-ink-900"
              >
                {location.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      {service.faqHr && (
        <Section tone="paper">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <Eyebrow>Česta pitanja</Eyebrow>
            <dl className="divide-y divide-paper-200 border-y border-paper-200">
              {service.faqHr.map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="t-heading-md">{item.q}</dt>
                  <dd className="measure mt-2 text-ink-700">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      )}

      {/* ── Related ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <Section tone="tint">
          <h2 className="t-display-md">Povezane usluge</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/usluge/${other.slug}`}
                  className="group flex h-full flex-col rounded-[16px] border border-paper-200 bg-paper-000 p-6 transition-colors hover:border-gold-500/55"
                >
                  <h3 className="t-heading-md">{other.nameHr}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] text-ink-700">
                    {other.summaryHr}
                  </p>
                  <span className="tabular mt-4 text-[0.9375rem] font-medium text-gold-700">
                    {other.priceMissing
                      ? 'cijena na upit'
                      : `od ${formatPrice(other.fromPriceCents)}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ClosingCta
        title={`Rezervirajte ${service.nameHr.toLowerCase()}`}
        href={service.bookable ? `/narucivanje?usluga=${service.slug}` : '/kontakt'}
        cta={service.bookable ? 'Naruči se' : 'Kontaktirajte nas'}
      />
    </>
  );
}
