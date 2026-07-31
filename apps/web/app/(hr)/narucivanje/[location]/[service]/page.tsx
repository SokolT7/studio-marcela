import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingStepper } from '@/components/booking-stepper';
import { CtaLink, RefImage } from '@/components/ui';
import { getLocation } from '@/lib/content/locations';
import { PACKAGES, SERVICES, formatPrice } from '@/lib/content/services';
import { BOOKABLE_SERVICES, stylistsForLocation } from '@/lib/seed';
import {
  addDays,
  formatDateHr,
  getAvailability,
  groupSlotsByPartOfDay,
  slotTime,
  TIMEZONE,
} from '@/lib/booking';
import { localDateString } from '@sm/scheduling';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'Odabir termina | Studio Marcela' },
    robots: { index: false, follow: true },
  };
}

const ALL_SERVICES = [...PACKAGES, ...SERVICES];

export default async function BookingTimeStep({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; service: string }>;
  searchParams: Promise<{ datum?: string; stilist?: string }>;
}) {
  const { location: locationSlug, service: serviceSlug } = await params;
  const { datum, stilist } = await searchParams;

  const location = getLocation(locationSlug);
  const service = ALL_SERVICES.find((s) => s.slug === serviceSlug);
  if (!location || !service || !BOOKABLE_SERVICES[serviceSlug]) notFound();

  const now = Date.now();
  const today = localDateString(now, TIMEZONE);
  const stylists = stylistsForLocation(locationSlug);
  const selectedStylist = stilist && stylists.some((s) => s.id === stilist) ? stilist : undefined;

  const dateStrip = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  /**
   * Which day to show when the client has not chosen one.
   *
   * Defaulting to today looks tidy and converts badly: a colour booked in the
   * afternoon has no same-day slots left, so the client lands on an empty grid
   * and an apology. Land them on the first day that has something instead.
   */
  const firstDateWithSlots =
    dateStrip.find(
      (date) =>
        (getAvailability({
          locationSlug,
          serviceSlug,
          date,
          now,
          ...(selectedStylist ? { stylistId: selectedStylist } : {}),
        })?.merged.length ?? 0) > 0,
    ) ?? today;

  const selectedDate =
    datum && /^\d{4}-\d{2}-\d{2}$/.test(datum) ? datum : firstDateWithSlots;

  const availability = getAvailability({
    locationSlug,
    serviceSlug,
    date: selectedDate,
    now,
    ...(selectedStylist ? { stylistId: selectedStylist } : {}),
  });

  // "Any stylist" collapses to one entry per start time; a named stylist shows
  // only their own slots.
  const slots = selectedStylist ? (availability?.slots ?? []) : (availability?.merged ?? []);
  const groups = groupSlotsByPartOfDay(slots);

  const buildHref = (next: { datum?: string; stilist?: string | null }) => {
    const query = new URLSearchParams();
    const nextDate = next.datum ?? selectedDate;
    if (nextDate !== today) query.set('datum', nextDate);

    const nextStylist = next.stilist === null ? undefined : (next.stilist ?? selectedStylist);
    if (nextStylist) query.set('stilist', nextStylist);
    const qs = query.toString();
    return `/narucivanje/${locationSlug}/${serviceSlug}${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <BookingStepper
        steps={[
          { label: 'Salon', value: location.displayName, href: '/narucivanje' },
          {
            label: 'Usluga',
            value: service.nameHr,
            href: `/narucivanje/${locationSlug}`,
          },
          { label: 'Termin' },
        ]}
        current={2}
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0">
            <h1 className="t-display-md">Kada vam odgovara?</h1>

            {/* ── Stylist ─────────────────────────────────────────
                "Prvi slobodni" is the prominent default. Most clients
                have no preference and forcing the choice loses them
                (plan §9.3). */}
            <h2 className="t-caption mt-12 text-ink-500">Stilist</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              <li>
                <Link
                  href={buildHref({ stilist: null })}
                  aria-current={!selectedStylist ? 'true' : undefined}
                  className={[
                    'flex min-h-[44px] items-center rounded-[8px] border px-4 text-[0.9375rem] font-medium transition-colors',
                    !selectedStylist
                      ? 'border-gold-500 bg-gold-100 text-gold-700'
                      : 'border-paper-200 bg-paper-000 text-ink-700 hover:border-ink-900/40',
                  ].join(' ')}
                >
                  Prvi slobodni
                </Link>
              </li>
              {stylists
                .filter((s) => BOOKABLE_SERVICES[serviceSlug] &&
                  s.skills.some((skill) => skill.serviceId === serviceSlug))
                .map((s) => (
                  <li key={s.id}>
                    <Link
                      href={buildHref({ stilist: s.id })}
                      aria-current={selectedStylist === s.id ? 'true' : undefined}
                      className={[
                        'flex min-h-[44px] items-center gap-2.5 rounded-[8px] border py-1.5 pl-1.5 pr-4 text-[0.9375rem] font-medium transition-colors',
                        selectedStylist === s.id
                          ? 'border-gold-500 bg-gold-100 text-gold-700'
                          : 'border-paper-200 bg-paper-000 text-ink-700 hover:border-ink-900/40',
                      ].join(' ')}
                    >
                      <RefImage
                        refId={s.portraitRef}
                        alt=""
                        ratio="h-8 w-8"
                        className="h-8 w-8 shrink-0 rounded-full"
                        sizes="32px"
                        bare
                      />
                      {s.firstName} {s.lastInitial}
                    </Link>
                  </li>
                ))}
            </ul>

            {/* ── Date ────────────────────────────────────────── */}
            <h2 className="t-caption mt-10 text-ink-500">Datum</h2>
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {dateStrip.map((date) => {
                const dayAvailability = getAvailability({
                  locationSlug,
                  serviceSlug,
                  date,
                  now,
                  ...(selectedStylist ? { stylistId: selectedStylist } : {}),
                });
                const hasSlots = (dayAvailability?.merged.length ?? 0) > 0;
                const isSelected = date === selectedDate;

                return (
                  <li key={date} className="shrink-0">
                    {hasSlots ? (
                      <Link
                        href={buildHref({ datum: date })}
                        aria-current={isSelected ? 'date' : undefined}
                        className={[
                          'flex min-h-[68px] w-[5.25rem] flex-col items-center justify-center rounded-[8px] border text-center transition-colors',
                          isSelected
                            ? 'border-gold-500 bg-gold-100 text-gold-700'
                            : 'border-paper-200 bg-paper-000 text-ink-700 hover:border-ink-900/40',
                        ].join(' ')}
                      >
                        <span className="text-[0.75rem] uppercase tracking-wide">
                          {formatDateHr(date, { withWeekday: true }).split(',')[0]}
                        </span>
                        <span className="tabular text-[0.9375rem] font-semibold">
                          {formatDateHr(date)}
                        </span>
                      </Link>
                    ) : (
                      // Days with nothing free are visibly disabled, not hidden.
                      <span
                        aria-disabled="true"
                        className="flex min-h-[68px] w-[5.25rem] cursor-not-allowed flex-col items-center justify-center rounded-[8px] border border-dashed border-paper-200 bg-paper-100/60 text-center text-ink-500"
                      >
                        <span className="text-[0.75rem] uppercase tracking-wide">
                          {formatDateHr(date, { withWeekday: true }).split(',')[0]}
                        </span>
                        <span className="tabular text-[0.9375rem]">
                          {formatDateHr(date)}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* ── Slots ───────────────────────────────────────── */}
            <h2 className="t-caption mt-10 text-ink-500">Vrijeme</h2>
            {groups.length === 0 ? (
              <p className="mt-4 rounded-[8px] border border-paper-200 bg-paper-000 p-6 text-ink-700">
                Za {formatDateHr(selectedDate, { withWeekday: true })} nema slobodnih
                termina za odabranu uslugu. Pokušajte s drugim danom ili odaberite
                „Prvi slobodni” stilist.
              </p>
            ) : (
              <div className="mt-4 space-y-7">
                {groups.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-[0.875rem] font-semibold text-ink-700">
                      {group.label}
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {group.slots.map((slot) => (
                        <li key={`${slot.stylistId}-${slot.start}`}>
                          <Link
                            href={`/narucivanje/${locationSlug}/${serviceSlug}/potvrda?t=${slot.start}&s=${slot.stylistId}`}
                            className="tabular flex min-h-[44px] min-w-[4.5rem] items-center justify-center rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.9375rem] font-medium text-ink-900 transition-colors hover:border-gold-500 hover:bg-gold-100 hover:text-gold-700"
                          >
                            {slotTime(slot.start)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Sticky summary ───────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-6">
              <h2 className="t-heading-md">Vaš termin</h2>
              <dl className="mt-5 space-y-3.5 text-[0.9375rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Salon</dt>
                  <dd className="text-right font-medium">{location.displayName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Usluga</dt>
                  <dd className="text-right font-medium">{service.nameHr}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Stilist</dt>
                  <dd className="text-right font-medium">
                    {selectedStylist
                      ? stylists.find((s) => s.id === selectedStylist)?.firstName
                      : 'Prvi slobodni'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-paper-200 pt-3.5">
                  <dt className="text-ink-500">Cijena</dt>
                  <dd className="tabular text-right font-semibold text-gold-700">
                    {service.isPackage
                      ? formatPrice(service.fromPriceCents)
                      : `od ${formatPrice(service.fromPriceCents)}`}
                  </dd>
                </div>
              </dl>

              {!service.isPackage && (
                <p className="mt-4 text-[0.8125rem] text-ink-500">
                  Konačna cijena ovisi o dužini i gustoći kose. Stilist će vam je
                  reći prije početka rada.
                </p>
              )}

              <p className="mt-5 rounded-[8px] bg-paper-100 px-3.5 py-3 text-[0.8125rem] text-ink-700">
                Potvrda stiže odmah, SMS-om i e-poštom. Besplatno otkazivanje do 24
                sata prije termina.
              </p>
            </div>

            <CtaLink
              href={`/saloni/${location.slug}`}
              variant="ghost"
              className="mt-4 w-full"
            >
              Pogledaj salon
            </CtaLink>
          </aside>
        </div>
      </div>
    </>
  );
}
