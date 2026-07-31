'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/lib/i18n';

/**
 * Navigation for everything below `lg`.
 *
 * Until now the header nav was `hidden lg:block` with no alternative, so on
 * every phone and most tablets the site had **no navigation at all** — the
 * logo, the language switcher and the booking button were the only links above
 * the footer. Given 73% of salon booking traffic is mobile (§1.2), that is the
 * single worst defect the responsive pass had to fix.
 */

export interface NavItem {
  href: string;
  label: string;
}

const COPY: Record<Locale, { open: string; close: string; menu: string; book: string; secondary: string }> = {
  hr: {
    open: 'Otvori izbornik',
    close: 'Zatvori izbornik',
    menu: 'Izbornik',
    book: 'Naruči se',
    secondary: 'Više',
  },
  en: {
    open: 'Open menu',
    close: 'Close menu',
    menu: 'Menu',
    book: 'Book now',
    secondary: 'More',
  },
};

export function MobileNav({
  locale = 'hr',
  items,
  secondary,
}: {
  locale?: Locale;
  items: NavItem[];
  secondary: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copy = COPY[locale];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Any navigation closes the drawer. Without this it stays open over the new
  // page, because App Router transitions do not remount the header.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      // Keep focus inside the drawer while it is open.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={copy.open}
        className="flex h-11 w-11 items-center justify-center rounded-[8px] text-ink-900 transition-colors hover:bg-paper-100 lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M2 5h16M2 10h16M2 15h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Portalled to <body> deliberately. The header carries
          `backdrop-blur`, and a backdrop-filter establishes a containing block
          for fixed-position descendants — so a drawer rendered inside the
          header sizes itself to the header's ~110px box instead of the
          viewport, and only its top strip is visible. */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label={copy.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/45"
          />

          <div
            ref={panelRef}
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={copy.menu}
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-paper-050 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
              <span className="t-caption text-ink-500">{copy.menu}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="flex h-11 w-11 items-center justify-center rounded-[8px] text-ink-900 transition-colors hover:bg-paper-100"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav aria-label={copy.menu} className="flex-1 px-3 py-4">
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-[52px] items-center rounded-[8px] px-4 text-[1.0625rem] text-ink-900 transition-colors hover:bg-paper-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="t-caption mt-6 px-4 text-ink-500">{copy.secondary}</p>
              <ul className="mt-1">
                {secondary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-[48px] items-center rounded-[8px] px-4 text-[0.9375rem] text-ink-700 transition-colors hover:bg-paper-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-paper-200 p-4">
              <Link
                href="/narucivanje"
                className="flex min-h-[52px] items-center justify-center rounded-[8px] bg-clay-600 px-6 font-medium text-paper-000"
              >
                {copy.book}
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
