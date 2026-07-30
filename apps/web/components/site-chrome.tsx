import Link from 'next/link';
import { LOCATIONS } from '@/lib/content/locations';
import { CtaLink } from './ui';

/**
 * Header and footer.
 *
 * Six nav items, maximum (§5.3). The current site has ten, which is why
 * nothing in it is findable. Blog, Karijere, Galerija, FAQ and Loyalty live in
 * the footer and are reached contextually.
 */

const NAV = [
  { href: '/saloni', label: 'Saloni' },
  { href: '/usluge', label: 'Usluge' },
  { href: '/cjenik', label: 'Cjenik' },
  { href: '/tim', label: 'Tim' },
  { href: '/vjencanja', label: 'Vjenčanja' },
  { href: '/o-nama', label: 'O nama' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-paper-200 bg-paper-050/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1360px] items-center gap-6 px-5 py-4 md:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display text-[1.0625rem] tracking-[0.22em] text-ink-900"
        >
          STUDIO MARCELA
        </Link>

        <nav aria-label="Glavna navigacija" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
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
          <Link
            href="/en"
            className="hidden text-[0.8125rem] uppercase tracking-wider text-ink-500 transition-colors hover:text-ink-900 sm:block"
            hrefLang="en"
          >
            EN
          </Link>
          {/* The only primary-styled button in the header, at every breakpoint. */}
          <CtaLink href="/narucivanje">Naruči se</CtaLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-900 text-paper-050">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-20 md:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="t-caption mb-5 text-brass-500">Saloni</h2>
            <ul className="space-y-2.5">
              {LOCATIONS.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/saloni/${l.slug}`}
                    className="text-[0.9375rem] text-paper-200 transition-colors hover:text-paper-000"
                  >
                    {l.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="t-caption mb-5 text-brass-500">Usluge</h2>
            <ul className="space-y-2.5">
              {[
                ['Šišanje i fen frizura', '/usluge/sisanje-i-fen'],
                ['Bojanje', '/usluge/bojanje'],
                ['Pramenovi', '/usluge/pramenovi'],
                ['Balayage', '/usluge/balayage'],
                ['Njega i tretmani', '/usluge/njega-i-tretmani'],
                ['Muško šišanje', '/usluge/musko-sisanje'],
                ['Šminkanje', '/usluge/sminkanje'],
                ['Frizer to Go', '/frizer-to-go'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href!}
                    className="text-[0.9375rem] text-paper-200 transition-colors hover:text-paper-000"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="t-caption mb-5 text-brass-500">Studio</h2>
            <ul className="space-y-2.5">
              {[
                ['O nama', '/o-nama'],
                ['Naš tim', '/tim'],
                ['Galerija', '/galerija'],
                ['Blog', '/blog'],
                ['Studio Marcela Club', '/loyalty'],
                ['Karijere', '/karijere'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href!}
                    className="text-[0.9375rem] text-paper-200 transition-colors hover:text-paper-000"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="t-caption mb-5 text-brass-500">Pomoć</h2>
            <ul className="space-y-2.5">
              {[
                ['Kontakt', '/kontakt'],
                ['Česta pitanja', '/faq'],
                ['Pravila otkazivanja', '/pravila-otkazivanja'],
                ['Pravila privatnosti', '/pravila-privatnosti'],
                ['Uvjeti korištenja', '/uvjeti-koristenja'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href!}
                    className="text-[0.9375rem] text-paper-200 transition-colors hover:text-paper-000"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper-000/12 pt-8 text-[0.8125rem] text-ink-300 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Studio Marcela. Sva prava pridržana.</p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-brass-500" aria-hidden="true" />
            Silky TechnoBasic — službeni partner za Hrvatsku
          </p>
        </div>
      </div>
    </footer>
  );
}
