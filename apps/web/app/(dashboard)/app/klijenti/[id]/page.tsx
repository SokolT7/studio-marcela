'use client';

import Link from 'next/link';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { EmptyState, Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { serviceNameHr, stylistById, type DemoColourFormula } from '@/lib/dashboard/demo-data';
import { formatDateHr, slotTime, TIMEZONE } from '@/lib/booking';
import { formatPrice } from '@/lib/content/services';
import { localDateString } from '@sm/scheduling';

/**
 * Client record — plan §10.6.
 *
 * The colour formula is the point of this screen. Most salons keep it on index
 * cards that vanish when a stylist leaves; putting it here is the single
 * highest-value piece of data the business owns, and "isto kao prošli put" is
 * the whole retention mechanic in one button.
 */

export default function ClientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { clients, appointments, date } = useDashboard();

  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const todays = appointments
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => a.startsAt - b.startsAt);

  const latest = client.formulas[0];

  return (
    <div className="space-y-5">
      <nav aria-label="Staza" className="text-[0.8125rem] text-ink-500">
        <Link href="/app/klijenti" className="hover:text-ink-900">
          Klijenti
        </Link>
        <span className="mx-2 text-ink-300" aria-hidden="true">
          /
        </span>
        <span className="text-ink-900">
          {client.firstName} {client.lastName}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-ink-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="tabular mt-1 text-[0.9375rem] text-ink-700">{client.phone}</p>
          {client.email && <p className="text-[0.875rem] text-ink-500">{client.email}</p>}
        </div>
        <p className="text-[0.875rem] text-ink-500">Gošća od {formatSince(client.since)}</p>
      </div>

      {client.allergies && (
        <p className="rounded-[8px] border border-danger-600/30 bg-danger-600/10 px-4 py-3 text-[0.9375rem] font-medium text-danger-600">
          ⚠ {client.allergies}
        </p>
      )}

      {client.noShows >= 2 && (
        <p className="rounded-[8px] border border-warning-600/30 bg-warning-600/10 px-4 py-3 text-[0.9375rem] text-warning-600">
          {client.noShows} nedolaska — sustav traži akontaciju za nove termine.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Posjeta" value={String(client.visits)} />
        <StatTile label="Ukupna vrijednost" value={formatPrice(client.lifetimeValueCents)} />
        <StatTile
          label="Nedolasci"
          value={String(client.noShows)}
          tone={client.noShows > 0 ? 'warn' : 'good'}
        />
        <StatTile label="Formule boje" value={String(client.formulas.length)} />
      </div>

      {/* ── Colour formula — the reason this screen exists ────── */}
      <Panel
        title="Formule boje"
        tone={client.formulas.length > 0 ? 'attention' : 'default'}
        action={
          latest && (
            <button
              type="button"
              className="inline-flex min-h-[36px] items-center rounded-[8px] bg-gold-500 px-3.5 text-[0.875rem] font-medium text-ink-900 hover:bg-gold-400"
            >
              Isto kao prošli put
            </button>
          )
        }
      >
        {client.formulas.length === 0 ? (
          <EmptyState>Nema zabilježenih formula — gošća još nije bojila kosu kod nas.</EmptyState>
        ) : (
          <ol className="space-y-4">
            {client.formulas.map((f, i) => (
              <FormulaCard key={f.id} formula={f} isLatest={i === 0} />
            ))}
          </ol>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Termini">
          {todays.length === 0 ? (
            <EmptyState>Nema termina na prikazani dan.</EmptyState>
          ) : (
            <ul className="divide-y divide-paper-200">
              {todays.map((a) => {
                const stylist = stylistById(a.stylistId);
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="tabular w-[3.5rem] font-semibold text-ink-900">
                      {slotTime(a.startsAt)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-ink-900">{serviceNameHr(a.serviceSlug)}</span>
                      <span className="block text-[0.875rem] text-ink-500">
                        {formatDateHr(localDateString(a.startsAt, TIMEZONE))} ·{' '}
                        {stylist?.firstName} {stylist?.lastInitial}
                      </span>
                    </span>
                    <span className="tabular text-[0.9375rem] text-ink-700">
                      {formatPrice(a.priceCents)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-[0.8125rem] text-ink-500">
            Puna povijest posjeta dolazi kad se spoji baza — ovdje se prikazuju termini s
            odabranog dana ({formatDateHr(date)}).
          </p>
        </Panel>

        <Panel title="Bilješke">
          {client.notes ? (
            <p className="text-[0.9375rem] text-ink-700">{client.notes}</p>
          ) : (
            <EmptyState>Nema bilješki.</EmptyState>
          )}
          <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
            Bilješke vidi samo osoblje. Nikad se ne prikazuju gostu.
          </p>
        </Panel>
      </div>

      <Panel title="Privole">
        <ul className="space-y-2 text-[0.9375rem]">
          <ConsentRow label="Obrada podataka za termine" granted />
          <ConsentRow label="SMS podsjetnici i ponude" granted={client.visits > 10} />
          <ConsentRow label="Objava fotografija" granted={false} />
        </ul>
        <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
          Privole se bilježe zasebno, s vremenom i izvorom — GDPR čl. 7. Fotografija bez
          zabilježene privole ne može se objaviti.
        </p>
      </Panel>
    </div>
  );
}

const MONTHS_GENITIVE = [
  'siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja',
  'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca',
];

/** `"2021-03"` → `"ožujka 2021."` */
function formatSince(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return `${MONTHS_GENITIVE[(month ?? 1) - 1]} ${year}.`;
}

function FormulaCard({ formula, isLatest }: { formula: DemoColourFormula; isLatest: boolean }) {
  const stylist = stylistById(formula.stylistId);
  return (
    <li
      className={[
        'rounded-[8px] border p-4',
        isLatest ? 'border-gold-500/50 bg-gold-100/40' : 'border-paper-200',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium text-ink-900">
          {formatDateHr(localDateString(formula.appliedAt, TIMEZONE), { withWeekday: false })}
          {isLatest && (
            <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-900">
              zadnja
            </span>
          )}
        </p>
        <p className="text-[0.875rem] text-ink-500">
          {stylist?.firstName} {stylist?.lastInitial} · {formula.productLine}
        </p>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-2 text-[0.9375rem] sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-ink-500">Nijanse</dt>
          <dd className="tabular font-medium text-ink-900">
            {formula.shades.map((s) => `${s.shade} — ${s.grams} g`).join(' + ')}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Razvijač</dt>
          <dd className="text-ink-900">
            {formula.developer} {formula.developerVolume}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Omjer</dt>
          <dd className="tabular text-ink-900">{formula.ratio}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Stajanje</dt>
          <dd className="tabular text-ink-900">{formula.processingMin} min</dd>
        </div>
      </dl>

      {formula.resultNote && (
        <p className="mt-3 text-[0.875rem] text-ink-700">{formula.resultNote}</p>
      )}
      {formula.nextTimeNote && (
        // The field that turns a record into an instruction.
        <p className="mt-2 rounded-[6px] bg-paper-000 px-3 py-2 text-[0.875rem] text-ink-900">
          <strong>Sljedeći put:</strong> {formula.nextTimeNote}
        </p>
      )}
    </li>
  );
}

function ConsentRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-paper-200 pb-2 last:border-0 last:pb-0">
      <span className="text-ink-700">{label}</span>
      <span
        className={[
          'rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium',
          granted ? 'bg-success-600/10 text-success-600' : 'bg-paper-100 text-ink-500',
        ].join(' ')}
      >
        {granted ? 'dana' : 'nije dana'}
      </span>
    </li>
  );
}
