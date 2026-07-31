import type { Metadata } from 'next';
import Link from 'next/link';
import { ClosingCta, DraftNotice, PageHeader } from '@/components/page-shell';
import { RefImage, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: { absolute: 'Galerija — rad našeg tima | Studio Marcela' },
  description:
    'Frizure, boje i tehnike koje radimo u Studiju Marcela. Svaka fotografija je rad našeg stilista.',
  alternates: { canonical: '/galerija' },
};

/**
 * Gallery — IMPLEMENTATION_PLAN.md §7.9.
 *
 * The current site has 39 uncategorised, uncredited images. The rebuilt gallery
 * tags every item by service and stylist and carries a "book this look" action
 * — the highest-converting asset a salon owns, currently used as wallpaper.
 *
 * The filtering UI and the stylist credits arrive with the real portfolio
 * programme (§6.5). Until the shoot, this shows the reference set so the
 * layout and the booking hand-off can be reviewed.
 */
const ITEMS = [
  { ref: 'RESULT-02', service: 'balayage', label: 'Balayage — mekani prijelaz' },
  { ref: 'SVC-COLOR-01', service: 'balayage', label: 'Dubina boje u dužini' },
  { ref: 'RESULT-01', service: 'pramenovi', label: 'Pramenovi — svjetlina oko lica' },
  { ref: 'SVC-FOILS-01', service: 'pramenovi', label: 'Pramenovi na folije' },
  { ref: 'SVC-COLOR-02', service: 'bojanje', label: 'Bojanje izrasta' },
  { ref: 'SVC-CUT-01', service: 'sisanje-i-fen', label: 'Šišanje i oblikovanje' },
  { ref: 'BRIDAL-03', service: 'vjencana-frizura', label: 'Vjenčana frizura' },
  { ref: 'BRIDAL-01', service: 'vjencana-frizura', label: 'Svečana podignuta frizura' },
  { ref: 'SVC-MAKEUP-01', service: 'sminkanje', label: 'Svečano šminkanje' },
  { ref: 'SVC-MENS-01', service: 'musko-sisanje', label: 'Muško šišanje i brada' },
  { ref: 'SVC-WASH-01', service: 'njega-i-tretmani', label: 'Silky tretman njege' },
  { ref: 'CLIENT-01', service: 'sisanje-i-fen', label: 'Prirodne kovrče' },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Galerija"
        title="Rad našeg tima"
        lead="Svaka fotografija je rad našeg stilista na našem gostu — s imenom stilista i uslugom, tako da možete rezervirati točno ono što vidite."
        breadcrumb={[{ label: 'Galerija' }]}
      />

      <Section tone="paper">
        <DraftNotice>
          Prikazane su referentne fotografije, a ne stvarni radovi. Zamjenjuju se
          fotografijama snimljenima u studijima nakon snimanja — vidi plan §6.
        </DraftNotice>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <li key={item.ref}>
              <figure className="overflow-hidden rounded-[16px] border border-paper-200 bg-paper-000">
                <RefImage
                  refId={item.ref}
                  alt={item.label}
                  ratio="aspect-[4/5]"
                  className="rounded-none"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <figcaption className="flex items-center justify-between gap-4 p-5">
                  <span className="text-[0.9375rem] text-ink-900">{item.label}</span>
                  {/* Every gallery item is a booking entry point (§7.9). */}
                  <Link
                    href={`/narucivanje?usluga=${item.service}`}
                    className="shrink-0 text-[0.875rem] font-medium text-clay-600 underline underline-offset-4"
                  >
                    Rezerviraj
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta
        title="Sviđa vam se nešto?"
        body="Odaberite uslugu i stilista — pokazat ćemo vam prvi slobodan termin."
      />
    </>
  );
}
