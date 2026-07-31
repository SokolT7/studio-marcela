'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { rosteredStylists, salonWindow, shiftFor } from '@/lib/dashboard/day';
import {
  clientById,
  serviceNameHr,
  stylistById,
  type DemoAppointment,
} from '@/lib/dashboard/demo-data';
import { slotTime } from '@/lib/booking';
import { formatPrice } from '@/lib/content/services';

/**
 * Day calendar — plan §10.4.
 *
 * The screen the whole capacity argument lives or dies on. Processing-time
 * overlap is only worth anything if staff trust it, and they will not trust a
 * grid that looks double-booked. So the passive phase of a colour is drawn
 * explicitly — recessed and hatched — and a second client sitting inside that
 * window is drawn beside it rather than on top of it.
 *
 * Desktop-first by deliberate choice: a resource grid needs width. Below `lg`
 * it falls back to an agenda list, which is what a stylist wants on a phone
 * anyway.
 */

const PX_PER_MIN = 1.5;
const GUTTER = 56; // width of the time axis

export default function CalendarPage() {
  const { date, appointments, user, moveAppointment, canManage } = useDashboard();
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const stylists = rosteredStylists(date);
  const window = salonWindow(date);

  const selectedAppointment = appointments.find((a) => a.id === selected) ?? null;

  if (!window || stylists.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Kalendar</h1>
        <EmptyState>Salon je zatvoren ili nitko nije na rasporedu.</EmptyState>
      </div>
    );
  }

  const totalMinutes = (window.end - window.start) / 60_000;
  const hours = Math.ceil(totalMinutes / 60);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Kalendar</h1>
        <Legend />
      </div>

      {/* ── Desktop resource grid ─────────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-[12px] border border-paper-200 bg-paper-000 lg:block">
        <div className="min-w-max">
          {/* Column headers */}
          <div className="sticky top-0 z-10 flex border-b border-paper-200 bg-paper-000">
            <div style={{ width: GUTTER }} className="shrink-0" />
            {stylists.map((s) => {
              const shift = shiftFor(s, date);
              return (
                <div
                  key={s.id}
                  className="w-[15rem] shrink-0 border-l border-paper-200 px-3 py-2.5"
                >
                  <p className="font-medium text-ink-900">
                    {s.firstName} {s.lastInitial}
                  </p>
                  <p className="tabular text-[0.8125rem] text-ink-500">
                    {shift ? `${slotTime(shift.start)}–${slotTime(shift.end)}` : '—'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Grid body. The top padding keeps the first hour label, which is
              centred on its rule, from being clipped by the header. */}
          <div className="relative flex pt-3">
            {/* Time axis */}
            <div style={{ width: GUTTER }} className="relative shrink-0">
              {Array.from({ length: hours + 1 }, (_, i) => (
                <div
                  key={i}
                  className="tabular absolute right-2 -translate-y-1/2 text-[0.75rem] text-ink-500"
                  style={{ top: i * 60 * PX_PER_MIN }}
                >
                  {slotTime(window.start + i * 60 * 60_000)}
                </div>
              ))}
              <div style={{ height: totalMinutes * PX_PER_MIN }} />
            </div>

            {stylists.map((stylist) => {
              const shift = shiftFor(stylist, date);
              const theirs = appointments.filter(
                (a) => a.stylistId === stylist.id && a.status !== 'CANCELLED',
              );
              const lanes = assignLanes(theirs);

              return (
                <div
                  key={stylist.id}
                  className="relative w-[15rem] shrink-0 border-l border-paper-200"
                  style={{ height: totalMinutes * PX_PER_MIN }}
                  onDragOver={(e) => canManage && e.preventDefault()}
                  onDrop={(e) => {
                    if (!canManage || !dragging) return;
                    e.preventDefault();
                    const box = e.currentTarget.getBoundingClientRect();
                    const minutesFromTop = (e.clientY - box.top) / PX_PER_MIN;
                    // Snap to the nearest quarter hour.
                    const snapped = Math.round(minutesFromTop / 15) * 15;
                    moveAppointment(dragging, window.start + snapped * 60_000, stylist.id);
                    setDragging(null);
                  }}
                >
                  {/* Hour rules */}
                  {Array.from({ length: hours + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute inset-x-0 border-t border-paper-200/70"
                      style={{ top: i * 60 * PX_PER_MIN }}
                    />
                  ))}

                  {/* Outside-shift shading */}
                  {shift && shift.start > window.start && (
                    <div
                      className="absolute inset-x-0 bg-paper-100"
                      style={{ top: 0, height: ((shift.start - window.start) / 60_000) * PX_PER_MIN }}
                    />
                  )}
                  {shift && shift.end < window.end && (
                    <div
                      className="absolute inset-x-0 bg-paper-100"
                      style={{
                        top: ((shift.end - window.start) / 60_000) * PX_PER_MIN,
                        bottom: 0,
                      }}
                    />
                  )}

                  {theirs.map((a) => (
                    <AppointmentBlock
                      key={a.id}
                      appointment={a}
                      windowStart={window.start}
                      lane={lanes.get(a.id) ?? { index: 0, of: 1 }}
                      draggable={canManage}
                      onDragStart={() => setDragging(a.id)}
                      onClick={() => setSelected(a.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile agenda ─────────────────────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {stylists.map((stylist) => {
          const theirs = appointments
            .filter((a) => a.stylistId === stylist.id && a.status !== 'CANCELLED')
            .sort((a, b) => a.startsAt - b.startsAt);
          return (
            <section
              key={stylist.id}
              className="rounded-[12px] border border-paper-200 bg-paper-000"
            >
              <h2 className="border-b border-paper-200 px-4 py-3 font-medium text-ink-900">
                {stylist.firstName} {stylist.lastInitial}
                <span className="ml-2 text-[0.8125rem] font-normal text-ink-500">
                  {theirs.length} termina
                </span>
              </h2>
              {theirs.length === 0 ? (
                <p className="px-4 py-4 text-[0.9375rem] text-ink-500">Nema termina.</p>
              ) : (
                <ul className="divide-y divide-paper-200">
                  {theirs.map((a) => {
                    const client = clientById(a.clientId);
                    const passive = a.segments.find((s) => s.type === 'PASSIVE');
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(a.id)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-paper-100"
                        >
                          <span className="tabular w-[3.5rem] shrink-0 font-semibold text-ink-900">
                            {slotTime(a.startsAt)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-ink-900">
                              {client ? `${client.firstName} ${client.lastName}` : 'Gost'}
                            </span>
                            <span className="block text-[0.875rem] text-ink-500">
                              {serviceNameHr(a.serviceSlug)}
                            </span>
                            {passive && (
                              <span className="tabular mt-1 inline-block rounded-[6px] bg-gold-100 px-2 py-0.5 text-[0.75rem] text-ink-700">
                                slobodno {slotTime(passive.startsAt)}–{slotTime(passive.endsAt)}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {selectedAppointment && (
        <AppointmentDrawer
          appointment={selectedAppointment}
          onClose={() => setSelected(null)}
          canManage={canManage}
          isOwn={selectedAppointment.stylistId === user.stylistId}
        />
      )}
    </div>
  );
}

/* ── Lane assignment ─────────────────────────────────────────────── */

interface Lane {
  index: number;
  of: number;
}

/**
 * Place overlapping appointments side by side.
 *
 * A stylist running processing-time overlap genuinely has two clients at once;
 * the grid has to show both without either hiding the other.
 */
function assignLanes(appointments: DemoAppointment[]): Map<string, Lane> {
  const sorted = [...appointments].sort((a, b) => a.startsAt - b.startsAt);
  const lanes = new Map<string, Lane>();
  const clusters: DemoAppointment[][] = [];

  for (const a of sorted) {
    const cluster = clusters.find((c) => c.some((b) => a.startsAt < b.endsAt && b.startsAt < a.endsAt));
    if (cluster) cluster.push(a);
    else clusters.push([a]);
  }

  for (const cluster of clusters) {
    const laneEnds: number[] = [];
    for (const a of cluster) {
      let idx = laneEnds.findIndex((end) => end <= a.startsAt);
      if (idx === -1) {
        idx = laneEnds.length;
        laneEnds.push(a.endsAt);
      } else {
        laneEnds[idx] = a.endsAt;
      }
      lanes.set(a.id, { index: idx, of: 1 });
    }
    const width = laneEnds.length;
    for (const a of cluster) {
      const lane = lanes.get(a.id)!;
      lanes.set(a.id, { index: lane.index, of: width });
    }
  }

  return lanes;
}

/* ── Blocks ──────────────────────────────────────────────────────── */

function AppointmentBlock({
  appointment,
  windowStart,
  lane,
  draggable,
  onDragStart,
  onClick,
}: {
  appointment: DemoAppointment;
  windowStart: number;
  lane: Lane;
  draggable: boolean;
  onDragStart: () => void;
  onClick: () => void;
}) {
  const client = clientById(appointment.clientId);
  const top = ((appointment.startsAt - windowStart) / 60_000) * PX_PER_MIN;
  const height = ((appointment.endsAt - appointment.startsAt) / 60_000) * PX_PER_MIN;
  const widthPct = 100 / lane.of;

  const done = appointment.status === 'COMPLETED';
  const noShow = appointment.status === 'NO_SHOW';

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={[
        'absolute overflow-hidden rounded-[6px] border text-left transition-shadow',
        noShow
          ? 'border-danger-600/40 bg-danger-600/10'
          : done
            ? 'border-success-600/30 bg-success-600/10'
            : 'border-ink-900/15 bg-paper-000 hover:shadow-md',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
      ].join(' ')}
      style={{
        top,
        height: Math.max(height, 22),
        left: `calc(${lane.index * widthPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
    >
      {/* Phase bands: the passive window is where the stylist is free. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]">
        {appointment.segments.map((seg, i) => (
          <span
            key={i}
            className={`absolute left-0 w-full ${seg.type === 'ACTIVE' ? 'bg-gold-500' : 'bg-gold-500/25'}`}
            style={{
              top: ((seg.startsAt - appointment.startsAt) / 60_000) * PX_PER_MIN,
              height: ((seg.endsAt - seg.startsAt) / 60_000) * PX_PER_MIN,
            }}
          />
        ))}
      </span>

      {appointment.segments
        .filter((s) => s.type === 'PASSIVE')
        .map((seg, i) => (
          <span
            key={`p-${i}`}
            aria-hidden="true"
            title="Boja odstoji — stilist je slobodan"
            className="absolute inset-x-0"
            style={{
              top: ((seg.startsAt - appointment.startsAt) / 60_000) * PX_PER_MIN,
              height: ((seg.endsAt - seg.startsAt) / 60_000) * PX_PER_MIN,
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(194,161,92,0.18) 0 6px, transparent 6px 12px)',
            }}
          />
        ))}

      <span className="relative block px-2 py-1">
        <span className="tabular block text-[0.6875rem] text-ink-500">
          {slotTime(appointment.startsAt)}
        </span>
        <span className="block truncate text-[0.8125rem] font-medium text-ink-900">
          {client ? `${client.firstName} ${client.lastName.charAt(0)}.` : 'Gost'}
        </span>
        {height > 60 && (
          <span className="block truncate text-[0.75rem] text-ink-500">
            {serviceNameHr(appointment.serviceSlug)}
          </span>
        )}
      </span>
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[0.8125rem] text-ink-700">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-[2px] bg-gold-500" aria-hidden="true" />
        Stilist radi
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-3 w-3 rounded-[2px] border border-gold-500/40"
          aria-hidden="true"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(194,161,92,0.3) 0 3px, transparent 3px 6px)',
          }}
        />
        Boja odstoji — stilist slobodan
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-[2px] bg-paper-100 ring-1 ring-paper-200" aria-hidden="true" />
        Izvan smjene
      </span>
    </div>
  );
}

/* ── Drawer ──────────────────────────────────────────────────────── */

function AppointmentDrawer({
  appointment,
  onClose,
  canManage,
  isOwn,
}: {
  appointment: DemoAppointment;
  onClose: () => void;
  canManage: boolean;
  isOwn: boolean;
}) {
  const { setStatus } = useDashboard();
  const client = clientById(appointment.clientId);
  const stylist = stylistById(appointment.stylistId);
  const passive = appointment.segments.find((s) => s.type === 'PASSIVE');
  const editable = canManage || isOwn;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Zatvori"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />
      <aside className="relative flex w-[min(26rem,92vw)] flex-col overflow-y-auto bg-paper-050 shadow-lg">
        <header className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
          <span className="tabular text-[0.8125rem] text-ink-500">{appointment.reference}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="flex h-10 w-10 items-center justify-center rounded-[8px] hover:bg-paper-100"
          >
            ✕
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div>
            <h2 className="text-[1.25rem] font-semibold text-ink-900">
              {client ? `${client.firstName} ${client.lastName}` : 'Gost'}
            </h2>
            <p className="tabular mt-1 text-[0.9375rem] text-ink-700">
              {slotTime(appointment.startsAt)}–{slotTime(appointment.endsAt)} ·{' '}
              {serviceNameHr(appointment.serviceSlug)}
            </p>
            <p className="mt-0.5 text-[0.875rem] text-ink-500">
              {stylist?.firstName} {stylist?.lastInitial} · {formatPrice(appointment.priceCents)}
            </p>
          </div>

          {passive && (
            <p className="tabular rounded-[8px] bg-gold-100 px-4 py-3 text-[0.875rem] text-ink-900">
              <strong>{slotTime(passive.startsAt)}–{slotTime(passive.endsAt)}</strong> boja odstoji.
              Stilist je slobodan i može primiti drugog gosta.
            </p>
          )}

          {client?.allergies && (
            <p className="rounded-[8px] bg-danger-600/10 px-4 py-3 text-[0.875rem] font-medium text-danger-600">
              ⚠ {client.allergies}
            </p>
          )}

          {appointment.clientNote && (
            <div>
              <p className="text-[0.75rem] uppercase tracking-wider text-ink-500">Napomena gosta</p>
              <p className="mt-1 text-[0.9375rem] text-ink-700">{appointment.clientNote}</p>
            </div>
          )}

          {editable ? (
            <div className="flex flex-wrap gap-2 border-t border-paper-200 pt-5">
              <DrawerAction onClick={() => setStatus(appointment.id, 'ARRIVED')}>
                Stigao/la
              </DrawerAction>
              <DrawerAction primary onClick={() => setStatus(appointment.id, 'COMPLETED')}>
                Gotovo
              </DrawerAction>
              <DrawerAction onClick={() => setStatus(appointment.id, 'NO_SHOW')}>
                Nije došao/la
              </DrawerAction>
            </div>
          ) : (
            // Stylists see the whole floor but act only on their own diary
            // (plan §10.1) — the restriction is stated, not hidden.
            <p className="rounded-[8px] border border-paper-200 px-4 py-3 text-[0.875rem] text-ink-500">
              Ovo je termin kolegice. Izmjene radi voditelj.
            </p>
          )}

          {client && (
            <Link
              href={`/app/klijenti/${client.id}`}
              className="flex min-h-[44px] items-center justify-center rounded-[8px] border border-ink-900/20 px-4 text-[0.9375rem] font-medium text-ink-900 hover:bg-paper-100"
            >
              Otvori karton{client.formulas.length > 0 ? ' · formula boje' : ''}
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

function DrawerAction({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex min-h-[40px] items-center rounded-[8px] px-3.5 text-[0.875rem] font-medium',
        primary
          ? 'bg-gold-500 text-ink-900 hover:bg-gold-400'
          : 'border border-ink-900/20 text-ink-900 hover:bg-paper-100',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
