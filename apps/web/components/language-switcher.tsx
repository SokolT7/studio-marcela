'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { equivalentPath, hasEquivalent, localeOf, type Locale } from '@/lib/i18n';

/**
 * Two-way language switcher.
 *
 * Both locales are always shown, with the active one marked. The previous
 * version rendered a single hardcoded link to `/en`, which meant an English
 * visitor had no way back to Croatian short of editing the URL.
 *
 * A Client Component because it needs the current pathname to work out where
 * its counterpart is. It is tiny and carries no data, so the cost is a few
 * hundred bytes.
 */

const LABELS: Record<Locale, { short: string; full: string }> = {
  hr: { short: 'HR', full: 'Hrvatski' },
  en: { short: 'EN', full: 'English' },
};

export function LanguageSwitcher() {
  const pathname = usePathname() || '/';
  const current = localeOf(pathname);

  return (
    <nav aria-label="Jezik / Language" className="flex items-center">
      <ul className="flex items-center gap-1">
        {(['hr', 'en'] as const).map((locale, index) => {
          const isActive = locale === current;
          const href = equivalentPath(pathname, locale);
          // Flag pages whose counterpart does not exist yet, so the visitor
          // understands they are being taken to the homepage rather than to
          // the same page in another language.
          const exact = hasEquivalent(pathname, locale);

          return (
            <li key={locale} className="flex items-center">
              {index > 0 && (
                <span aria-hidden="true" className="mr-1 text-paper-200/55">
                  /
                </span>
              )}
              {isActive ? (
                <span
                  aria-current="true"
                  className="px-1 text-[0.8125rem] font-semibold uppercase tracking-wider text-gold-400"
                >
                  <span aria-hidden="true">{LABELS[locale].short}</span>
                  <span className="sr-only">{LABELS[locale].full}</span>
                </span>
              ) : (
                <Link
                  href={href}
                  hrefLang={locale}
                  lang={locale}
                  title={
                    exact
                      ? LABELS[locale].full
                      : locale === 'en'
                        ? 'English homepage — this page is not translated yet'
                        : 'Hrvatska početna — ova stranica još nije prevedena'
                  }
                  className="px-1 text-[0.8125rem] uppercase tracking-wider text-paper-200/75 transition-colors hover:text-gold-400"
                >
                  <span aria-hidden="true">{LABELS[locale].short}</span>
                  <span className="sr-only">{LABELS[locale].full}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
