import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaLink, Eyebrow, RefImage, Section } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';

export const metadata: Metadata = {
  title: 'Naši saloni u Zagrebu i Dubrovniku',
  description:
    'Pet frizerskih salona u Zagrebu i dva u Dubrovniku. Adrese, kontakti i online naručivanje za svaki studio.',
  alternates: { canonical: '/saloni' },
};

export default function SalonsIndexPage() {
  const zagreb = LOCATIONS.filter((l) => l.city === 'Zagreb');
  const dubrovnik = LOCATIONS.filter((l) => l.city === 'Dubrovnik');

  return (
    <>
      <Section tone="paper">
        <div className="max-w-[48rem]">
          <Eyebrow>Naši studiji</Eyebrow>
          <h1 className="t-display-lg">
            Frizerski saloni u Zagrebu i Dubrovniku
          </h1>
          <p className="t-body-lg mt-6 text-ink-700">
            Pet studija u Zagrebu i dva u Dubrovniku. Isti standard, isti proizvodi,
            ista edukacija — kroz koja god vrata uđete.
          </p>
        </div>
      </Section>

      {[
        { city: 'Zagreb', list: zagreb },
        { city: 'Dubrovnik', list: dubrovnik },
      ].map((group, index) => (
        <Section key={group.city} tone={index % 2 === 0 ? 'tint' : 'paper'}>
          <h2 className="t-display-md">{group.city}</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.list.map((location) => (
              <li key={location.slug}>
                <Link
                  href={`/saloni/${location.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000 transition-colors hover:border-clay-600/45"
                >
                  <RefImage
                    refId={location.heroRef}
                    alt={`Studio Marcela ${location.displayName}`}
                    ratio="aspect-[3/2]"
                    className="rounded-none"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="t-heading-lg">{location.displayName}</h3>
                    <p className="mt-2 text-[0.9375rem] text-ink-700">
                      {location.addressStreet}
                    </p>
                    <p className="tabular mt-1 text-[0.9375rem] text-ink-500">
                      {location.phone}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-clay-600">
                      Pogledaj salon
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section tone="ink">
        <div className="mx-auto max-w-[42rem] text-center">
          <h2 className="t-display-md text-paper-050">Niste sigurni koji vam je najbliži?</h2>
          <p className="t-body-lg mt-6 text-paper-200">
            Krenite od usluge — pokazat ćemo vam prvi slobodan termin u svakom studiju.
          </p>
          <div className="mt-10 flex justify-center">
            <CtaLink href="/narucivanje" size="lg">
              Naruči se
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  );
}
