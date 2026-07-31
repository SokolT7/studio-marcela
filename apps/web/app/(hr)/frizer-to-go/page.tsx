import type { Metadata } from 'next';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { CtaLink, Eyebrow, RefImage, Section, VerifyBadge } from '@/components/ui';
import { formatPrice } from '@/lib/content/services';

export const metadata: Metadata = {
  title: { absolute: 'Frizer na kućnu adresu u Zagrebu | Studio Marcela' },
  description:
    'Frizer to Go — dolazimo na vašu adresu u Zagrebu. Frizura 70 €, vjenčana frizura 80 €, šminkanje 95 €. Sva oprema i proizvodi su naši.',
  alternates: { canonical: '/frizer-to-go' },
};

export default function MobileServicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Frizer to Go"
        title="Dolazimo na vašu adresu"
        lead="Za jutra kad nema vremena doći do salona — vjenčanja, proslave, ili jednostavno dan kad je lakše da mi dođemo k vama."
        breadcrumb={[{ label: 'Frizer to Go' }]}
      />

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Cijene</Eyebrow>
            <h2 className="t-display-md">Cijena je fiksna i kaže se unaprijed</h2>
            <p className="measure mt-5 text-ink-700">
              Na staroj stranici je za ovu uslugu pisalo „javite se za cijenu”. Evo je.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                ['Frizura to go', 7000],
                ['Vjenčana frizura to go', 8000],
                ['Makeup to go', 9500],
              ].map(([name, cents]) => (
                <li
                  key={name as string}
                  className="flex items-baseline justify-between gap-4 rounded-[8px] border border-paper-200 bg-paper-000 px-5 py-4"
                >
                  <span className="t-heading-md">{name as string}</span>
                  <span className="tabular t-heading-md text-gold-700">
                    {formatPrice(cents as number)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 rounded-[8px] bg-paper-100 px-4 py-3 text-[0.875rem] text-ink-700">
              Za adrese izvan uže gradske zone naplaćujemo putni trošak, koji vam
              kažemo prije potvrde termina.
              <VerifyBadge />
            </p>
          </div>

          <RefImage
            refId="SVC-BLOW-01"
            alt="Frizer dolazi na kućnu adresu"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="t-display-md">Što donosimo mi</h2>
            <ul className="mt-6 space-y-3">
              {[
                'Sve alate — fen, figaro, ravnalo, škare',
                'Silky profesionalne proizvode',
                'Ogrtač, ručnike i sve potrošno',
                'Stilista koji radi u našim studijima, ne vanjskog suradnika',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-ink-700">
                  <span aria-hidden="true" className="mt-1.5 text-gold-700">
                    —
                  </span>
                  <span className="t-body-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-display-md">Što trebate vi</h2>
            <ul className="mt-6 space-y-3">
              {[
                'Stolicu i malo prostora oko nje',
                'Utičnicu u blizini',
                'Pristup vodi za pranje, ako je usluga uključuje',
                'Podatak o katu i liftu, da stignemo na vrijeme',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-ink-700">
                  <span aria-hidden="true" className="mt-1.5 text-gold-700">
                    —
                  </span>
                  <span className="t-body-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-8">
          <h2 className="t-heading-lg">Kako rezervirati</h2>
          <p className="measure mt-3 text-ink-700">
            Za dolazak na adresu trebamo nekoliko podataka više nego za termin u
            salonu — adresu, kat, i sat do kojeg morate biti spremni. Zato ovu uslugu
            zasad dogovaramo telefonski, a ne kroz obično online naručivanje.
          </p>
          <CtaLink href="/kontakt" className="mt-6">
            Kontaktirajte nas
          </CtaLink>
        </div>
      </Section>

      <ClosingCta
        title="Radije u salonu?"
        body="Sedam studija u Zagrebu i Dubrovniku, s online naručivanjem i trenutnom potvrdom."
        href="/narucivanje"
      />
    </>
  );
}
