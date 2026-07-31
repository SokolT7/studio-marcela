import type { Metadata } from 'next';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { CtaLink, RefImage, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'Grupne usluge — vjenčanja, proslave i poslovne grupe | Studio Marcela' },
  description:
    'Frizure i šminkanje za grupe: vjenčanja, proslave, maturalne i poslovne događaje. Raspored po satima i više stilista istovremeno.',
  alternates: { canonical: '/grupne-usluge' },
};

export default function GroupServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Grupne usluge"
        title="Kad vas je više"
        lead="Vjenčanja, proslave, maturalne i poslovni događaji. Slažemo raspored unatrag od sata kad svi moraju biti spremni — i držimo ga."
        breadcrumb={[{ label: 'Grupne usluge' }]}
      />

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="t-display-md">Kako to radimo</h2>
            <div className="measure mt-6 space-y-5 text-ink-700">
              <p className="t-body-lg">
                Grupa nije zbroj pojedinačnih termina. Ako vas je šest, a svi moraju
                biti gotovi do 15 sati, to je jedan zadatak s jednim rasporedom — ne
                šest odvojenih rezervacija koje se slučajno preklapaju.
              </p>
              <p className="t-body-lg">
                Zato za grupe radimo satnicu unatrag: tko sjeda kada, koliko traje i
                tko ga radi. Dobijete je napisanu, po imenima.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                'Više stilista istovremeno, ako je grupa veća',
                'Dolazak na vašu lokaciju ili termin u studiju',
                'Proba unaprijed za mladenku ili slavljenicu',
                'Jedna ponuda i jedan kontakt, ne šest rezervacija',
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

          <RefImage
            refId="BRIDAL-02"
            alt="Priprema svadbene grupe"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </Section>

      <Section tone="tint">
        <h2 className="t-display-md">Za koje prilike</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Vjenčanja',
              body: 'Mladenka, majke, kume i djeveruše. Proba unaprijed i satnica na dan.',
              href: '/vjencanja',
              cta: 'Vjenčanja',
            },
            {
              title: 'Proslave i maturalne',
              body: 'Rođendani, krstitke, maturalne večeri i sve prilike s fotografom.',
              href: '/kontakt',
              cta: 'Pošaljite upit',
            },
            {
              title: 'Poslovne grupe',
              body: 'Konferencije, snimanja i timski događaji, u studiju ili kod vas.',
              href: '/kontakt',
              cta: 'Pošaljite upit',
            },
          ].map((item) => (
            <li
              key={item.title}
              className="flex flex-col rounded-[16px] border border-paper-200 bg-paper-000 p-6"
            >
              <h3 className="t-heading-lg">{item.title}</h3>
              <p className="mt-3 flex-1 text-ink-700">{item.body}</p>
              <CtaLink href={item.href} variant="secondary" className="mt-6">
                {item.cta}
              </CtaLink>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta
        title="Recite nam datum i koliko vas je"
        body="Vratit ćemo se s ponudom i prijedlogom satnice unutar jednog radnog dana."
        href="/kontakt"
        cta="Pošaljite upit"
      />
    </>
  );
}
