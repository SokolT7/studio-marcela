'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';

/**
 * Sticky booking bar for mobile — IMPLEMENTATION_PLAN.md §8.2.
 *
 * Appears after 40% scroll depth, so it never covers the hero's own call to
 * action, and hides while a form field has focus so it cannot sit on top of
 * the on-screen keyboard.
 *
 * Suppressed inside the booking flow itself: a persistent "book now" bar over
 * a booking form is noise, and on the confirmation step it would compete with
 * the actual submit button.
 */

const COPY: Record<Locale, { book: string; call: string }> = {
  hr: { book: 'Naruči se', call: 'Nazovi' },
  en: { book: 'Book now', call: 'Call' },
};

export function StickyBookCta({
  locale = 'hr',
  phoneHref,
}: {
  locale?: Locale;
  phoneHref?: string;
}) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() || '/';
  const copy = COPY[locale];

  const suppressed = pathname.startsWith('/narucivanje');

  useEffect(() => {
    if (suppressed) return;

    const onScroll = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      // On a page too short to scroll there is no "40%" to speak of; showing
      // the bar immediately would just cover content.
      if (scrollable < 400) {
        setVisible(false);
        return;
      }
      setVisible(window.scrollY / scrollable > 0.4);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) setVisible(false);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [suppressed, pathname]);

  if (suppressed || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-200 bg-paper-050/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
      // Purely supplementary — the same actions exist in the page and the
      // header, so it is hidden from assistive tech to avoid duplicate links.
      aria-hidden="true"
    >
      <div className="mx-auto flex max-w-[32rem] gap-2">
        <Link
          href="/narucivanje"
          tabIndex={-1}
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-[8px] bg-clay-600 px-6 font-medium text-paper-000"
        >
          {copy.book}
        </Link>
        {phoneHref && (
          <a
            href={`tel:${phoneHref}`}
            tabIndex={-1}
            aria-label={copy.call}
            className="flex min-h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] border border-ink-900/25 text-ink-900"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M6.6 3.5 8.2 7 6.6 8.6a10 10 0 0 0 4.8 4.8L13 11.8l3.5 1.6v3A1.6 1.6 0 0 1 14.8 18 13.3 13.3 0 0 1 2 5.2 1.6 1.6 0 0 1 3.6 3.5h3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
