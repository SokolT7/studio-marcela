import type { Metadata } from 'next';
import { ClosingCta, DraftNotice, PageHeader } from '@/components/page-shell';
import { CtaLink, Eyebrow, RefImage, Section } from '@/components/ui';
import { LOCATIONS } from '@/lib/content/locations';

export const metadata: Metadata = {
  title: { absolute: 'Posao za frizere u Zagrebu i Dubrovniku | Studio Marcela' },
  description:
    'Tražimo frizere i stiliste za sedam studija u Zagrebu i Dubrovniku. Kontinuirana i plaćena edukacija, Silky obuka, rast od juniora do seniora.',
  alternates: { canonical: '/karijere' },
};

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Karijere"
        title="Tražimo frizere koji rade po standardu"
        lead="Sedam studija, kontinuirana edukacija i jasan put od juniora do seniora. Ako vam je stalo do zanata, razgovarajmo."
        breadcrumb={[{ label: 'Karijere' }]}
      />

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Zašto kod nas</Eyebrow>
            <ul className="mt-6 space-y-5">
              {[
                {
                  title: 'Edukacija je plaćena i redovita',
                  body: 'Silky obuku vodimo interno, a nove tehnike učite na radnom vremenu, ne vikendom o svom trošku.',
                },
                {
                  title: 'Jasan put napretka',
                  body: 'Od juniora do seniora i trenera, s napisanim kriterijima — ne po dojmu.',
                },
                {
                  title: 'Raspored koji se poštuje',
                  body: 'Smjene se objavljuju unaprijed, a godišnji se odobrava kroz sustav, ne kroz poruke u tri ujutro.',
                },
                {
                  title: 'Radite s dobrim materijalom',
                  body: 'Silky TechnoBasic iz Milana u svih sedam studija. Nikad ne štedimo na boji.',
                },
              ].map((item) => (
                <li key={item.title}>
                  <h3 className="t-heading-md">{item.title}</h3>
                  <p className="mt-1.5 text-ink-700">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <RefImage
            refId="STYLIST-ATWORK-01"
            alt="Rad u Studiju Marcela"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </Section>

      <Section tone="tint">
        <h2 className="t-display-md">Gdje tražimo</h2>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {LOCATIONS.map((location) => (
            <li
              key={location.slug}
              className="rounded-[8px] border border-paper-200 bg-paper-000 px-4 py-2.5 text-[0.9375rem] text-ink-700"
            >
              {location.displayName}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <DraftNotice>
            Otvorena radna mjesta, raspon plaće i uvjeti objavljuju se kad ih klijent
            potvrdi — vidi plan §25.2, točka 14. Oglas bez plaće u pravilu privuče
            upola manje prijava, pa preporučujemo da se objavi.
          </DraftNotice>
        </div>
      </Section>

      <Section tone="paper">
        <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-8">
          <h2 className="t-display-md">Javite nam se</h2>
          <p className="measure mt-4 text-ink-700">
            Pošaljite nam nekoliko rečenica o sebi i, ako imate, poveznicu na svoj rad.
            Javljamo se na svaku prijavu, i kad odgovor nije potvrdan.
          </p>
          <CtaLink href="/kontakt" size="lg" className="mt-7">
            Pošaljite prijavu
          </CtaLink>
        </div>
      </Section>

      <ClosingCta
        title="Prvo biste vidjeli kako radimo?"
        body="Naručite se kao gost i pogledajte studio iznutra. To je najpošteniji intervju."
      />
    </>
  );
}
