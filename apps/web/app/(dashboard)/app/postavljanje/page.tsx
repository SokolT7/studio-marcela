'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Panel } from '@/components/dashboard/shell';
import { LOCATIONS } from '@/lib/content/locations';
import { STYLISTS } from '@/lib/seed';
import { ALL_SERVICES } from '@/lib/content/services';

/**
 * Setup wizard.
 *
 * Strategically the most valuable screen in the dashboard, and the reason it
 * exists at all: the two things blocking this entire project are the opening
 * hours and the staff roster (plan §25.1, items 1 and 2). As a request in a
 * document they are homework. As a guided flow they are a task the owner can
 * start during the meeting.
 *
 * Everything here is inert in the prototype — no persistence — but the shape,
 * the order and the sense of "this is an hour, not a project" are real.
 */

const DAYS = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

const STEPS = [
  { id: 1, title: 'Radno vrijeme', blurb: 'Kad je koji salon otvoren' },
  { id: 2, title: 'Tim', blurb: 'Tko radi gdje' },
  { id: 3, title: 'Vještine', blurb: 'Tko smije raditi koju uslugu' },
  { id: 4, title: 'Cijene', blurb: 'Potvrda cjenika po salonu' },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="mx-auto max-w-[56rem] space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-ink-900">Početno postavljanje</h1>
        <p className="mt-1 max-w-[42rem] text-[0.9375rem] text-ink-700">
          Četiri koraka i sustav je spreman za rad. Sve se može mijenjati kasnije — cilj je
          unijeti ono bez čega online naručivanje ne može krenuti.
        </p>
      </div>

      {/* ── Progress ─────────────────────────────────────────── */}
      <ol className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((s) => {
          const done = s.id < step;
          const current = s.id === step;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                aria-current={current ? 'step' : undefined}
                className={[
                  'w-full rounded-[8px] border p-3 text-left transition-colors',
                  current
                    ? 'border-gold-500 bg-gold-100'
                    : done
                      ? 'border-success-600/30 bg-success-600/5'
                      : 'border-paper-200 bg-paper-000 hover:border-ink-900/25',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold',
                      done ? 'bg-success-600 text-paper-000' : current ? 'bg-ink-900 text-paper-000' : 'bg-paper-200 text-ink-500',
                    ].join(' ')}
                  >
                    {done ? '✓' : s.id}
                  </span>
                  <span className="text-[0.875rem] font-medium text-ink-900">{s.title}</span>
                </span>
                <span className="mt-1 block text-[0.75rem] text-ink-500">{s.blurb}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 1 && <HoursStep />}
      {step === 2 && <TeamStep />}
      {step === 3 && <SkillsStep />}
      {step === 4 && <PricesStep />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper-200 pt-5">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex min-h-[44px] items-center rounded-[8px] border border-ink-900/20 px-4 text-[0.9375rem] font-medium text-ink-900 disabled:cursor-not-allowed disabled:border-paper-200 disabled:text-ink-300"
        >
          Natrag
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="inline-flex min-h-[44px] items-center rounded-[8px] bg-gold-500 px-5 text-[0.9375rem] font-medium text-ink-900 hover:bg-gold-400"
          >
            Dalje
          </button>
        ) : (
          <Link
            href="/app"
            className="inline-flex min-h-[44px] items-center rounded-[8px] bg-gold-500 px-5 text-[0.9375rem] font-medium text-ink-900 hover:bg-gold-400"
          >
            Gotovo — otvori nadzornu ploču
          </Link>
        )}
      </div>

      <p className="rounded-[8px] border border-warning-600/30 bg-warning-600/10 px-4 py-3 text-[0.875rem] text-ink-700">
        <strong className="text-warning-600">U prototipu se ništa ne sprema.</strong> Ovaj korak
        postoji da se vidi koliko je unosa stvarno potrebno — radno vrijeme i tim su jedino bez
        čega sustav ne može raditi.
      </p>
    </div>
  );
}

/* ── Step 1 ──────────────────────────────────────────────────────── */

