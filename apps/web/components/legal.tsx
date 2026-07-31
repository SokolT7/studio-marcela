import type { ReactNode } from 'react';

/**
 * Shared furniture for the legal pages.
 *
 * These documents are drafted to cover the right ground — GDPR Articles 13 and
 * 14, Croatian consumer rules on distance selling, and the deposit policy from
 * IMPLEMENTATION_PLAN.md §9.6. They are **not** legal advice and must be
 * reviewed by a lawyer before launch (§20.3).
 *
 * Anything only the client can supply — company name, OIB, registered address,
 * retention periods — renders through `PLACEHOLDER` so it is visibly missing
 * rather than quietly invented. A privacy policy naming the wrong legal entity
 * is worse than no privacy policy.
 */

export function PLACEHOLDER(label: string) {
  return (
    <span
      className="rounded-[4px] bg-warning-600/12 px-1.5 py-0.5 text-[0.9em] font-medium text-warning-600"
      title="Podatak koji klijent mora dostaviti prije objave"
    >
      [{label}]
    </span>
  );
}

export function LegalReviewNotice() {
  return (
    <div className="rounded-[8px] border border-warning-600/30 bg-warning-600/8 p-5">
      <p className="text-[0.875rem] font-semibold text-warning-600">
        Nacrt — čeka pravnu provjeru
      </p>
      <p className="mt-1.5 text-[0.875rem] text-ink-700">
        Ovaj dokument pokriva sve što propisi traže, ali ga prije objave mora
        pregledati pravnik. Označena polja popunjava klijent — vidi plan §20.3 i
        §25.1, točka 9.
      </p>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="t-heading-lg">{title}</h2>
      <div
        className="mt-4 space-y-4 text-ink-700 [&_li]:pl-1 [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
      >
        {children}
      </div>
    </section>
  );
}
