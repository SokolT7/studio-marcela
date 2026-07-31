import type { Metadata } from 'next';
import Link from 'next/link';
import { ClosingCta, DraftNotice, PageHeader } from '@/components/page-shell';
import { CtaLink, RefImage, Section } from '@/components/ui';
import { STYLISTS } from '@/lib/seed';
import { LOCATIONS } from '@/lib/content/locations';

export const metadata: Metadata = {
  title: { absolute: 'Naš tim — frizeri i stilisti | Studio Marcela' },
  description:
    'Upoznajte stiliste Studija Marcela. Svaki član tima ima svoju specijalnost i svoj kalendar — birajte stilista, ne samo salon.',
  alternates: { canonical: '/tim' },
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Naš tim"
        title="Iza svake frizure stoji netko s imenom"
        lead="Birajte stilista, ne salon. Svaki član tima ima svoju specijalnost, svoj portfolio i svoj kalendar — i možete ga rezervirati izravno."
        breadcrumb={[{ label: 'Tim' }]}
      />

      <Section tone="paper">
        <DraftNotice>
          Profili na ovoj stranici su primjeri. Stvarni tim, fotografije i
          specijalnosti unose se kad klijent dostavi popis osoblja — vidi plan §25.1,
          točka 2. Nijedno ime ovdje nije stvarna osoba.
        </DraftNotice>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {STYLISTS.map((stylist) => {
            const home = LOCATIONS.find((l) => l.slug === 'precko');
            return (
              <li
                key={stylist.id}
                className="overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000"
              >
                <RefImage
                  refId={stylist.portraitRef}
                  alt={`${stylist.firstName} ${stylist.lastInitial}, ${stylist.title}`}
                  ratio="aspect-[4/5]"
                  className="rounded-none"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="p-6">
                  <h2 className="t-heading-lg">
                    {stylist.firstName} {stylist.lastInitial}
                  </h2>
                  <p className="mt-1 text-[0.9375rem] text-ink-500">{stylist.title}</p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {stylist.specialities.map((speciality) => (
                      <li
                        key={speciality}
                        className="rounded-full bg-paper-100 px-3 py-1 text-[0.8125rem] text-ink-700"
                      >
                        {speciality}
                      </li>
                    ))}
                  </ul>

                  {home && (
                    <p className="mt-4 text-[0.875rem] text-ink-500">
                      Radi u studiju{' '}
                      <Link
                        href={`/saloni/${home.slug}`}
                        className="text-clay-600 underline underline-offset-4"
                      >
                        {home.displayName}
                      </Link>
                    </p>
                  )}

                  <CtaLink
                    href={`/narucivanje/precko?stilist=${stylist.id}`}
                    variant="secondary"
                    className="mt-5 w-full"
                  >
                    Naruči se kod {stylist.firstName}
                  </CtaLink>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="t-display-md">Radite li s nama?</h2>
            <p className="t-body-lg measure mt-6 text-ink-700">
              Tražimo frizere koji žele raditi po standardu, a ne po prečici.
              Edukacija je kontinuirana i plaćena, a Silky obuku vodimo interno.
            </p>
            <CtaLink href="/karijere" variant="secondary" className="mt-8">
              Otvorena radna mjesta
            </CtaLink>
          </div>
          <RefImage
            refId="STYLIST-ATWORK-01"
            alt="Edukacija u Studiju Marcela"
            ratio="aspect-[3/2]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
