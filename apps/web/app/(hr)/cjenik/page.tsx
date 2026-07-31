import type { Metadata } from 'next';
import Link from 'next/link';
import { ClosingCta, PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';
import { HAIR_LENGTHS, PRICE_LIST } from '@/lib/content/pricelist';
import { formatPrice } from '@/lib/content/services';

export const metadata: Metadata = {
  title: { absolute: 'Cjenik frizerskih usluga — Zagreb i Dubrovnik | Studio Marcela' },
  description:
    'Cjenik svih usluga: šišanje, bojanje, pramenovi, balayage, njega kose, svečane frizure i šminkanje. Cijene u eurima, s PDV-om.',
  alternates: { canonical: '/cjenik' },
};

export default function PriceListPage() {
  const catalogue = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Cjenik — Studio Marcela',
    itemListElement: PRICE_LIST.map((group) => ({
      '@type': 'OfferCatalog',
      name: group.titleHr,
      itemListElement: group.rows
        .filter((row) => !row.missing && !row.isSurcharge)
        .map((row) => ({
          '@type': 'Offer',
          name: row.nameHr,
          price: (row.fromCents / 100).toFixed(2),
          priceCurrency: 'EUR',
        })),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogue) }}
      />

      <PageHeader
        title="Cjenik"
        lead="Cijene vrijede za sve studije osim gdje je drukčije naznačeno. Konačna cijena ovisi o dužini i gustoći kose — stilist će vam je reći prije početka rada, nikad nakon."
        breadcrumb={[{ label: 'Cjenik' }]}
      />

      <Section tone="paper">
        <div className="rounded-[16px] border border-paper-200 bg-paper-000 p-6">
          <h2 className="t-heading-md">Dužina kose</h2>
          <p className="mt-2 text-[0.9375rem] text-ink-700">
            Cijene bojanja i pramenova računaju se prema dužini i gustoći kose:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {HAIR_LENGTHS.map((length) => (
              <li
                key={length}
                className="rounded-full border border-paper-200 px-3.5 py-1.5 text-[0.875rem] text-ink-700"
              >
                {length}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {PRICE_LIST.map((group, index) => (
        <Section key={group.slug} tone={index % 2 === 0 ? 'tint' : 'paper'}>
          <h2 className="t-display-md">{group.titleHr}</h2>

          <div className="mt-8">
            <table className="w-full border-collapse">
              <caption className="sr-only">{group.titleHr} — cijene u eurima</caption>
              <thead>
                <tr className="border-b border-paper-200 text-left">
                  <th scope="col" className="t-caption pb-3 text-ink-500">
                    Usluga
                  </th>
                  <th scope="col" className="t-caption pb-3 text-right text-ink-500">
                    Cijena
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr
                    key={row.nameHr}
                    className={[
                      'border-b border-paper-200/70',
                      row.highlight ? 'bg-gold-100/60' : '',
                    ].join(' ')}
                  >
                    <th scope="row" className="py-4 pr-4 text-left font-normal sm:pr-6">
                      <span
                        className={row.highlight ? 'font-semibold text-ink-900' : 'text-ink-900'}
                      >
                        {row.nameHr}
                      </span>
                      {row.noteHr && (
                        <span className="mt-1 block text-[0.8125rem] text-ink-500">
                          {row.noteHr}
                        </span>
                      )}
                    </th>
                    <td className="tabular py-4 text-right align-top whitespace-nowrap">
                      {row.missing ? (
                        <span
                          className="text-warning-600"
                          title="Cijena nije objavljena — traži se od klijenta"
                        >
                          na upit
                        </span>
                      ) : (
                        <span
                          className={
                            row.highlight ? 'font-semibold text-gold-700' : 'text-ink-900'
                          }
                        >
                          {row.isSurcharge && '+ '}
                          {formatPrice(row.fromCents)}
                          {row.toCents && ` – ${formatPrice(row.toCents)}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}

      <Section tone="tint">
        <div className="measure space-y-4 text-[0.9375rem] text-ink-700">
          <p>Sve cijene su u eurima i uključuju PDV.</p>
          <p>
            Cijene se mogu razlikovati ovisno o lokaciji — provjerite sa svojim
            stilistom za konačnu ponudu.
          </p>
          <p>
            Usluge označene „na upit” dogovaramo osobno jer cijena previše ovisi o
            stanju i dužini kose.{' '}
            <Link href="/kontakt" className="text-gold-700 underline underline-offset-4">
              Javite nam se
            </Link>{' '}
            i reći ćemo vam točan iznos.
          </p>
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
