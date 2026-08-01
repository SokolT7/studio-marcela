'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState, Panel } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { stylistById } from '@/lib/dashboard/demo-data';
import { formatPrice } from '@/lib/content/services';

/**
 * Client list — plan §10.6.
 *
 * Full-text search across name and phone, because reception is looking someone
 * up while that person stands in front of them. Everything else is secondary.
 */

export default function ClientsPage() {
  const { clients } = useDashboard();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? clients.filter((c) =>
          `${c.firstName} ${c.lastName} ${c.phone} ${c.email ?? ''}`.toLowerCase().includes(q),
        )
      : clients;
    return [...list].sort((a, b) => b.visits - a.visits);
  }, [clients, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Klijenti</h1>
        <p className="text-[0.875rem] text-ink-500">{clients.length} u kartoteci</p>
      </div>

      <label className="block">
        <span className="sr-only">Pretraži klijente</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ime, prezime ili broj mobitela"
          className="w-full max-w-[28rem] rounded-[8px] border border-paper-200 bg-paper-000 px-4 py-3 text-[0.9375rem] outline-none focus-visible:border-gold-500"
        />
      </label>

      <Panel>
        {results.length === 0 ? (
          <EmptyState>Nema rezultata za „{query}”.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-[0.9375rem]">
              <thead>
                <tr className="border-b border-paper-200 text-left">
                  <th scope="col" className="pb-3 pr-4 text-[0.75rem] uppercase tracking-wider text-ink-500">
                    Klijent
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-[0.75rem] uppercase tracking-wider text-ink-500">
                    Kontakt
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right text-[0.75rem] uppercase tracking-wider text-ink-500">
                    Posjeta
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right text-[0.75rem] uppercase tracking-wider text-ink-500">
                    Vrijednost
                  </th>
                  <th scope="col" className="pb-3 text-[0.75rem] uppercase tracking-wider text-ink-500">
                    Oznake
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => {
                  const stylist = c.preferredStylistId ? stylistById(c.preferredStylistId) : undefined;
                  return (
                    <tr key={c.id} className="border-b border-paper-200/70 last:border-0">
                      <th scope="row" className="py-3 pr-4 text-left font-normal">
                        <Link
                          href={`/app/klijenti/${c.id}`}
                          className="font-medium text-ink-900 underline-offset-4 hover:underline"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        {stylist && (
                          <span className="block text-[0.8125rem] text-ink-500">
                            stalni stilist: {stylist.firstName} {stylist.lastInitial}
                          </span>
                        )}
                      </th>
                      <td className="py-3 pr-4 align-top">
                        <span className="tabular block text-ink-700">{c.phone}</span>
                        {c.email && (
                          <span className="block text-[0.8125rem] text-ink-500">{c.email}</span>
                        )}
                      </td>
                      <td className="tabular py-3 pr-4 text-right align-top text-ink-900">
                        {c.visits}
                      </td>
                      <td className="tabular py-3 pr-4 text-right align-top text-ink-900">
                        {formatPrice(c.lifetimeValueCents)}
                      </td>
                      <td className="py-3 align-top">
                        <span className="flex flex-wrap gap-1.5">
                          {c.formulas.length > 0 && <Tag tone="gold">formula boje</Tag>}
                          {c.allergies && <Tag tone="danger">alergija</Tag>}
                          {c.noShows >= 2 && <Tag tone="warn">{c.noShows} nedolaska</Tag>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: 'gold' | 'warn' | 'danger' }) {
  const tones = {
    gold: 'bg-gold-100 text-ink-900',
    warn: 'bg-warning-600/12 text-warning-600',
    danger: 'bg-danger-600/10 text-danger-600',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
