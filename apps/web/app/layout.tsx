import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import './globals.css';

/**
 * Both faces carry `latin-ext`, which is a hard requirement: without it
 * č ć đ š ž fall back mid-word and the Croatian copy looks broken.
 * Test string — "Šišanje, češljanje i njega kose — Đurđica Žužić" (§4.3).
 */
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK'],
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

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

/**
 * Brand-level structured data. Each location page carries its **own**
 * HairSalon block with its own address, geo and hours — never this one copied
 * seven times with the district swapped (§14.3).
 */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  '@id': 'https://studiomarcela.hr/#salon',
  name: 'Studio Marcela',
  alternateName: 'Frizerski salon Studio Marcela',
  url: 'https://studiomarcela.hr',
  slogan: 'Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja.',
  founder: { '@type': 'Person', name: 'Jadranka Pezo' },
  areaServed: [
    { '@type': 'City', name: 'Zagreb' },
    { '@type': 'City', name: 'Dubrovnik' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="hr" on the Croatian tree. The current site declares lang="en" on
    // its Croatian homepage — the defect this fixes (§14.4).
    <html lang="hr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
        />
        <a href="#sadrzaj" className="skip-link">
          Preskoči na sadržaj
        </a>
        <SiteHeader />
        <main id="sadrzaj">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
