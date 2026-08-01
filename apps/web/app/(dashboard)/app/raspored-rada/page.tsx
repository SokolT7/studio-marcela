'use client';

import Link from 'next/link';
import { Panel } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { STYLISTS } from '@/lib/seed';
import { salonWindow, shiftDate, shiftFor } from '@/lib/dashboard/day';
import { formatDateHr, slotTime } from '@/lib/booking';

/**
 * Shift planning — plan §10.5.
 *
 * A week at a glance, staff down and days across, because that is how a rota
 * is actually thought about. The coverage warnings matter more than the grid:
 * an hour the salon is open with nobody who can colour is a booking the site
 * will refuse to take, and the manager should learn that here rather than from
 * a client who could not find a slot.
 */

const DAY_SHORT = ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'];

export default function RotaPage() {
  const { date } = useDashboard();

  // The Monday of the shown week.
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
  const monday = shiftDate(date, dow === 0 ? -6 : 1 - dow);
  const week = Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));

  const coverage = week.map((day) => {
    const open = salonWindow(day) !== null;
    const working = STYLISTS.filter((s) => shiftFor(s, day) !== null);
    const colourists = working.filter((s) =>
      s.skills.some(
        (k) => (k.level === 'CERTIFIED' || k.level === 'TRAINER') && k.serviceId === 'bojanje',
      ),
    );
    return { day, open, working, colourists };
  });

  const warnings = coverage.filter((c) => c.open && (c.working.length === 0 || c.colourists.length === 0));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-ink-900">Raspored rada</h1>
          <p className="mt-1 text-[0.9375rem] text-ink-500">
            Tjedan {formatDateHr(monday)} – {formatDateHr(week[6]!)}
          </p>
        </div>
        <Link
          href="/app/odsutnost"
          className="text-[0.875rem] font-medium text-gold-700 underline underline-offset-4"
        >
          Odsutnost →
        </Link>
      </div>

      {warnings.length > 0 && (
        <Panel title={`Upozorenja o pokrivenosti (${warnings.length})`} tone="attention">
          <ul className="space-y-2">
            {warnings.map((w) => (
              <li key={w.day} className="rounded-[8px] bg-warning-600/10 px-4 py-3 text-[0.9375rem]">
                <strong className="text-ink-900">{formatDateHr(w.day, { withWeekday: true })}</strong>{' '}
                <span className="text-warning-600">
                  {w.working.length === 0
                    ? '— salon je otvoren, a nitko nije na rasporedu.'
                    : '— nitko na rasporedu nije certificiran za bojanje. Online se neće nuditi termini za boju.'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-[0.875rem]">
            <caption className="sr-only">Tjedni raspored rada po djelatniku</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[10rem] pb-3 text-left text-[0.75rem] uppercase tracking-wider text-ink-500">
                  Djelatnik
                </th>
                {coverage.map((c) => (
                  <th
                    key={c.day}
                    scope="col"
                    className="pb-3 text-center text-[0.75rem] uppercase tracking-wider text-ink-500"
                  >
                    <span className="block">{DAY_SHORT[new Date(`${c.day}T00:00:00Z`).getUTCDay()]}</span>
                    <span className="tabular block font-normal normal-case text-ink-700">
                      {Number(c.day.slice(8))}.
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STYLISTS.map((s) => (
                <tr key={s.id} className="border-t border-paper-200">
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal">
                    <Link
                      href={`/app/osoblje/${s.id}`}
                      className="font-medium text-ink-900 underline-offset-4 hover:underline"
                    >
                      {s.firstName} {s.lastInitial}
                    </Link>
                  </th>
                  {coverage.map((c) => {
                    const shift = shiftFor(s, c.day);
                    return (
                      <td key={c.day} className="px-1 py-2.5 text-center align-middle">
                        {!c.open ? (
                          <span className="block rounded-[6px] bg-paper-100 py-1.5 text-[0.75rem] text-ink-500">
                            zatvoreno
                          </span>
                        ) : shift ? (
                          <span className="tabular block rounded-[6px] bg-gold-100 py-1.5 text-[0.75rem] font-medium text-ink-900">
                            {slotTime(shift.start)}–{slotTime(shift.end)}
                          </span>
                        ) : (
                          <span className="block rounded-[6px] border border-dashed border-paper-200 py-1.5 text-[0.75rem] text-ink-500">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Objava rasporeda">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="inline-flex min-h-[40px] cursor-not-allowed items-center rounded-[8px] border border-paper-200 bg-paper-100 px-4 text-[0.875rem] font-medium text-ink-500"
          >
            Objavi raspored timu
          </button>
          <button
            type="button"
            disabled
            className="inline-flex min-h-[40px] cursor-not-allowed items-center rounded-[8px] border border-paper-200 bg-paper-100 px-4 text-[0.875rem] font-medium text-ink-500"
          >
            Kopiraj prošli tjedan
          </button>
          <button
            type="button"
            disabled
            className="inline-flex min-h-[40px] cursor-not-allowed items-center rounded-[8px] border border-paper-200 bg-paper-100 px-4 text-[0.875rem] font-medium text-ink-500"
          >
            Ispis za salon
          </button>
        </div>
        <p className="mt-4 text-[0.8125rem] text-ink-500">
          Objava, kopiranje i ispis čekaju spajanje baze. Do tada se raspored prikazuje iz
          tjednog obrasca svakog djelatnika.
        </p>
      </Panel>
    </div>
  );
}
