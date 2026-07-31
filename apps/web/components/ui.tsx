import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/* ── Button (§8.1) ────────────────────────────────────────────────
   One primary action on the site: Naruči se. Never two primary
   buttons in one viewport, never a primary that does not lead to a
   booking.                                                          */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-medium rounded-[8px] ' +
  'transition-[background-color,color,border-color] duration-150 ' +
  'min-h-[44px] whitespace-nowrap'; // 44px tap target — §4.9

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gold-500 text-ink-900 hover:bg-gold-400',
  secondary:
    'border border-ink-900/25 text-ink-900 hover:border-ink-900/60 hover:bg-paper-100',
  ghost: 'text-ink-700 hover:text-ink-900 hover:bg-paper-100',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'px-5 text-[0.9375rem]',
  lg: 'px-7 text-base min-h-[52px]',
};

export function CtaLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ── Section shell ────────────────────────────────────────────────
   Consecutive sections must alternate surfaces — never two identical
   backgrounds in a row (§4.4).                                      */

export function Section({
  children,
  tone = 'paper',
  className = '',
  id,
}: {
  children: ReactNode;
  tone?: 'paper' | 'tint' | 'ink';
  className?: string;
  id?: string;
}) {
  const tones = {
    paper: 'bg-paper-050 text-ink-900',
    tint: 'bg-paper-100 text-ink-900',
    ink: 'bg-ink-900 text-paper-050',
  };
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:py-20 md:px-8 md:py-28 lg:px-12 lg:py-32">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="t-caption text-gold-700 mb-4">{children}</p>;
}

/* ── Reference image (§6.6) ───────────────────────────────────────
   Every photograph on this site is a stand-in until the shoot. The
   watermark is not decoration: it makes it structurally obvious that
   nothing here is production-ready, so stock photography cannot ship
   by accident.                                                      */

export function RefImage({
  refId,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  ratio = 'aspect-[3/2]',
  bare = false,
}: {
  refId: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  ratio?: string;
  /**
   * Drop the watermark. Only for images too small to carry legible text —
   * avatars and thumbnails, where the banner renders as illegible noise rather
   * than a warning. Never use it to make a large image look production-ready.
   */
  bare?: boolean;
}) {
  return (
    // `relative` lives here, not in `.ref-image`: the containing block for the
    // fill image must not depend on whether the watermark is shown.
    <div
      className={`relative overflow-hidden rounded-[16px] bg-paper-200 ${bare ? '' : 'ref-image'} ${ratio} ${className}`}
    >
      <Image
        src={`/ref/${refId}.jpg`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/* ── Unverified fact marker (§7.2.3) ──────────────────────────────
   Neighbourhood and transport details are inferred from addresses.
   A wrong tram number on a location page is worse than no tram
   number, so unconfirmed facts are visibly flagged rather than
   quietly published.                                                */

export function VerifyBadge() {
  return (
    <span
      className="ml-2 inline-flex items-center rounded-[4px] bg-warning-600/12 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-warning-600"
      title="Nepotvrđen podatak — provjeriti s klijentom prije objave"
    >
      provjeriti
    </span>
  );
}

/* ── Missing data marker ─────────────────────────────────────────── */

export function MissingPrice() {
  return (
    <span className="text-warning-600" title="Cijena nije objavljena — traži se od klijenta">
      cijena na upit
    </span>
  );
}
