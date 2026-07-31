'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { localDateString } from '@sm/scheduling';
import { LOCATIONS } from '../content/locations';
import { TIMEZONE } from '../seed';
import {
  DEMO_ABSENCES,
  DEMO_CLIENTS,
  generateDay,
  type AppointmentStatus,
  type DemoAbsence,
  type DemoAppointment,
  type DemoClient,
} from './demo-data';

/**
 * Dashboard state for the frontend-only build.
 *
 * Everything lives in memory for the session. Dragging an appointment, marking
 * an arrival or approving leave all persist until reload — which is what makes
 * a demo feel like software rather than a slideshow. Nothing is written
 * anywhere, and reloading resets to the generated day.
 *
 * The mutations are shaped like the API calls in plan §12, so wiring them to
 * real endpoints later means replacing the body of each function.
 */

export type Role = 'OWNER' | 'MANAGER' | 'STYLIST' | 'RECEPTION';

export interface DashboardUser {
  id: string;
  name: string;
  role: Role;
  /** Which stylist this user *is*, when the role is STYLIST. */
  stylistId?: string;
}

/**
 * The demo personas.
 *
 * Switching between them is the fastest way to show an owner exactly what each
 * of her employees can and cannot see. Demo-only — production derives the role
 * from the session.
 */
export const DEMO_USERS: DashboardUser[] = [
  { id: 'u-owner', name: 'Jadranka P.', role: 'OWNER' },
  { id: 'u-manager', name: 'Voditeljica — Prečko', role: 'MANAGER' },
  { id: 'u-stylist', name: 'Ana K.', role: 'STYLIST', stylistId: 'ana-k' },
  { id: 'u-reception', name: 'Recepcija', role: 'RECEPTION' },
];

interface DashboardState {
  user: DashboardUser;
  setUser: (u: DashboardUser) => void;

  locationId: string;
  setLocationId: (id: string) => void;

  /** `YYYY-MM-DD` in Europe/Zagreb. */
  date: string;
  setDate: (d: string) => void;

  appointments: DemoAppointment[];
  clients: DemoClient[];
  absences: DemoAbsence[];

  setStatus: (id: string, status: AppointmentStatus) => void;
  moveAppointment: (id: string, newStartsAt: number, newStylistId?: string) => void;
  addWalkIn: (input: {
    stylistId: string;
    clientId: string;
    serviceSlug: string;
    startsAt: number;
    durationMin: number;
    priceCents: number;
  }) => void;
  reviewAbsence: (id: string, status: 'APPROVED' | 'DECLINED') => void;

  /** True when the signed-in persona may act on other people's diaries. */
  canManage: boolean;
  /** Locations this persona may see. */
  visibleLocations: typeof LOCATIONS;
}

const Ctx = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser>(DEMO_USERS[0]!);
  const [locationId, setLocationId] = useState('precko');
  const [date, setDate] = useState(() => localDateString(Date.now(), TIMEZONE));

  // Generated per date+location, then held so edits survive navigation.
  const [overrides, setOverrides] = useState<Record<string, DemoAppointment[]>>({});
  const [absences, setAbsences] = useState<DemoAbsence[]>(DEMO_ABSENCES);

  const key = `${date}:${locationId}`;
  const appointments = useMemo(
    () => overrides[key] ?? generateDay(date, locationId),
    [overrides, key, date, locationId],
  );

  const commit = useCallback(
    (next: DemoAppointment[]) => setOverrides((prev) => ({ ...prev, [key]: next })),
    [key],
  );

  const setStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      commit(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    },
    [appointments, commit],
  );

  const moveAppointment = useCallback(
    (id: string, newStartsAt: number, newStylistId?: string) => {
      commit(
        appointments.map((a) => {
          if (a.id !== id) return a;
          const delta = newStartsAt - a.startsAt;
          return {
            ...a,
            startsAt: newStartsAt,
            endsAt: a.endsAt + delta,
            stylistId: newStylistId ?? a.stylistId,
            segments: a.segments.map((s) => ({
              ...s,
              startsAt: s.startsAt + delta,
              endsAt: s.endsAt + delta,
            })),
          };
        }),
      );
    },
    [appointments, commit],
  );

  const addWalkIn = useCallback<DashboardState['addWalkIn']>(
    (input) => {
      const id = `walkin-${Date.now()}`;
      const endsAt = input.startsAt + input.durationMin * 60_000;
      commit([
        ...appointments,
        {
          id,
          reference: `SM-W${String(appointments.length + 1).padStart(3, '0')}`,
          locationId,
          stylistId: input.stylistId,
          clientId: input.clientId,
          serviceSlug: input.serviceSlug,
          startsAt: input.startsAt,
          endsAt,
          segments: [{ type: 'ACTIVE', startsAt: input.startsAt, endsAt }],
          status: 'ARRIVED',
          priceCents: input.priceCents,
          source: 'WALK_IN',
        },
      ]);
    },
    [appointments, commit, locationId],
  );

  const reviewAbsence = useCallback(
    (id: string, status: 'APPROVED' | 'DECLINED') => {
      setAbsences((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    },
    [],
  );

  const canManage = user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'RECEPTION';
  const visibleLocations = user.role === 'OWNER' ? LOCATIONS : LOCATIONS.filter((l) => l.slug === locationId);

  const value: DashboardState = {
    user,
    setUser,
    locationId,
    setLocationId,
    date,
    setDate,
    appointments,
    clients: DEMO_CLIENTS,
    absences,
    setStatus,
    moveAppointment,
    addWalkIn,
    reviewAbsence,
    canManage,
    visibleLocations,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard(): DashboardState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
