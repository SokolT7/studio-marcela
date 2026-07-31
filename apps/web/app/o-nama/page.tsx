import type { Metadata } from 'next';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { Eyebrow, RefImage, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'O nama — Studio Marcela, 16 godina i sedam studija' },
  description:
    'Priča Studija Marcela: od jednog salona do sedam studija, Silky TechnoBasic iz Milana i standard koji je isti u svakom studiju.',
  alternates: { canonical: '/o-nama' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="O nama"
        title="Ne prodajemo frizure. Gradimo povjerenje."
        lead="Šesnaest godina, sedam studija i jedan standard — kroz koja god vrata uđete."
        breadcrumb={[{ label: 'O nama' }]}
      />

      {/* ── Founder ─────────────────────────────────────────────── */}
      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
          <RefImage
            refId="STYLIST-PORTRAIT-01"
            alt="Jadranka Pezo, osnivačica Studija Marcela"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
          <div>
            <Eyebrow>Osnivačica</Eyebrow>
            <h2 className="t-display-md">Jadranka Pezo</h2>
            <div className="measure mt-6 space-y-5 text-ink-700">
              <p className="t-body-lg">
                Studio Marcela počeo je s jednim salonom i jednom idejom: da frizura
                nije usluga koju kupite, nego odnos koji gradite. Danas nas je sedam
                studija — pet u Zagrebu i dva u Dubrovniku — i ta se ideja nije
                promijenila.
              </p>
              <p className="t-body-lg">
                Uz vođenje studija, Jadranka je i direktorica Silkyja za Hrvatsku.
                To znači da liniju kojom radimo poznajemo iz prve ruke: od formulacije
                do police, bez posrednika između tvornice i stolice u kojoj sjedite.
              </p>
            </div>

            <figure className="mt-10 border-l-2 border-brass-500 pl-6">
              <blockquote className="t-display-md text-ink-900">
                „Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja.”
              </blockquote>
              <figcaption className="mt-4 text-[0.9375rem] text-ink-500">
                Jadranka Pezo, osnivačica
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>

      {/* ── Silky ───────────────────────────────────────────────── */}
      <Section tone="ink">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="t-caption mb-4 text-brass-500">Silky TechnoBasic</p>
            <h2 className="t-display-lg text-paper-050">
              Iz Milana, izravno u naše studije
            </h2>
            <div className="measure mt-7 space-y-5 text-paper-200">
              <p className="t-body-lg">
                Proizvode naručujemo izravno iz tvornice H.S.A. u Milanu — bez
                posrednika i bez dugog stajanja u skladištima. Boja koja stoji predugo
                nije ista boja.
              </p>
              <p className="t-body-lg">
                Zato u svih sedam studija radimo istom linijom, iste svježine. To je
                razlog zašto vaša boja izgleda jednako i na Ilici i u Dubrovniku, i
                zašto formulu možemo ponoviti za tri mjeseca.
              </p>
            </div>
          </div>
          <RefImage
            refId="PRODUCT-01"
            alt="Silky TechnoBasic profesionalna kozmetika"
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </Section>

      {/* ── How we work ─────────────────────────────────────────── */}
      <Section tone="paper">
        <h2 className="t-display-md">Kako radimo</h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              title: 'Cijenu kažemo prije',
              body: 'Konačan iznos čujete prije nego što stilist krene s radom. Nikad nakon. Ako se tijekom rada nešto promijeni, stajemo i pitamo.',
            },
            {
              title: 'Formulu zapisujemo',
              body: 'Svaku boju bilježimo — nijansu, razvijač, omjer i vrijeme stajanja. Za tri mjeseca ne morate pamtiti ni objašnjavati.',
            },
            {
              title: 'Kažemo i kad nešto ne ide',
              body: 'Ako željeni rezultat traži dva termina ili prvo korekciju, reći ćemo vam to prije, a ne na pola posla.',
            },
          ].map((item) => (
            <li key={item.title}>
              <h3 className="t-heading-lg">{item.title}</h3>
              <p className="mt-3 text-ink-700">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Numbers ─────────────────────────────────────────────── */}
      <Section tone="tint">
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['16', 'godina iskustva'],
            ['7', 'studija u Hrvatskoj'],
            ['2', 'grada — Zagreb i Dubrovnik'],
            ['1', 'standard, u svakom studiju'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="t-display-lg tabular block text-clay-600">{value}</span>
                <span className="mt-2 block text-ink-700">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <ClosingCta
        title="Dođite vidjeti"
        body="Sedam studija u Zagrebu i Dubrovniku. Odaberite onaj koji vam je najbliži."
        href="/saloni"
        cta="Pogledajte studije"
      />
    </>
  );
}
