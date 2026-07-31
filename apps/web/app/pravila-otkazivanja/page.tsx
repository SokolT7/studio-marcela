import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';
import { LegalReviewNotice, LegalSection, PLACEHOLDER } from '@/components/legal';

export const metadata: Metadata = {
  title: { absolute: 'Pravila otkazivanja termina | Studio Marcela' },
  description:
    'Kako otkazati ili pomaknuti termin, do kada je besplatno i što se događa s akontacijom.',
  alternates: { canonical: '/pravila-otkazivanja' },
};

export default function CancellationPage() {
  return (
    <>
      <PageHeader
        title="Pravila otkazivanja"
        lead="Planovi se mijenjaju. Evo točno što vrijedi, da ne morate zvati i pitati."
        breadcrumb={[{ label: 'Pravila otkazivanja' }]}
      />

      <Section tone="paper">
        <LegalReviewNotice />

        <div className="mt-12 max-w-[42rem]">
          <LegalSection title="Otkazivanje">
            <ul>
              <li>
                <strong>Više od 24 sata prije termina</strong> — otkazivanje je
                besplatno, a akontacija se vraća u cijelosti.
              </li>
              <li>
                <strong>Manje od 24 sata prije termina</strong> — akontacija se
                zadržava. Termin koji ostane prazan u zadnji čas najčešće se više ne
                može popuniti.
              </li>
              <li>
                <strong>Nedolazak bez javljanja</strong> — akontacija se zadržava.
                Nakon dva nedolaska tražimo akontaciju za sve buduće termine.
              </li>
            </ul>
            <p>
              Ako termin otkažemo mi, akontaciju vraćamo u cijelosti bez obzira na to
              koliko je vremena ostalo do termina.
            </p>
          </LegalSection>

          <LegalSection title="Kako otkazati ili pomaknuti termin">
            <p>
              U potvrdi koju ste dobili SMS-om i e-poštom nalazi se poveznica za
              upravljanje terminom. Preko nje možete otkazati ili pomaknuti termin bez
              poziva i bez objašnjavanja.
            </p>
            <p>
              Ako poveznicu ne možete pronaći, nazovite studio u koji ste naručeni —
              brojevi su na{' '}
              <Link href="/kontakt" className="text-clay-600 underline underline-offset-4">
                stranici kontakta
              </Link>
              .
            </p>
          </LegalSection>

          <LegalSection title="Kašnjenje">
            <p>
              Javite nam se čim znate da kasnite. Do 15 minuta obično uspijemo odraditi
              uslugu u cijelosti. Kod dužih kašnjenja možda ćemo morati skratiti opseg
              ili predložiti novi termin, jer iza vas najčešće slijedi drugi gost.
            </p>
          </LegalSection>

          <LegalSection title="Akontacija">
            <p>
              Za zahtjevnije usluge — bojanje, pramenove, keratinske tretmane, vjenčane
              frizure i grupne termine — planiramo tražiti akontaciju koja se u
              cijelosti odbija od konačnog računa. Iznos vidite prije nego potvrdite
              termin.
            </p>
            <p>
              Za kraće usluge poput šišanja i fen frizure akontacija se ne traži.
            </p>
            <p className="text-[0.9375rem]">
              Konačna politika akontacije: {PLACEHOLDER('odluka klijenta — plan §9.6')}
            </p>
          </LegalSection>

          <LegalSection title="Povrat sredstava">
            <p>
              Povrat se izvršava na isti način na koji je plaćanje izvršeno, najkasnije
              u roku od 14 dana od otkazivanja.
            </p>
          </LegalSection>
        </div>
      </Section>
    </>
  );
}
