import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaLink, Eyebrow, RefImage, Section } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';
import { formatPrice } from '@/lib/content/services';

/**
 * English homepage.
 *
 * Not a translation of the Croatian page. The English-speaking audience is
 * overwhelmingly Dubrovnik hotel guests and destination-wedding couples
 * (IMPLEMENTATION_PLAN.md §1.4), so this leads with Dubrovnik and weddings
 * rather than with Zagreb neighbourhoods.
 *
 * The full English tree — services, locations, booking — is Phase 2. Booking
 * links point at the Croatian flow, which is functional; that is a deliberate
 * interim, not an oversight.
 */

export const metadata: Metadata = {
  title: {
    absolute: 'Hair Salon in Zagreb & Dubrovnik | Studio Marcela — Book Online',
  },
  description:
    'Seven studios in Zagreb and Dubrovnik. Cuts, colour, bridal hair and makeup — including salons inside Rixos Premium and Sheraton Dubrovnik Riviera.',
  alternates: {
    canonical: '/en',
    languages: { hr: '/', en: '/en', 'x-default': '/' },
  },
};

export default function EnglishHomePage() {
  const dubrovnik = LOCATIONS.filter((l) => l.city === 'Dubrovnik');
  const zagreb = LOCATIONS.filter((l) => l.city === 'Zagreb');

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <RefImage
            refId="INTERIOR-01"
            alt="Studio Marcela salon interior in natural light"
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
            <p className="t-caption mb-5 text-brass-500">Zagreb · Dubrovnik — since 2010</p>
            <h1 className="t-display-xl text-paper-050">
              Hair salon in Zagreb and Dubrovnik — seven studios, one standard
            </h1>
            <p className="t-body-lg measure mt-6 text-paper-200">
              Cuts, colour and highlights with the stylist you choose. See the price
              and the duration before you confirm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/narucivanje" size="lg">
                Book an appointment
              </CtaLink>
              <CtaLink
                href="/cjenik"
                variant="secondary"
                size="lg"
                className="border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
              >
                Price list
              </CtaLink>
            </div>
            <p className="mt-5 text-[0.875rem] text-ink-300">
              Confirmation arrives immediately — no waiting for a call back.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-paper-200 bg-paper-100">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-[0.875rem] text-ink-700 md:px-8 lg:px-12">
          <span>16 years</span>
          <span className="hidden h-1 w-1 rounded-full bg-brass-500 sm:block" aria-hidden="true" />
          <span>7 studios</span>
          <span className="hidden h-1 w-1 rounded-full bg-brass-500 sm:block" aria-hidden="true" />
          <span>Silky TechnoBasic, direct from Milan</span>
          <span className="hidden h-1 w-1 rounded-full bg-brass-500 sm:block" aria-hidden="true" />
          <span>English spoken</span>
        </div>
      </div>

      {/* ── Dubrovnik first: it is who reads this page ──────────── */}
      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Dubrovnik</Eyebrow>
            <h2 className="t-display-lg">Two salons inside Dubrovnik hotels</h2>
            <p className="t-body-lg measure mt-6 text-ink-700">
              You do not need to be staying with us. Guests of any hotel are welcome —
              a reservation is all it takes.
            </p>
            <p className="t-body-lg measure mt-4 text-ink-700">
              Blow-dries and cuts are usually available the same day. Bridal and event
              styling should be arranged in advance, particularly in summer.
            </p>

            <ul className="mt-9 space-y-3">
              {dubrovnik.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/saloni/${location.slug}`}
                    className="group flex items-center justify-between gap-6 rounded-[16px] border border-paper-200 bg-paper-000 p-5 transition-colors hover:border-clay-600/45"
                  >
                    <span>
                      <span className="t-heading-md block">{location.displayName}</span>
                      <span className="mt-1 block text-[0.9375rem] text-ink-700">
                        {location.addressStreet}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-clay-600 transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <RefImage
            refId="BRIDAL-02"
            alt="Bridal hair being styled"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </Section>

      {/* ── Weddings ────────────────────────────────────────────── */}
      <Section tone="ink">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <RefImage
            refId="BRIDAL-03"
            alt="Finished bridal updo"
            ratio="aspect-[3/2]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div>
            <p className="t-caption mb-4 text-brass-500">Weddings</p>
            <h2 className="t-display-lg text-paper-050">
              Wedding hair and makeup in Dubrovnik
            </h2>
            <div className="measure mt-7 space-y-5 text-paper-200">
              <p className="t-body-lg">
                We work with whole bridal parties — bride, mothers, bridesmaids — and
                build the morning schedule backwards from the hour everyone has to be
                ready. You receive it written out, by name and by time.
              </p>
              <p className="t-body-lg">
                We come to your venue, or you come to us. If you are arriving from
                abroad, the trial can be arranged in the days before the wedding.
              </p>
            </div>
            <CtaLink
              href="/vjencanja"
              variant="secondary"
              size="lg"
              className="mt-9 border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
            >
              Weddings
            </CtaLink>
          </div>
        </div>
      </Section>

      {/* ── Prices ──────────────────────────────────────────────── */}
      <Section tone="paper">
        <Eyebrow>Prices</Eyebrow>
        <h2 className="t-display-lg">Everything included, no surprises</h2>
        <p className="t-body-lg measure mt-6 text-ink-700">
          Our two most popular services come at a fixed price covering the whole
          visit — wash, treatment, cut, colour or highlights, toner and blow-dry.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            ['Highlights — all inclusive', 9500],
            ['Colour — all inclusive', 5500],
          ].map(([name, cents]) => (
            <li
              key={name as string}
              className="flex items-baseline justify-between gap-4 rounded-[16px] border border-paper-200 bg-paper-000 p-6"
            >
              <span className="t-heading-md">{name as string}</span>
              <span className="tabular t-display-md text-clay-600">
                {formatPrice(cents as number)}
              </span>
            </li>
          ))}
        </ul>

        <p className="measure mt-7 border-l-2 border-brass-500 pl-5 text-[0.9375rem] text-ink-700">
          Prices apply to hair to shoulder length. For longer or thicker hair your
          stylist will tell you the exact amount before starting work.{' '}
          <strong>Never afterwards.</strong>
        </p>
      </Section>

      {/* ── Zagreb ──────────────────────────────────────────────── */}
      <Section tone="tint">
        <h2 className="t-display-md">Five studios in Zagreb</h2>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {zagreb.map((location) => (
            <li key={location.slug}>
              <Link
                href={`/saloni/${location.slug}`}
                className="inline-flex min-h-[44px] items-center rounded-[8px] border border-paper-200 bg-paper-000 px-4 text-[0.9375rem] text-ink-700 transition-colors hover:border-clay-600/45 hover:text-ink-900"
              >
                {location.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="paper">
        <div className="mx-auto max-w-[42rem] text-center">
          <h2 className="t-display-md">Book in a few taps</h2>
          <p className="t-body-lg mt-6 text-ink-700">
            Choose a salon, a service and a time. Confirmation arrives immediately by
            text and email.
          </p>
          <div className="mt-9 flex justify-center">
            <CtaLink href="/narucivanje" size="lg">
              Book an appointment
            </CtaLink>
          </div>
          <p className="mt-6 text-[0.875rem] text-ink-500">
            The booking flow is currently in Croatian. Prefer to talk to someone?{' '}
            <Link href="/kontakt" className="text-clay-600 underline underline-offset-4">
              Call your nearest salon
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
