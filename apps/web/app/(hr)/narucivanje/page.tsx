import type { Metadata } from 'next';
import Link from 'next/link';
import { BookingStepper } from '@/components/booking-stepper';
import { RefImage } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';
import { findFirstAvailable, formatDateHr, slotTime } from '@/lib/booking';

export const metadata: Metadata = {
  title: { absolute: 'Naručivanje | Studio Marcela' },
  description:
    'Rezervirajte termin u jednom od sedam studija. Odaberite salon, uslugu i vrijeme — potvrda stiže odmah.',
  robots: { index: true, follow: true },
};

/** Availability depends on the diary, so this page is never statically cached. */
export const dynamic = 'force-dynamic';

export default function BookingLocationStep() {
  const now = Date.now();

  return (
    <>
      <BookingStepper
        steps={[{ label: 'Salon' }, { label: 'Usluga' }, { label: 'Termin' }]}
        current={0}
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="max-w-[42rem]">
          <h1 className="t-display-md">Gdje vam odgovara?</h1>
          <p className="t-body-lg mt-5 text-ink-700">
            Odaberite studio, pa uslugu i vrijeme. Cijenu i trajanje vidite prije
            nego išta potvrdite.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((location) => {
            // The earliest real slot at this salon, computed by the engine.
            // Turns an abstract choice into an immediate one (plan §9.3).
            const first = findFirstAvailable(location.slug, 'sisanje-i-fen', 14, now);

            return (
              <li key={location.slug}>
                <Link
                  href={`/narucivanje/${location.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000 transition-colors hover:border-gold-500/55"
                >
                  <RefImage
                    refId={location.heroRef}
                    alt={`Studio Marcela ${location.displayName}`}
                    ratio="aspect-[16/9]"
                    className="rounded-none"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="t-caption text-ink-500">{location.city}</p>
                    <h2 className="t-heading-lg mt-1.5">{location.displayName}</h2>
                    <p className="mt-2 text-[0.9375rem] text-ink-700">
                      {location.addressStreet}
                    </p>

                    <div className="mt-5 flex-1" />

                    {first ? (
                      <p className="tabular rounded-[8px] bg-gold-100 px-3.5 py-2.5 text-[0.875rem] text-gold-700">
                        <span className="font-semibold">Prvi slobodan termin:</span>{' '}
                        {formatDateHr(first.date, { withWeekday: true })} u{' '}
                        {slotTime(first.slot.start)}
                      </p>
                    ) : (
                      <p className="rounded-[8px] bg-paper-100 px-3.5 py-2.5 text-[0.875rem] text-ink-500">
                        Nema slobodnih termina u sljedeća dva tjedna
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-[0.875rem] text-ink-500">
          Radije biste telefonom?{' '}
          <Link href="/kontakt" className="text-gold-700 underline underline-offset-4">
            Brojevi svih salona
          </Link>
        </p>
      </div>
    </>
  );
}
