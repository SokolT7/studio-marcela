import Link from 'next/link';
import { LOCATIONS } from '@/lib/content/locations';
import type { Locale } from '@/lib/i18n';
import { CtaLink } from './ui';
import { LanguageSwitcher } from './language-switcher';

/**
 * Header and footer.
 *
 * Six nav items, maximum (§5.3). The current site has ten, which is why
 * nothing in it is findable. Blog, Karijere, Galerija, FAQ and Loyalty live in
 * the footer and are reached contextually.
 *
 * Both take a `locale` so the English tree gets English chrome. Links from the
 * English header still point into the Croatian tree where no English page
 * exists yet — that is Phase 2, and sending someone to a working Croatian page
 * beats sending them to a 404.
 */

const NAV: Record<Locale, { href: string; label: string }[]> = {
  hr: [
    { href: '/saloni', label: 'Saloni' },
    { href: '/usluge', label: 'Usluge' },
    { href: '/cjenik', label: 'Cjenik' },
    { href: '/tim', label: 'Tim' },
    { href: '/vjencanja', label: 'Vjenčanja' },
    { href: '/o-nama', label: 'O nama' },
  ],
  en: [
    { href: '/saloni', label: 'Salons' },
    { href: '/usluge', label: 'Services' },
    { href: '/cjenik', label: 'Prices' },
    { href: '/tim', label: 'Team' },
    { href: '/vjencanja', label: 'Weddings' },
    { href: '/o-nama', label: 'About' },
  ],
};

const BOOK_LABEL: Record<Locale, string> = {
  hr: 'Naruči se',
  en: 'Book now',
};

interface FooterHeadings {
  salons: string;
  services: string;
  studio: string;
  help: string;
}

const FOOTER_HEADINGS: Record<Locale, FooterHeadings> = {
  hr: { salons: 'Saloni', services: 'Usluge', studio: 'Studio', help: 'Pomoć' },
  en: { salons: 'Salons', services: 'Services', studio: 'Studio', help: 'Help' },
};

const FOOTER_SERVICES: Record<Locale, [string, string][]> = {
  hr: [
    ['Šišanje i fen frizura', '/usluge/sisanje-i-fen'],
    ['Bojanje', '/usluge/bojanje'],
    ['Pramenovi', '/usluge/pramenovi'],
    ['Balayage', '/usluge/balayage'],
    ['Njega i tretmani', '/usluge/njega-i-tretmani'],
    ['Muško šišanje', '/usluge/musko-sisanje'],
    ['Šminkanje', '/usluge/sminkanje'],
    ['Frizer to Go', '/frizer-to-go'],
  ],
  en: [
    ['Cut and blow-dry', '/usluge/sisanje-i-fen'],
    ['Colour', '/usluge/bojanje'],
    ['Highlights', '/usluge/pramenovi'],
    ['Balayage', '/usluge/balayage'],
    ['Treatments', '/usluge/njega-i-tretmani'],
    ["Men's cut", '/usluge/musko-sisanje'],
    ['Makeup', '/usluge/sminkanje'],
    ['Mobile service', '/frizer-to-go'],
  ],
};

const FOOTER_STUDIO: Record<Locale, [string, string][]> = {
  hr: [
    ['O nama', '/o-nama'],
    ['Naš tim', '/tim'],
    ['Galerija', '/galerija'],
    ['Blog', '/blog'],
    ['Studio Marcela Club', '/loyalty'],
    ['Karijere', '/karijere'],
  ],
  en: [
    ['About us', '/o-nama'],
    ['Our team', '/tim'],
    ['Gallery', '/galerija'],
    ['Blog', '/blog'],
    ['Studio Marcela Club', '/loyalty'],
    ['Careers', '/karijere'],
  ],
};

const FOOTER_HELP: Record<Locale, [string, string][]> = {
  hr: [
    ['Kontakt', '/kontakt'],
    ['Česta pitanja', '/faq'],
    ['Pravila otkazivanja', '/pravila-otkazivanja'],
    ['Pravila privatnosti', '/pravila-privatnosti'],
    ['Uvjeti korištenja', '/uvjeti-koristenja'],
  ],
  en: [
    ['Contact', '/kontakt'],
    ['FAQ', '/faq'],
    ['Cancellation policy', '/pravila-otkazivanja'],
    ['Privacy policy', '/pravila-privatnosti'],
    ['Terms of use', '/uvjeti-koristenja'],
  ],
};

const PARTNER_LINE: Record<Locale, string> = {
  hr: 'Silky TechnoBasic — službeni partner za Hrvatsku',
  en: 'Silky TechnoBasic — official partner for Croatia',
};

const RIGHTS: Record<Locale, string> = {
  hr: 'Sva prava pridržana.',
  en: 'All rights reserved.',
};

export function SiteHeader({ locale = 'hr' }: { locale?: Locale }) {
  const home = locale === 'en' ? '/en' : '/';

  return (
    <header className="sticky top-0 z-50 border-b border-paper-200 bg-paper-050/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1360px] items-center gap-6 px-5 py-4 md:px-8 lg:px-12">
        <Link
          href={home}
          className="font-display text-[1.0625rem] tracking-[0.22em] text-ink-900"
        >
          STUDIO MARCELA
        </Link>

        <nav
          aria-label={locale === 'en' ? 'Main navigation' : 'Glavna navigacija'}
          className="ml-auto hidden lg:block"
        >
          <ul className="flex items-center gap-7">
            {NAV[locale].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.9375rem] text-ink-700 transition-colors hover:text-ink-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <LanguageSwitcher />
          {/* The only primary-styled button in the header, at every breakpoint. */}
          <CtaLink href="/narucivanje">{BOOK_LABEL[locale]}</CtaLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale = 'hr' }: { locale?: Locale }) {
  const headings = FOOTER_HEADINGS[locale];

  const column = (title: string, links: [string, string][]) => (
    <div>
      <h2 className="t-caption mb-5 text-brass-500">{title}</h2>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-[0.9375rem] text-paper-200 transition-colors hover:text-paper-000"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-ink-900 text-paper-050">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-20 md:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {column(
            headings.salons,
            LOCATIONS.map((l) => [l.displayName, `/saloni/${l.slug}`]),
          )}
          {column(headings.services, FOOTER_SERVICES[locale])}
          {column(headings.studio, FOOTER_STUDIO[locale])}
          {column(headings.help, FOOTER_HELP[locale])}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper-000/12 pt-8 text-[0.8125rem] text-ink-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Studio Marcela. {RIGHTS[locale]}
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-brass-500" aria-hidden="true" />
            {PARTNER_LINE[locale]}
          </p>
        </div>
      </div>
    </footer>
  );
}
