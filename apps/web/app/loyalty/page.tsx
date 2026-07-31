import type { Metadata } from 'next';
import { ClosingCta, DraftNotice, PageHeader } from '@/components/page-shell';
import { RefImage, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'Studio Marcela Club — program vjernosti' },
  description:
    'Svaki posjet nosi bodove, a bodovi se pretvaraju u popuste i usluge. Kartica živi u vašem profilu.',
  alternates: { canonical: '/loyalty' },
};

export default function LoyaltyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Program vjernosti"
        title="Studio Marcela Club"
        lead="Svaki posjet nosi bodove, a bodovi se vraćaju kroz usluge i popuste. Kartica živi u vašem profilu — ne morate je nositi sa sobom ni pamtiti gdje je."
        breadcrumb={[{ label: 'Studio Marcela Club' }]}
      />

      <Section tone="paper">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="t-display-md">Kako radi</h2>
            <ol className="mt-8 space-y-6">
              {[
                {
                  title: 'Naručite se online',
                  body: 'Prvim online terminom automatski ulazite u klub. Nema prijave ni papira.',
                },
                {
                  title: 'Skupljate bodove',
                  body: 'Svaka obavljena usluga nosi bodove, srazmjerno iznosu.',
                },
                {
                  title: 'Trošite ih kad želite',
                  body: 'Bodovi se pretvaraju u popust ili uslugu. Stanje vidite u svom profilu.',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span className="tabular text-[0.875rem] font-semibold text-clay-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="t-heading-md">{step.title}</h3>
                    <p className="mt-1.5 text-ink-700">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <RefImage
            refId="CLIENT-01"
            alt="Zadovoljna gošća Studija Marcela"
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </Section>

      <Section tone="tint">
        <DraftNotice>
          Točna pravila — koliko bodova nosi koja usluga, kako se troše i kada
          istječu — dogovaraju se s klijentom prije objave. Vidi plan §25.2, točka 12.
        </DraftNotice>
      </Section>

      <ClosingCta
        title="Uđite u klub prvim terminom"
        body="Naručite se online i automatski ste član. Bez prijave i bez kartice u novčaniku."
      />
    </>
  );
}
