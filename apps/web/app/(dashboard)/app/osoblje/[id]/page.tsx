'use client';

import Link from 'next/link';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { EmptyState, Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { BOOKABLE_SERVICES, STYLISTS } from '@/lib/seed';
import { shiftFor } from '@/lib/dashboard/day';
import { serviceNameHr } from '@/lib/dashboard/demo-data';
import { slotTime } from '@/lib/booking';
import { formatPrice } from '@/lib/content/services';

/**
 * Staff record — plan §10.5.1.
 *
 * Working hours, the skills matrix and absence in one place, because these are
 * the three things a manager actually changes. The skills matrix is not
 * cosmetic: only CERTIFIED and TRAINER appear as bookable online, which is what
 * stops a client being booked for AirTouch with someone who has never done one.
 */

const DAY_NAMES = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

const SKILL_LABEL: Record<string, string> = {
  NOT_TRAINED: 'Nije educiran',
  IN_TRAINING: 'U edukaciji',
  CERTIFIED: 'Certificiran',
  TRAINER: 'Trener',
};

const SKILL_STYLE: Record<string, string> = {
  NOT_TRAINED: 'bg-paper-100 text-ink-500',
  IN_TRAINING: 'bg-warning-600/12 text-warning-600',
  CERTIFIED: 'bg-success-600/10 text-success-600',
  TRAINER: 'bg-gold-500 text-ink-900',
};

export default function StaffRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { date, appointments, absences } = useDashboard();

  const stylist = STYLISTS.find((s) => s.id === id);
  if (!stylist) notFound();

  const shift = shiftFor(stylist, date);
  const theirs = appointments.filter((a) => a.stylistId === stylist.id && a.status !== 'CANCELLED');
  const revenue = theirs
    .filter((a) => a.status !== 'NO_SHOW')
    .reduce((t, a) => t + a.priceCents, 0);
  const bookedMin = theirs.reduce((t, a) => t + (a.endsAt - a.startsAt) / 60_000, 0);
  const shiftMin = shift ? (shift.end - shift.start) / 60_000 : 0;
  const utilisation = shiftMin > 0 ? Math.round((bookedMin / shiftMin) * 100) : 0;

  const theirAbsences = absences.filter((a) => a.userId === stylist.id);
  const allServices = Object.keys(BOOKABLE_SERVICES);

  return (
    <div className="space-y-5">
      <nav aria-label="Staza" className="text-[0.8125rem] text-ink-500">
        <Link href="/app/osoblje" className="hover:text-ink-900">
          Osoblje
        </Link>
        <span className="mx-2 text-ink-300" aria-hidden="true">
          /
        </span>
        <span className="text-ink-900">
          {stylist.firstName} {stylist.lastInitial}
        </span>
      </nav>

      <div>
        <h1 className="text-[1.5rem] font-semibold text-ink-900">
          {stylist.firstName} {stylist.lastInitial}
        </h1>
        <p className="mt-1 text-[0.9375rem] text-ink-700">{stylist.title}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Smjena danas"
          value={shift ? `${slotTime(shift.start)}–${slotTime(shift.end)}` : '—'}
        />
        <StatTile label="Termini danas" value={String(theirs.length)} />
        <StatTile
          label="Popunjenost"
          value={`${utilisation}%`}
          tone={utilisation >= 70 ? 'good' : 'default'}
        />
        <StatTile label="Promet danas" value={formatPrice(revenue)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Working hours ──────────────────────────────────── */}
        <Panel title="Radno vrijeme">
          <table className="w-full text-[0.9375rem]">
            <caption className="sr-only">Tjedni raspored</caption>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
                const pattern = stylist.patterns.find((p) => p.dayOfWeek === dow);
                return (
                  <tr key={dow} className="border-b border-paper-200/70 last:border-0">
                    <th scope="row" className="py-2.5 text-left font-normal text-ink-700">
                      {DAY_NAMES[dow]}
                    </th>
                    <td className="tabular py-2.5 text-right text-ink-900">
                      {pattern ? (
                        <>
                          {pattern.startsAt}–{pattern.endsAt}
                          {pattern.weekParity !== 'EVERY' && (
                            <span className="ml-2 rounded-full bg-paper-100 px-2 py-0.5 text-[0.6875rem] text-ink-500">
                              {pattern.weekParity === 'ODD' ? 'neparni tjedni' : 'parni tjedni'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-ink-500">slobodno</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
            Izmjena radnog vremena koja bi ostavila već rezervirane termine bez stilista
            blokira se i traži rješenje — premještanje ili obavijest gostima.
          </p>
        </Panel>

        {/* ── Absence ────────────────────────────────────────── */}
        <Panel title="Odsutnost">
          {theirAbsences.length === 0 ? (
            <EmptyState>Nema evidentiranih odsutnosti.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {theirAbsences.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-[8px] bg-paper-100 px-4 py-3"
                >
                  <span className="tabular text-[0.9375rem] text-ink-900">
                    {a.startDate} → {a.endDate}
                  </span>
                  <span className="text-[0.875rem] text-ink-500">
                    {a.type === 'ANNUAL'
                      ? 'godišnji'
                      : a.type === 'SICK'
                        ? 'bolovanje'
                        : a.type === 'TRAINING'
                          ? 'edukacija'
                          : 'neplaćeno'}
                  </span>
                  <span
                    className={[
                      'ml-auto rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium',
                      a.status === 'APPROVED'
                        ? 'bg-success-600/10 text-success-600'
                        : a.status === 'DECLINED'
                          ? 'bg-danger-600/10 text-danger-600'
                          : 'bg-warning-600/12 text-warning-600',
                    ].join(' ')}
                  >
                    {a.status === 'APPROVED' ? 'odobreno' : a.status === 'DECLINED' ? 'odbijeno' : 'na čekanju'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-paper-200 pt-4 text-center">
            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-ink-500">Pravo</dt>
              <dd className="tabular text-[1.25rem] text-ink-900">20</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-ink-500">Iskorišteno</dt>
              <dd className="tabular text-[1.25rem] text-ink-900">6</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-ink-500">Ostalo</dt>
              <dd className="tabular text-[1.25rem] text-success-600">14</dd>
            </div>
          </dl>
          <p className="mt-3 text-[0.8125rem] text-ink-500">
            Zakonski minimum u Hrvatskoj je 4 tjedna. Stvarna politika unosi se u postavkama.
          </p>
        </Panel>
      </div>

      {/* ── Skills matrix ────────────────────────────────────── */}
      <Panel title="Matrica vještina">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map((slug) => {
            const skill = stylist.skills.find((k) => k.serviceId === slug);
            const level = skill?.level ?? 'NOT_TRAINED';
            return (
              <li
                key={slug}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-paper-200 px-3.5 py-2.5"
              >
                <span className="min-w-0 truncate text-[0.9375rem] text-ink-900">
                  {serviceNameHr(slug)}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${SKILL_STYLE[level]}`}
                >
                  {SKILL_LABEL[level]}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
          Online se nude samo usluge za koje je stilist certificiran. „U edukaciji” se može
          rezervirati jedino kad je trener u istoj smjeni.
        </p>
      </Panel>
    </div>
  );
}
