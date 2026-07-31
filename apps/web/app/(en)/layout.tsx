import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { ORGANISATION_SCHEMA, fontVariables } from '@/lib/fonts';
import '../globals.css';

/**
 * English root layout.
 *
 * Exists so the English tree can declare `lang="en"`. Next.js permits multiple
 * root layouts as long as no `app/layout.tsx` sits above them, which is why
 * the shared one was removed.
 */

export const metadata: Metadata = {
  metadataBase: new URL('https://studiomarcela.hr'),
  title: {
    default: 'Hair Salon in Zagreb & Dubrovnik | Studio Marcela',
    template: '%s | Studio Marcela',
  },
  description:
    'Seven studios in Zagreb and Dubrovnik. Cuts, colour, bridal hair and makeup — including salons inside Rixos Premium and Sheraton Dubrovnik Riviera.',
  alternates: {
    canonical: '/en',
    languages: { hr: '/', en: '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    alternateLocale: 'hr_HR',
    siteName: 'Studio Marcela',
  },
  robots: { index: true, follow: true },
};

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION_SCHEMA) }}
        />
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader locale="en" />
        <main id="content">{children}</main>
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
