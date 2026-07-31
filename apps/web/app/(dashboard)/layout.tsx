import type { Metadata } from 'next';
import { DashboardProvider } from '@/lib/dashboard/store';
import { DashboardShell } from '@/components/dashboard/shell';
import { fontVariables } from '@/lib/fonts';
import '../globals.css';

/**
 * Dashboard root layout — the third of three (plan §14.4 explains why each
 * locale needs its own; this one exists because the dashboard shares no chrome
 * with the marketing site).
 *
 * Never indexed. It is a staff tool behind a login in production; here it is
 * open so the client can walk through it.
 */

export const metadata: Metadata = {
  title: { default: 'Nadzorna ploča | Studio Marcela', template: '%s | Studio Marcela' },
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={fontVariables}>
      <body>
        <DashboardProvider>
          <DashboardShell>{children}</DashboardShell>
        </DashboardProvider>
      </body>
    </html>
  );
}
