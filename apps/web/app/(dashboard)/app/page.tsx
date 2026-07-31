'use client';

import Link from 'next/link';
import { EmptyState, Panel, StatTile } from '@/components/dashboard/shell';
import { useDashboard } from '@/lib/dashboard/store';
import { findGaps, rosteredStylists, shiftFor, summarise } from '@/lib/dashboard/day';
import {
  clientById,
  serviceNameHr,
  stylistById,
  type AppointmentStatus,
  type DemoAppointment,
} from '@/lib/dashboard/demo-data';
import { slotTime } from '@/lib/booking';
import { formatPrice } from '@/lib/content/services';

/**
 * Today — the landing screen, different per role (plan §10.3).
 *
 * The rule the whole screen follows: answer in one glance, act in one tap,
 * never make someone navigate to find out whether something needs them.
 */

export default function TodayPage() {
  const { user } = useDashboard();
  if (user.role === 'STYLIST') return <StylistToday />;
  if (user.role === 'OWNER') return <OwnerToday />;
  return <FloorToday />;
}

/* ── Status chip ─────────────────────────────────────────────────── */

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  CONFIRMED: 'Potvrđeno',
  ARRIVED: 'Stigao/la',
  IN_PROGRESS: 'U tijeku',
  COMPLETED: 'Gotovo',
  NO_SHOW: 'Nije došao/la',
  CANCELLED: 'Otkazano',
};

// Status never relies on colour alone — each carries a word (plan §18).
const STATUS_STYLE: Record<AppointmentStatus, string> = {
  CONFIRMED: 'border-paper-200 bg-paper-100 text-ink-700',
  ARRIVED: 'border-gold-500/60 bg-gold-100 text-ink-900',
  IN_PROGRESS: 'border-gold-500 bg-gold-500 text-ink-900',
  COMPLETED: 'border-success-600/30 bg-success-600/10 text-success-600',
  NO_SHOW: 'border-danger-600/30 bg-danger-600/10 text-danger-600',
  CANCELLED: 'border-paper-200 bg-paper-100 text-ink-500 line-through',
};

