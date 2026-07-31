/**
 * Locale routing.
 *
 * Croatian is the default and lives at the root. English lives under `/en`.
 * See IMPLEMENTATION_PLAN.md §5.1 and §14.4.
 *
 * **On hreflang.** Only pages with a genuine counterpart declare `alternates.
 * languages` — currently just the two homepages. Croatian pages with no
 * English version deliberately emit a canonical and no alternates. Adding a
 * blanket `hreflang="en" href="/en"` to every page would tell Google that the
 * English homepage is the English version of the team page, the price list and
 * everything else, which is false and invites the pages to be treated as
 * duplicates. Add entries to `HR_TO_EN` as real translations land, and the
 * alternates follow.
 */

export type Locale = 'hr' | 'en';

export const EN_PREFIX = '/en';

export function localeOf(pathname: string): Locale {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'hr';
}

/**
 * Croatian path → its English counterpart.
 *
 * Only the English homepage exists today; the rest of the tree is Phase 2
 * (§24). Entries get added here as English pages land — and note the slugs
 * differ where the translated slug carries real search value
 * (`/en/salons/…`, not `/en/saloni/…`).
 */
const HR_TO_EN: Record<string, string> = {
  '/': '/en',
};

/** English path → its Croatian counterpart. Kept as the exact inverse. */
const EN_TO_HR: Record<string, string> = Object.fromEntries(
  Object.entries(HR_TO_EN).map(([hr, en]) => [en, hr]),
);

/**
 * The equivalent page in the target locale.
 *
 * Where no counterpart exists yet, fall back to that locale's homepage rather
 * than to a 404. The plan's rule is that the switcher maps to the *equivalent*
 * page and never dumps the user on the homepage — that holds as soon as the
 * English tree exists; until then, the homepage is the honest fallback and the
 * only alternative is a dead link.
 */
export function equivalentPath(pathname: string, target: Locale): string {
  const current = localeOf(pathname);
  if (current === target) return pathname;

  return target === 'en'
    ? (HR_TO_EN[pathname] ?? '/en')
    : (EN_TO_HR[pathname] ?? '/');
}

/** True when the target locale has a real counterpart for this page. */
export function hasEquivalent(pathname: string, target: Locale): boolean {
  const current = localeOf(pathname);
  if (current === target) return true;
  return target === 'en' ? pathname in HR_TO_EN : pathname in EN_TO_HR;
}
