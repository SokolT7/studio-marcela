import type { Metadata } from 'next';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'Česta pitanja | Studio Marcela' },
  description:
    'Odgovori na najčešća pitanja o naručivanju, cijenama, otkazivanju, bojanju i uslugama Studija Marcela.',
  alternates: { canonical: '/faq' },
};

const GROUPS = [
  {
    title: 'Naručivanje',
    items: [
      {
        q: 'Kako se naručujem?',
        a: 'Online, u tri koraka: odaberete salon, uslugu i vrijeme. Potvrda stiže odmah SMS-om i e-poštom. Možete i nazvati studio u koji dolazite.',
      },
      {
        q: 'Mogu li odabrati stilista?',
        a: 'Da. Svaki član tima ima svoj kalendar. Ako nemate preferenciju, odaberite „Prvi slobodni” i dobit ćete najraniji mogući termin.',
      },
      {
        q: 'Trebam li otvoriti račun?',
        a: 'Ne. Naručivanje radi bez registracije. Račun vam nudimo tek nakon potvrde termina, i to samo da biste lakše ponovili narudžbu.',
      },
      {
        q: 'Radite li vikendom?',
        a: 'Subotom da, u većini studija. Točno radno vrijeme svakog salona nalazi se na njegovoj stranici.',
      },
    ],
  },
  {
    title: 'Cijene i plaćanje',
    items: [
      {
        q: 'Zašto piše „od” pored cijene?',
        a: 'Jer konačna cijena ovisi o dužini i gustoći kose. Čim odaberete dužinu, prikazujemo točan iznos. Stilist će ga potvrditi prije početka rada — nikad nakon.',
      },
      {
        q: 'Trebam li platiti unaprijed?',
        a: 'Za većinu usluga ne. Kod zahtjevnijih usluga poput bojanja, pramenova i vjenčanih frizura planiramo tražiti manju akontaciju koja se odbija od konačnog računa.',
      },
      {
        q: 'Mogu li platiti karticom?',
        a: 'Da, u svim studijima.',
      },
    ],
  },
  {
    title: 'Otkazivanje i promjene',
    items: [
      {
        q: 'Što ako moram otkazati?',
        a: 'Otkazivanje je besplatno do 24 sata prije termina, izravno preko poveznice iz potvrde. Bez poziva i bez objašnjavanja.',
      },
      {
        q: 'Mogu li pomaknuti termin?',
        a: 'Da, istom poveznicom iz potvrde. Prikazat će vam se svi slobodni termini.',
      },
      {
        q: 'Što ako zakasnim?',
        a: 'Javite nam se čim znate. Do 15 minuta obično stignemo odraditi uslugu u cijelosti; kod dužih kašnjenja možda ćemo morati skratiti ili pomaknuti termin.',
      },
    ],
  },
  {
    title: 'Bojanje i njega',
    items: [
      {
        q: 'Koliko traje bojanje?',
        a: 'Računajte na dva do tri sata, ovisno o dužini i gustoći. Točno trajanje vidite prije nego potvrdite termin.',
      },
      {
        q: 'Trebam li test na alergiju?',
        a: 'Ako kod nas bojite kosu prvi put, preporučujemo test 48 sati unaprijed. Javite nam pri naručivanju.',
      },
      {
        q: 'Pamtite li koju ste mi boju radili?',
        a: 'Da. Svaku formulu zapisujemo — nijansu, razvijač, omjer i vrijeme stajanja. Zato boja izgleda isto i za tri mjeseca.',
      },
      {
        q: 'Kojim proizvodima radite?',
        a: 'Silky TechnoBasic, koji naručujemo izravno iz tvornice u Milanu. Ista linija u svih sedam studija.',
      },
    ],
  },
  {
    title: 'Ostalo',
    items: [
      {
        q: 'Dolazite li na kućnu adresu?',
        a: 'Da, usluga Frizer to Go pokriva Zagreb. Stilist donosi svu opremu i profesionalne proizvode.',
      },
      {
        q: 'Radite li vjenčanja i grupe?',
        a: 'Radimo. Za vjenčanja uvijek ide proba unaprijed, a za grupe slažemo raspored po satima unatrag od trenutka kad svi moraju biti spremni.',
      },
      {
        q: 'Šišate li djecu?',
        a: 'Da, do 10 godina po posebnoj cijeni. Ako dijete prvi put sjeda u stolicu, uzmite raniji termin kad je u salonu mirnije.',
      },
    ],
  },
];

export default function FaqPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHeader
        eyebrow="Pomoć"
        title="Česta pitanja"
        lead="Ako ovdje ne nađete odgovor, nazovite svoj studio — javit će vam se netko tko vas može odmah naručiti."
        breadcrumb={[{ label: 'Česta pitanja' }]}
      />

      {GROUPS.map((group, index) => (
        <Section key={group.title} tone={index % 2 === 0 ? 'paper' : 'tint'}>
          <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr] lg:gap-16">
            <h2 className="t-display-md">{group.title}</h2>
            <dl className="divide-y divide-paper-200 border-y border-paper-200">
              {group.items.map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="t-heading-md">{item.q}</dt>
                  <dd className="measure mt-2 text-ink-700">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      ))}

      <ClosingCta />
    </>
  );
}
