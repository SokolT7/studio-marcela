import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-shell';
import { CtaLink, Section, VerifyBadge } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';

export const metadata: Metadata = {
  title: { absolute: 'Kontakt — svi saloni | Studio Marcela' },
  description:
    'Adrese i brojevi telefona svih sedam salona Studija Marcela u Zagrebu i Dubrovniku.',
  alternates: { canonical: '/kontakt' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Javite nam se"
        lead="Svaki studio ima svoj broj — nazovite onaj u koji dolazite i javit će vam se netko tko vas može odmah naručiti."
        breadcrumb={[{ label: 'Kontakt' }]}
      />

      <Section tone="paper">
        <div className="rounded-[16px] border border-gold-500/40 bg-gold-100/60 p-7">
          <h2 className="t-heading-lg">Najbrže je online</h2>
          <p className="measure mt-3 text-ink-700">
            Vidite slobodne termine, cijenu i trajanje odmah, bez čekanja na liniji.
            Potvrda stiže SMS-om i e-poštom.
          </p>
          <CtaLink href="/narucivanje" className="mt-6">
            Naruči se online
          </CtaLink>
        </div>
      </Section>

      {(['Zagreb', 'Dubrovnik'] as const).map((city, index) => (
        <Section key={city} tone={index % 2 === 0 ? 'tint' : 'paper'}>
          <h2 className="t-display-md">{city}</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.filter((l) => l.city === city).map((location) => (
              <li
                key={location.slug}
                className="flex flex-col rounded-[16px] border border-paper-200 bg-paper-000 p-6"
              >
                <h3 className="t-heading-lg">{location.displayName}</h3>

                <address className="mt-4 space-y-2 not-italic text-[0.9375rem] text-ink-700">
                  <p>{location.addressStreet}</p>
                  <p>
                    {location.addressPostal} {location.addressCity}
                  </p>
                  <p>
                    <a
                      href={`tel:${location.phoneHref}`}
                      className="tabular inline-flex min-h-[44px] items-center text-gold-700 underline underline-offset-4"
                    >
                      {location.phone}
                    </a>
                  </p>
                </address>

                <div className="mt-4 rounded-[8px] bg-paper-100 px-4 py-3 text-[0.8125rem] text-ink-700">
                  <span className="font-medium">Radno vrijeme</span>
                  <span className="ml-1.5">nije još objavljeno</span>
                  <VerifyBadge />
                </div>

                <div className="mt-5 flex-1" />

                <div className="flex flex-col gap-2">
                  <CtaLink href={`/narucivanje/${location.slug}`} variant="secondary">
                    Naruči se {location.locative}
                  </CtaLink>
                  <Link
                    href={`/saloni/${location.slug}`}
                    className="flex min-h-[44px] items-center justify-center text-[0.875rem] text-gold-700 underline underline-offset-4"
                  >
                    Pogledaj salon
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section tone="tint">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="t-heading-lg">Grupe i vjenčanja</h2>
            <p className="measure mt-3 text-ink-700">
              Za vjenčanja, poslovne grupe i proslave javite nam se izravno — termin
              slažemo unatrag od sata kad svi moraju biti gotovi.
            </p>
            <Link
              href="/vjencanja"
              className="mt-2 inline-flex min-h-[44px] items-center font-medium text-gold-700 underline underline-offset-4"
            >
              Vjenčanja i grupe →
            </Link>
          </div>
          <div>
            <h2 className="t-heading-lg">Dolazimo na vašu adresu</h2>
            <p className="measure mt-3 text-ink-700">
              Frizer to Go pokriva Zagreb. Stilist donosi svu opremu i profesionalne
              proizvode.
            </p>
            <Link
              href="/frizer-to-go"
              className="mt-2 inline-flex min-h-[44px] items-center font-medium text-gold-700 underline underline-offset-4"
            >
              Frizer to Go →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
