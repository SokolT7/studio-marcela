import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { ORGANISATION_SCHEMA, fontVariables } from '@/lib/fonts';
import '../globals.css';

/**
 * Croatian root layout.
 *
 * One of two root layouts — the English tree has its own under `app/(en)/`.
 * Splitting them is what lets each locale declare the correct `lang`. The
 * previous single root layout hardcoded `lang="hr"`, so `/en` served English
 * copy inside a document declared as Croatian: precisely the defect this
 * project exists to fix on the old site (§14.4).
 */

export const metadata: Metadata = {
  metadataBase: new URL('https://studiomarcela.hr'),
  title: {
    default: 'Frizerski salon Zagreb | Studio Marcela — 7 studija, online naručivanje',
    template: '%s | Studio Marcela',
  },
  description:
    'Šišanje, bojanje, pramenovi i balayage u 5 salona u Zagrebu i 2 u Dubrovniku. Cijene i trajanje unaprijed, potvrda termina odmah. Naručite se online.',
  alternates: {
    canonical: '/',
    languages: { hr: '/', en: '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    alternateLocale: 'en_GB',
    siteName: 'Studio Marcela',
  },
  robots: { index: true, follow: true },
};

export default function CroatianRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION_SCHEMA) }}
        />
        <a href="#sadrzaj" className="skip-link">
          Preskoči na sadržaj
        </a>
        <SiteHeader locale="hr" />
        <main id="sadrzaj">{children}</main>
        <SiteFooter locale="hr" />
      </body>
    </html>
  );
}
