import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-shell';
import { Section } from '@/components/ui';
import { LegalReviewNotice, LegalSection, PLACEHOLDER } from '@/components/legal';

export const metadata: Metadata = {
  title: { absolute: 'Pravila privatnosti | Studio Marcela' },
  description:
    'Kako Studio Marcela prikuplja, koristi i štiti vaše osobne podatke pri naručivanju i pružanju usluga.',
  alternates: { canonical: '/pravila-privatnosti' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Pravila privatnosti"
        lead="Kako prikupljamo, koristimo i čuvamo vaše podatke — i što u svakom trenutku možete tražiti od nas."
        breadcrumb={[{ label: 'Pravila privatnosti' }]}
      />

      <Section tone="paper">
        <LegalReviewNotice />

        <div className="mt-12 max-w-[42rem]">
          <LegalSection title="Tko obrađuje vaše podatke">
            <p>
              Voditelj obrade osobnih podataka je {PLACEHOLDER('puni naziv tvrtke')},
              sa sjedištem na adresi {PLACEHOLDER('adresa sjedišta')}, OIB{' '}
              {PLACEHOLDER('OIB')}.
            </p>
            <p>
              Za sva pitanja o obradi podataka javite se na{' '}
              {PLACEHOLDER('e-adresa za zaštitu podataka')}.
            </p>
          </LegalSection>

          <LegalSection title="Koje podatke prikupljamo">
            <p>Pri naručivanju termina prikupljamo:</p>
            <ul>
              <li>ime i prezime</li>
              <li>broj mobitela — potreban za potvrdu i podsjetnik na termin</li>
              <li>e-adresu — za potvrdu termina i račun</li>
              <li>odabrani salon, uslugu, stilista i vrijeme</li>
              <li>napomenu koju sami upišete</li>
            </ul>
            <p>
              Tijekom pružanja usluge vodimo i evidenciju o obavljenim uslugama, a kod
              bojanja i formulu boje (nijansa, razvijač, omjer i vrijeme stajanja).
              Tu evidenciju vodimo kako bismo sljedeći put mogli ponoviti isti
              rezultat.
            </p>
            <p>
              Podatke o zdravstvenom stanju ne prikupljamo, osim podataka o alergijama
              i osjetljivostima koje nam sami prijavite, a koji su nužni za sigurno
              pružanje usluge.
            </p>
          </LegalSection>

          <LegalSection title="Na temelju čega ih obrađujemo">
            <ul>
              <li>
                <strong>Izvršenje ugovora</strong> — podaci o terminu i obavljenoj
                usluzi. Bez njih vas ne možemo naručiti.
              </li>
              <li>
                <strong>Privola</strong> — marketinške poruke i objava fotografija.
                Privolu dajete zasebno za svaku svrhu i možete je povući u svakom
                trenutku.
              </li>
              <li>
                <strong>Legitimni interes</strong> — evidencija nedolazaka, radi
                zaštite od zloupotrebe rezervacijskog sustava.
              </li>
              <li>
                <strong>Zakonska obveza</strong> — podaci na računima, koje smo dužni
                čuvati prema poreznim propisima.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Koliko dugo ih čuvamo">
            <ul>
              <li>podaci o klijentu i povijest usluga — {PLACEHOLDER('rok')} od zadnjeg posjeta, nakon čega ih anonimiziramo</li>
              <li>računi i porezna dokumentacija — prema zakonskom roku</li>
              <li>zapisi o pristupu podacima — 24 mjeseca</li>
              <li>zapisi o poslanim porukama — 12 mjeseci</li>
              <li>životopisi poslani putem stranice — 6 mjeseci</li>
            </ul>
          </LegalSection>

          <LegalSection title="S kim ih dijelimo">
            <p>
              Podatke ne prodajemo. Dijelimo ih samo s izvršiteljima obrade koji su
              nam potrebni za rad stranice i sustava naručivanja, i to u minimalnom
              opsegu:
            </p>
            <ul>
              <li>pružatelj hostinga i baze podataka (Europska unija)</li>
              <li>pružatelj usluge slanja SMS poruka</li>
              <li>pružatelj usluge slanja e-pošte</li>
              <li>pružatelj usluge naplate, ako plaćate akontaciju</li>
              <li>alati za analitiku, samo uz vašu privolu</li>
            </ul>
            <p>
              Podaci se pohranjuju na poslužiteljima unutar Europske unije. Sa svakim
              izvršiteljem obrade sklopljen je ugovor o obradi podataka.
            </p>
          </LegalSection>

          <LegalSection title="Vaša prava">
            <p>U svakom trenutku imate pravo:</p>
            <ul>
              <li>zatražiti uvid u podatke koje o vama imamo</li>
              <li>zatražiti ispravak netočnih podataka</li>
              <li>zatražiti brisanje podataka</li>
              <li>zatražiti prijenos podataka u strojno čitljivom obliku</li>
              <li>povući privolu za marketing ili objavu fotografija</li>
              <li>uložiti prigovor na obradu</li>
            </ul>
            <p>
              Napomena o brisanju: podatke koje smo dužni čuvati zbog poreznih propisa
              ne možemo obrisati prije isteka zakonskog roka. U tom slučaju ih
              pseudonimiziramo tako da vas više ne identificiraju.
            </p>
            <p>
              Ako smatrate da smo vaša prava povrijedili, možete se obratiti Agenciji
              za zaštitu osobnih podataka (AZOP).
            </p>
          </LegalSection>

          <LegalSection title="Fotografije">
            <p>
              Fotografije radova objavljujemo samo uz vašu izričitu privolu, koju
              tražimo zasebno i koju možete povući u svakom trenutku. Povlačenjem
              privole fotografiju uklanjamo s naših stranica i društvenih mreža.
            </p>
          </LegalSection>

          <LegalSection title="Kolačići">
            <p>
              Bez vaše privole koristimo isključivo kolačiće nužne za rad stranice i
              sustava naručivanja. Analitičke i marketinške kolačiće postavljamo tek
              nakon što ih prihvatite, a privolu možete promijeniti u svakom trenutku.
            </p>
          </LegalSection>

          <LegalSection title="Izmjene">
            <p>
              Ova pravila možemo mijenjati. Datum zadnje izmjene naveden je na dnu
              stranice, a o bitnim izmjenama obavijestit ćemo vas e-poštom.
            </p>
            <p className="text-[0.875rem] text-ink-500">
              Zadnja izmjena: {PLACEHOLDER('datum objave')}
            </p>
          </LegalSection>

          <p className="mt-12 text-[0.9375rem] text-ink-700">
            Vezano:{' '}
            <Link href="/uvjeti-koristenja" className="text-gold-700 underline underline-offset-4">
              Uvjeti korištenja
            </Link>{' '}
            i{' '}
            <Link href="/pravila-otkazivanja" className="text-gold-700 underline underline-offset-4">
              Pravila otkazivanja
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
