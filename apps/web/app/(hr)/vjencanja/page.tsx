import type { Metadata } from 'next';
import Link from 'next/link';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { CtaLink, Eyebrow, RefImage, Section } from '@/components/ui';
import { formatPrice } from '@/lib/content/services';

export const metadata: Metadata = {
  title: { absolute: 'Vjenčane frizure i šminkanje — Zagreb i Dubrovnik | Studio Marcela' },
  description:
    'Vjenčane frizure, šminkanje i cijele svadbene grupe. Proba unaprijed, raspored po satima i dolazak na vašu lokaciju.',
  alternates: { canonical: '/vjencanja' },
};

const TIMELINE = [
  {
    when: '3–6 mjeseci prije',
    title: 'Javite nam se',
    detail:
      'Trebamo datum, lokaciju i okvirno koliko vas ima. Termine u sezoni popunimo rano, osobito u Dubrovniku.',
  },
  {
    when: '4–8 tjedana prije',
    title: 'Proba',
    detail:
      'Složimo izgled, izmjerimo koliko traje i provjerimo kako se drži. Ponesite ukosnicu, veo ili nakit ako ih imate.',
  },
  {
    when: 'Tjedan prije',
    title: 'Raspored po satima',
    detail:
      'Šaljemo satnicu složenu unatrag od trenutka kad svi moraju biti spremni — tko sjeda kada i koliko traje.',
  },
  {
    when: 'Na dan vjenčanja',
    title: 'U salonu ili kod vas',
    detail:
      'Dolazimo na vašu adresu ili vas primamo u studiju. Za veće grupe radi više stilista istovremeno.',
  },
];

export default function WeddingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Vjenčanja"
        title="Vjenčane frizure i šminkanje"
        lead="Za mladenku i za cijelu grupu — s probom unaprijed i rasporedom po satima, tako da nitko ne čeka i nitko ne kasni."
        breadcrumb={[{ label: 'Vjenčanja' }]}
      />

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <RefImage
            refId="BRIDAL-03"
            alt="Vjenčana frizura — podignuta frizura s ukrasnim češljem"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div>
            <Eyebrow>Kako radimo</Eyebrow>
            <h2 className="t-display-md">Nijedna vjenčana frizura bez probe</h2>
            <div className="measure mt-6 space-y-5 text-ink-700">
              <p className="t-body-lg">
                Proba nije formalnost. Na njoj vidimo kako vaša kosa drži oblik, koliko
                joj treba i što se događa nakon četiri sata — a to se ne može
                pretpostaviti s fotografije.
              </p>
              <p className="t-body-lg">
                Za grupe slažemo raspored unatrag od sata kad svi moraju biti gotovi.
                Dobijete ga napisanog, po imenima i po satima.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Prices ──────────────────────────────────────────────── */}
      <Section tone="tint">
        <h2 className="t-display-md">Cijene</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Vjenčana frizura', 5000, 'U salonu, uz prethodnu probu'],
            ['Probna vjenčana frizura', 4000, '60–90 minuta, 4–8 tjedana prije'],
            ['Svečana frizura', 4000, 'Za kume, majke i djeveruše'],
            ['Svečana frizura Hollywood', 6000, 'Valovi i volumen'],
            ['Svečani make up', 6000, 'Uz ugradnju trepavica po želji'],
            ['Vjenčana frizura to go', 8000, 'Dolazimo na vašu adresu'],
          ].map(([name, cents, note]) => (
            <li
              key={name as string}
              className="flex flex-col rounded-[16px] border border-paper-200 bg-paper-000 p-6"
            >
              <h3 className="t-heading-md">{name as string}</h3>
              <p className="mt-2 flex-1 text-[0.9375rem] text-ink-700">{note as string}</p>
              <p className="tabular mt-4 t-heading-md text-gold-700">
                {formatPrice(cents as number)}
              </p>
            </li>
          ))}
        </ul>
        <p className="measure mt-8 text-[0.9375rem] text-ink-700">
          Za grupe od pet i više osoba slažemo ponudu po mjeri. Za dolazak izvan
          Zagreba i Dubrovnika naplaćujemo putni trošak, koji vam kažemo unaprijed.
        </p>
      </Section>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <Section tone="paper">
        <h2 className="t-display-md">Kako to izgleda po koracima</h2>
        <ol className="mt-10 divide-y divide-paper-200 border-y border-paper-200">
          {TIMELINE.map((step) => (
            <li key={step.title} className="grid gap-4 py-7 md:grid-cols-[12rem_1fr]">
              <p className="t-caption text-gold-700">{step.when}</p>
              <div>
                <h3 className="t-heading-md">{step.title}</h3>
                <p className="measure mt-2 text-ink-700">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Dubrovnik ───────────────────────────────────────────── */}
      <Section tone="ink">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="t-caption mb-4 text-gold-400">Dubrovnik</p>
            <h2 className="t-display-lg text-paper-050">
              Vjenčanja u Dubrovniku i Župi dubrovačkoj
            </h2>
            <div className="measure mt-7 space-y-5 text-paper-200">
              <p className="t-body-lg">
                Imamo dva studija u dubrovačkim hotelima — u Rixos Premiumu i u
                Sheratonu na Srebrenom — pa se pripreme mogu odvijati na mjestu gdje
                ste smješteni, bez vožnje na dan vjenčanja.
              </p>
              <p className="t-body-lg">
                Dolazimo i na lokaciju vjenčanja. Ako planirate iz inozemstva, probu
                možemo dogovoriti u danima prije termina.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink
                href="/saloni/dubrovnik-sheraton"
                variant="secondary"
                className="border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
              >
                Studio Srebreno
              </CtaLink>
              <CtaLink
                href="/saloni/dubrovnik-rixos"
                variant="secondary"
                className="border-paper-050/35 text-paper-050 hover:border-paper-050 hover:bg-paper-050/10"
              >
                Studio Rixos
              </CtaLink>
            </div>
          </div>
          <RefImage
            refId="BRIDAL-02"
            alt="Priprema mladenke"
            ratio="aspect-[3/2]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </Section>

      {/* ── Enquiry ─────────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-8">
          <h2 className="t-display-md">Recite nam datum</h2>
          <p className="measure mt-4 text-ink-700">
            Za vjenčanja ne radimo obično online naručivanje — previše se toga mora
            uskladiti. Javite nam datum, lokaciju i broj osoba, i vratit ćemo se s
            ponudom i prijedlogom satnice unutar jednog radnog dana.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CtaLink href="/kontakt" size="lg">
              Pošaljite upit
            </CtaLink>
            <CtaLink href="/usluge/vjencana-frizura" variant="secondary" size="lg">
              O vjenčanoj frizuri
            </CtaLink>
          </div>
          <p className="mt-6 text-[0.875rem] text-ink-500">
            Probnu frizuru možete rezervirati i online —{' '}
            <Link
              href="/narucivanje?usluga=vjencana-frizura"
              className="text-gold-700 underline underline-offset-4"
            >
              odaberite termin
            </Link>
            .
          </p>
        </div>
      </Section>

      <ClosingCta
        title="Probna frizura"
        body="Probu možete rezervirati online. Za sve ostalo javite nam se — složit ćemo ponudu po mjeri."
        href="/narucivanje?usluga=vjencana-frizura"
        cta="Rezerviraj probu"
      />
    </>
  );
}
