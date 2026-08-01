'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DEMO_USERS, useDashboard, type Role } from '@/lib/dashboard/store';
import { formatDateHr } from '@/lib/booking';
import { shiftDate } from '@/lib/dashboard/day';
import { localDateString } from '@sm/scheduling';
import { TIMEZONE } from '@/lib/seed';

/**
 * Dashboard chrome.
 *
 * Deliberately unlike the marketing site: dense, quiet, and built for someone
 * who is mid-task. No hero, no motion, no gold ornament — the gold is reserved
 * for the one thing that needs attention on each screen.
 */

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: '/app', label: 'Danas', roles: ['OWNER', 'MANAGER', 'STYLIST', 'RECEPTION'] },
  { href: '/app/kalendar', label: 'Kalendar', roles: ['OWNER', 'MANAGER', 'STYLIST', 'RECEPTION'] },
  { href: '/app/klijenti', label: 'Klijenti', roles: ['OWNER', 'MANAGER', 'STYLIST', 'RECEPTION'] },
  { href: '/app/osoblje', label: 'Osoblje', roles: ['OWNER', 'MANAGER'] },
  { href: '/app/raspored-rada', label: 'Raspored rada', roles: ['OWNER', 'MANAGER'] },
  { href: '/app/odsutnost', label: 'Odsutnost', roles: ['OWNER', 'MANAGER', 'STYLIST'] },
  { href: '/app/izvjestaji', label: 'Izvještaji', roles: ['OWNER', 'MANAGER'] },
  { href: '/app/postavljanje', label: 'Postavljanje', roles: ['OWNER'] },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, setUser, locationId, setLocationId, visibleLocations, date, setDate } =
    useDashboard();
  const today = localDateString(Date.now(), TIMEZONE);
  const pathname = usePathname();

  const items = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-paper-100">
      {/* ── Demo banner ──────────────────────────────────────────
          This is a prototype running on invented data. Saying so
          plainly, once, is better than the client discovering it. */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-warning-600 px-4 py-1.5 text-center text-[0.75rem] font-medium text-paper-000">
        <span>PROTOTIP — izmišljeni podaci, promjene se ne spremaju</span>
        <span className="hidden opacity-70 sm:inline">
          Prebacite ulogu desno gore da vidite što tko vidi
        </span>
      </div>

      <div className="lg:flex">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 border-r border-paper-200 bg-ink-900 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <Link
              href="/app"
              className="flex min-h-[64px] items-center border-b border-paper-000/10 px-5 font-display text-[0.9375rem] tracking-[0.18em] text-gold-400"
            >
              STUDIO MARCELA
            </Link>

            <nav aria-label="Nadzorna ploča" className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'flex min-h-[44px] items-center rounded-[8px] px-3.5 text-[0.9375rem] transition-colors',
                          active
                            ? 'bg-gold-500 font-medium text-ink-900'
                            : 'text-paper-200 hover:bg-paper-000/10 hover:text-paper-000',
                        ].join(' ')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-paper-000/10 p-3">
              <Link
                href="/"
                className="flex min-h-[44px] items-center rounded-[8px] px-3.5 text-[0.875rem] text-ink-300 transition-colors hover:text-paper-200"
              >
                ← Natrag na stranicu
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* ── Top bar ───────────────────────────────────────── */}
          <header className="sticky top-0 z-30 border-b border-paper-200 bg-paper-050">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setDate(shiftDate(date, -1))}
                    aria-label="Prethodni dan"
                    className="flex h-10 w-10 items-center justify-center rounded-l-[8px] border border-paper-200 bg-paper-000 text-ink-700 hover:bg-paper-100"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(shiftDate(date, 1))}
                    aria-label="Sljedeći dan"
                    className="-ml-px flex h-10 w-10 items-center justify-center rounded-r-[8px] border border-paper-200 bg-paper-000 text-ink-700 hover:bg-paper-100"
                  >
                    ›
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="tabular text-[0.9375rem] font-semibold text-ink-900">
                    {formatDateHr(date, { withWeekday: true })}
                    {date === today && (
                      <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider">
                        danas
                      </span>
                    )}
                  </p>
                  <p className="text-[0.8125rem] text-ink-500">
                    {visibleLocations.find((l) => l.slug === locationId)?.displayName ?? locationId}
                  </p>
                </div>
                {date !== today && (
                  <button
                    type="button"
                    onClick={() => setDate(today)}
                    className="ml-1 min-h-[40px] rounded-[8px] px-3 text-[0.8125rem] font-medium text-gold-700 underline underline-offset-4"
                  >
                    Danas
                  </button>
                )}
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                {/* Location switcher — owners see all seven. */}
                {user.role === 'OWNER' && (
                  <label className="flex items-center gap-2 text-[0.8125rem] text-ink-500">
                    <span className="sr-only">Salon</span>
                    <select
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      className="min-h-[40px] rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.875rem] text-ink-900"
                    >
                      {visibleLocations.map((l) => (
                        <option key={l.slug} value={l.slug}>
                          {l.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Role switcher — demo only. */}
                <label className="flex items-center gap-2">
                  <span className="hidden text-[0.75rem] uppercase tracking-wider text-ink-500 sm:inline">
                    Uloga
                  </span>
                  <select
                    value={user.id}
                    onChange={(e) =>
                      setUser(DEMO_USERS.find((u) => u.id === e.target.value) ?? DEMO_USERS[0]!)
                    }
                    className="min-h-[40px] rounded-[8px] border border-gold-500/60 bg-gold-100 px-3 text-[0.875rem] font-medium text-ink-900"
                  >
                    {DEMO_USERS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* ── Mobile nav ──────────────────────────────────── */}
            <nav aria-label="Nadzorna ploča" className="overflow-x-auto border-t border-paper-200 lg:hidden">
              <ul className="flex min-w-max gap-1 px-3 py-2">
                {items.map((item) => {
                  const active =
                    item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'flex min-h-[40px] items-center whitespace-nowrap rounded-[8px] px-3.5 text-[0.875rem] transition-colors',
                          active
                            ? 'bg-ink-900 font-medium text-paper-050'
                            : 'text-ink-700 hover:bg-paper-100',
                        ].join(' ')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </header>

          <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* ── Shared building blocks ──────────────────────────────────────── */

export function Panel({
  title,
  action,
  children,
  tone = 'default',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'attention';
}) {
  return (
    <section
      className={[
        'rounded-[12px] border bg-paper-000',
        tone === 'attention' ? 'border-gold-500/60' : 'border-paper-200',
      ].join(' ')}
    >
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-200 px-5 py-3.5">
          <h2 className="text-[0.9375rem] font-semibold text-ink-900">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'good' | 'warn';
}) {
  const valueTone =
    tone === 'good' ? 'text-success-600' : tone === 'warn' ? 'text-warning-600' : 'text-ink-900';
  return (
    <div className="rounded-[12px] border border-paper-200 bg-paper-000 p-4">
      <p className="text-[0.75rem] uppercase tracking-wider text-ink-500">{label}</p>
      <p className={`tabular mt-1.5 text-[1.75rem] leading-none ${valueTone}`}>{value}</p>
      {sub && <p className="mt-1.5 text-[0.8125rem] text-ink-500">{sub}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[8px] border border-dashed border-paper-200 px-4 py-6 text-center text-[0.9375rem] text-ink-500">
      {children}
    </p>
  );
}
