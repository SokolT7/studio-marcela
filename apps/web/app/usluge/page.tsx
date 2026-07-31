import type { Metadata } from 'next';
import Link from 'next/link';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { MissingPrice, RefImage, Section } from '@/components/ui';
import {
  ALL_SERVICES,
  CATEGORIES,
  formatDurationRange,
  formatPrice,
} from '@/lib/content/services';

export const metadata: Metadata = {
  title: { absolute: 'Frizerske usluge u Zagrebu — cijene i trajanje | Studio Marcela' },
  description:
    'Šišanje, bojanje, pramenovi, balayage, njega kose i šminkanje. Svaka usluga s cijenom i trajanjem, prije nego se naručite.',
  alternates: { canonical: '/usluge' },
};

export default function ServicesIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="Usluge"
        title="Usluge — s cijenom i trajanjem, unaprijed"
        lead="Znate što plaćate i koliko traje prije nego sjednete u stolicu. Bez „javite se za cijenu”."
        breadcrumb={[{ label: 'Usluge' }]}
      />

      {CATEGORIES.map((category, index) => {
        const services = ALL_SERVICES.filter((s) => s.category === category.slug);
        if (services.length === 0) return null;

        return (
          <Section key={category.slug} tone={index % 2 === 0 ? 'paper' : 'tint'}>
            <h2 className="t-display-md">{category.nameHr}</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/usluge/${service.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000 transition-colors hover:border-clay-600/45"
                  >
                    <RefImage
                      refId={service.imageRef}
                      alt={service.nameHr}
                      ratio="aspect-[16/10]"
                      className="rounded-none"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="t-heading-md">{service.nameHr}</h3>
                      <p className="mt-2 flex-1 text-[0.9375rem] text-ink-700">
                        {service.summaryHr}
                      </p>
                      <p className="tabular mt-5 flex flex-wrap items-baseline gap-x-2 text-[0.9375rem]">
                        <span className="font-semibold text-clay-600">
                          {service.priceMissing ? (
                            <MissingPrice />
                          ) : service.isPackage ? (
                            formatPrice(service.fromPriceCents)
                          ) : (
                            `od ${formatPrice(service.fromPriceCents)}`
                          )}
                        </span>
                        <span className="text-ink-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-ink-500">
                          {formatDurationRange(
                            service.durationMinFrom,
                            service.durationMinTo,
                          )}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section tone="paper">
        <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-8">
          <h2 className="t-heading-lg">Cijeli cjenik</h2>
          <p className="measure mt-3 text-ink-700">
            Sve usluge, uključujući pojedinačne tretmane i nadoplate, nalaze se u
            cjeniku. Konačna cijena ovisi o dužini i gustoći kose — stilist će vam
            je reći prije početka rada.
          </p>
          <Link
            href="/cjenik"
            className="mt-5 inline-block font-medium text-clay-600 underline underline-offset-4"
          >
            Pogledaj cjenik →
          </Link>
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
