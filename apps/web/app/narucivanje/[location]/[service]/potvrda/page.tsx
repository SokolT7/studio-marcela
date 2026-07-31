import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingStepper } from '@/components/booking-stepper';
import { CtaLink, RefImage, Section } from '@/components/ui';
import { getLocation } from '@/lib/content/locations';
import { formatPrice, getService } from '@/lib/content/services';
import { BOOKABLE_SERVICES, stylistsForLocation } from '@/lib/seed';
import { formatDateHr, slotTime, TIMEZONE } from '@/lib/booking';
import { localDateString } from '@sm/scheduling';

/**
 * Booking step 4 — confirm (IMPLEMENTATION_PLAN.md §9.3).
 *
 * The full summary is shown **before** anything is asked of the client: salon,
 * services, stylist, date, time, duration and price, plus the cancellation
 * terms. Only then do we ask for their details.
 *
 * The form is deliberately inert. Creating an appointment needs the database,
 * the SMS verification provider and the payment provider, none of which are
 * wired yet (§24, phase 3). A submit button that silently does nothing would
 * be worse than one that says so.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Potvrda termina | Studio Marcela' },
  robots: { index: false, follow: false },
};

export default async function BookingConfirmStep({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; service: string }>;
  searchParams: Promise<{ t?: string; s?: string }>;
}) {
  const { location: locationSlug, service: serviceSlug } = await params;
  const { t, s } = await searchParams;

  const location = getLocation(locationSlug);
  const service = getService(serviceSlug);
  if (!location || !service || !BOOKABLE_SERVICES[serviceSlug]) notFound();

  const startsAt = t && /^\d+$/.test(t) ? Number(t) : null;
  const stylist = stylistsForLocation(locationSlug).find((x) => x.id === s);

  // A slot reference that is missing or unparseable means the client arrived
  // here without picking a time. Send them back rather than showing a summary
  // with holes in it.
  if (!startsAt || !stylist) {
    return (
      <>
        <BookingStepper
          steps={[
            { label: 'Salon', value: location.displayName, href: '/narucivanje' },
            { label: 'Usluga', value: service.nameHr, href: `/narucivanje/${locationSlug}` },
            { label: 'Termin' },
          ]}
          current={2}
        />
        <Section tone="paper">
          <div className="max-w-[36rem]">
            <h1 className="t-display-md">Termin nije odabran</h1>
            <p className="t-body-lg mt-5 text-ink-700">
              Poveznica na kojoj ste sletjeli nema podatak o vremenu. Vratite se korak
              natrag i odaberite termin.
            </p>
            <CtaLink
              href={`/narucivanje/${locationSlug}/${serviceSlug}`}
              size="lg"
              className="mt-8"
            >
              Odaberi termin
            </CtaLink>
          </div>
        </Section>
      </>
    );
  }

  const date = localDateString(startsAt, TIMEZONE);
  const durationMin = service.durationMinFrom;

  return (
    <>
      <BookingStepper
        steps={[
          { label: 'Salon', value: location.displayName, href: '/narucivanje' },
          { label: 'Usluga', value: service.nameHr, href: `/narucivanje/${locationSlug}` },
          {
            label: 'Termin',
            value: `${formatDateHr(date)} u ${slotTime(startsAt)}`,
            href: `/narucivanje/${locationSlug}/${serviceSlug}`,
          },
          { label: 'Potvrda' },
        ]}
        current={3}
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="min-w-0 max-w-[36rem]">
            <h1 className="t-display-md">Još samo vaši podaci</h1>
            <p className="t-body-lg mt-5 text-ink-700">
              Termin držimo 10 minuta dok ispunjavate podatke.
            </p>

            <form className="mt-10 space-y-6" aria-describedby="submit-note">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="ime" label="Ime" autoComplete="given-name" required />
                <Field id="prezime" label="Prezime" autoComplete="family-name" required />
              </div>

              <Field
                id="mobitel"
                label="Broj mobitela"
                type="tel"
                autoComplete="tel"
                required
                hint="Na ovaj broj šaljemo potvrdu i podsjetnik. Provjeravamo ga jednokratnim kodom."
              />

              <Field
                id="email"
                label="E-adresa"
                type="email"
                autoComplete="email"
                required
                hint="Za potvrdu termina i poveznicu za izmjenu ili otkazivanje."
              />

              <div>
                <label htmlFor="napomena" className="block text-[0.9375rem] font-medium">
                  Napomena{' '}
                  <span className="font-normal text-ink-500">(nije obavezno)</span>
                </label>
                <textarea
                  id="napomena"
                  name="napomena"
                  rows={3}
                  className="mt-2 w-full rounded-[8px] border border-paper-200 bg-paper-000 px-4 py-3 text-[0.9375rem] outline-none focus-visible:border-clay-600"
                  placeholder="Alergije, prethodno bojanje, ili bilo što što bismo trebali znati."
                />
              </div>

              {/* Consents are separate and unticked by default — GDPR Art. 7
                  accountability, plan §20.1. Never one combined checkbox. */}
              <fieldset className="space-y-3 rounded-[16px] border border-paper-200 bg-paper-000 p-5">
                <legend className="px-1 text-[0.875rem] font-medium">Privole</legend>
                <Consent
                  id="uvjeti"
                  required
                  label={
                    <>
                      Prihvaćam{' '}
                      <Link
                        href="/uvjeti-koristenja"
                        className="text-clay-600 underline underline-offset-4"
                      >
                        uvjete korištenja
                      </Link>{' '}
                      i{' '}
                      <Link
                        href="/pravila-otkazivanja"
                        className="text-clay-600 underline underline-offset-4"
                      >
                        pravila otkazivanja
                      </Link>
                      .
                    </>
                  }
                />
                <Consent
                  id="marketing-sms"
                  label="Želim primati SMS podsjetnike na obnovu boje i povremene ponude."
                />
                <Consent
                  id="marketing-email"
                  label="Želim primati novosti e-poštom."
                />
              </fieldset>

              <div
                id="submit-note"
                className="rounded-[8px] border border-warning-600/30 bg-warning-600/8 p-5"
              >
                <p className="text-[0.875rem] font-semibold text-warning-600">
                  Potvrda još nije aktivna
                </p>
                <p className="mt-1.5 text-[0.875rem] text-ink-700">
                  Zaprimanje rezervacija čeka spajanje baze podataka, SMS provjere i
                  naplate akontacije — vidi plan §24, faza 3. Do tada termin
                  dogovorite telefonom, a raspored koji vidite je stvaran.
                </p>
              </div>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="flex min-h-[52px] w-full cursor-not-allowed items-center justify-center rounded-[8px] bg-ink-300 px-7 font-medium text-paper-000"
              >
                Potvrdi termin
              </button>

              <a
                href={`tel:${location.phoneHref}`}
                className="flex min-h-[52px] w-full items-center justify-center rounded-[8px] border border-ink-900/25 px-7 font-medium text-ink-900 transition-colors hover:border-ink-900/60 hover:bg-paper-100"
              >
                Nazovi {location.displayName} — {location.phone}
              </a>
            </form>
          </div>

          {/* ── Summary, shown before anything is asked ─────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-6">
              <h2 className="t-heading-md">Vaš termin</h2>

              <div className="mt-5 flex items-center gap-3 border-b border-paper-200 pb-5">
                <RefImage
                  refId={stylist.portraitRef}
                  alt=""
                  ratio="h-11 w-11"
                  className="h-11 w-11 shrink-0 rounded-full"
                  sizes="44px"
                  bare
                />
                <div>
                  <p className="font-medium">
                    {stylist.firstName} {stylist.lastInitial}
                  </p>
                  <p className="text-[0.8125rem] text-ink-500">{stylist.title}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-3.5 text-[0.9375rem]">
                <Row label="Salon" value={location.displayName} />
                <Row label="Adresa" value={location.addressStreet} />
                <Row label="Usluga" value={service.nameHr} />
                <Row
                  label="Datum"
                  value={formatDateHr(date, { withWeekday: true })}
                />
                <Row label="Vrijeme" value={slotTime(startsAt)} tabular />
                <Row label="Trajanje" value={`oko ${durationMin} min`} tabular />
                <div className="flex justify-between gap-4 border-t border-paper-200 pt-3.5">
                  <dt className="text-ink-500">Cijena</dt>
                  <dd className="tabular text-right font-semibold text-clay-600">
                    {service.isPackage
                      ? formatPrice(service.fromPriceCents)
                      : `od ${formatPrice(service.fromPriceCents)}`}
                  </dd>
                </div>
              </dl>

              {!service.isPackage && (
                <p className="mt-4 text-[0.8125rem] text-ink-500">
                  Konačna cijena ovisi o dužini i gustoći kose. Stilist će vam je reći
                  prije početka rada, nikad nakon.
                </p>
              )}

              <p className="mt-5 rounded-[8px] bg-paper-100 px-3.5 py-3 text-[0.8125rem] text-ink-700">
                Besplatno otkazivanje do 24 sata prije termina, preko poveznice iz
                potvrde.
              </p>
            </div>

            <Link
              href={`/narucivanje/${locationSlug}/${serviceSlug}`}
              className="mt-4 block text-center text-[0.875rem] text-clay-600 underline underline-offset-4"
            >
              Promijeni termin
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  tabular = false,
}: {
  label: string;
  value: string;
  tabular?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd className={`text-right font-medium ${tabular ? 'tabular' : ''}`}>{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  type = 'text',
  required = false,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      {/* Persistent label, never placeholder-as-label (§18). */}
      <label htmlFor={id} className="block text-[0.9375rem] font-medium">
        {label}
        {required && (
          <span className="ml-1 text-clay-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-2 w-full rounded-[8px] border border-paper-200 bg-paper-000 px-4 py-3 text-[0.9375rem] outline-none focus-visible:border-clay-600"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function Consent({
  id,
  label,
  required = false,
}: {
  id: string;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        required={required}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-clay-600)]"
      />
      <label htmlFor={id} className="text-[0.875rem] text-ink-700">
        {label}
        {required && (
          <span className="ml-1 text-clay-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
    </div>
  );
}
