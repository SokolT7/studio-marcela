'use client';

import { useMemo } from 'react';
import { Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { generateDay, serviceNameHr, stylistById } from '@/lib/dashboard/demo-data';
import { rosteredStylists, shiftDate, shiftFor } from '@/lib/dashboard/day';
import { formatDateHr } from '@/lib/booking';
import { formatPrice } from '@/lib/content/services';

/**
 * Reports — plan §10.8, deliberately narrowed.
 *
 * The plan lists ten report types; four is what a manager acts on weekly, and
 * ten would mean nobody reads any. Revenue, utilisation, no-shows and service
 * mix, plus acquisition — which is the one she has never had, and the one that
 * finally answers what a booked euro costs by channel.
 */

const WINDOW_DAYS = 14;

export default function ReportsPage() {
  const { date, locationId } = useDashboard();

  const data = useMemo(() => {
    const days = Array.from({ length: WINDOW_DAYS }, (_, i) => shiftDate(date, -(WINDOW_DAYS - 1 - i)));

    let revenue = 0;
    let appointments = 0;
    let noShows = 0;
    let bookedMinutes = 0;
    let rosteredMinutes = 0;
    const byService = new Map<string, { count: number; cents: number }>();
    const byStylist = new Map<string, { count: number; cents: number }>();
    const bySource = new Map<string, number>();
    const daily: { day: string; cents: number; count: number }[] = [];

    for (const day of days) {
      const list = generateDay(day, locationId).filter((a) => a.status !== 'CANCELLED');
      let dayCents = 0;

      for (const a of list) {
        appointments++;
        bookedMinutes += (a.endsAt - a.startsAt) / 60_000;
        if (a.status === 'NO_SHOW') {
          noShows++;
        } else {
          revenue += a.priceCents;
          dayCents += a.priceCents;
        }

        const svc = byService.get(a.serviceSlug) ?? { count: 0, cents: 0 };
        byService.set(a.serviceSlug, { count: svc.count + 1, cents: svc.cents + a.priceCents });

        const st = byStylist.get(a.stylistId) ?? { count: 0, cents: 0 };
        byStylist.set(a.stylistId, { count: st.count + 1, cents: st.cents + a.priceCents });

        bySource.set(a.source, (bySource.get(a.source) ?? 0) + 1);
      }

      for (const s of rosteredStylists(day)) {
        const shift = shiftFor(s, day);
        if (shift) rosteredMinutes += (shift.end - shift.start) / 60_000;
      }

      daily.push({ day, cents: dayCents, count: list.length });
    }

    return {
      days,
      revenue,
      appointments,
      noShows,
      noShowRate: appointments > 0 ? Math.round((noShows / appointments) * 100) : 0,
      utilisation: rosteredMinutes > 0 ? Math.round((bookedMinutes / rosteredMinutes) * 100) : 0,
      averageTicket: appointments - noShows > 0 ? Math.round(revenue / (appointments - noShows)) : 0,
      byService: [...byService.entries()].sort((a, b) => b[1].cents - a[1].cents),
      byStylist: [...byStylist.entries()].sort((a, b) => b[1].cents - a[1].cents),
      bySource: [...bySource.entries()].sort((a, b) => b[1] - a[1]),
      daily,
    };
  }, [date, locationId]);

  const maxDaily = Math.max(...data.daily.map((d) => d.cents), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Izvještaji</h1>
        <p className="mt-1 text-[0.9375rem] text-ink-500">
          Zadnjih {WINDOW_DAYS} dana · {formatDateHr(data.days[0]!)} – {formatDateHr(date)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Promet" value={formatPrice(data.revenue)} sub={`${data.appointments} termina`} />
        <StatTile
          label="Popunjenost"
          value={`${data.utilisation}%`}
          tone={data.utilisation >= 70 ? 'good' : 'default'}
          sub="rezervirano od rasporeda"
        />
        <StatTile
          label="Nedolasci"
          value={`${data.noShowRate}%`}
          tone={data.noShowRate <= 8 ? 'good' : 'warn'}
          sub={`${data.noShows} termina`}
        />
        <StatTile label="Prosječan račun" value={formatPrice(data.averageTicket)} />
      </div>

      {/* ── Revenue by day ─────────────────────────────────────── */}
      <Panel title="Promet po danima">
        <ul className="flex items-end gap-1.5" style={{ height: 160 }}>
          {data.daily.map((d) => (
            <li key={d.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span className="tabular text-[0.6875rem] text-ink-500">
                {d.cents > 0 ? Math.round(d.cents / 100) : ''}
              </span>
              <span
                className="w-full rounded-t-[3px] bg-gold-500"
                style={{ height: `${Math.max((d.cents / maxDaily) * 110, 2)}px` }}
                title={`${formatDateHr(d.day)} — ${formatPrice(d.cents)}`}
              />
              <span className="tabular text-[0.625rem] text-ink-500">{Number(d.day.slice(8))}.</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.8125rem] text-ink-500">Iznosi u eurima, bez nedolazaka.</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Service mix ──────────────────────────────────────── */}
        <Panel title="Što se prodaje">
          <ul className="space-y-2.5">
            {data.byService.slice(0, 8).map(([slug, v]) => {
              const share = Math.round((v.cents / Math.max(data.revenue, 1)) * 100);
              return (
                <li key={slug}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                    <span className="min-w-0 truncate text-ink-900">{serviceNameHr(slug)}</span>
                    <span className="tabular shrink-0 text-ink-700">
                      {formatPrice(v.cents)} · {v.count}×
                    </span>
                  </div>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-paper-100">
                    <span
                      className="block h-full rounded-full bg-gold-500"
                      style={{ width: `${Math.max(share, 2)}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* ── By stylist ───────────────────────────────────────── */}
        <Panel title="Po stilistu">
          <ul className="space-y-2.5">
            {data.byStylist.map(([id, v]) => {
              const stylist = stylistById(id);
              const share = Math.round((v.cents / Math.max(data.revenue, 1)) * 100);
              return (
                <li key={id}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                    <span className="text-ink-900">
                      {stylist?.firstName} {stylist?.lastInitial}
                    </span>
                    <span className="tabular shrink-0 text-ink-700">
                      {formatPrice(v.cents)} · {v.count}×
                    </span>
                  </div>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-paper-100">
                    <span
                      className="block h-full rounded-full bg-gold-500"
                      style={{ width: `${Math.max(share, 2)}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
            Ovi brojevi su alat za razgovor, ne ljestvica. Ako postanu javno natjecanje, tim
            počne birati lakše goste i žuriti s uslugama.
          </p>
        </Panel>
      </div>

      {/* ── Acquisition — the one she has never had ────────────── */}
      <Panel title="Odakle dolaze rezervacije" tone="attention">
        <ul className="space-y-2.5">
          {data.bySource.map(([source, count]) => {
            const label =
              source === 'ONLINE' ? 'Online naručivanje' : source === 'PHONE' ? 'Telefon' : 'Bez najave';
            const share = Math.round((count / Math.max(data.appointments, 1)) * 100);
            return (
              <li key={source}>
                <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
                  <span className="text-ink-900">{label}</span>
                  <span className="tabular shrink-0 text-ink-700">
                    {count} · {share}%
                  </span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-paper-100">
                  <span
                    className="block h-full rounded-full bg-gold-500"
                    style={{ width: `${Math.max(share, 2)}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-paper-200 pt-4 text-[0.8125rem] text-ink-500">
          Kad se spoji Google Ads, ovdje se vidi i koliko košta jedan rezerviran termin po
          kanalu — podatak koji sustav već prikuplja, a nitko ga dosad nije koristio.
        </p>
      </Panel>

      <div className="flex flex-wrap gap-3">
        {['Izvoz u CSV', 'Pošalji e-poštom tjedno'].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="inline-flex min-h-[40px] cursor-not-allowed items-center rounded-[8px] border border-paper-200 bg-paper-100 px-4 text-[0.875rem] font-medium text-ink-500"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
