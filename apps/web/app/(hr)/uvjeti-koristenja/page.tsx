import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';
import { LegalReviewNotice, LegalSection, PLACEHOLDER } from '@/components/legal';

export const metadata: Metadata = {
  title: { absolute: 'Uvjeti korištenja | Studio Marcela' },
  description:
    'Uvjeti korištenja internetske stranice i sustava online naručivanja Studija Marcela.',
  alternates: { canonical: '/uvjeti-koristenja' },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Uvjeti korištenja"
        lead="Uvjeti pod kojima koristite ovu stranicu i sustav online naručivanja."
        breadcrumb={[{ label: 'Uvjeti korištenja' }]}
      />

      <Section tone="paper">
        <LegalReviewNotice />

        <div className="mt-12 max-w-[42rem]">
          <LegalSection title="Pružatelj usluge">
            <p>
              Stranicu i sustav naručivanja pruža {PLACEHOLDER('puni naziv tvrtke')},
              sa sjedištem na adresi {PLACEHOLDER('adresa sjedišta')}, OIB{' '}
              {PLACEHOLDER('OIB')}, upisan u {PLACEHOLDER('registar i broj upisa')}.
            </p>
          </LegalSection>

          <LegalSection title="Naručivanje termina">
            <p>
              Rezervacijom termina putem ove stranice sklapate ugovor o pružanju usluge
              u dogovoreno vrijeme, u odabranom salonu. Potvrdu rezervacije šaljemo
              SMS-om i e-poštom odmah nakon zaprimanja.
            </p>
            <p>
              Za rezervaciju je potreban ispravan broj mobitela, koji provjeravamo
              jednokratnim kodom. Bez potvrde broja rezervacija se ne dovršava.
            </p>
            <p>
              Zadržavamo pravo otkazati termin u iznimnim okolnostima — bolest
              stilista, kvar ili zatvaranje salona. U tom slučaju javljamo se čim
              prije, nudimo zamjenski termin i vraćamo akontaciju u cijelosti.
            </p>
          </LegalSection>

          <LegalSection title="Cijene">
            <p>
              Sve cijene iskazane su u eurima i uključuju PDV. Cijena prikazana pri
              rezervaciji je početna — konačna ovisi o dužini i gustoći kose, a stilist
              će vam je reći prije početka rada.
            </p>
            <p>
              Cijena dogovorena pri rezervaciji ne mijenja se naknadnom izmjenom
              cjenika.
            </p>
          </LegalSection>

          <LegalSection title="Otkazivanje">
            <p>
              Uvjeti otkazivanja i povrata akontacije opisani su u{' '}
              <Link
                href="/pravila-otkazivanja"
                className="text-gold-700 underline underline-offset-4"
              >
                Pravilima otkazivanja
              </Link>
              , koja su sastavni dio ovih uvjeta.
            </p>
          </LegalSection>

          <LegalSection title="Odgovornost">
            <p>
              Usluge pružamo profesionalno i pažnjom dobrog stručnjaka. Da bismo to
              mogli, dužni ste nas obavijestiti o alergijama, osjetljivostima i
              prethodnim kemijskim tretmanima kose — osobito o bojanju bojama koje
              nisu profesionalne.
            </p>
            <p>
              Ne odgovaramo za posljedice koje proizlaze iz nepotpunih ili netočnih
              podataka koje ste nam dali.
            </p>
          </LegalSection>

          <LegalSection title="Sadržaj stranice">
            <p>
              Sav sadržaj na ovoj stranici — tekstovi, fotografije i oznake — vlasništvo
              je pružatelja usluge i ne smije se koristiti bez pisanog odobrenja.
            </p>
          </LegalSection>

          <LegalSection title="Prigovori">
            <p>
              Prigovor možete uputiti pisanim putem na{' '}
              {PLACEHOLDER('e-adresa za prigovore')} ili na adresu sjedišta. Na
              prigovor odgovaramo u zakonskom roku od 15 dana.
            </p>
          </LegalSection>

          <LegalSection title="Mjerodavno pravo">
            <p>
              Na ove uvjete primjenjuje se pravo Republike Hrvatske. Za sporove je
              nadležan sud u {PLACEHOLDER('mjesto nadležnog suda')}.
            </p>
            <p className="text-[0.875rem] text-ink-500">
              Zadnja izmjena: {PLACEHOLDER('datum objave')}
            </p>
          </LegalSection>
        </div>
      </Section>
    </>
  );
}