function StatusChip({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.75rem] font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── Stylist ─────────────────────────────────────────────────────── */

function StylistToday() {
  const { user, date, appointments, setStatus } = useDashboard();
  const mine = appointments
    .filter((a) => a.stylistId === user.stylistId && a.status !== 'CANCELLED')
    .sort((a, b) => a.startsAt - b.startsAt);

  const stylist = user.stylistId ? stylistById(user.stylistId) : undefined;
  const shift = stylist ? shiftFor(stylist, date) : null;
  const remaining = mine.filter((a) => a.status === 'CONFIRMED' || a.status === 'ARRIVED');
  const bookedMin = mine.reduce((t, a) => t + (a.endsAt - a.startsAt) / 60_000, 0);

  return (
    <div className="mx-auto max-w-[52rem] space-y-6">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Vaš dan</h1>
        <p className="mt-1 text-[0.9375rem] text-ink-500">
          {shift
            ? `Smjena ${slotTime(shift.start)}–${slotTime(shift.end)} · ${mine.length} termina · ${Math.round(bookedMin / 60)} h u stolici`
            : 'Danas niste na rasporedu.'}
        </p>
      </div>

      {mine.length === 0 ? (
        <EmptyState>Nema termina za danas.</EmptyState>
      ) : (
        <ol className="space-y-3">
          {mine.map((a) => {
            const client = clientById(a.clientId);
            const passive = a.segments.find((s) => s.type === 'PASSIVE');
            return (
              <li
                key={a.id}
                className="rounded-[12px] border border-paper-200 bg-paper-000 p-4"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="tabular w-[4.5rem] shrink-0">
                    <p className="text-[1.125rem] font-semibold text-ink-900">
                      {slotTime(a.startsAt)}
                    </p>
                    <p className="text-[0.8125rem] text-ink-500">{slotTime(a.endsAt)}</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink-900">
                        {client ? `${client.firstName} ${client.lastName}` : 'Gost'}
                      </p>
                      <StatusChip status={a.status} />
                    </div>
                    <p className="mt-0.5 text-[0.9375rem] text-ink-700">
                      {serviceNameHr(a.serviceSlug)}
                    </p>

                    {passive && (
                      // The stylist needs to know they are free mid-service —
                      // that window is the whole point of overlap scheduling.
                      <p className="tabular mt-2 inline-flex rounded-[6px] bg-gold-100 px-2.5 py-1 text-[0.8125rem] text-ink-700">
                        Slobodni {slotTime(passive.startsAt)}–{slotTime(passive.endsAt)} dok boja
                        odstoji
                      </p>
                    )}

                    {client?.allergies && (
                      <p className="mt-2 text-[0.8125rem] font-medium text-danger-600">
                        ⚠ {client.allergies}
                      </p>
                    )}
                    {a.clientNote && (
                      <p className="mt-1.5 text-[0.8125rem] text-ink-500">
                        Napomena gosta: {a.clientNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-paper-200 pt-3">
                  {a.status === 'CONFIRMED' && (
                    <ActionButton onClick={() => setStatus(a.id, 'ARRIVED')}>
                      Stigao/la
                    </ActionButton>
                  )}
                  {(a.status === 'ARRIVED' || a.status === 'IN_PROGRESS') && (
                    <ActionButton primary onClick={() => setStatus(a.id, 'COMPLETED')}>
                      Gotovo
                    </ActionButton>
                  )}
                  {client && (
                    <ActionLink href={`/app/klijenti/${client.id}`}>
                      Karton{client.formulas.length > 0 ? ' · formula boje' : ''}
                    </ActionLink>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {remaining.length > 0 && (
        <p className="text-[0.875rem] text-ink-500">
          Još {remaining.length}{' '}
          {remaining.length === 1 ? 'termin' : remaining.length < 5 ? 'termina' : 'termina'} do kraja
          smjene.
        </p>
      )}
    </div>
  );
}

/* ── Manager / reception ─────────────────────────────────────────── */

function FloorToday() {
  const { date, appointments, absences, reviewAbsence, setStatus } = useDashboard();
  const summary = summarise(appointments, date);
  const gaps = findGaps(appointments, date);
  const pending = absences.filter((a) => a.status === 'REQUESTED');
  const stylists = rosteredStylists(date);

  return (
    <div className="space-y-6">
      <h1 className="text-[1.5rem] font-semibold text-ink-900">Danas u salonu</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Termini" value={String(summary.total)} sub={`${summary.completed} gotovo`} />
        <StatTile
          label="Popunjenost"
          value={`${summary.utilisation}%`}
          sub="rezervirano od rasporeda"
          tone={summary.utilisation >= 70 ? 'good' : 'default'}
        />
        <StatTile label="Očekivani promet" value={formatPrice(summary.revenueCents)} />
        <StatTile
          label="Nedolasci"
          value={String(summary.noShows)}
          tone={summary.noShows > 0 ? 'warn' : 'good'}
          sub={summary.noShows > 0 ? 'provjeriti kontakte' : 'nema nedolazaka'}
        />
      </div>

      {/* Gaps first — this is the panel that makes money. */}
      <Panel
        title={`Rupe u rasporedu (${gaps.length})`}
        tone={gaps.length > 0 ? 'attention' : 'default'}
      >
        {gaps.length === 0 ? (
          <EmptyState>Nema većih rupa — dan je dobro popunjen.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {gaps.map((gap) => {
              const stylist = stylistById(gap.stylistId);
              return (
                <li
                  key={`${gap.stylistId}-${gap.startsAt}`}
                  className="flex flex-wrap items-center gap-3 rounded-[8px] bg-paper-100 px-4 py-3"
                >
                  <span className="tabular font-medium text-ink-900">
                    {slotTime(gap.startsAt)}–{slotTime(gap.endsAt)}
                  </span>
                  <span className="text-[0.9375rem] text-ink-700">
                    {stylist?.firstName} {stylist?.lastInitial}
                  </span>
                  <span className="text-[0.875rem] text-ink-500">{gap.minutes} min slobodno</span>
                  <span className="ml-auto flex gap-2">
                    <ActionButton disabled title="Čeka spajanje liste čekanja">
                      Javi listi čekanja
                    </ActionButton>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {pending.length > 0 && (
        <Panel title={`Zahtjevi za odsutnost (${pending.length})`} tone="attention">
          <ul className="space-y-2">
            {pending.map((a) => {
              const stylist = stylistById(a.userId);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-[8px] bg-paper-100 px-4 py-3"
                >
                  <span className="font-medium text-ink-900">
                    {stylist?.firstName} {stylist?.lastInitial}
                  </span>
                  <span className="tabular text-[0.875rem] text-ink-700">
                    {a.startDate} → {a.endDate}
                  </span>
                  {a.note && <span className="text-[0.8125rem] text-ink-500">{a.note}</span>}
                  <span className="ml-auto flex gap-2">
                    <ActionButton primary onClick={() => reviewAbsence(a.id, 'APPROVED')}>
                      Odobri
                    </ActionButton>
                    <ActionButton onClick={() => reviewAbsence(a.id, 'DECLINED')}>
                      Odbij
                    </ActionButton>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel
        title="Na podu"
        action={
          <Link
            href="/app/kalendar"
            className="text-[0.875rem] font-medium text-gold-700 underline underline-offset-4"
          >
            Otvori kalendar →
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stylists.map((s) => {
            const theirs = appointments
              .filter((a) => a.stylistId === s.id && a.status !== 'CANCELLED')
              .sort((a, b) => a.startsAt - b.startsAt);
            const next = theirs.find((a) => a.status === 'CONFIRMED' || a.status === 'ARRIVED');
            const shift = shiftFor(s, date);

            return (
              <div key={s.id} className="rounded-[8px] border border-paper-200 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-ink-900">
                    {s.firstName} {s.lastInitial}
                  </p>
                  <p className="tabular text-[0.8125rem] text-ink-500">
                    {shift ? `${slotTime(shift.start)}–${slotTime(shift.end)}` : '—'}
                  </p>
                </div>
                <p className="mt-1 text-[0.8125rem] text-ink-500">{theirs.length} termina</p>
                {next ? (
                  <p className="tabular mt-2 text-[0.875rem] text-ink-700">
                    Sljedeći {slotTime(next.startsAt)} · {serviceNameHr(next.serviceSlug)}
                  </p>
                ) : (
                  <p className="mt-2 text-[0.875rem] text-ink-500">Nema više termina.</p>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Dolasci">
        <ArrivalsList appointments={appointments} onArrive={(id) => setStatus(id, 'ARRIVED')} />
      </Panel>
    </div>
  );
}

function ArrivalsList({
  appointments,
  onArrive,
}: {
  appointments: DemoAppointment[];
  onArrive: (id: string) => void;
}) {
  const waiting = appointments
    .filter((a) => a.status === 'CONFIRMED')
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, 8);

  if (waiting.length === 0) return <EmptyState>Svi očekivani gosti su evidentirani.</EmptyState>;

  return (
    <ul className="divide-y divide-paper-200">
      {waiting.map((a) => {
        const client = clientById(a.clientId);
        const stylist = stylistById(a.stylistId);
        return (
          <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="tabular w-[3.5rem] font-semibold text-ink-900">
              {slotTime(a.startsAt)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink-900">
                {client ? `${client.firstName} ${client.lastName}` : 'Gost'}
              </span>
              <span className="block text-[0.875rem] text-ink-500">
                {serviceNameHr(a.serviceSlug)} · {stylist?.firstName}
              </span>
            </span>
            {client && client.noShows >= 2 && (
              <span className="rounded-full bg-warning-600/12 px-2.5 py-0.5 text-[0.75rem] font-medium text-warning-600">
                {client.noShows} nedolaska
              </span>
            )}
            <ActionButton onClick={() => onArrive(a.id)}>Stigao/la</ActionButton>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Owner ───────────────────────────────────────────────────────── */

function OwnerToday() {
  const { date, appointments, locationId, visibleLocations, setLocationId } = useDashboard();
  const summary = summarise(appointments, date);
  const gaps = findGaps(appointments, date);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Pregled</h1>
        <p className="mt-1 text-[0.9375rem] text-ink-500">
          Sedam studija. Prikazan je{' '}
          {visibleLocations.find((l) => l.slug === locationId)?.displayName}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Termini danas" value={String(summary.total)} />
        <StatTile
          label="Popunjenost"
          value={`${summary.utilisation}%`}
          tone={summary.utilisation >= 70 ? 'good' : 'default'}
        />
        <StatTile label="Očekivani promet" value={formatPrice(summary.revenueCents)} />
        <StatTile
          label="Rupe u rasporedu"
          value={String(gaps.length)}
          tone={gaps.length > 2 ? 'warn' : 'good'}
          sub={`${gaps.reduce((t, g) => t + g.minutes, 0)} min ukupno`}
        />
      </div>

      <Panel title="Svi studiji">
        <ul className="divide-y divide-paper-200">
          {visibleLocations.map((l) => (
            <li key={l.slug} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink-900">{l.displayName}</span>
                <span className="block text-[0.875rem] text-ink-500">{l.addressStreet}</span>
              </span>
              {l.slug === locationId ? (
                <span className="rounded-full bg-gold-100 px-3 py-1 text-[0.75rem] font-medium text-ink-900">
                  prikazano
                </span>
              ) : (
                <ActionButton onClick={() => setLocationId(l.slug)}>Prikaži</ActionButton>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.8125rem] text-ink-500">
          Zbirni pregled svih sedam studija odjednom dolazi kad se spoji baza — za sada
          se prebacuje po salonu.
        </p>
      </Panel>
    </div>
  );
}

/* ── Small controls ──────────────────────────────────────────────── */

function ActionButton({
  children,
  onClick,
  primary = false,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'inline-flex min-h-[36px] items-center rounded-[8px] px-3.5 text-[0.875rem] font-medium transition-colors',
        disabled
          ? 'cursor-not-allowed border border-paper-200 bg-paper-100 text-ink-500'
          : primary
            ? 'bg-gold-500 text-ink-900 hover:bg-gold-400'
            : 'border border-ink-900/20 text-ink-900 hover:bg-paper-100',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[36px] items-center rounded-[8px] border border-ink-900/20 px-3.5 text-[0.875rem] font-medium text-ink-900 transition-colors hover:bg-paper-100"
    >
      {children}
    </Link>
  );
}
