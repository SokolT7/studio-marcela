'use client';

import Link from 'next/link';
import { EmptyState, Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { STYLISTS } from '@/lib/seed';
import { stylistById } from '@/lib/dashboard/demo-data';
import { formatDateHr } from '@/lib/booking';

/**
 * Absence — plan §10.5.
 *
 * Requests, approvals and balances in one place. Approving here removes the
 * time from bookable availability immediately; where that would orphan an
 * existing appointment, the system asks for a resolution rather than silently
 * leaving a client without a stylist.
 */

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: 'Godišnji odmor',
  SICK: 'Bolovanje',
  TRAINING: 'Edukacija',
  UNPAID: 'Neplaćeni dopust',
};

export default function AbsencePage() {
  const { absences, reviewAbsence, user } = useDashboard();

  const pending = absences.filter((a) => a.status === 'REQUESTED');
  const decided = absences.filter((a) => a.status !== 'REQUESTED');
  const isStylist = user.role === 'STYLIST';
  const mine = absences.filter((a) => a.userId === user.stylistId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Odsutnost</h1>
        {isStylist && (
          <button
            type="button"
            disabled
            className="inline-flex min-h-[40px] cursor-not-allowed items-center rounded-[8px] border border-paper-200 bg-paper-100 px-4 text-[0.875rem] font-medium text-ink-500"
          >
            Zatraži odsutnost
          </button>
        )}
      </div>

      {isStylist ? (
        <Panel title="Moji zahtjevi">
          {mine.length === 0 ? (
            <EmptyState>Nemate zabilježenih odsutnosti.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {mine.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-[8px] bg-paper-100 px-4 py-3"
                >
                  <span className="font-medium text-ink-900">{TYPE_LABEL[a.type]}</span>
                  <span className="tabular text-[0.875rem] text-ink-700">
                    {formatDateHr(a.startDate)} → {formatDateHr(a.endDate)}
                  </span>
                  <StatusPill status={a.status} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
            Zahtjev odobrava voditelj. Odobreno vrijeme odmah nestaje iz online kalendara.
          </p>
        </Panel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Na čekanju"
              value={String(pending.length)}
              tone={pending.length > 0 ? 'warn' : 'good'}
            />
            <StatTile
              label="Odobreno"
              value={String(absences.filter((a) => a.status === 'APPROVED').length)}
            />
            <StatTile label="Djelatnika u timu" value={String(STYLISTS.length)} />
          </div>

          <Panel
            title={`Zahtjevi na čekanju (${pending.length})`}
            tone={pending.length > 0 ? 'attention' : 'default'}
          >
            {pending.length === 0 ? (
              <EmptyState>Nema zahtjeva koji čekaju odluku.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {pending.map((a) => {
                  const stylist = stylistById(a.userId);
                  return (
                    <li key={a.id} className="rounded-[8px] border border-paper-200 p-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <Link
                          href={`/app/osoblje/${a.userId}`}
                          className="font-medium text-ink-900 underline-offset-4 hover:underline"
                        >
                          {stylist?.firstName} {stylist?.lastInitial}
                        </Link>
                        <span className="text-[0.875rem] text-ink-500">{TYPE_LABEL[a.type]}</span>
                        <span className="tabular text-[0.9375rem] text-ink-700">
                          {formatDateHr(a.startDate)} → {formatDateHr(a.endDate)}
                        </span>
                      </div>
                      {a.note && (
                        <p className="mt-1.5 text-[0.875rem] text-ink-500">{a.note}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => reviewAbsence(a.id, 'APPROVED')}
                          className="inline-flex min-h-[36px] items-center rounded-[8px] bg-gold-500 px-3.5 text-[0.875rem] font-medium text-ink-900 hover:bg-gold-400"
                        >
                          Odobri
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewAbsence(a.id, 'DECLINED')}
                          className="inline-flex min-h-[36px] items-center rounded-[8px] border border-ink-900/20 px-3.5 text-[0.875rem] font-medium text-ink-900 hover:bg-paper-100"
                        >
                          Odbij
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Riješeni zahtjevi">
            {decided.length === 0 ? (
              <EmptyState>Još nema riješenih zahtjeva.</EmptyState>
            ) : (
              <ul className="divide-y divide-paper-200">
                {decided.map((a) => {
                  const stylist = stylistById(a.userId);
                  return (
                    <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink-900">
                          {stylist?.firstName} {stylist?.lastInitial}
                        </span>
                        <span className="tabular block text-[0.875rem] text-ink-500">
                          {TYPE_LABEL[a.type]} · {formatDateHr(a.startDate)} →{' '}
                          {formatDateHr(a.endDate)}
                        </span>
                      </span>
                      <StatusPill status={a.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Stanje godišnjeg odmora">
            <ul className="divide-y divide-paper-200">
              {STYLISTS.map((s, i) => {
                // Placeholder balances until the real entitlement policy is set.
                const used = 4 + i * 2;
                const total = 20;
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="w-[9rem] font-medium text-ink-900">
                      {s.firstName} {s.lastInitial}
                    </span>
                    <span className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-paper-100">
                      <span
                        className="block h-full rounded-full bg-gold-500"
                        style={{ width: `${(used / total) * 100}%` }}
                      />
                    </span>
                    <span className="tabular text-[0.875rem] text-ink-700">
                      {used} / {total} dana
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
              Prikazana su okvirna stanja. Stvarno pravo po djelatniku unosi se u postavkama —
              zakonski minimum je 4 tjedna.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: 'bg-success-600/10 text-success-600',
    DECLINED: 'bg-danger-600/10 text-danger-600',
    REQUESTED: 'bg-warning-600/12 text-warning-600',
  };
  const label: Record<string, string> = {
    APPROVED: 'odobreno',
    DECLINED: 'odbijeno',
    REQUESTED: 'na čekanju',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}
