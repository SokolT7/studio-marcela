'use client';

import Link from 'next/link';
import { Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { STYLISTS } from '@/lib/seed';
import { rosteredStylists, shiftFor } from '@/lib/dashboard/day';
import { slotTime } from '@/lib/booking';

/**
 * Staff list — plan §10.5.
 *
 * The screen a manager opens to answer "who is in today, and who can do what".
 * Certification is shown as a count here and in full on the record, because the
 * skills matrix is what gates online booking.
 */

export default function StaffPage() {
  const { date, appointments, absences } = useDashboard();
  const onToday = rosteredStylists(date);
  const pending = absences.filter((a) => a.status === 'REQUESTED');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Osoblje</h1>
        <Link
          href="/app/raspored-rada"
          className="text-[0.875rem] font-medium text-gold-700 underline underline-offset-4"
        >
          Raspored rada →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Ukupno u timu" value={String(STYLISTS.length)} />
        <StatTile label="Na rasporedu danas" value={String(onToday.length)} />
        <StatTile
          label="Zahtjevi za odsutnost"
          value={String(pending.length)}
          tone={pending.length > 0 ? 'warn' : 'good'}
        />
      </div>

      <Panel>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STYLISTS.map((s) => {
            const shift = shiftFor(s, date);
            const theirs = appointments.filter(
              (a) => a.stylistId === s.id && a.status !== 'CANCELLED',
            );
            const certified = s.skills.filter((k) => k.level === 'CERTIFIED' || k.level === 'TRAINER');

            return (
              <li key={s.id} className="rounded-[8px] border border-paper-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/app/osoblje/${s.id}`}
                      className="font-medium text-ink-900 underline-offset-4 hover:underline"
                    >
                      {s.firstName} {s.lastInitial}
                    </Link>
                    <p className="text-[0.8125rem] text-ink-500">{s.title}</p>
                  </div>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium',
                      shift ? 'bg-success-600/10 text-success-600' : 'bg-paper-100 text-ink-500',
                    ].join(' ')}
                  >
                    {shift ? 'na rasporedu' : 'slobodan dan'}
                  </span>
                </div>

                <dl className="mt-3 space-y-1 text-[0.875rem]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-500">Smjena</dt>
                    <dd className="tabular text-ink-900">
                      {shift ? `${slotTime(shift.start)}–${slotTime(shift.end)}` : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-500">Termini danas</dt>
                    <dd className="tabular text-ink-900">{theirs.length}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-500">Certificiran za</dt>
                    <dd className="tabular text-ink-900">{certified.length} usluga</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-500">Preklapanje</dt>
                    <dd className="text-ink-900">
                      {s.allowOverlap ? `do ${s.maxConcurrentClients} gosta` : 'isključeno'}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {s.specialities.map((sp) => (
                    <li
                      key={sp}
                      className="rounded-full bg-paper-100 px-2.5 py-0.5 text-[0.75rem] text-ink-700"
                    >
                      {sp}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Panel>

      <p className="text-[0.8125rem] text-ink-500">
        Stvarni tim, smjene i certifikati unose se kroz{' '}
        <Link href="/app/postavljanje" className="text-gold-700 underline underline-offset-4">
          početno postavljanje
        </Link>
        . Prikazani ljudi su izmišljeni.
      </p>
    </div>
  );
}
