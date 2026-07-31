import Link from 'next/link';
import type { ReactNode } from 'react';
import { CtaLink, Eyebrow, Section } from './ui';

/**
 * Shared furniture for content pages: a consistent header, breadcrumbs and a
 * closing call to action.
 *
 * Every page on the site ends by offering a booking. A content page that
 * dead-ends is a page that cost money to produce and returns nothing (§8.1).
 */

export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    // Lighter top padding than a full section: on a phone, 96px of empty space
    // above a breadcrumb pushes the heading below the fold. Bottom padding
    // stays at zero at every width — the following section supplies its own,
    // and stacking the two leaves a dead gap under the lead paragraph.
    <Section tone="paper" className="!pb-0 !pt-8 md:!pt-14 lg:!pt-24">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="Staza"
          className="-mt-2 mb-6 flex flex-wrap items-center text-[0.8125rem] text-ink-500"
        >
          <Link href="/" className="flex min-h-[44px] items-center pr-1 hover:text-ink-900">
            Početna
          </Link>
          {breadcrumb.map((crumb) => (
            <span key={crumb.label} className="flex items-center">
              <span className="text-ink-300" aria-hidden="true">
                /
              </span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-[44px] items-center px-1 hover:text-ink-900"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center px-1 text-ink-900">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="max-w-[46rem]">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="t-display-lg">{title}</h1>
        {lead && <p className="t-body-lg mt-6 text-ink-700">{lead}</p>}
      </div>
    </Section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="measure space-y-5 text-ink-700 [&_p]:t-body-lg">{children}</div>;
}

export function ClosingCta({
  title = 'Rezervirajte termin',
  body = 'Odaberite salon, uslugu i vrijeme. Potvrda stiže odmah — bez čekanja na poziv.',
  href = '/narucivanje',
  cta = 'Naruči se',
}: {
  title?: string;
  body?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <Section tone="ink">
      <div className="mx-auto max-w-[42rem] text-center">
        <h2 className="t-display-md text-paper-050">{title}</h2>
        <p className="t-body-lg mt-6 text-paper-200">{body}</p>
        <div className="mt-10 flex justify-center">
          <CtaLink href={href} size="lg">
            {cta}
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}

/**
 * Marks a page whose content is a placeholder awaiting the client.
 *
 * Visible on purpose. A page that quietly invents opening hours or a salary
 * range is worse than one that admits the gap — see §25.
 */
export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-warning-600/30 bg-warning-600/8 p-5 text-[0.875rem] text-warning-600">
      <p className="font-semibold">Sadržaj u pripremi</p>
      <p className="mt-1.5 text-ink-700">{children}</p>
    </div>
  );
}
