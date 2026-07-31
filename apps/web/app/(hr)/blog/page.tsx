import type { Metadata } from 'next';
import { ClosingCta, DraftNotice, PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'Savjeti za kosu — blog | Studio Marcela' },
  description:
    'Savjeti naših stilista o njezi kose, bojanju, kovrčama i svakodnevnim problemima s kosom.',
  alternates: { canonical: '/blog' },
};

/**
 * Blog index — IMPLEMENTATION_PLAN.md §7.10.
 *
 * These eight titles exist on the current site but only `/blog` appears in its
 * sitemap, so eight pieces of real content earn nothing. Migrating them to
 * individual indexed URLs with dates and stylist authorship is a content task
 * that needs the original copy from the client.
 */
const POSTS = [
  'Kako pravilno koristiti ulje za kosu: savjeti za sve tipove kose',
  'Suha i lomljiva kosa: kako je regenerirati i ojačati',
  'Savjeti za upravljanje kovrčavom kosom i postizanje savršenih kovrča',
  'Kako stvoriti volumen u tankoj kosi: trikovi i proizvodi za punijim izgled',
  'Uzroci peruti i kako ih riješiti: kompletan vodič',
  'Gubitak kose — uzroci i mogućnosti liječenja',
  'Polupodignute frizure: savršen spoj elegancije i praktičnosti',
  'Sjaj, glamur i stil: najljepše frizure za doček Nove godine',
];

export default function BlogIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Savjeti naših stilista"
        lead="Ono što najčešće objašnjavamo u stolici — o njezi, boji i kosi koja ne sluša."
        breadcrumb={[{ label: 'Blog' }]}
      />

      <Section tone="paper">
        <DraftNotice>
          Ovih osam tekstova postoji na postojećoj stranici, ali nemaju vlastite
          adrese pa ih tražilice ne indeksiraju zasebno. Prijenos čeka izvorne
          tekstove od klijenta — vidi plan §7.10.
        </DraftNotice>

        <ul className="mt-12 divide-y divide-paper-200 border-y border-paper-200">
          {POSTS.map((title) => (
            <li key={title} className="py-7">
              <h2 className="t-heading-lg text-ink-900">{title}</h2>
              <p className="mt-2 text-[0.875rem] text-ink-500">
                Tekst se prenosi s postojeće stranice
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta
        title="Pitanje o vašoj kosi?"
        body="Naručite se na kratku konzultaciju — besplatna je i ne obvezuje vas ni na što."
      />
    </>
  );
}
