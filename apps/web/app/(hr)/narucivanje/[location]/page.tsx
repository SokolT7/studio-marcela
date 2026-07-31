import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingStepper } from '@/components/booking-stepper';
import { MissingPrice } from '@/components/ui';
import { getLocation } from '@/lib/content/locations';
import {
  PACKAGES,
  SERVICES,
  formatDurationRange,
  formatPrice,
} from '@/lib/content/services';
import { BOOKABLE_SERVICES } from '@/lib/seed';
import { findFirstAvailable, formatDateHr, slotTime } from '@/lib/booking';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: slug } = await params;
  const location = getLocation(slug);
  return {
    title: { absolute: `Naručivanje — ${location?.displayName ?? ''} | Studio Marcela` },
    // Booking steps beyond the entry point are not indexed (plan §14.5).
    robots: { index: false, follow: true },
  };
}

export default async function BookingServiceStep({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  const now = Date.now();
  // Only services the engine can actually schedule are offered here.
  const bookable = [...PACKAGES, ...SERVICES].filter(
    (s) => s.bookable && Boolean(BOOKABLE_SERVICES[s.slug]),
  );
  const unavailable = [...PACKAGES, ...SERVICES].filter(
    (s) => !s.bookable || !BOOKABLE_SERVICES[s.slug],
  );

  return (
    <>
      <BookingStepper
        steps={[
          { label: 'Salon', value: location.displayName, href: '/narucivanje' },
          { label: 'Usluga' },
          { label: 'Termin' },
        ]}
        current={1}
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="max-w-[42rem]">
          <h1 className="t-display-md">Što vam treba?</h1>
          <p className="t-body-lg mt-5 text-ink-700">
            Svaka usluga ima cijenu i trajanje. Ako trebate više od jedne, dodajte
            ih u sljedećem koraku.
          </p>
        </div>

        <h2 className="t-caption mt-14 text-clay-600">Sve uključeno</h2>
        <ul className="mt-5 grid gap-4 lg:grid-cols-2">
          {bookable
            .filter((s) => s.isPackage)
            .map((service) => (
              <ServiceOption
                key={service.slug}
                locationSlug={location.slug}
                service={service}
                now={now}
                highlight
              />
            ))}
        </ul>

        <h2 className="t-caption mt-12 text-ink-500">Pojedinačne usluge</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookable
            .filter((s) => !s.isPackage)
            .map((service) => (
              <ServiceOption
                key={service.slug}
                locationSlug={location.slug}
                service={service}
                now={now}
              />
            ))}
        </ul>

        {unavailable.length > 0 && (
          <div className="mt-12 rounded-[16px] border border-paper-200 bg-paper-100 p-6">
            <h2 className="t-heading-md">Usluge koje dogovaramo osobno</h2>
            <p className="mt-2 text-[0.9375rem] text-ink-700">
              Za ove usluge trebamo kratak razgovor prije termina — javite nam se i
              dogovorit ćemo sve u jednom pozivu.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {unavailable.map((service) => (
                <li
                  key={service.slug}
                  className="rounded-full border border-paper-200 bg-paper-000 px-3.5 py-1.5 text-[0.875rem] text-ink-700"
                >
                  {service.nameHr}
                </li>
              ))}
            </ul>
            <a
              href={`tel:${location.phoneHref}`}
              className="mt-3 inline-flex min-h-[44px] items-center text-[0.9375rem] font-medium text-clay-600 underline underline-offset-4"
            >
              Nazovite {location.displayName} — {location.phone}
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function ServiceOption({
  locationSlug,
  service,
  now,
  highlight = false,
}: {
  locationSlug: string;
  service: (typeof SERVICES)[number];
  now: number;
  highlight?: boolean;
}) {
  const first = findFirstAvailable(locationSlug, service.slug, 21, now);

  return (
    <li>
      <Link
        href={`/narucivanje/${locationSlug}/${service.slug}`}
        className={[
          'group flex h-full flex-col rounded-[16px] border bg-paper-000 p-6 transition-colors',
          highlight
            ? 'border-clay-600/35 hover:border-clay-600'
            : 'border-paper-200 hover:border-clay-600/45',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="t-heading-md">{service.nameHr}</h3>
          <p className="tabular shrink-0 text-right">
            <span className="t-heading-md text-clay-600">
              {service.priceMissing ? (
                <MissingPrice />
              ) : service.isPackage ? (
                formatPrice(service.fromPriceCents)
              ) : (
                `od ${formatPrice(service.fromPriceCents)}`
              )}
            </span>
          </p>
        </div>

        <p className="mt-2 flex-1 text-[0.9375rem] text-ink-700">{service.summaryHr}</p>

        {service.includesHr && (
          <p className="mt-3 text-[0.8125rem] text-ink-500">
            Uključuje: {service.includesHr.join(' · ')}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.875rem]">
          <span className="tabular text-ink-500">
            {formatDurationRange(service.durationMinFrom, service.durationMinTo)}
          </span>
          {first && (
            <>
              <span className="text-paper-200" aria-hidden="true">
                ·
              </span>
              <span className="tabular text-clay-600">
                prvi termin {formatDateHr(first.date)} u {slotTime(first.slot.start)}
              </span>
            </>
          )}
        </div>
      </Link>
    </li>
  );
}