function HoursStep() {
  return (
    <Panel title="Radno vrijeme po salonu" tone="attention">
      <p className="mb-4 max-w-[46rem] text-[0.9375rem] text-ink-700">
        Ovo je jedini podatak koji nedostaje i na postojećoj stranici — nigdje nije objavljen.
        Bez njega online naručivanje ne zna kada nuditi termine.
      </p>

      <label className="mb-4 block max-w-[22rem]">
        <span className="mb-1.5 block text-[0.875rem] font-medium text-ink-900">Salon</span>
        <select className="w-full min-h-[44px] rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.9375rem]">
          {LOCATIONS.map((l) => (
            <option key={l.slug}>{l.displayName}</option>
          ))}
        </select>
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-[0.9375rem]">
          <caption className="sr-only">Radno vrijeme po danima</caption>
          <thead>
            <tr className="border-b border-paper-200 text-left">
              <th scope="col" className="pb-2 text-[0.75rem] uppercase tracking-wider text-ink-500">Dan</th>
              <th scope="col" className="pb-2 text-[0.75rem] uppercase tracking-wider text-ink-500">Otvara</th>
              <th scope="col" className="pb-2 text-[0.75rem] uppercase tracking-wider text-ink-500">Zatvara</th>
              <th scope="col" className="pb-2 text-[0.75rem] uppercase tracking-wider text-ink-500">Zatvoreno</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => (
              <tr key={day} className="border-b border-paper-200/70 last:border-0">
                <th scope="row" className="py-2 pr-3 text-left font-normal text-ink-900">{day}</th>
                <td className="py-2 pr-3">
                  <input
                    type="time"
                    defaultValue={i === 6 ? '' : i === 5 ? '08:00' : '08:00'}
                    className="tabular min-h-[40px] w-[7rem] rounded-[8px] border border-paper-200 bg-paper-000 px-2.5"
                    aria-label={`${day} — otvaranje`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="time"
                    defaultValue={i === 6 ? '' : i === 5 ? '14:00' : '20:00'}
                    className="tabular min-h-[40px] w-[7rem] rounded-[8px] border border-paper-200 bg-paper-000 px-2.5"
                    aria-label={`${day} — zatvaranje`}
                  />
                </td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    defaultChecked={i === 6}
                    className="h-5 w-5 accent-[var(--color-gold-700)]"
                    aria-label={`${day} — zatvoreno`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ── Step 2 ──────────────────────────────────────────────────────── */

function TeamStep() {
  return (
    <Panel title="Tim" tone="attention">
      <p className="mb-4 max-w-[46rem] text-[0.9375rem] text-ink-700">
        Tko radi u kojem salonu i u kojoj smjeni. Ovo je drugi podatak bez kojeg raspored ne
        može raditi — sve što trenutno vidite u kalendaru su izmišljene smjene.
      </p>

      <ul className="space-y-3">
        {STYLISTS.map((s) => (
          <li key={s.id} className="grid gap-3 rounded-[8px] border border-paper-200 p-4 sm:grid-cols-[1fr_auto_auto]">
            <label>
              <span className="mb-1 block text-[0.75rem] uppercase tracking-wider text-ink-500">Ime</span>
              <input
                defaultValue={`${s.firstName} ${s.lastInitial}`}
                className="min-h-[40px] w-full rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.9375rem]"
              />
            </label>
            <label>
              <span className="mb-1 block text-[0.75rem] uppercase tracking-wider text-ink-500">Salon</span>
              <select className="min-h-[40px] rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.9375rem]">
                {LOCATIONS.map((l) => (
                  <option key={l.slug}>{l.displayName}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-[0.75rem] uppercase tracking-wider text-ink-500">Uloga</span>
              <select className="min-h-[40px] rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-[0.9375rem]">
                <option>Stilist</option>
                <option>Voditelj</option>
                <option>Recepcija</option>
              </select>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-4 inline-flex min-h-[40px] items-center rounded-[8px] border border-ink-900/20 px-4 text-[0.875rem] font-medium text-ink-900 hover:bg-paper-100"
      >
        + Dodaj djelatnika
      </button>
    </Panel>
  );
}

/* ── Step 3 ──────────────────────────────────────────────────────── */

function SkillsStep() {
  const services = ALL_SERVICES.filter((s) => s.bookable).slice(0, 8);
  return (
    <Panel title="Tko smije raditi koju uslugu">
      <p className="mb-4 max-w-[46rem] text-[0.9375rem] text-ink-700">
        Online se nudi samo ono za što je stilist certificiran. Ovo sprječava najgoru grešku u
        rasporedu — gosta naručenog na tehniku koju taj stilist nikad nije radio.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-[0.875rem]">
          <caption className="sr-only">Matrica vještina</caption>
          <thead>
            <tr>
              <th scope="col" className="pb-2 text-left text-[0.75rem] uppercase tracking-wider text-ink-500">
                Usluga
              </th>
              {STYLISTS.map((s) => (
                <th key={s.id} scope="col" className="pb-2 px-2 text-center text-[0.75rem] text-ink-700">
                  {s.firstName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.slug} className="border-t border-paper-200">
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-ink-900">
                  {svc.nameHr}
                </th>
                {STYLISTS.map((s) => {
                  const has = s.skills.some(
                    (k) => k.serviceId === svc.slug && (k.level === 'CERTIFIED' || k.level === 'TRAINER'),
                  );
                  return (
                    <td key={s.id} className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={has}
                        aria-label={`${s.firstName} — ${svc.nameHr}`}
                        className="h-5 w-5 accent-[var(--color-gold-700)]"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ── Step 4 ──────────────────────────────────────────────────────── */

function PricesStep() {
  const services = ALL_SERVICES.slice(0, 10);
  return (
    <Panel title="Potvrda cjenika">
      <p className="mb-4 max-w-[46rem] text-[0.9375rem] text-ink-700">
        Cijene su preuzete s postojeće stranice. Provjerite ih i ispravite gdje se razlikuju
        po salonu — dvije usluge nemaju objavljenu cijenu i traže odluku.
      </p>

      <ul className="space-y-2">
        {services.map((svc) => (
          <li
            key={svc.slug}
            className="flex flex-wrap items-center gap-3 rounded-[8px] border border-paper-200 px-4 py-3"
          >
            <span className="min-w-0 flex-1 text-[0.9375rem] text-ink-900">{svc.nameHr}</span>
            {svc.priceMissing ? (
              <span className="rounded-full bg-warning-600/12 px-2.5 py-0.5 text-[0.75rem] font-medium text-warning-600">
                nema cijene
              </span>
            ) : null}
            <label className="flex items-center gap-2">
              <span className="sr-only">Cijena za {svc.nameHr}</span>
              <input
                type="number"
                defaultValue={svc.priceMissing ? '' : svc.fromPriceCents / 100}
                placeholder="—"
                className="tabular min-h-[40px] w-[6rem] rounded-[8px] border border-paper-200 bg-paper-000 px-3 text-right"
              />
              <span className="text-ink-500">€</span>
            </label>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
