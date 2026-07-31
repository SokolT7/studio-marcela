# Studio Marcela — Implementation Plan

**Version** 1.0 · **Date** 30 July 2026 · **Status** Awaiting client sign-off
**Replaces** studiomarcela.hr (custom jQuery/Bootstrap/htmx build)

---

## 0. How to read this document

This is the complete build specification. It is written so that a developer, a copywriter, a
photographer and the client can each find their part without reading the others'.

| If you are… | Read |
|---|---|
| Client / decision maker | §1, §3, §6.1, §25 |
| Developer | §5, §9, §10, §11, §12, §13, §17, §19, §21, §22 |
| Copywriter / SEO | §3, §7, §8, §14, §16 |
| Photographer | §6 |
| Project manager | §1.2, §24, §25 |

**Conventions used throughout:**

- `[VERIFY]` — an assumption that must be confirmed with the client before build. Do not ship
  anything marked this way without confirmation.
- `[CLIENT]` — a dependency we cannot resolve ourselves; the client must supply it.
- **HR** = Croatian copy (primary). **EN** = English copy (secondary).
- All prices in EUR, matching the current published price list (§26).

---

## 1. Project brief

### 1.1 Objective

Replace studiomarcela.hr with a site that converts paid and organic traffic into confirmed,
prepaid-where-appropriate appointments across seven locations, and give the business a single
operational back office that replaces the phone, the paper diary and the WhatsApp threads.

Three outcomes, in priority order:

1. **More booked appointments per visitor.** The business already buys traffic (a Google Ads
   conversion tag, `AW-11273628291`, is live on the current homepage). Every point of friction
   in the current funnel is spent ad budget producing nothing.
2. **Fewer no-shows and fewer phone calls.** Staff time currently spent answering "what does
   balayage cost" and "are you open Saturday" is time not spent behind a chair.
3. **Local search visibility per neighbourhood.** Seven salons currently share one contact
   page and rank as one entity. They should rank as seven.

### 1.2 Success metrics

Baseline must be captured from Google Analytics and Google Ads **before** launch. `[CLIENT]`

| Metric | Target | Measured by |
|---|---|---|
| Booking funnel completion (start → confirmed) | ≥ 55% | GA4 funnel |
| Homepage → booking start | ≥ 18% | GA4 event |
| Mobile share of completed bookings | ≥ 70% | GA4 (73% of salon booking traffic is mobile) |
| No-show rate | < 8% | Dashboard report |
| Organic sessions to location pages | +150% at 6 months | GSC |
| Location pages ranking top-3 for "frizer + [district]" | 5 of 7 at 6 months | GSC / rank tracking |
| Cost per booked appointment (paid) | −35% | Ads + GA4 |
| Largest Contentful Paint, mobile p75 | < 2.0 s | CrUX / Vercel Analytics |

### 1.3 Scope

**In scope**

- Public marketing site, Croatian and English, all seven locations
- Booking engine with real-time availability and instant confirmation
- Staff dashboard: appointments, schedules, working hours, absence, clients, reporting
- Individual accounts for every employee
- CMS for prices, services, hours, team, gallery, blog
- Full SEO architecture and migration from the existing URLs
- Transactional email and SMS

**Out of scope for v1** (noted here so it is not assumed)

- Point-of-sale / till integration
- Stock and inventory management
- Payroll and commission calculation
- E-commerce for Silky retail products (planned Phase 4, §24)
- Native mobile apps (the dashboard is a responsive PWA instead)
- Fiscal receipt issuance — see §20.2, this is deliberate

### 1.4 Constraints and assumptions

- Primary market is Zagreb, Croatian-speaking. Secondary is Dubrovnik hotel guests and
  destination-wedding clients, English-speaking. The two need genuinely different funnels,
  not a translation of each other.
- The business has no in-house developer. Everything routine must be editable in the CMS or
  the dashboard, never in code.
- Staff technical confidence is assumed to be mixed. The dashboard must be usable by someone
  whose only computer is their phone.
- Existing brand assets are limited: a wordmark, a Silky partnership, and a founder's story.
  There is no usable photography. `[VERIFY]`

---

## 2. What we are fixing

Condensed from the audit of the live site. Included so that every decision below has a
traceable reason.

| # | Defect on current site | Fixed by |
|---|---|---|
| 1 | `<html lang="en">` on the Croatian homepage; meta description is Croatian | §14.4 |
| 2 | Homepage `<h1>` is "OUR SALONS" — English, generic, on the Croatian page | §7.1 |
| 3 | Keyword-stuffed `<h2>` listing every service and "Najbolji frizerski salon…" | §7.1, §14.2 |
| 4 | Zero location pages; seven salons on one `/kontakt` page | §7.2 |
| 5 | Salons named "Studio Marcela I–VII" — unsearchable | §7.2 |
| 6 | Opening hours published nowhere on the site | §7.2, §11 |
| 7 | Booking shows no prices and no durations | §9.3, §9.4 |
| 8 | Booking service tiles are 3–10 KB images — visibly pixelated | §6 |
| 9 | reCAPTCHA is 374 KB of a 483 KB booking page | §9.12, §19.3 |
| 10 | `/usluge` says "contact us for prices"; `/cjenik` publishes them | §7.3 |
| 11 | Untranslated strings leak into the English booking flow | §13.3 |
| 12 | Blog posts have no individual URLs and are absent from the sitemap | §7.10 |
| 13 | Gallery is 39 uncategorised, uncredited images | §7.9 |
| 14 | No stylist appears anywhere on the site | §7.4 |
| 15 | `html5-qrcode` loaded from unpkg.com on every page | §13.1 |
| 16 | Founder story and Silky partnership buried on `/o-nama` | §3, §7.8 |
| 17 | Dubrovnik hotel locations have no targeted content at all | §7.6 |
| 18 | A file input renders on the public `/gallery` page `[VERIFY]` | §19.2 |

---

## 3. Brand and positioning

### 3.1 Positioning statement

> Studio Marcela is not a chain of seven salons. It is one studio with seven rooms — the same
> standard, the same products, the same training, whichever door you walk through.

The current site sells *convenience* (we have many locations). Convenience is what every
competitor sells, and it loses to whoever is closest. The new site sells *consistency and
craft*, which cannot be copied by the salon on the next corner.

### 3.2 The three proof assets

These already exist. They are simply not being used.

**1. Jadranka Pezo.** Founder, sixteen years, and Croatian director for Silky professional
cosmetics. A salon owner who runs a professional product line nationally is a materially
different proposition from a salon owner. This belongs on the homepage, not page six.

**2. Silky TechnoBasic.** Manufactured in Milan by H.S.A., shipped direct from the factory,
used exclusively across all seven studios. This is a *reason to pay more* and it currently
appears nowhere a prospective client will see it.

**3. The line that is already written.** From the current About page:

> "We don't sell haircuts. We build trust — cut by cut, color by color."

HR: **„Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja."**

This is the brand. It goes above the fold.

### 3.3 Voice and tone

| Do | Don't |
|---|---|
| Speak as a professional to an adult | Use "luxury", "premium", "exclusive" as adjectives |
| Be specific: "45 minuta", "od 40 €", "Silky, iz Milana" | Be vague: "vrhunska kvaliteta", "najbolji u gradu" |
| Name people: "Ana radi balayage" | Say "our expert team" |
| Say the price | Say "contact us for pricing" |
| Warm, direct, calm | Excitable, exclamation marks, ALL CAPS |

**Croatian register:** address the client as **vi** (formal) throughout the marketing site.
In the booking flow and in transactional messages, stay formal but shorten — the client is
mid-task, not reading. Never use anglicisms where a normal Croatian word exists
(*booking* → **naručivanje** / **rezervacija**; *tim* is acceptable, *stilist* is acceptable
and in common salon use).

### 3.4 Messaging hierarchy

Every page answers these in this order:

1. What is this and is it near me?
2. What will it cost and how long will it take?
3. Who will do it, and are they any good?
4. Can I book it right now without phoning anyone?

The current site answers none of these above the fold on any page.

---

## 4. Design system

### 4.1 Principles

1. **The photograph is the design.** Layout exists to frame photography, not to compete with
   it. If a section works with a grey box in place of the image, the image is decorative and
   should be cut.
2. **One idea per screen.** No section asks the visitor to consider two things at once.
3. **Booking is never more than one tap away.** A persistent, non-intrusive route to booking
   at every scroll position on every page.
4. **Restraint reads as expensive.** Slow, few, deliberate movements. Cheap sites animate
   everything.
5. **Nothing decorative loads before something useful.**

### 4.2 Colour

**Decision, 31 July 2026 — client direction.** Keep the existing brand equity:
dark, gold and white, as on studiomarcela.hr. An earlier draft of this section
argued for moving away from gold-on-black; the client overruled it, and they
are right that the palette is recognisably theirs. The work is therefore in
*how* the gold is applied, not in replacing it.

Three surfaces: a warm near-black, white and two warm off-whites, and a gold
family.

```
--color-ink-900   #100E0C   Dark surfaces: header, footer, heroes, feature bands
--color-ink-800   #1C1917   Second dark step, for layering on dark
--color-ink-700   #3A3531   Body text on light surfaces
--color-ink-500   #6A625B   Secondary text on light
--color-ink-300   #A79E95   Tertiary, hairlines on dark

--color-paper-000 #FFFFFF   Cards
--color-paper-050 #FBFAF8   Page background
--color-paper-100 #F4F1EB   Alternating sections
--color-paper-200 #E4DFD5   Borders, dividers

--color-gold-300  #E8D5A3   Hover state on dark
--color-gold-400  #D9BE7A   Text and accents ON DARK
--color-gold-500  #C2A15C   Buttons, rules, ornament
--color-gold-700  #7A5F28   The only gold permitted as small text ON WHITE
--color-gold-100  #F7F0DF   Tinted backgrounds on light surfaces
```

**The rule that makes this work.** One gold cannot serve both surfaces. The
brand gold measures **2.4:1 on white** — nowhere near the 4.5:1 that AA
requires for text — while measuring **7.8:1 on ink-900**. So the family splits
by where it sits:

| Context | Token | Ratio |
|---|---|---|
| Text and accents on dark | `gold-400` | 7.8:1 ✓ |
| Small text on white | `gold-700` | 4.9:1 ✓ |
| Button fill, with `ink-900` text on it | `gold-500` | 7.8:1 ✓ |
| Rules, borders, ornament | `gold-500` | decorative, no threshold |
| Large display figures on white | `gold-500` | 3:1 large-text threshold ✓ |

**Never** `gold-500` as body text on white, and **never** white text on a gold
fill — that pairing is 2.4:1 and is the single easiest way to break this
palette. Gold-on-gold-tint is likewise out.

**Where the dark goes.** The gold needs dark surfaces to sit on or it has
nowhere to work: the header, the footer, every hero, and the feature bands are
`ink-900`. Content-heavy pages stay light so long-form copy remains readable —
which is also how the old site was structured.

Contrast is verified against the rendered pages in CI (§21.4), not by eye.

### 4.3 Typography

Two families. Both must have full Croatian diacritic coverage — **č ć đ š ž Č Ć Đ Š Ž**. This
is a hard requirement and rules out a surprising number of display faces. Test every candidate
with the string `Šišanje, češljanje i njega kose — Đurđica Žužić`.

| Role | Face | Fallback stack |
|---|---|---|
| Display / headings | A high-contrast serif with a true italic | `Georgia, 'Times New Roman', serif` |
| Body / UI | A humanist sans with tabular figures | `-apple-system, 'Segoe UI', Roboto, sans-serif` |

Candidates to evaluate (all have Croatian coverage and open licences): **Fraunces**,
**Newsreader**, or **Instrument Serif** for display; **Inter**, **Public Sans**, or
**Source Sans 3** for body. `[VERIFY]` final pairing at design review.

**Scale** (fluid, `clamp()` between the mobile and desktop values):

```
display-xl   40 → 76 px   line-height 1.04   tracking -0.02em   display face
display-lg   32 → 56 px   line-height 1.08   tracking -0.015em  display face
display-md   26 → 40 px   line-height 1.15   tracking -0.01em   display face
heading-lg   22 → 28 px   line-height 1.25                      body face, 600
heading-md   18 → 22 px   line-height 1.3                       body face, 600
body-lg      17 → 19 px   line-height 1.6                       body face, 400
body-md      15 → 16 px   line-height 1.6                       body face, 400
body-sm      13 → 14 px   line-height 1.5                       body face, 400
caption      12 → 13 px   line-height 1.4    tracking 0.02em    body face, 500
```

Prices and times use **tabular figures** everywhere so columns align.
Measure caps at **68 characters** for body copy.

### 4.4 Spacing, grid, layout

8 px base unit. Steps: `4 8 12 16 24 32 48 64 96 128 160`.

| Breakpoint | Width | Columns | Gutter | Margin |
|---|---|---|---|---|
| `sm` | 0–639 | 4 | 16 | 20 |
| `md` | 640–1023 | 8 | 20 | 32 |
| `lg` | 1024–1439 | 12 | 24 | 48 |
| `xl` | 1440+ | 12 | 32 | max-width 1360, centred |

Section vertical rhythm: 96 px mobile, 160 px desktop. Consecutive sections must alternate
between `--paper-050` and `--paper-100` or be separated by a full-bleed image; never two
identical backgrounds in a row.

### 4.5 Radius, elevation, borders

```
radius-sm    4px    inputs, chips, tags
radius-md    8px    buttons, small cards
radius-lg    16px   cards, image containers
radius-full  999px  avatars, pills

border-hairline  1px solid var(--paper-200)

shadow-sm   0 1px 2px rgba(26,22,20,.06)
shadow-md   0 4px 16px rgba(26,22,20,.08)
shadow-lg   0 12px 40px rgba(26,22,20,.12)   modals, booking summary only
```

Elevation is used sparingly. Prefer a hairline border to a shadow for grouping.

### 4.6 Motion

```
duration-fast     120ms   hover, focus, colour
duration-base     220ms   dropdowns, accordions, tab changes
duration-slow     420ms   page and step transitions
duration-reveal   700ms   scroll-in reveals

ease-out     cubic-bezier(0.16, 1, 0.3, 1)      entrances
ease-in-out  cubic-bezier(0.65, 0, 0.35, 1)     movement between two states
```

**Rules**

- Scroll reveals: opacity 0→1 plus a 16 px rise. Once, never on scroll-back. Stagger siblings
  by 60 ms, maximum four in a group.
- No parallax. No horizontal scroll-jacking. No counters that tick up.
- The hero video is muted, loops, `playsinline`, and is replaced by its poster frame on
  `prefers-reduced-motion` and on connections reporting `saveData`.
- **`prefers-reduced-motion: reduce` disables every transform and every autoplay.** Opacity
  transitions may remain. This is checked in CI.

### 4.7 Iconography

One set, outline, 1.5 px stroke, 24 px grid — Lucide. No filled icons. No emoji anywhere in
the product UI. Icons never appear without a text label in the booking flow.

### 4.8 Component inventory

Built as a documented library before any page is assembled.

**Primitives** — Button (primary / secondary / ghost / destructive; sm, md, lg; loading and
disabled states), Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, DatePicker,
TimeSlotGrid, PhoneInput (HR format, `+385`), Badge, Tag, Chip, Avatar, Tooltip, Popover,
Modal, Drawer, Toast, Skeleton, Spinner, Pagination, Tabs, Accordion, Breadcrumb, Rating.

**Composites** — LocationCard, ServiceCard (with price, duration, "what's included"),
StylistCard, ReviewCard, BeforeAfterSlider, GalleryGrid, GalleryLightbox, PriceTable,
BookingStepper, BookingCart, BookingSummaryBar (sticky), AvailabilityCalendar, AddOnList,
FaqAccordion, OpeningHoursTable (with a live "open now / closed" state), MapEmbed,
StickyBookCta, LanguageSwitcher, BlogCard, TeamGrid.

**Dashboard** — DayCalendar, WeekCalendar, StaffCalendar (resource columns), AppointmentBlock,
AppointmentDrawer, ClientRecord, ColourFormulaEntry, ShiftEditor, AbsenceRequestCard,
ServiceEditor, StatTile, DataTable (sort, filter, paginate, CSV export), AuditLogEntry.

### 4.9 Responsive rules

- Design mobile-first and review mobile first. 73% of salon booking traffic is mobile;
  the desktop layout is the secondary case.
- Tap targets ≥ 44 × 44 px with ≥ 8 px separation.
- No hover-only affordances anywhere. Every hover has a tap or focus equivalent.
- Sticky booking CTA appears on mobile after 40% scroll depth; on desktop it lives in the
  header at all times.
- Tables (price list, dashboard) scroll horizontally inside their own container. The page body
  never scrolls sideways.

---

## 5. Information architecture

### 5.1 Sitemap

```
/                                    Homepage
/saloni                              All locations index
  /saloni/ilica                      Centar — Ilica 49
  /saloni/precko                     SC Prečko — Josipa Slavenskog 1
  /saloni/sigecica                   Sigečica — Hvarska 10
  /saloni/novi-zagreb                Novi Zagreb — Jaruščica 9A
  /saloni/galleria-iblerov-trg       Galleria BC — Trg Drage Iblera 10
  /saloni/dubrovnik-rixos            Hotel Rixos Premium Dubrovnik
  /saloni/dubrovnik-sheraton         Sheraton Dubrovnik Riviera, Srebreno
/usluge                              Services index
  /usluge/sisanje-i-fen              Cutting and blow-dry
  /usluge/bojanje                    Colour
  /usluge/pramenovi                  Highlights
  /usluge/balayage                   Balayage
  /usluge/airtouch                   AirTouch
  /usluge/preljev                    Gloss / toner
  /usluge/njega-i-tretmani           Treatments and hair care
  /usluge/keratinski-tretman         Keratin
  /usluge/musko-sisanje              Men's cutting
  /usluge/djecje-sisanje             Children's cutting
  /usluge/svecane-frizure            Formal styling
  /usluge/vjencana-frizura           Bridal hair
  /usluge/sminkanje                  Makeup
  /usluge/ekstenzije                 Extensions
/tim                                 Team index
  /tim/[slug]                        Individual stylist
/cjenik                              Full price list
/narucivanje                         Booking
/vjencanja                           Weddings hub
  /vjencanja/dubrovnik               Destination weddings (EN-first)
/frizer-to-go                        Mobile service
/grupne-usluge                       Group bookings
/galerija                            Gallery
/o-nama                              About / founder / Silky
/blog                                Blog index
  /blog/[slug]                       Post
/loyalty                             Loyalty club
/karijere                            Careers
/kontakt                             Contact
/faq                                 FAQ
/pravila-privatnosti                 Privacy policy
/uvjeti-koristenja                   Terms
/pravila-otkazivanja                 Cancellation policy

/moj-termin/[token]                  Client self-service (manage a booking, no login)
/racun                               Client account (optional, post-booking)

/app                                 Dashboard (auth required) — see §10
```

English mirrors live under `/en/...` with the **same slugs** except where a translated slug
carries real search value (`/en/weddings/dubrovnik`, `/en/salons/...`). Slug decisions are
listed per page in §7.

### 5.2 URL rules

- Lower case, hyphens, no diacritics in slugs (`sisanje`, not `šišanje`).
- No trailing slashes. No `index` segments. No query parameters for content.
- The booking flow encodes state in the path so it is linkable and shareable:
  `/narucivanje/[location]/[service]?stylist=&date=` — see §9.2.
- Never change a published URL. If one must change, add a 301 and record it in §14.7.

### 5.3 Navigation

**Header** (sticky, condenses on scroll)

`Saloni · Usluge · Cjenik · Tim · Vjenčanja · O nama` + **[Naruči se]** + language switcher.

Six items maximum. The current site has ten, which is why nothing in it is findable. `Blog`,
`Karijere`, `Galerija`, `FAQ`, `Loyalty` and `Frizer to Go` live in the footer and are reached
contextually from within relevant pages.

`Saloni` and `Usluge` open a mega-menu on desktop (locations with thumbnails and hours;
services grouped by category with starting prices) and an accordion on mobile.

**[Naruči se]** is the only primary-styled button in the header, at every breakpoint.

**Footer** — four columns: Saloni (all seven, with district names), Usluge (top eight),
Studio (O nama, Tim, Blog, Karijere, Loyalty), Pomoć (Kontakt, FAQ, Pravila otkazivanja,
Privatnost, Uvjeti). Plus NAP block, social links, and the Silky partnership mark.

### 5.4 Internal linking rules

These are load-bearing for SEO, not decorative.

- Every service page links to **all seven** location pages ("Dostupno u:").
- Every location page links to the **top six** services offered there, and to every stylist
  who works there.
- Every stylist page links to their home location and to the services they are certified for.
- Every gallery item links to its service, its stylist, and a pre-filled booking link.
- Every blog post links to at least one service page and one location page, in body copy.
- Breadcrumbs on every page below the top level, with `BreadcrumbList` schema.
- No page is more than three clicks from the homepage.

---

## 6. Photography and asset specification

> This section is the photographer's brief. Reference images live in
> `apps/web/public/ref/`, described in `docs/photo-references/README.md`. **The references
> are direction, not
> content. Every reference is replaced by an original photograph of a real Studio Marcela
> salon, stylist, or client.**

### 6.1 Why this section decides the project

The strategic premise of the new site is that a visitor should feel they have already been
inside the studio before they arrive. That is delivered by photography or it is not delivered.
Layout, typography and motion can only frame what the camera captured.

The current site's photography is its single largest weakness: dim, wide, empty-room
interiors, and service thumbnails exported at 3–10 KB. No amount of front-end work
compensates for this.

**Recommended minimum:** one half-day per location (7 half-days) plus one full day for
stylist portraits and service detail. `[CLIENT]`

If the budget allows only one thing, shoot **the four Zagreb locations most people search
for, and the stylist portraits.** Dubrovnik can launch on hotel-supplied imagery in Phase 1
and be reshot in Phase 3.

### 6.2 Global shooting rules

| | |
|---|---|
| **Light** | Natural, directional, from a window. Kill the overhead fluorescents — shoot early morning or late afternoon. One bounce card is fine; no on-camera flash, ever. |
| **Colour** | Warm and true. Skin must read as skin. Do not push contrast or clarity. Deliver a consistent grade across the whole set. |
| **People** | Real staff and real, consenting clients. Hands and faces beat empty rooms every time. Unposed over posed. A genuine laugh over a held smile. |
| **Wardrobe** | Staff in their working blacks / aprons. No branded promotional t-shirts. |
| **Set dressing** | Tidy but not sterile — a salon in use, not a showroom. Remove: personal clutter, competitor product, price signs, anything with a visible non-Silky logo. |
| **Framing** | Leave generous headroom and side room. Every image gets cropped to at least three aspect ratios; shoot loose. |
| **Do not** | Use a fisheye or ultra-wide for interiors (it distorts and reads as a real-estate listing). Shoot at f/1.2 for interiors — we need the room legible. Retouch skin texture away. |
| **Consent** | Written model release for every identifiable person, staff and client, covering web and social use. Template required. `[CLIENT]` |

### 6.3 Delivery and export

**From the photographer:** full-resolution 16-bit TIFF or DNG masters, graded, plus
JPEG previews. Minimum 4000 px on the long edge.

**Naming:** `sm_[location|service|person]_[subject]_[nn].jpg`
e.g. `sm_precko_interior_03.jpg`, `sm_stylist_ana-k_portrait_01.jpg`

**Build pipeline:** originals are committed to the asset store, never to git. Next.js
`<Image>` generates AVIF and WebP at `640, 960, 1280, 1600, 2000, 2560` px. Quality 72
for photographic content, 82 for anything with fine detail (colour dimension close-ups).

**Budget:** no single image exceeds **200 KB** at its largest served size. Hero images must
be under **160 KB** — they are LCP candidates (§17).

**Art direction across breakpoints:** heroes are shot so the subject sits in the middle
third, allowing a 16:9 desktop crop and a 4:5 mobile crop from the same frame. Where that is
impossible, shoot both.

### 6.4 Shot list

Every image slot on the site. `Ref` names a file in `apps/web/public/ref/`, catalogued in
`docs/photo-references/README.md`.

#### Homepage

| ID | Slot | Ratio | Brief | Ref |
|---|---|---|---|---|
| `HP-01` | Hero | 16:9 desktop / 4:5 mobile | The single most important frame on the site. A real Studio Marcela room in late-afternoon window light. A stylist mid-work with a client, both slightly soft; foreground gives an empty chair and a mirror edge for depth. Warm, calm, inhabited. Must survive a text overlay on the left third — shoot with that area uncluttered. | `INTERIOR-01` |
| `HP-02` | Hero video loop | 16:9 | 4–6 s, muted, no cuts. Locked-off camera. One of: a tint brush loading with colour, foils being folded, scissors point-cutting, a round brush lifting a section. Slow, hypnotic, no faces needed. Poster frame must stand alone as a still. | `SVC-FOILS-01` |
| `HP-03` | Founder portrait | 4:5 | Jadranka Pezo in one of her salons. Waist-up, direct to camera, calm authority, working blacks. Window light from one side. This image carries the entire trust proposition — allow proper time for it. | `STYLIST-PORTRAIT-01` |
| `HP-04` | Silky product still | 3:2 | Silky TechnoBasic bottles on a warm surface, raking side light, shallow depth. Labels legible. Shot to feel like an object worth paying for, not a catalogue listing. | `PRODUCT-01`, `PRODUCT-02` |
| `HP-05` | Locations strip ×7 | 3:2 each | One establishing frame per salon, consistent treatment. See `LOC-*` below. | `INTERIOR-01` |
| `HP-06` | Result / transformation ×4 | 4:5 | Finished work, three-quarter rear, showing colour dimension in daylight. These are the images that sell colour services. | `RESULT-01`, `RESULT-02`, `SVC-COLOR-01` |

#### Location pages (repeat for all seven)

| ID | Slot | Ratio | Brief | Ref |
|---|---|---|---|---|
| `LOC-01` | Arrival / exterior | 3:2 | How the client finds the door. Street level, straight on, daylight, signage legible. For **SC Prečko** this is the mall entrance and the second-floor unit frontage; for **Rixos** and **Sheraton** it is the salon entrance within the hotel interior. *No reference available for the mall and hotel cases — shoot to this brief.* | `LOC-EXT-01`, `LOC-EXT-02` |
| `LOC-02` | Room, wide | 16:9 | The main floor, eye level, symmetrical if the room allows. Lights on but daylight dominant. Empty of people. This is the "what am I walking into" frame. | `INTERIOR-01` |
| `LOC-03` | Room, inhabited | 3:2 | Same room, working. Two or three stations occupied, staff mid-task, natural. Shot on a normal busy day, not staged. For the evening/winter variant — warm lamps, dark outside — see the mood reference, but **keep our warm-neutral palette, not its heavy amber grade**. | `INTERIOR-01`, `INTERIOR-MOOD-01` |
| `LOC-04` | Basin area | 3:2 | The wash station. Clean, calm, towels folded. If shooting with a model, the reclined-client frame is more inviting than the empty chair. | `SVC-WASH-01`, `SVC-WASH-02` |
| `LOC-05` | Station detail | 4:5 | One styling station: tools laid out, Silky products, a folded towel, the mirror edge. Raking window light. **Note:** `TOOLS-01` has the right composition but the wrong palette — ours is warm neutral, not orange. | `TOOLS-01`, `PRODUCT-01` |
| `LOC-06` | Reception | 3:2 | The desk and retail shelf. Where the client pays and where product is sold — so it must look like somewhere you would buy something. | `RECEPTION-01` |
| `LOC-07` | Team at this salon | 16:9 | The people who actually work here, in their room. Loose grouping, relaxed, some interaction — not a police line-up. **Note:** `TEAM-01` reads too corporate; ours must read as a working salon team. | `TEAM-01` |

#### Service pages

| ID | Service | Ratio | Brief | Ref |
|---|---|---|---|---|
| `SVC-01` | Cutting and blow-dry | 3:2 | Scissors in wet hair, close, over the shoulder, hands sharp. | `SVC-CUT-01` |
| `SVC-02` | Colour | 3:2 | Gloved hands applying colour at the root, bowl and brush in frame. | `SVC-COLOR-02` |
| `SVC-03` | Highlights | 3:2 | A foil being placed and folded, tint brush loaded. | `SVC-FOILS-01` |
| `SVC-04` | Balayage | 4:5 | Freehand sweep down a section — the gesture that defines the technique. Plus a macro of the finished gradient. | `SVC-COLOR-01` |
| `SVC-05` | AirTouch | 3:2 | The dryer separating a section before colour is painted. Distinctive and rarely photographed well — worth the effort. | *none — shoot to brief* |
| `SVC-06` | Gloss / toner | 4:5 | Product being worked through mid-lengths; the shine change is the story. | `SVC-COLOR-01` |
| `SVC-07` | Treatments | 3:2 | Mask or ampoule being applied, scalp massage. Tactile, close, calm. | `SVC-WASH-01` |
| `SVC-08` | Keratin | 3:2 | Flat iron sealing a section, steam catching the light. | *none — shoot to brief* |
| `SVC-09` | Men's cutting | 3:2 | Clipper work at the nape or a beard line. Warm, sharp, confident. | `SVC-MENS-01` |
| `SVC-10` | Children's cutting | 3:2 | A child in the chair, relaxed, a parent visible. Warm and unforced. Consent is non-negotiable. | *none — shoot to brief* |
| `SVC-11` | Formal styling | 4:5 | A finished updo, three-quarter rear, jewellery and neckline in frame. | `BRIDAL-03` |
| `SVC-12` | Bridal | 4:5 | Stylist's hands setting the final pin; veil or comb visible. Soft, high-key, romantic without being twee. | `BRIDAL-01`, `BRIDAL-02`, `BRIDAL-03` |
| `SVC-13` | Makeup | 4:5 | Brush at the cheekbone, eyes down, skin texture preserved. Plus the makeup station. | `SVC-MAKEUP-01` |
| `SVC-14` | Extensions | 4:5 | Bonding detail close, then a length-and-movement result frame. | `RESULT-01` |
| `SVC-15` | Blow-dry | 3:2 | Round brush and dryer mid-motion, hair lifting. **Note:** `SVC-BLOW-01` is a studio beauty shot; ours must be in-salon and in-service. | `SVC-BLOW-01` |

#### People

| ID | Slot | Ratio | Brief | Ref |
|---|---|---|---|---|
| `PPL-01` | Stylist portrait (× every stylist) | 4:5 | Identical treatment for all: waist-up, direct to camera, calm half-smile, working blacks, soft window light from one side, their own salon softly behind. Natural skin texture — minimal retouching. Consistency across the whole team matters more than any single frame. | `STYLIST-PORTRAIT-01` |
| `PPL-02` | Stylist at work (× every stylist) | 3:2 | The same person absorbed in their craft, not looking at the camera. Pairs with the portrait on their profile page. | `STYLIST-ATWORK-01` |
| `PPL-03` | Client joy | 4:5 | A real client, delighted, in the mirror moment. Used for testimonials and for the loyalty section. | `CLIENT-01` |

#### Portfolio and gallery

| ID | Slot | Ratio | Brief | Ref |
|---|---|---|---|---|
| `GAL-01` | Portfolio result | 4:5 | Ongoing programme, not a one-off shoot. Every stylist photographs finished work in a **fixed spot** in their salon with **consistent light** — see §6.5. | `RESULT-01`, `RESULT-02` |
| `GAL-02` | Before / after pair | 4:5 ×2 | Identical framing, identical light, identical distance. The whole persuasive power is that nothing changed except the hair. Shoot the "before" *before* the client is gowned. *No reference available — this is a discipline, not a look.* | *none* |

#### Other

| ID | Slot | Ratio | Brief | Ref |
|---|---|---|---|---|
| `OTH-01` | Frizer to Go | 3:2 | A stylist working in a client's home or hotel room — kit open, natural domestic light, client relaxed. Must read as *your* space, not a salon. *No reference available.* | *none* |
| `OTH-02` | Weddings, Dubrovnik | 16:9 | Bridal prep with Adriatic light through a hotel window; stone, sea, linen. Sells the destination as much as the service. | `BRIDAL-02` |
| `OTH-03` | Careers | 3:2 | Staff training, hands-on, senior with junior. Sells the salon as a place to grow. | `STYLIST-ATWORK-01` |
| `OTH-04` | Silky story | 3:2 | Product in use, plus a still life. If a factory or Milan visit is ever photographed, that footage is gold. | `PRODUCT-01` |
| `OTH-05` | OG / social card | 1.91:1 | One strong branded frame per key page for link previews. Generated from the page hero with a wordmark overlay. | — |

### 6.5 The portfolio programme (ongoing, after launch)

The gallery is the highest-converting asset a salon owns and it cannot be filled by one shoot.
Set up a repeatable process:

1. One **fixed photo spot** per salon: a specific position with a plain wall and good window
   light, marked on the floor with tape.
2. A phone mount at a fixed height and distance so framing is consistent.
3. Stylists upload finished work through the dashboard (§10.7), tagging service, stylist,
   hair length and colour technique.
4. A manager approves before anything publishes.
5. Client consent captured in the same flow, stored against the client record (§20.1).

This produces a growing, correctly-tagged, correctly-credited portfolio at zero marginal cost —
and it feeds §7.9's filterable gallery, where every image carries a "book this look" action.

### 6.6 Interim imagery

Between build and shoot, the site is developed against the reference library with a visible
`REFERENCE — NOT FOR PRODUCTION` watermark applied by the build in non-production
environments. A CI check fails the production build if any asset path still resolves into
`/ref/`. This makes it structurally impossible to ship stock photography by accident.

**Note on where these live.** The placeholders sit in `apps/web/public/ref/` and are committed,
because the app serves them and anything excluded from the repository is absent from a deploy.
An earlier attempt to keep them out of git and regenerate them at build time shipped a
production site with every image broken — assets the app serves belong in version control.

---

## 7. Page specifications

Croatian is the primary copy. English follows where the page has a genuine English audience.
Copy marked `[CLIENT]` needs information we do not have.

### 7.1 Homepage — `/`

**Meta**

```
Title (HR):  Frizerski salon Zagreb | Studio Marcela — 7 studija, online naručivanje
Title (EN):  Hair Salon Zagreb & Dubrovnik | Studio Marcela — Book Online
Description (HR): Šišanje, bojanje, pramenovi i balayage u 5 salona u Zagrebu i 2 u
Dubrovniku. Cijene i trajanje unaprijed, potvrda termina odmah. Naručite se online.
```

Title stays under 60 characters, description under 155. No keyword stacking — the current
site's `Najbolji frizerski salon u Zagrebu i okolici - Studio Marcela - šišanje, bojanje…`
heading is removed entirely.

**Structure**

| # | Section | Purpose |
|---|---|---|
| 1 | Hero | Answer *what, where, how much, book now* in one screen |
| 2 | Trust bar | Immediate credibility |
| 3 | All-inclusive offer | Their strongest commercial hook |
| 4 | Locations | The strongest filter — get people to their salon |
| 5 | Services | Price and duration transparency |
| 6 | The team | Sell the person |
| 7 | Silky | Justify the price |
| 8 | Founder | Trust |
| 9 | Reviews | Social proof |
| 10 | Gallery preview | Proof of craft |
| 11 | Loyalty | Retention |
| 12 | FAQ | Objection handling + `FAQPage` schema |
| 13 | Closing CTA | Final conversion |

**Copy — HR**

*1. Hero* — image `HP-01`, video `HP-02`

```
H1     Frizerski salon u Zagrebu — sedam studija, jedan standard
Sub    Šišanje, bojanje i pramenovi kod stilista kojeg birate vi.
       Vidite cijenu i trajanje prije nego potvrdite termin.
CTA1   Naruči se
CTA2   Pogledaj cjenik
```

> The H1 does the work the current `OUR SALONS` does not: it names the service, the city, and
> the differentiator, in Croatian, on the Croatian page.

*2. Trust bar* — single row, no icons larger than the text

```
16 godina iskustva  ·  7 studija  ·  Silky TechnoBasic iz Milana  ·  174+ recenzija [VERIFY]
```

*3. All-inclusive offer* — image `HP-06`

```
H2     Sve uključeno. Bez iznenađenja na kraju.
Body   Dvije najtraženije usluge s fiksnom cijenom u koju ulazi baš sve —
       pranje, njega kose, šišanje, boja ili pramenovi, preljev i fen frizura.

       Pramenovi — sve uključeno       95 €
       Bojanje — sve uključeno         55 €

Note   Cijena vrijedi za kosu do ramena. Za dužu ili gušću kosu stilist će
       vam reći točan iznos prije početka rada. Nikad nakon.
CTA    Rezerviraj paket
```

> "Nikad nakon" directly answers the single biggest anxiety in salon pricing. Keep it.

*4. Locations* — images `HP-05` / `LOC-02`

```
H2     Sedam studija. Odaberite onaj koji vam je najbliži.
Sub    Pet u Zagrebu, dva u Dubrovniku. Isti standard, isti proizvodi,
       ista edukacija — kroz koja god vrata uđete.
```

Seven `LocationCard`s: photo, district name, street address, today's hours with a live
*Otvoreno / Zatvoreno* state, walking-distance landmark, and two actions —
**Naruči se** and **Pogledaj salon**. A "najbliži meni" control requests geolocation on
tap only, never automatically.

*5. Services*

```
H2     Usluge — s cijenom i trajanjem, unaprijed
Sub    Znate što plaćate i koliko traje prije nego sjednete u stolicu.
```

Eight `ServiceCard`s (Šišanje i fen · Bojanje · Pramenovi · Balayage · AirTouch · Njega i
tretmani · Muško šišanje · Šminkanje), each showing *od X €* and *~N min*.
Link: **Cijeli cjenik →**

*6. The team* — images `PPL-01`

```
H2     Iza svake frizure stoji netko s imenom
Sub    Birajte stilista, ne salon. Svaki član tima ima svoj portfolio,
       svoju specijalnost i svoj kalendar.
CTA    Upoznajte tim
```

*7. Silky* — image `HP-04` / `OTH-04`

```
H2     Silky TechnoBasic — iz Milana, izravno u naše studije
Body   Naša osnivačica Jadranka Pezo direktorica je Silkyja za Hrvatsku.
       Proizvode koje koristimo naručujemo izravno iz tvornice H.S.A. u Milanu,
       bez posrednika i bez dugog stajanja u skladištima.

       Zato u svih sedam studija radimo istom linijom, iste svježine —
       i zato boja izgleda jednako i na Ilici i u Dubrovniku.
```

*8. Founder* — image `HP-03`

```
Quote  „Ne prodajemo frizure. Gradimo povjerenje — rez po rez, boja po boja."
Attr   Jadranka Pezo, osnivačica Studija Marcela
CTA    Naša priča
```

*9. Reviews*

```
H2     Što kažu naši gosti
```

Three to six real reviews with name, salon, service and date. Pulled from Google Business
Profile per location (§10.9), reviewed before display. `Review` schema (§14.3).

*10. Gallery preview*

```
H2     Rad našeg tima
Sub    Svaka fotografija je rad našeg stilista na našem gostu.
CTA    Cijela galerija
```

Eight to twelve items, each linking to its service and stylist.

*11. Loyalty*

```
H2     Studio Marcela Club
Body   Svaki posjet nosi bodove, svaki peti donosi nešto natrag.
       Kartica živi u vašem profilu — ne morate je nositi sa sobom.
CTA    Saznajte više
```

*12. FAQ* — six questions, `FAQPage` schema

```
Trebam li platiti unaprijed?
Koliko traje bojanje?
Mogu li odabrati stilista?
Što ako moram otkazati?
Radite li vikendom?
Dolazite li na kućnu adresu?
```

*13. Closing CTA*

```
H2     Slobodni termini već ovaj tjedan
Sub    Odaberite salon, uslugu i vrijeme. Potvrda stiže odmah — bez čekanja
       na poziv i bez poruka koje nitko ne pročita.
CTA    Naruči se
Alt    Radije biste telefonom? Nazovite svoj salon →
```

**Copy — EN** (`/en`)

```
H1   Hair Salon in Zagreb — Seven Studios, One Standard
Sub  Cuts, colour and highlights with the stylist you choose.
     See the price and the duration before you confirm.
```

Remaining sections translate directly, except *Silky*, which leads with "Direct from the
factory in Milan" for an audience that will not recognise the brand.

---

### 7.2 Location pages — `/saloni/[slug]`

**The most important pages on the site.** Seven salons currently share one contact page and
compete as a single entity. Each becomes a page that can win its own neighbourhood.

#### 7.2.1 Non-negotiable rules

1. **The location appears in the `<h1>` and in the first `<h2>`.** This is the explicit
   requirement and it is also correct practice — it is the strongest on-page signal for
   "frizer + [district]" queries.
2. **Genuinely unique body copy per page.** Not a template with the district name swapped.
   Duplicated location pages trigger the same suppression as duplicated content and the
   entire exercise fails. Minimum 350 words of original copy per page.
3. **Distinct, non-overlapping keyword targets** per page, so the seven do not cannibalise
   each other (§14.1).
4. **Its own `HairSalon` schema block** with that salon's address, geo, phone, hours and
   review data. Never one block copied seven times.
5. **Its own team, its own gallery, its own reviews.**
6. Every CTA on the page deep-links into booking **with that location pre-selected** (§9.2).

#### 7.2.2 Template

| # | Section | Contents |
|---|---|---|
| 1 | Hero | `LOC-01`/`LOC-02`, H1 with location, address, live open/closed, **Naruči se u [salon]**, tap-to-call |
| 2 | Intro | H2 with location + district. 120–180 words, specific to this room and this neighbourhood |
| 3 | Getting here | Tram/bus lines, parking, floor, entrance notes, `MapEmbed`, "Navigate" deep link |
| 4 | Hours | Full week, `OpeningHoursTable`, holiday exceptions |
| 5 | Team here | `StylistCard`s for staff at this salon, each bookable directly |
| 6 | Services here | Top 6–8 with local prices and durations; note any service *not* offered here |
| 7 | Gallery | 8–12 images shot at this salon by this team |
| 8 | Reviews | This location's Google reviews only |
| 9 | FAQ | 4–6 questions specific to this salon (parking, children, walk-ins, card payment) |
| 10 | Nearby | Links to the two closest other salons — captures "the other one was full" |
| 11 | CTA | Book at this salon |

#### 7.2.3 The seven pages

> Neighbourhood, transport and parking details below are inferred from the addresses and are
> marked `[VERIFY]`. **Every one must be confirmed with the client before publication** —
> a wrong tram number on a location page is worse than no tram number.

---

**1 · Ilica — `/saloni/ilica`**

```
H1  Frizerski salon Ilica 49, Zagreb — Studio Marcela Centar
H2  Šišanje, bojanje i pramenovi u samom centru Zagreba

Title:  Frizerski salon Ilica, Zagreb | Studio Marcela Centar
Desc:   Frizerski salon na Ilici 49 u centru Zagreba. Šišanje, bojanje,
        pramenovi i balayage. Naručite se online — potvrda odmah.
Tel:    092 / 1816 736
```

*Intro copy (HR):*

> Naš studio na Ilici 49 nalazi se u samom centru grada, nekoliko minuta pješice od Trga bana
> Jelačića `[VERIFY]`. To je salon u koji se najčešće dolazi između dvije obaveze — pa smo ga
> tako i posložili: termini kreću na vrijeme, a prije rezervacije točno vidite koliko usluga
> traje.
>
> Ovdje radimo cijeli raspon usluga — od šišanja i fen frizure do zahtjevnih tehnika bojanja,
> balayagea i AirToucha. Ako niste sigurni što vaša kosa treba, naručite se na kratku
> konzultaciju; ona je besplatna i ne obvezuje vas ni na što. `[VERIFY]`

*Targets:* `frizerski salon centar Zagreb`, `frizer Ilica`, `frizerski salon Ilica 49`,
`frizer centar Zagreb`

---

**2 · Prečko — `/saloni/precko`**

```
H1  Frizerski salon Prečko — Studio Marcela u SC Prečko
H2  Frizer u Prečkom: šišanje, bojanje i pramenovi uz besplatan parking

Title:  Frizerski salon Prečko | Studio Marcela, SC Prečko
Desc:   Frizerski salon u Shopping centru Prečko, 2. kat. Šišanje, bojanje,
        pramenovi i njega kose. Besplatan parking. Naručite se online.
Adr:    Shopping Centar Prečko, Josipa Slavenskog 1, 2. kat
Tel:    098 / 1666 353
```

*Intro angle:* the shopping-centre salon — parking, errands in one trip, family-friendly,
children's cuts. Explicitly name the second floor; people get lost in malls.

*Targets:* `frizer Prečko`, `frizerski salon Prečko`, `frizer SC Prečko`,
`frizer Vrbani` `[VERIFY]`, `frizer Špansko` `[VERIFY]`

---

**3 · Sigečica — `/saloni/sigecica`**

```
H1  Frizerski salon Sigečica — Studio Marcela, Hvarska 10
H2  Frizer na Sigečici: šišanje, bojanje, pramenovi i njega kose

Title:  Frizerski salon Sigečica, Zagreb | Studio Marcela, Hvarska 10
Desc:   Frizerski salon na Hvarskoj 10, Sigečica. Šišanje, bojanje, pramenovi
        i tretmani njege kose. Online naručivanje s trenutnom potvrdom.
Tel:    092 / 3193 701
```

*Intro angle:* the neighbourhood salon — regulars, families, the stylist who knows your hair.
Lean into continuity and the colour-formula record (§10.6).

*Targets:* `frizer Sigečica`, `frizerski salon Sigečica`, `frizer Hvarska`,
`frizer Peščenica` `[VERIFY]`

---

**4 · Novi Zagreb — `/saloni/novi-zagreb`**

```
H1  Frizerski salon Novi Zagreb — Studio Marcela, Jaruščica 9A
H2  Frizer u Novom Zagrebu: šišanje, bojanje, pramenovi i balayage

Title:  Frizerski salon Novi Zagreb | Studio Marcela, Jaruščica 9A
Desc:   Frizerski salon u Novom Zagrebu, Jaruščica 9A. Šišanje, bojanje,
        pramenovi, balayage i šminkanje. Naručite se online.
Tel:    092 / 341 5473
```

*Intro angle:* the largest catchment of the seven. Name the surrounding neighbourhoods in
body copy — this is where long-tail local traffic is won.

*Targets:* `frizer Novi Zagreb`, `frizerski salon Novi Zagreb`, `frizer Jaruščica`,
`frizer Sopot` `[VERIFY]`, `frizer Trnsko` `[VERIFY]`, `frizer Siget` `[VERIFY]`

---

**5 · Galleria / Iblerov trg — `/saloni/galleria-iblerov-trg`**

```
H1  Frizerski salon Iblerov trg — Studio Marcela u Galleria Business Centru
H2  Frizer u centru Zagreba, na Iblerovom trgu 10

Title:  Frizerski salon Iblerov trg | Studio Marcela, Galleria BC
Desc:   Frizerski salon u Galleria Business Centru, Trg Drage Iblera 10.
        Brzi termini prije i poslije posla. Naručite se online.
Tel:    099 / 6772 719
```

*Intro angle:* the business-district salon. Early and late slots, express blow-dry, "in and
out between meetings", corporate group arrangements. This is the one location where a
30-minute express service is a genuine product — worth pitching to the client. `[VERIFY]`

*Targets:* `frizer Iblerov trg`, `frizerski salon Galleria`, `frizer Kvaternikov trg`
`[VERIFY]`, `frizerski salon blizu centra Zagreb`

---

**6 · Dubrovnik / Rixos — `/saloni/dubrovnik-rixos`** · EN: `/en/salons/dubrovnik-rixos`

```
H1 (HR)  Frizerski salon Dubrovnik — Studio Marcela u hotelu Rixos Premium
H2 (HR)  Frizer u Dubrovniku: šišanje, bojanje, svečane i vjenčane frizure

H1 (EN)  Hair Salon in Dubrovnik — Studio Marcela at Rixos Premium
H2 (EN)  Haircuts, colour, bridal hair and makeup in Dubrovnik

Title (EN): Hair Salon Dubrovnik | Studio Marcela at Rixos Premium
Desc (EN):  Professional hair salon inside Rixos Premium Dubrovnik. Cuts,
            colour, bridal hair and makeup. Walk-ins and same-day appointments.
Adr:        Hotel Rixos Premium Dubrovnik, Liechtensteinov put 3
Tel:        099 / 5258 154
```

**English-first page.** The audience is hotel guests and visitors searching in English.
Emphasise: no appointment needed for a blow-dry `[VERIFY]`, same-day availability, bridal and
event styling, and that guests of other hotels are welcome. Link prominently to
`/en/weddings/dubrovnik`.

*Targets:* `hairdresser Dubrovnik`, `hair salon Dubrovnik`, `hair salon Rixos Dubrovnik`,
`blow dry Dubrovnik`, `wedding hair Dubrovnik`

---

**7 · Srebreno / Sheraton — `/saloni/dubrovnik-sheraton`** · EN: `/en/salons/dubrovnik-sheraton`

```
H1 (HR)  Frizerski salon Srebreno — Studio Marcela u hotelu Sheraton Dubrovnik Riviera
H2 (HR)  Frizer u Župi dubrovačkoj: vjenčane frizure, šminkanje i njega kose

H1 (EN)  Hair Salon Srebreno, Dubrovnik Riviera — Studio Marcela at the Sheraton
H2 (EN)  Wedding hair, makeup and styling in Župa dubrovačka

Title (EN): Hair Salon Srebreno | Studio Marcela at Sheraton Dubrovnik Riviera
Desc (EN):  Hair and makeup at Sheraton Dubrovnik Riviera, Srebreno. Wedding
            hair, event styling and treatments. Book online.
Adr:        Sheraton Dubrovnik Riviera, Šetalište Dr. F. Tuđmana 17, Srebreno
Tel:        099 / 1644 508
```

**The wedding page in disguise.** A hotel resort salon in a destination-wedding region is a
bridal-party business. Lead with weddings, groups and trials.

*Targets:* `hair salon Srebreno`, `hairdresser Župa dubrovačka`,
`wedding hair Dubrovnik Riviera`, `bridal hair Dubrovnik`, `hairdresser Mlini` `[VERIFY]`

---

### 7.3 Service pages — `/usluge/[slug]`

Fifteen pages (§5.1). These win high-intent commercial searches — someone typing
"balayage Zagreb cijena" is closer to booking than someone typing "frizer".

The current site's contradiction is removed: `/usluge` said *contact us for pricing* while
`/cjenik` published a full list. **Every service page states its price.**

**Template**

| # | Section | Contents |
|---|---|---|
| 1 | Hero | H1 with service + city, hero image, *od X €*, *~N min*, **Naruči se** |
| 2 | What it is | 100–150 words, plain language, no jargon without explanation |
| 3 | Who it suits | Hair types, situations, and honestly — who it does *not* suit |
| 4 | How it works | Numbered steps with realistic timings |
| 5 | Price table | By hair length: kratka / poluduga / duga / extra duga / ekstenzije |
| 6 | What's included | Explicit list, and what costs extra |
| 7 | Aftercare | Which Silky products and why — supports future retail |
| 8 | Gallery | Real results for *this* service, filtered |
| 9 | Specialists | Stylists certified for this service, each bookable |
| 10 | Available at | All seven locations, linked |
| 11 | FAQ | 5–8 questions, `FAQPage` schema |
| 12 | Related | 3 related services |
| 13 | CTA | Book this service |

**Example — `/usluge/balayage`**

```
H1     Balayage u Zagrebu — mekani prijelazi koji rastu bez oštre linije
Sub    Od 50 €  ·  2–4 sata  ·  Dostupno u svih 7 studija

Title: Balayage Zagreb — cijena, trajanje i termini | Studio Marcela
Desc:  Balayage pramenovi u Zagrebu od 50 €. Ručno slikana tehnika bez oštrog
       izrasta. Vidite cijenu i trajanje, naručite se online.
```

*What it is:*

> Balayage je tehnika kod koje boju nanosimo slobodnom rukom, bez folija, tako da prijelaz
> prema svjetlijem ide postupno. Rezultat izgleda kao kosa posvijetljena suncem — i, što je
> praktičnije, raste bez oštre linije izrasta.
>
> Zbog toga se balayage obnavlja rjeđe nego klasični pramenovi: umjesto svakih šest do osam
> tjedana, obično svakih tri do četiri mjeseca. Skuplji je po posjetu, jeftiniji kroz godinu.

> The last sentence handles the price objection directly instead of hoping nobody notices.

*Who it does not suit:* say it plainly — very dark, previously box-dyed or heavily damaged
hair may need a correction first. Being honest here prevents the worst kind of appointment:
one that cannot deliver what was expected. It also builds the trust the brand claims to sell.

**Sales rules for every service page**

- The price is visible without scrolling on mobile.
- Duration is stated as a realistic range, never a single optimistic number.
- The primary CTA books *this service*, pre-selected.
- Never "contact us for pricing".
- Where a service has a package equivalent (colour → 55 € all-inclusive), show the comparison.
  This is the single highest-value upsell on the site.

---

### 7.4 Stylist pages — `/tim/[slug]`

Currently there is **no stylist anywhere on the site.** 57% of salon clients prefer booking a
named stylist, and clients bond with people rather than brands — which is what turns a first
visit into a regular.

**Template:** portrait (`PPL-01`) and at-work image (`PPL-02`); name and role; home salon,
linked; years of experience; specialities as tags; a short first-person introduction
(60–100 words, in their own voice — not marketing copy); certifications; their portfolio
(filtered gallery); their reviews; **their live availability with a direct book action**;
languages spoken (matters in Dubrovnik).

**Index `/tim`** — filterable by salon, service and language.

`Person` schema, `worksFor` the salon, `image`, `jobTitle`, `knowsLanguage`.

Privacy: staff choose whether their surname is published. First name plus initial is the
default. `[VERIFY]` — confirm the policy with the client, and get written consent per person
before any portrait publishes.

---

### 7.5 Price list — `/cjenik`

The full catalogue from §26, grouped, searchable, and filterable by location where prices
differ. Every row links to booking with that service pre-selected.

Header note (HR):

```
Cijene vrijede za sve studije osim gdje je drukčije naznačeno. Konačna cijena
ovisi o dužini i gustoći kose — stilist će vam je reći prije početka rada.
```

**Missing prices to resolve before launch** `[CLIENT]`: AirTouch and flamboyage are marketed
across the current site but appear nowhere in the published price list. Either price them or
stop marketing them.

---

### 7.6 Weddings — `/vjencanja` and `/en/weddings/dubrovnik`

The largest untapped opportunity in the business. Studio Marcela has bridal hair, bridal
makeup, mobile service, group bookings, and salons inside two Dubrovnik resort hotels — and
no content targeting destination weddings at all.

Destination-wedding couples plan six to eighteen months ahead, search in English, and buy
packages for a whole bridal party rather than a single service.

**`/vjencanja`** (HR) — domestic weddings: trials, the morning-of timeline, mobile service,
group pricing, the bridal party.

**`/en/weddings/dubrovnik`** (EN, the priority page) —

| # | Section |
|---|---|
| 1 | Hero — `OTH-02`, Adriatic light, "Wedding hair and makeup in Dubrovnik" |
| 2 | Two salons inside Rixos Premium and Sheraton Dubrovnik Riviera — plus we travel to your venue |
| 3 | Packages: bride only / bride + party / full day with touch-ups |
| 4 | The trial — how it works remotely for couples arriving days before |
| 5 | Timeline — what happens on the morning, hour by hour |
| 6 | Real weddings gallery |
| 7 | Testimonials from couples |
| 8 | For planners and venues — a partnership block |
| 9 | Enquiry form (not the standard booking flow — see §9.10) |
| 10 | FAQ: travel fees, group sizes, deposits, timings, humidity, veils |

**Distribution beyond the site** `[CLIENT]`: hotel concierge desks at both properties,
wedding planners operating in Dubrovnik, and the existing vjencanja.hr listing. The page is
the asset; the concierge relationship is the channel.

---

### 7.7 Frizer to Go — `/frizer-to-go`

Replaces "contact us for prices" with real prices (Frizura to go 70 €, Vjenčana frizura to go
80 €, Makeup to go 95 €), a defined coverage map with travel zones and surcharges `[CLIENT]`,
what the stylist brings, what the client needs (a chair, a socket, water), and a real booking
flow (§9.11) rather than a phone number.

`/grupne-usluge` sits alongside it — weddings, corporate, celebrations, enquiry-led (§9.10).

### 7.8 About — `/o-nama`

Jadranka's story properly told, the Silky partnership, the sixteen-year timeline, the growth
to seven studios, the standards, and the training programme.

This page currently contains the best material on the site and receives the least traffic.
The homepage now feeds it (§7.1 section 8), and the Silky story earns its own anchor for
linking from service pages.

### 7.9 Gallery — `/galerija`

Rebuilt as the sales engine described in §6.5. Filter by service, stylist, location, hair
length and colour technique. Every item carries a stylist credit (linked), a service (linked),
and **"Rezerviraj ovaj izgled"**, which opens booking pre-filled with that service and that
stylist. Before/after items use `BeforeAfterSlider`. Lightbox with keyboard navigation and
swipe.

The current gallery is 39 uncategorised, uncredited images — the highest-converting asset a
salon owns, used as wallpaper.

### 7.10 Blog — `/blog` and `/blog/[slug]`

The eight existing posts migrate to individual indexed URLs with publication dates, stylist
authorship and `Article` schema. Currently only `/blog` appears in the sitemap, so eight
pieces of genuine content earn nothing.

Each post links to at least one service page and one location page in body copy (§5.4).
Ongoing cadence and topic pillars in §23.3.

### 7.11 Careers — `/karijere`

A real recruitment page: what it pays `[CLIENT]`, the training programme, the Silky education,
growth from junior to senior, current openings, and an application form with CV upload.

Staffing is the binding constraint on a seven-salon business. Treat this as a revenue page,
not an afterthought.

### 7.12 Contact — `/kontakt`

All seven with full NAP, hours, map, WhatsApp and a contact form. It stops being the de-facto
locations page once §7.2 exists, but it stays for direct queries.

### 7.13 Support pages

**`/faq`** — the full FAQ set, grouped, searchable, `FAQPage` schema.
**`/loyalty`** — programme rules, how to join, balance lookup for members.
**`/pravila-otkazivanja`** — a clear cancellation and deposit policy. Required before deposits
go live (§9.6) and linked from every booking confirmation.
**`/pravila-privatnosti`**, **`/uvjeti-koristenja`** — per §20.

### 7.14 System pages

404 with a search box and links to the seven salons; 500; and a maintenance page. All branded,
all with a route back to booking.

---

## 8. Conversion architecture

### 8.1 CTA hierarchy

One primary action on the site: **Naruči se**. Everything else is secondary.

| Level | Style | Used for |
|---|---|---|
| Primary | Solid `--clay-600` | Naruči se, Potvrdi termin, Rezerviraj |
| Secondary | Outline | Pogledaj cjenik, Pogledaj salon, Upoznaj tim |
| Tertiary | Text + arrow | Cijeli cjenik →, Sve usluge → |
| Utility | Ghost icon | Call, WhatsApp, directions, share |

Never two primary buttons in one viewport. Never a primary button that does not lead toward
a booking.

### 8.2 Persistent booking access

- **Desktop:** primary button in the sticky header at all scroll positions.
- **Mobile:** a bottom bar appears after 40% scroll depth with **Naruči se** plus a call icon.
  It hides while a form field is focused so it never covers the keyboard.
- **Location and service pages:** the CTA is pre-scoped ("Naruči se u Prečko", "Rezerviraj
  balayage") — a pre-filled booking converts materially better than a generic one.

### 8.3 Trust signals, placed deliberately

| Signal | Where |
|---|---|
| Google rating and review count, per location | Location hero, footer |
| "Potvrda termina odmah" | Beside every booking CTA |
| "Bez plaćanja unaprijed" *or* the deposit amount | Booking step 4, stated before any commitment |
| "Besplatno otkazivanje do 24 h prije" | Booking step 4, confirmation email |
| Silky partnership mark | Footer, service pages, about |
| Named stylist with portrait | Service pages, location pages, booking step 3 |
| 16 years / 7 studios | Trust bar |
| Real client photography | Everywhere — the strongest signal on the site |

### 8.4 Objection handling

Each objection is answered at the exact point it arises, not buried in an FAQ.

| Objection | Answered by | Where |
|---|---|---|
| "I don't know what it costs" | Price on every card, before selection | Service tiles, §9.3 |
| "I don't know how long it takes" | Duration on every card | Service tiles |
| "It'll cost more than quoted" | "Stilist će vam reći točan iznos prije početka rada. Nikad nakon." | Hero offer, price list |
| "I don't know who'll do my hair" | Named stylists with portfolios | Step 3, stylist pages |
| "I don't want to phone" | Full online flow, instant confirmation | Everywhere |
| "What if I need to change it?" | Self-service reschedule link in every confirmation | §9.8 |
| "Will they be able to do what I want?" | Honest "who this doesn't suit" copy | Service pages |
| "Is parking a problem?" | Getting-here section per location | §7.2 |
| "Do they speak English?" | Language tags on stylist cards | Dubrovnik pages |

### 8.5 Abandonment recovery

- Booking state persists in `localStorage` for 7 days. Returning visitors resume where they
  left off with a single "Nastavite gdje ste stali?" prompt.
- If a phone number was entered before abandonment and marketing consent was given, one SMS
  after 2 hours: *"Vaš termin nije dovršen. Nastavite ovdje: [link]"* — **once only**, never
  repeated, unsubscribable. Requires explicit consent capture (§20.1).
- No exit-intent popups. No countdown timers. No fake scarcity. Genuine scarcity ("posljednji
  slobodan termin ovaj tjedan kod Ane") is shown **only when true**, computed from live
  availability.

---

## 9. Booking system

### 9.1 Principles

1. **Three decisions maximum:** where, what, when. Everything else is pre-filled, defaulted,
   or asked after the appointment is already secured.
2. **Real availability, never a request form.** 59% of clients abandon when there is no
   instant confirmation.
3. **Price and duration visible before every choice.**
4. **Mobile-first.** Designed for one thumb on a 375 px screen.
5. **No account required.** Ever. An account is offered after confirmation, never before.
6. **Context carries.** Arriving from a location, service or stylist page pre-fills that
   choice and the step is skipped.

### 9.2 Entry points and deep links

Booking state lives in the URL so every entry point can pre-fill it, and so campaigns can
link straight into a partly-completed flow.

```
/narucivanje                                    cold start
/narucivanje/precko                             location pre-selected
/narucivanje/precko/balayage                    + service
/narucivanje/precko/balayage?stylist=ana-k      + stylist
/narucivanje?paket=pramenovi-95                 all-inclusive package
/narucivanje?rebook=<appointmentId>             one-tap rebook of a past visit
/narucivanje?gallery=<imageId>                  "book this look" from the gallery
```

Every URL is server-rendered, indexable where useful, and shareable. Google Ads campaigns
link directly to service-scoped URLs, which alone should move cost-per-booking materially.

### 9.3 The flow

**Step 0 — Entry.** Skipped when context supplies the answer.

**Step 1 — Where**

Location cards: photo, district, address, today's hours, live open/closed, distance if
geolocation was granted (on tap, never automatic), and the earliest available slot —
*"Prvi slobodan termin: danas 16:30"*. That last line is the highest-converting element in
the entire flow; it turns an abstract choice into an immediate one.

**Step 2 — What**

A **cart**, not a single selection. Real clients book a cut *and* a colour; the current site
cannot express that.

- Categories as tabs, all-inclusive packages first.
- Every tile: name, *od X €*, *~N min*, and a "što uključuje" disclosure.
- **Hair-length selector** (kratka / poluduga / duga / extra duga / ekstenzije) which
  recalculates price and duration live. This is how the published price list already works;
  the booking flow must reflect it.
- Adding a second service updates the total price and total duration in a sticky summary bar.
- Where a chosen combination is cheaper as a package, an inline prompt says so:
  *"Bojanje + šišanje + fen = 55 € kao paket. Uštedite 14 €."* — an honest upsell that
  raises average value while the client feels they won.

**Step 3 — Who and when**

- **"Prvi slobodni stilist"** is the default and the visually prominent option. Most clients
  do not have a preference, and forcing the choice loses them.
- Named stylists below: portrait, speciality, and their next available slot. Only stylists
  certified for every service in the cart are shown (§10.5 skills matrix).
- Calendar: next 60 days, days with no availability disabled and visibly so.
- Time slots grouped *Jutro / Popodne / Navečer*.
- Slots are computed by §9.5 and held for **10 minutes** once selected, with a visible timer.

**Step 4 — Confirm**

Fields, in this order: first name, last name, mobile, email, optional note.
Then, before any commitment is asked for:

- Full summary: salon, services, stylist, date, time, total duration, total price.
- Deposit amount if applicable, stated plainly, with a link to the cancellation policy.
- Consent checkboxes, unticked by default, separated (§20.1).

**Verification replaces reCAPTCHA.** A 6-digit SMS code to the entered number. It removes
374 KB, removes an accessibility barrier, and — unlike a CAPTCHA — validates the one piece of
data the salon actually needs to be correct. Returning devices with a valid `deviceToken`
skip it.

**Step 5 — Confirmed**

Immediate on-screen confirmation with the booking reference, plus: add to Apple/Google
Calendar, an `.ics` download, directions, the stylist's name and photo, what to bring or
expect, a manage-booking link, and a soft prompt to save an account (password-less, magic
link). Confirmation email and SMS dispatch within seconds.

### 9.4 Pricing and duration engine

Price and duration are both functions of `(service, hairLength, stylistTier, location)`.

```
basePrice(service, location)
  + lengthSurcharge(service, hairLength)          e.g. "Nadoplata za dužinu/gustoću" 7 €
  + stylistTierSurcharge(stylist)                 senior/master, if the client opts for it
  + addOns[]
  − packageDiscount(cartContents)
```

Rules:

- Prices displayed as *"od X €"* whenever any modifier can apply. Never a bare number that
  might change.
- Once hair length is chosen, the display switches to an exact figure.
- Duration follows the same model, expressed as a realistic range.
- All prices and durations are editable per location in the dashboard, never in code.
- A price change never alters an already-confirmed appointment. The agreed price is frozen
  onto the appointment record at booking time.

### 9.5 Availability algorithm

This is the hardest part of the system and the part that most competitors get wrong.

A slot at time `t` for stylist `s` is available when **all** hold:

1. `t` falls within `s`'s working hours for that date at that location (§10.4).
2. `t` is not inside an approved absence — holiday, sick leave, training (§10.4).
3. `t` is not inside a manual block (lunch, admin, personal).
4. The full service duration fits before the shift ends.
5. `s` holds the required skill for every service in the cart (§10.5).
6. Required **resources** are free for their portion — basins, colour bar, an AirTouch dryer
   (§11 `Resource`).
7. No overlapping appointment exists — **except** as permitted by processing-time overlap.
8. Buffers before and after are respected (per service, configurable).
9. `t` is at least `minimumNotice` from now (per service; a colour needs more notice than a cut).
10. `t` is no further ahead than `maximumHorizon` (default 90 days).

#### Processing-time overlap — the feature that pays for the project

A colour service is not one continuous block of stylist attention. It is:

```
ACTIVE 45 min   (application — stylist required)
PASSIVE 35 min  (development — stylist NOT required, chair and client occupied)
ACTIVE 40 min   (wash, tone, cut, blow-dry — stylist required)
```

Almost every booking system blocks all 120 minutes of stylist time. Salons therefore either
lose that capacity or juggle it by hand on paper.

Modelling services as an ordered list of `ACTIVE`/`PASSIVE` segments lets the scheduler place
another client's `ACTIVE` segment inside the first client's `PASSIVE` window — while still
holding the chair, the client and any required resource.

**This is worth roughly 20–30% more capacity per stylist with no new hires.** It is the single
most valuable thing in this specification.

Guard rails, because unlimited overlap ruins service quality:
- `maxConcurrentClients` per stylist, default **2**, configurable per stylist and location.
- A minimum gap between two `ACTIVE` starts, so nobody is double-booked to the second.
- Overlap can be disabled entirely per stylist (juniors) or per service (bridal — never).
- The dashboard renders overlap explicitly so a manager can see and override it.

**Implementation note.** Compute availability server-side, in the salon's timezone
(`Europe/Zagreb`), over a materialised per-stylist-per-day slot map, cached and invalidated
on any change to appointments, shifts, absence or blocks. Never compute in the client.
All timestamps stored in UTC; all display converted. DST transitions have explicit tests
(§21.3) — Croatia observes DST and a naive implementation breaks twice a year.

### 9.6 Deposits and payments

Deposits cut no-shows by roughly 45%; combined with the reminder sequence in §9.7, no-shows
should fall below 5% from an industry-typical 15%.

**Recommended policy** `[CLIENT]` — final call is the client's:

| Service class | Deposit |
|---|---|
| Cuts, blow-dry, men's, children's | None |
| Colour, highlights, balayage, AirTouch | €15 |
| All-inclusive packages (95 € / 55 €) | €20 |
| Keratin, pH-C5, extensions | €25 |
| Bridal, trials, group bookings | 30% |
| Frizer to Go | 30% |
| Any client with 2+ prior no-shows | Deposit on everything, automatic |

That last rule matters: it targets the actual problem rather than taxing reliable clients.

- Deposit is deducted from the final bill and never charged twice.
- Refunded automatically on cancellation ≥ 24 h before; forfeited under 24 h; always refunded
  if the salon cancels.
- Provider: **Stripe** (cards, Apple Pay, Google Pay). Evaluate a Croatian PSP for lower
  domestic card fees `[VERIFY]`.
- Balance is paid in salon as today. The site never becomes a till (§20.2).
- PCI: Stripe Elements only. Card data never touches our servers.

### 9.7 Confirmations and reminders

| When | Channel | Content |
|---|---|---|
| Immediately | Email + SMS | Confirmation, reference, `.ics`, manage link |
| 72 h before *(colour, bridal, keratin only)* | Email | Preparation notes, "still coming?" |
| 24 h before | SMS | Reminder + one-tap confirm / reschedule |
| 2 h before | SMS | Short reminder + directions |
| 2 h after | Email | Thank you, aftercare, review request, rebook link |
| 6 weeks after *(colour)* | SMS | Rebook prompt timed to regrowth |

SMS is read within five minutes by 80% of recipients. Reminders alone cut no-shows 35–50%.

Every message is Croatian or English per the client's booking locale, sender-identified as
Studio Marcela, and carries an unsubscribe path for anything non-transactional. Reminders are
transactional; the 6-week rebook prompt is marketing and requires consent (§20.1).

Provider: **Infobip** — a Croatian company, with better domestic deliverability and pricing
than Twilio, and an alphanumeric sender ID for Croatian networks `[VERIFY]`.

### 9.8 Cancellation, rescheduling, no-shows

Self-service via a tokenised link — `/moj-termin/[token]` — in every confirmation. No login.
Token is single-purpose, expires 24 h after the appointment, and is revoked on cancellation.

- **Reschedule:** full availability picker; the deposit carries across.
- **Cancel:** reason optional; refund applied per policy; the slot returns to availability and
  the waitlist fires (§9.9).
- **No-show:** marked by staff only, never automatic. Recorded on the client record, counts
  toward the automatic-deposit rule, and is reversible by a manager.

Cancellation policy `[CLIENT]`, recommended: free until 24 h before; inside 24 h the deposit
is retained; the salon always refunds in full when it cancels.

### 9.9 Waitlist

The current system already carries a `waitingListMode` field, so the intent exists.

A client whose preferred day is full opts into *"Javite mi ako se nešto oslobodi"*, choosing
date ranges and times that would work. When a slot opens, the system notifies matching
clients in order — best match first, not first-come — with a link that holds the slot for
**15 minutes**. Maximum three notifications per client per week.

### 9.10 Group and bridal bookings

Structurally different from a single appointment: multiple people, multiple services,
sequenced so everyone finishes by a fixed time, often with more than one stylist and
sometimes off-site. Forcing this into the standard flow produces a bad booking and a bad day.

**Enquiry-first**: event type, date, location or venue, number of people, services per person,
the time everyone must be ready by, and contact details. It creates an `Enquiry` in the
dashboard with an SLA (respond within 1 working day), from which a manager builds a
multi-appointment `GroupBooking` with a shared reference and a deposit invoice.

The morning-of timeline is generated backwards from the ready-by time and sent to the client
as a schedule — the single thing bridal clients most want and least often get.

### 9.11 Frizer to Go

- Client enters an address; the system resolves it to a travel zone `[CLIENT]`.
- Travel surcharge applied per zone and shown before confirmation.
- Extra buffer for travel is added around the appointment automatically.
- Only stylists flagged `mobileEnabled` are offered.
- Address, floor, lift, parking and a contact number are captured as required fields.
- 30% deposit, given the travel commitment.

### 9.12 Edge cases

Every one of these has a defined behaviour and a test (§21).

| Case | Behaviour |
|---|---|
| Two clients select the same slot | Optimistic hold, 10 min TTL; loser sees "Termin je upravo rezerviran" and the nearest alternatives, with their cart intact |
| Hold expires mid-form | Non-destructive banner; re-select time; nothing else is lost |
| Stylist becomes unavailable after booking | Manager reassigns; client notified with an accept/reschedule choice |
| Salon closes unexpectedly | Bulk cancel with one message to all affected; automatic full refunds |
| Service removed while in a cart | Cart flags it; the rest survives |
| Price changes after booking | Confirmed appointments keep the agreed price |
| Client books across the DST boundary | Stored UTC, displayed Europe/Zagreb; explicitly tested |
| Duplicate submit / double tap | Idempotency key on the create endpoint |
| Invalid or non-HR phone | Libphonenumber validation, `+385` default, international accepted |
| SMS never arrives | Resend after 60 s; after two failures, offer email verification |
| Client books 4 appointments in a day | Allowed, but flagged for manager review |
| Bot / scripted booking | Rate limit by IP and device; SMS verification; honeypot |
| Under-18 booking | Guardian contact required for under-16s `[VERIFY]` |
| Client blocked | Silent decline into a "please call the salon" state |

### 9.13 Client account (optional, post-booking)

Password-less magic link. Never required.

Contains: upcoming and past appointments, one-tap rebook, saved stylist and salon
preferences, colour history (read-only, from §10.6), loyalty balance, saved consents, invoices
and receipts, and full GDPR self-service — export and deletion (§20.1).

---

## 10. Dashboard — `/app`

Replaces the phone, the paper diary, the WhatsApp threads and the spreadsheet. The design
target: **a manager should be able to run a full day from a phone, and a stylist should never
need to open anything except "Danas".**

### 10.1 Roles and permissions

Five roles. Permissions are additive; every user has exactly one role plus a set of location
assignments.

| | Owner | Manager | Stylist | Reception | Accountant |
|---|:---:|:---:|:---:|:---:|:---:|
| **Scope** | All 7 | Assigned | Self | Assigned | All 7 |
| View own schedule | ✓ | ✓ | ✓ | ✓ | — |
| View all schedules at their location | ✓ | ✓ | ✓ read-only | ✓ | — |
| View schedules at other locations | ✓ | — | — | — | — |
| Create / edit / move appointments | ✓ | ✓ | own only | ✓ | — |
| Cancel appointments | ✓ | ✓ | request | ✓ | — |
| Mark no-show | ✓ | ✓ | ✓ | ✓ | — |
| Override availability rules | ✓ | ✓ | — | — | — |
| Edit **working hours** for staff | ✓ | ✓ | — | — | — |
| Approve **absence / holiday** | ✓ | ✓ | request | request | — |
| Create / edit staff accounts | ✓ | ✓ own location | — | — | — |
| Deactivate staff | ✓ | — | — | — | — |
| Edit services and prices | ✓ | ✓ own location | — | — | — |
| Edit salon opening hours | ✓ | ✓ own location | — | — | — |
| View client records | ✓ | ✓ | own clients | ✓ | — |
| Edit colour formulas | ✓ | ✓ | ✓ | — | — |
| Export client data | ✓ | — | — | — | — |
| View revenue, own location | ✓ | ✓ | — | — | ✓ |
| View revenue, all locations | ✓ | — | — | — | ✓ |
| View own performance stats | ✓ | ✓ | ✓ | — | — |
| View others' performance stats | ✓ | ✓ own location | — | — | ✓ |
| Issue refunds | ✓ | ✓ ≤ €50 | — | — | — |
| Manage loyalty | ✓ | ✓ | — | ✓ | — |
| Publish gallery images | ✓ | ✓ | submit | — | — |
| View audit log | ✓ | ✓ own location | — | — | — |
| Manage integrations / settings | ✓ | — | — | — | — |

**Rules**

- A Stylist can *see* colleagues' schedules at their own salon (they need to know who is on
  the floor) but can never edit them.
- A Stylist can request a change to their own appointment; it queues for manager approval.
- Everything destructive is soft-delete plus audit log (§10.10).
- Every permission check happens server-side. Hiding a button is presentation, not security.

### 10.2 Screens

```
/app                         Today (role-dependent landing)
/app/kalendar                Calendar — day / week / staff view
/app/termini                 Appointment list, filterable
/app/termini/[id]            Appointment detail
/app/klijenti                Client list
/app/klijenti/[id]           Client record
/app/moj-raspored            My schedule (stylist)
/app/odsutnost               Absence — requests and approvals
/app/osoblje                 Staff list
/app/osoblje/[id]            Staff member: profile, hours, skills, absence, stats
/app/raspored-rada           Working hours and shift planning
/app/usluge                  Services, prices, durations, per location
/app/saloni                  Locations, opening hours, resources, holidays
/app/galerija                Portfolio submissions and approval queue
/app/upiti                   Enquiries — group, bridal, Frizer to Go
/app/izvjestaji              Reports
/app/loyalty                 Loyalty administration
/app/postavke                Settings, integrations, notification templates
/app/dnevnik                 Audit log
```

### 10.3 Today

The landing screen, different per role.

**Stylist** — a single vertical timeline of their day. Each block: time, client name, service,
duration, colour-formula shortcut, and a note flag. Actions: check in, mark complete, mark
no-show, add a note, photograph the result. A summary strip: appointments today, hours
booked, first gap, finish time. Nothing else. This screen must load in under a second on a
mid-range Android on salon wifi.

**Manager / Reception** — the whole floor: every stylist as a column, live status per chair,
today's arrivals, unconfirmed bookings, pending absence requests, gaps worth filling, and the
day's expected revenue. A "gaps" panel lists unfilled slots with a one-tap action to notify
the waitlist.

**Owner** — all seven locations in one view: today's bookings, utilisation and revenue per
salon, exceptions needing attention (understaffed days, pending approvals, unusual
cancellation rates), and week-on-week movement.

### 10.4 Calendar and schedule management

The operational core.

**Views** — Day (one location, stylists as columns), Week (one stylist, or one location
condensed), Staff (resource columns), Month (overview and planning only), Agenda (mobile
list). Location switcher for multi-location roles.

**Interactions**

- Drag an appointment to move it; drag its edge to change duration. Both validate against
  §9.5 and refuse invalid drops with a reason, not a silent snap-back.
- Click an empty slot to create — a fast form: client (search or create), service, stylist,
  time, note.
- Colour coding by service category, with a legend. Status shown by border treatment
  (confirmed / arrived / in progress / complete / no-show / cancelled).
- **Processing-time overlap is drawn explicitly** — the passive window is hatched, so it is
  obvious that a stylist is free during a development period and that a second client sits
  inside it. Without this the calendar looks double-booked and staff will not trust it.
- Walk-in entry in two taps.
- Manual blocks: lunch, admin, training, personal — with a reason.
- Undo on every destructive action, 30 seconds.
- Conflicts surface as a banner listing every affected appointment, never a silent overwrite.

**Real-time.** Multiple staff use this simultaneously. Changes propagate over WebSocket, with
optimistic local updates and reconciliation. Two people editing the same appointment: last
write wins with a visible "izmijenjeno" warning and the audit log recording both.

### 10.5 Staff management

> This is the section the client specifically asked for: *everything a manager does, in one
> place.*

#### 10.5.1 Staff record — `/app/osoblje/[id]`

**Profile** — name, photo (doubles as the public `PPL-01` portrait), role, employment type
(full-time / part-time / contractor / apprentice), start date, home location, additional
locations they may cover, phone, email, emergency contact `[VERIFY: what the client is
permitted to store — see §20.1]`, languages, public-profile visibility toggle, and the
biography shown on `/tim/[slug]`.

**Working hours** — the scheduling foundation.

- A **recurring weekly pattern** per location: e.g. Mon–Wed 09:00–17:00 Prečko,
  Thu–Fri 12:00–20:00 Ilica, Sat 08:00–14:00 Prečko.
- **Alternating-week patterns** (A/B weeks), because salon rotas commonly alternate Saturdays.
- **Date-specific overrides** that beat the pattern without editing it.
- Break rules: automatic unpaid break after N hours, or explicitly placed.
- Effective-dated: changing hours from 1 September does not rewrite August's history, and does
  not disturb appointments already booked.
- **A change that would orphan existing appointments is blocked**, with a list of the
  conflicts and three options: reassign, contact the clients, or override deliberately.

**Shift planning — `/app/raspored-rada`**

- Grid: staff down, days across, for one location, one week or one month.
- Publish a rota; staff are notified; unpublished drafts are invisible to them.
- Copy last week; apply a template; bulk-assign.
- Coverage warnings: opening hours with nobody rostered, or a day with no one qualified for
  colour.
- Export to CSV/PDF for the staff-room wall.
- Cost projection per week where hourly rates are recorded `[CLIENT — optional, sensitive]`.

**Absence — `/app/odsutnost`**

Types: annual leave (godišnji odmor), sick leave (bolovanje), unpaid leave, training/education,
public holiday, parental leave, other.

- Staff request from their own account: type, dates, half-day support, note.
- Manager approves or declines with a reason; both parties are notified.
- **On approval the time is immediately removed from bookable availability.**
- If an approved absence collides with existing appointments, the system lists them and
  requires a resolution — reassign to a colleague, or cancel and notify — before it commits.
- Annual-leave entitlement per person per year, with used/remaining balance. Croatian statutory
  minimum is 4 weeks; the client's actual policy must be configured `[CLIENT]`.
- Team absence calendar so managers can see coverage before approving.
- Configurable rule: maximum N staff on leave simultaneously per location.
- Croatian public holidays pre-loaded, per year, editable — a salon may open on some.

**Skills matrix**

Per stylist, per service: `NOT_TRAINED / IN_TRAINING / CERTIFIED / TRAINER`, with a
certification date and optional expiry.

This drives booking directly: **only `CERTIFIED` (or `TRAINER`) stylists are offered for a
service.** It prevents the worst operational failure a salon has — a client booked for
AirTouch with someone who has never done one.

`IN_TRAINING` staff can be booked only when a `TRAINER` is rostered at the same time.

**Performance** — appointments completed, revenue, average ticket, rebooking rate,
utilisation, no-show rate for their clients, new vs returning, service mix, retail attachment,
and average rating. Visible to the stylist for themselves; to managers for their location.

> Treat these numbers carefully. They are a coaching tool. If they become a leaderboard,
> staff will begin gaming them — refusing difficult clients, rushing services. Recommend to
> the client that individual figures are not published across the team. `[VERIFY]`

**Onboarding / offboarding** — a new-starter checklist (account, skills, hours, portrait,
public profile, training). Deactivation preserves all history, removes access immediately,
reassigns future appointments, and hides the public profile — never deletes.

### 10.6 Client records — `/app/klijenti/[id]`

**Colour formulas are the highest-value data a salon owns**, and most salons keep them on
index cards that get lost when a stylist leaves.

Per client: contact details and consents; full visit history with stylist, services, price and
duration; **per-visit colour formula** (product, shade, developer, ratio, processing time,
result note, and what to change next time); photographs per visit (with consent); allergies
and patch-test dates (a legal and safety matter for colour, not a nicety); preferences
(temperature, drink, conversation, parting); notes, staff-visible only; no-show and late
history; loyalty balance; lifetime value; and next suggested appointment based on their
colour cycle.

Merge duplicates. Full-text search across name, phone, email and note.

Patch tests: for first-time colour clients, record the test date and warn if a colour
appointment is booked without a valid one `[VERIFY — confirm the client's obligation and
practice]`.

### 10.7 Portfolio approval — `/app/galerija`

Stylists upload finished work from their phone against the appointment. It queues for manager
approval with the service, stylist, location, hair length and technique auto-tagged from the
appointment record. Approved images publish to `/galerija`, to the stylist's profile, and to
the relevant service page.

**Client consent is captured in the same flow** and stored on the client record. An image
without a recorded consent cannot be approved — enforced, not advisory.

### 10.8 Reporting — `/app/izvjestaji`

| Report | Answers |
|---|---|
| Revenue | By location, stylist, service, day/week/month, vs last period |
| Utilisation | % of rostered hours actually booked — the number that governs profitability |
| No-shows and cancellations | Rate, trend, by client, by service, deposit effectiveness |
| Rebooking rate | % leaving with a next appointment — the best retention predictor |
| New vs returning | By location and by acquisition source |
| Service mix | What sells, what does not, average ticket |
| Stylist performance | Per §10.5 |
| **Acquisition** | Bookings by source: organic, paid, direct, social — joined to Google Ads via the `adAttribution` field the current system already collects |
| Waitlist conversion | Notifications sent vs booked |
| Capacity forecast | Rostered vs booked, 4 weeks ahead, flagging under- and over-staffed days |

Every report: date range, comparison period, CSV export, and a scheduled email option.

The acquisition report is the one that changes how the business spends money — for the first
time the owner will know what a booked appointment costs by channel.

### 10.9 Reviews and reputation

Post-visit review requests (§9.7) route to the **correct location's** Google Business Profile.
Ratings are pulled back per location for display on location pages and in reports. Low ratings
raise an internal alert so a manager can respond before the review sits unanswered.

No review gating — do not route happy clients to Google and unhappy ones to a private form.
It violates Google's policies and it is dishonest.

### 10.10 Audit log — `/app/dnevnik`

Every mutation: who, what, when, before, after, IP. Appointments, prices, staff records,
absence approvals, client data access, refunds, permission changes. Immutable, retained
24 months, filterable, exportable.

This exists for three reasons: resolving "who moved my appointment", GDPR accountability
(§20.1), and deterring misuse of client data.

### 10.11 Dashboard non-functional requirements

- Installable PWA with an offline read-only view of today's schedule. Salon wifi is unreliable
  and a stylist must still know their day.
- Every list view is keyboard-navigable and screen-reader labelled.
- Sub-second interactions on a mid-range Android.
- Session: 12 hours on a trusted device, 30 minutes idle on a shared reception terminal.
- Optional 2FA, mandatory for Owner and Accountant.
- All times displayed in `Europe/Zagreb` regardless of device timezone.
- Full Croatian UI, with English available — staff choose per account.

---

## 11. Data model

PostgreSQL. Prisma schema, abbreviated to fields that carry meaning. All tables get
`id (uuid) · createdAt · updatedAt · deletedAt (nullable, soft delete)`.

```prisma
// ─── Organisation ────────────────────────────────────────────────

model Location {
  slug              String   @unique        // "precko"
  name              String                   // "Studio Marcela Prečko"
  displayName       String                   // "Prečko"  ← used in H1s, never "Studio Marcela II"
  addressStreet     String
  addressCity       String
  addressPostal     String
  addressCountry    String   @default("HR")
  latitude          Decimal
  longitude         Decimal
  phone             String
  whatsapp          String?
  email             String?
  timezone          String   @default("Europe/Zagreb")
  googlePlaceId     String?                  // review sync + GBP alignment
  floorNote         String?                  // "2. kat, SC Prečko"
  parkingNote       String?
  transportNote     String?
  isActive          Boolean  @default(true)
  isHotelSalon      Boolean  @default(false) // Rixos, Sheraton
  primaryLocale     String   @default("hr")  // "en" for Dubrovnik
  sortOrder         Int
}

model OpeningHours {                          // salon hours, not staff hours
  locationId        String
  dayOfWeek         Int                       // 0=Sun … 6=Sat
  opensAt           String                    // "09:00"
  closesAt          String                    // "20:00"
  isClosed          Boolean  @default(false)
  @@unique([locationId, dayOfWeek])
}

model OpeningHoursException {                 // holidays, one-offs
  locationId        String
  date              DateTime  @db.Date
  isClosed          Boolean
  opensAt           String?
  closesAt          String?
  reason            String?
}

model Resource {                              // basins, colour bar, AirTouch dryer
  locationId        String
  name              String
  type              ResourceType
  quantity          Int      @default(1)
}

// ─── People ──────────────────────────────────────────────────────

model User {                                  // every staff member
  email             String   @unique
  phone             String?
  passwordHash      String?                   // null when magic-link only
  role              Role
  firstName         String
  lastName          String
  publicSlug        String?  @unique          // "ana-k" → /tim/ana-k
  publicFirstNameOnly Boolean @default(true)
  displayTitle      String?                   // "Senior stilist"
  bioHr             String?
  bioEn             String?
  photoUrl          String?
  languages         String[]
  employmentType    EmploymentType
  startDate         DateTime @db.Date
  endDate           DateTime? @db.Date
  homeLocationId    String
  tier              StylistTier @default(STANDARD)
  isBookable        Boolean  @default(true)   // reception/accountant are not
  mobileEnabled     Boolean  @default(false)  // Frizer to Go
  maxConcurrentClients Int   @default(2)      // processing-time overlap cap
  allowOverlap      Boolean  @default(true)
  isPublic          Boolean  @default(false)  // shows on /tim
  twoFactorEnabled  Boolean  @default(false)
  uiLocale          String   @default("hr")
  isActive          Boolean  @default(true)
}

model UserLocation {                          // which salons a user may work at / manage
  userId            String
  locationId        String
  isPrimary         Boolean  @default(false)
  @@unique([userId, locationId])
}

// ─── Working time ────────────────────────────────────────────────

model WorkPattern {                           // recurring weekly rota
  userId            String
  locationId        String
  dayOfWeek         Int
  startsAt          String                    // "09:00"
  endsAt            String
  weekParity        WeekParity @default(EVERY) // EVERY | ODD | EVEN  (A/B weeks)
  effectiveFrom     DateTime @db.Date
  effectiveTo       DateTime? @db.Date        // effective-dating preserves history
}

model WorkOverride {                          // date-specific, beats the pattern
  userId            String
  locationId        String?
  date              DateTime @db.Date
  startsAt          String?
  endsAt            String?
  isWorking         Boolean
  reason            String?
}

model Absence {
  userId            String
  type              AbsenceType               // ANNUAL | SICK | UNPAID | TRAINING | PARENTAL | PUBLIC_HOLIDAY | OTHER
  startDate         DateTime @db.Date
  endDate           DateTime @db.Date
  isHalfDay         Boolean  @default(false)
  halfDayPeriod     HalfDay?                  // AM | PM
  status            AbsenceStatus             // REQUESTED | APPROVED | DECLINED | CANCELLED
  requestedBy       String
  reviewedBy        String?
  reviewedAt        DateTime?
  reviewNote        String?
  note              String?
}

model LeaveEntitlement {
  userId            String
  year              Int
  entitledDays      Decimal                   // HR statutory minimum 4 weeks; client policy applies
  carriedOverDays   Decimal  @default(0)
  @@unique([userId, year])
}

model TimeBlock {                             // lunch, admin, training, personal
  userId            String
  locationId        String
  startsAt          DateTime
  endsAt            DateTime
  reason            String
  isRecurring       Boolean  @default(false)
  recurrenceRule    String?                   // RFC 5545 RRULE
}

// ─── Catalogue ───────────────────────────────────────────────────

model ServiceCategory {
  slug              String   @unique
  nameHr            String
  nameEn            String
  sortOrder         Int
}

model Service {
  slug              String   @unique
  categoryId        String
  nameHr            String
  nameEn            String
  descriptionHr     String?
  descriptionEn     String?
  includesHr        String[]                  // "što uključuje"
  basePrice         Decimal
  baseDurationMin   Int
  bufferBeforeMin   Int      @default(0)
  bufferAfterMin    Int      @default(0)
  minimumNoticeHrs  Int      @default(2)      // colour needs more than a cut
  depositAmount     Decimal? 
  depositPercent    Decimal?
  requiresPatchTest Boolean  @default(false)
  requiresConsult   Boolean  @default(false)
  allowOverlap      Boolean  @default(true)   // false for bridal
  isPackage         Boolean  @default(false)  // the 95 € / 55 € all-inclusive offers
  packageServiceIds String[]
  isBookableOnline  Boolean  @default(true)
  isActive          Boolean  @default(true)
  sortOrder         Int
}

model ServiceSegment {                        // ← processing-time overlap lives here
  serviceId         String
  sequence          Int
  type              SegmentType               // ACTIVE | PASSIVE
  durationMin       Int
  requiresStylist   Boolean
  requiresChair     Boolean  @default(true)
  resourceType      ResourceType?
}

model ServiceLocationPrice {                  // per-salon overrides
  serviceId         String
  locationId        String
  price             Decimal?
  durationMin       Int?
  isOffered         Boolean  @default(true)
  @@unique([serviceId, locationId])
}

model ServiceLengthModifier {                 // kratka / poluduga / duga / extra duga / ekstenzije
  serviceId         String
  hairLength        HairLength
  priceDelta        Decimal  @default(0)
  durationDeltaMin  Int      @default(0)
  @@unique([serviceId, hairLength])
}

model StylistSkill {
  userId            String
  serviceId         String
  level             SkillLevel                // NOT_TRAINED | IN_TRAINING | CERTIFIED | TRAINER
  certifiedAt       DateTime?
  expiresAt         DateTime?
  @@unique([userId, serviceId])
}

model AddOn {                                 // Silky argan, masaža vlasišta, ampula…
  nameHr            String
  nameEn            String
  price             Decimal
  durationMin       Int      @default(0)
  applicableServiceIds String[]
}

// ─── Clients ─────────────────────────────────────────────────────

model Client {
  firstName         String
  lastName          String
  phone             String   @unique
  email             String?
  preferredLocale   String   @default("hr")
  preferredLocationId String?
  preferredStylistId  String?
  hairLength        HairLength?
  allergies         String?
  patchTestAt       DateTime?
  notes             String?                   // staff-visible only
  noShowCount       Int      @default(0)
  lateCount         Int      @default(0)
  requiresDeposit   Boolean  @default(false)  // auto-set at 2+ no-shows
  isBlocked         Boolean  @default(false)
  loyaltyPoints     Int      @default(0)
  marketingConsent  Boolean  @default(false)
  photoConsent      Boolean  @default(false)
  consentUpdatedAt  DateTime?
  source            String?                   // organic | paid | direct | walk-in
}

model ColourFormula {
  clientId          String
  appointmentId     String?
  stylistId         String
  productLine       String                    // "Silky TechnoBasic"
  shades            Json                      // [{shade:"7.3", grams:30}, …]
  developer         String
  developerVolume   String
  ratio             String
  processingMin     Int
  resultNote        String?
  nextTimeNote      String?                   // the field that makes this valuable
  appliedAt         DateTime
}

// ─── Appointments ────────────────────────────────────────────────

model Appointment {
  reference         String   @unique          // "SM-4K9P2"
  locationId        String
  clientId          String
  stylistId         String
  status            AppointmentStatus         // PENDING | CONFIRMED | ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
  startsAt          DateTime                  // UTC
  endsAt            DateTime
  totalDurationMin  Int
  agreedPrice       Decimal                   // frozen at booking — later price changes never apply
  depositAmount     Decimal  @default(0)
  depositStatus     DepositStatus             // NONE | PENDING | PAID | REFUNDED | FORFEITED
  paymentIntentId   String?
  hairLength        HairLength?
  clientNote        String?
  staffNote         String?
  source            BookingSource             // ONLINE | PHONE | WALK_IN | DASHBOARD | GROUP
  adAttribution     Json?                     // gclid, utm_* — feeds the acquisition report
  locale            String   @default("hr")
  manageToken       String   @unique          // /moj-termin/[token]
  groupBookingId    String?
  isMobileService   Boolean  @default(false)
  serviceAddress    Json?                     // Frizer to Go
  travelZone        String?
  cancelledAt       DateTime?
  cancelledBy       String?
  cancelReason      String?
  confirmedAt       DateTime?
  completedAt       DateTime?
}

model AppointmentService {
  appointmentId     String
  serviceId         String
  price             Decimal
  durationMin       Int
  sequence          Int
}

model AppointmentAddOn {
  appointmentId     String
  addOnId           String
  price             Decimal
}

model AppointmentSegment {                    // materialised for the scheduler
  appointmentId     String
  sequence          Int
  type              SegmentType
  startsAt          DateTime
  endsAt            DateTime
  requiresStylist   Boolean
  resourceId        String?
}

model SlotHold {                              // 10-minute optimistic hold
  stylistId         String
  locationId        String
  startsAt          DateTime
  endsAt            DateTime
  sessionId         String
  expiresAt         DateTime
}

model GroupBooking {
  reference         String   @unique
  type              GroupType                 // WEDDING | CORPORATE | CELEBRATION
  locationId        String?
  venueAddress      Json?
  eventDate         DateTime
  readyByTime       String                    // timeline is generated backwards from this
  contactName       String
  contactPhone      String
  contactEmail      String
  partySize         Int
  status            EnquiryStatus
  depositAmount     Decimal?
  notes             String?
}

model Waitlist {
  clientId          String
  locationId        String
  serviceIds        String[]
  preferredStylistId String?
  dateFrom          DateTime @db.Date
  dateTo            DateTime @db.Date
  timePreference    TimePreference[]          // MORNING | AFTERNOON | EVENING
  status            WaitlistStatus
  notifiedCount     Int      @default(0)
  lastNotifiedAt    DateTime?
}

model Enquiry {                               // group, bridal, Frizer to Go, careers
  type              EnquiryType
  payload           Json
  status            EnquiryStatus
  assignedTo        String?
  respondBy         DateTime                  // SLA
  respondedAt       DateTime?
}

// ─── Content & ops ───────────────────────────────────────────────

model GalleryImage {
  url               String
  altHr             String
  altEn             String
  serviceId         String?
  stylistId         String?
  locationId        String?
  clientId          String?                   // for consent linkage
  hairLength        HairLength?
  technique         String?
  isBeforeAfter     Boolean  @default(false)
  beforeUrl         String?
  status            ApprovalStatus            // SUBMITTED | APPROVED | REJECTED
  submittedBy       String
  approvedBy        String?
  consentRecorded   Boolean  @default(false)  // cannot approve without this
  publishedAt       DateTime?
}

model Review {
  locationId        String
  stylistId         String?
  source            String                    // "google"
  externalId        String   @unique
  rating            Int
  authorName        String
  text              String?
  publishedAt       DateTime
  isDisplayed       Boolean  @default(false)
  respondedAt       DateTime?
}

model AuditLog {
  actorId           String?
  action            String                    // "appointment.move"
  entityType        String
  entityId          String
  before            Json?
  after             Json?
  ipAddress         String?
  locationId        String?
  createdAt         DateTime @default(now())
}

model NotificationLog {
  clientId          String?
  appointmentId     String?
  channel           Channel                   // EMAIL | SMS
  template          String
  recipient         String
  status            String                    // queued | sent | delivered | failed
  providerId        String?
  sentAt            DateTime?
}

model ConsentRecord {                         // GDPR Art. 7 accountability
  clientId          String
  consentType       ConsentType               // MARKETING_EMAIL | MARKETING_SMS | PHOTO | DATA_PROCESSING
  granted           Boolean
  grantedAt         DateTime
  ipAddress         String?
  sourceUrl         String?
  withdrawnAt       DateTime?
}
```

**Key indexes**

```sql
CREATE INDEX ON "Appointment" ("locationId", "startsAt");
CREATE INDEX ON "Appointment" ("stylistId", "startsAt");
CREATE INDEX ON "Appointment" ("clientId", "startsAt" DESC);
CREATE INDEX ON "AppointmentSegment" ("startsAt", "endsAt");
CREATE INDEX ON "WorkPattern" ("userId", "dayOfWeek", "effectiveFrom");
CREATE INDEX ON "Absence" ("userId", "startDate", "endDate") WHERE status = 'APPROVED';
CREATE INDEX ON "SlotHold" ("expiresAt");
CREATE INDEX ON "Client" USING gin (to_tsvector('simple',
  coalesce("firstName",'')||' '||coalesce("lastName",'')||' '||coalesce("phone",'')));
```

**Integrity constraints**

- An exclusion constraint prevents two `AppointmentSegment` rows requiring the same stylist
  from overlapping — enforced in the database, not only in application code. This is the one
  invariant that must never be violated.
- The same applies per `Resource`.
- Cascade rules: soft-delete everywhere; a `Location` or `User` is never hard-deleted while
  appointment history references it.

---

## 12. API surface

REST, versioned at `/api/v1`. Server Components read directly through Prisma; this surface
serves mutations, the booking widget and any future integration.

**Public — no auth, rate limited**

```
GET  /locations                              list, with today's hours + open state
GET  /locations/:slug
GET  /services?location=&category=
GET  /services/:slug
GET  /stylists?location=&service=
GET  /stylists/:slug
GET  /availability?location=&services[]=&stylist=&from=&to=&hairLength=
POST /bookings/hold                          → { holdId, expiresAt }
POST /bookings/verify-phone                  → sends 6-digit code
POST /bookings/confirm-phone                 → { deviceToken }
POST /bookings                               idempotency-key required
GET  /bookings/:manageToken
PATCH/bookings/:manageToken/reschedule
POST /bookings/:manageToken/cancel
POST /waitlist
POST /enquiries                              group / bridal / to-go / careers
GET  /reviews?location=
```

**Authenticated — staff**

```
GET|POST|PATCH|DELETE  /appointments
POST   /appointments/:id/status              arrived | in-progress | complete | no-show
POST   /appointments/:id/move
GET|POST|PATCH         /clients
GET|POST               /clients/:id/formulas
GET|POST|PATCH         /users                            staff
GET|POST|PATCH|DELETE  /users/:id/work-patterns
GET|POST|PATCH|DELETE  /users/:id/overrides
GET|POST               /users/:id/skills
GET|POST|PATCH         /absences
POST   /absences/:id/approve | /decline
GET|POST|PATCH|DELETE  /time-blocks
GET|POST|PATCH         /services  /services/:id/prices  /services/:id/segments
GET|POST|PATCH         /locations/:id/hours  /exceptions  /resources
GET|POST               /gallery                          submit / approve
GET    /reports/:type?from=&to=&location=&format=json|csv
GET    /audit?entity=&actor=&from=&to=
POST   /notifications/test
WS     /realtime                                          calendar sync
```

**Conventions** — cursor pagination; RFC 7807 problem details for errors; `Idempotency-Key`
on every POST that creates money or appointments; ETag on availability; all mutations audited;
every response scoped to the caller's permitted locations, enforced server-side.

**Webhooks in** — Stripe (`payment_intent.succeeded`, `charge.refunded`), Infobip (delivery
receipts, inbound STOP).

---

## 13. Technology

### 13.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15+, App Router, TypeScript strict** | Server rendering for SEO, one codebase for site and dashboard, first-class image optimisation |
| Styling | **Tailwind CSS** + CSS custom properties for tokens | Tokens in §4 map directly; no runtime CSS-in-JS cost |
| UI primitives | **Radix UI** | Accessibility handled correctly at the primitive level |
| Database | **PostgreSQL 16** | Exclusion constraints and range types — needed for §11's overlap invariant |
| ORM | **Prisma** | Type safety end to end |
| Auth | **Auth.js** — magic link for clients, credentials + TOTP for staff | No password handling for clients |
| Payments | **Stripe** | Elements keeps card data off our servers |
| SMS | **Infobip** | Croatian provider, domestic deliverability, alphanumeric sender |
| Email | **Resend** + React Email | Templates as components, in version control |
| CMS | **Payload CMS** (self-hosted, same Postgres) | Croatian/English localisation built in; no second database; no per-seat cost |
| Files | **S3-compatible** + CDN | Originals never in git |
| Realtime | **Pusher** or self-hosted WS | Calendar sync |
| Hosting | **Vercel** (app) + **Neon** or **Railway** (Postgres, EU region) | EU data residency for GDPR |
| Monitoring | **Sentry** + Vercel Analytics + **Better Stack** uptime | |
| Testing | Vitest · Playwright · axe-core | §21 |

**Removed from the current stack:** jQuery, Bootstrap, htmx, and `html5-qrcode` loaded from
unpkg.com on every page. The loyalty QR scanner becomes a dynamically-imported route chunk
that loads only when a member opens the scanner — it has no business in the homepage critical
path.

### 13.2 Rendering strategy

| Content | Strategy |
|---|---|
| Homepage, locations, services, stylists, about, blog | Static, ISR revalidate 1 h; on-demand revalidation from the CMS |
| Price list | Static, on-demand revalidation on price change |
| Gallery | Static shell, paginated data |
| Availability | Dynamic, never cached, always server-computed |
| Booking flow | Server Components with Client Components at the interactive leaves |
| Dashboard | Dynamic, authenticated, no caching |

### 13.3 Internationalisation

`next-intl` with the routing in §5.1. **Every** user-facing string in message catalogues —
the current site leaks `pH-C5 TRETMAN` and `PRAMENOVI I BOJANJE` into its English booking
flow, and a CI check will fail the build on any missing key rather than silently falling back.

Content (services, locations, blog) is localised in Payload with `hr` and `en` fields.
Dates, times and currency use `Intl` with the `hr-HR` locale — note the Croatian convention
of `1.234,56 €` with a space before the symbol.

### 13.4 Repository

Single repo, pnpm workspaces:

```
apps/web            Next.js — public site + dashboard
packages/ui         Component library (§4.8)
packages/db         Prisma schema, migrations, seed
packages/scheduling Availability engine — pure, heavily unit-tested
packages/emails     React Email templates
packages/config     Shared TS, ESLint, Tailwind config
docs/               This plan, photo references, brand
```

`packages/scheduling` is deliberately separated: it is pure logic with no I/O, which makes the
overlap algorithm (§9.5) exhaustively testable without a database.

---

## 14. SEO specification

### 14.1 Keyword map

One primary target per page. No two pages compete for the same term — keyword cannibalisation
is the fastest way a multi-location strategy sabotages itself.

| Page | Primary | Secondary |
|---|---|---|
| `/` | frizerski salon Zagreb | frizer Zagreb, frizerski salon |
| `/saloni/ilica` | frizer Ilica | frizerski salon centar Zagreb |
| `/saloni/precko` | frizer Prečko | frizerski salon SC Prečko |
| `/saloni/sigecica` | frizer Sigečica | frizer Hvarska |
| `/saloni/novi-zagreb` | frizer Novi Zagreb | frizer Jaruščica, frizer Sopot |
| `/saloni/galleria-iblerov-trg` | frizer Iblerov trg | frizerski salon Galleria |
| `/saloni/dubrovnik-rixos` | hairdresser Dubrovnik | hair salon Dubrovnik |
| `/saloni/dubrovnik-sheraton` | hair salon Srebreno | hairdresser Župa dubrovačka |
| `/usluge/balayage` | balayage Zagreb | balayage cijena |
| `/usluge/airtouch` | airtouch Zagreb | airtouch pramenovi |
| `/usluge/pramenovi` | pramenovi Zagreb | pramenovi cijena |
| `/usluge/bojanje` | bojanje kose Zagreb | farbanje kose Zagreb |
| `/usluge/keratinski-tretman` | keratinski tretman Zagreb | ravnanje kose Zagreb |
| `/usluge/vjencana-frizura` | vjenčana frizura Zagreb | svadbena frizura |
| `/usluge/musko-sisanje` | muško šišanje Zagreb | frizer za muškarce Zagreb |
| `/usluge/sminkanje` | profesionalno šminkanje Zagreb | make up Zagreb |
| `/en/weddings/dubrovnik` | wedding hair Dubrovnik | bridal hair and makeup Dubrovnik |
| `/cjenik` | frizerski salon cjenik | cijene frizera Zagreb |
| `/frizer-to-go` | frizer na kućnu adresu Zagreb | mobilni frizer Zagreb |

Full research with volumes is a pre-build deliverable `[CLIENT — needs Ads account access]`.

### 14.2 On-page rules

- Exactly one `<h1>` per page, containing the primary keyword naturally.
- Heading hierarchy never skips a level.
- Title ≤ 60 chars, description ≤ 155, unique on every page, written for a click not a crawler.
- **No keyword stuffing.** The current `Najbolji frizerski salon u Zagrebu i okolici -
  Studio Marcela - šišanje, bojanje, pramenovi, balayage, mašinica, keratinski tretman`
  heading is deleted, not rewritten.
- Every image has a descriptive `alt` in the page's language.
- Descriptive internal anchor text — never "click here", never "read more" alone.
- Canonical on every page. Self-referencing by default.

### 14.3 Structured data

| Template | Schema |
|---|---|
| Global | `Organization`, `WebSite` + `SearchAction` |
| Homepage | `HairSalon` (the brand entity) with `department[]` linking each location |
| Location | **`HairSalon`, one per page**, with that salon's `address`, `geo`, `telephone`, `openingHoursSpecification`, `image`, `aggregateRating`, `hasMap`, `areaServed`, `priceRange` |
| Service | `Service` + `Offer` with `price`, `priceCurrency`, `availableAtOrFrom` each location |
| Stylist | `Person` with `worksFor`, `jobTitle`, `knowsLanguage`, `image` |
| Price list | `OfferCatalog` |
| Blog post | `Article` with `author` (the stylist), `datePublished`, `dateModified` |
| FAQ blocks | `FAQPage` |
| All sub-pages | `BreadcrumbList` |
| Booking | `Reservation` potential action on `HairSalon` |

**Never copy one schema block across the seven location pages, changing only the city.**
Duplicate structured data triggers the same suppression signals as duplicate content.

Validate every template in the Rich Results Test as part of the launch checklist (§21.5).

### 14.4 Language and hreflang

Fixes the current defect where the Croatian homepage declares `<html lang="en">`.

- `<html lang="hr">` on `/…`, `<html lang="en">` on `/en/…`.
- Reciprocal `hreflang` on every page: `hr`, `en`, `x-default` → the Croatian version.
- The language switcher maps to the *equivalent* page, never dumping the user on the homepage.
- Both languages fully crawlable; neither is JS-gated.

### 14.5 Sitemaps, robots, indexing

- `sitemap.xml` as an index of `sitemap-pages`, `sitemap-locations`, `sitemap-services`,
  `sitemap-team`, `sitemap-blog`, `sitemap-gallery`.
- **Every blog post gets its own URL in the sitemap** with `lastmod` — the current site lists
  only `/blog`, so eight posts earn nothing.
- `robots.txt` disallows `/app`, `/api`, `/moj-termin`, `/racun`.
- `noindex` on booking steps beyond the entry point, on search-result pages, and on all
  paginated gallery pages past the first.

### 14.6 Google Business Profile

Each of the seven claimed, verified and aligned `[CLIENT — needs access]`:

- NAP identical to the site, character for character.
- Correct primary category (Hair Salon) plus relevant secondaries.
- Website field points to that salon's **location page**, not the homepage. This is one of the
  highest-leverage twenty-minute jobs in the entire project.
- Hours, photos and services kept in sync from the CMS where the API allows.
- Review responses handled from §10.9.

### 14.7 Migration and redirects

Every existing URL must resolve. 301, never 302; never a chain.

| Old | New |
|---|---|
| `/` | `/` |
| `/en` | `/en` |
| `/usluge` | `/usluge` |
| `/cjenik` | `/cjenik` |
| `/narucivanje` | `/narucivanje` |
| `/o-nama` | `/o-nama` |
| `/kontakt` | `/kontakt` |
| `/gallery` | `/galerija` |
| `/frizer-to-go` | `/frizer-to-go` |
| `/sminkanje` | `/usluge/sminkanje` |
| `/group-services` | `/grupne-usluge` |
| `/trazis-posao` | `/karijere` |
| `/blog` | `/blog` |
| `/faq` | `/faq` |
| `/loyalty`, `/loyalty-card-info` | `/loyalty` |
| `/pravila-privatnosti` | `/pravila-privatnosti` |
| `/en/*` | `/en/*` equivalents |
| `/static/magazin/…pdf` | preserve at the same path |

**Pre-launch:** crawl the live site, export every indexed URL from Search Console, and confirm
each maps to a 200 or an intentional 301. **Post-launch:** monitor 404s daily for 30 days.

Preserve: the Google Ads conversion tag `AW-11273628291` (re-tagged to the new events, §15)
and the existing Analytics property, so historical data stays comparable.

---

## 15. Analytics and conversion tracking

GA4 plus server-side conversion reporting. Consent-gated (§20.1) — nothing fires before the
visitor chooses.

**Events**

```
page_view
booking_start              { entry_point, location, service }
booking_step               { step, location, service, stylist }
booking_service_added      { service, price, duration }
booking_slot_selected      { date, time, stylist, lead_time_days }
booking_abandoned          { last_step }
booking_complete           { value, location, service[], stylist, is_first_visit }   ← primary
deposit_paid               { value }
booking_rescheduled
booking_cancelled          { hours_before }
call_click                 { location }
whatsapp_click             { location }
directions_click           { location }
price_list_view
gallery_book_this_look     { service, stylist }
stylist_profile_view       { stylist }
waitlist_join
enquiry_submit             { type }
review_click
```

`booking_complete` is the conversion imported into Google Ads, replacing whatever the current
tag counts. Server-side confirmation makes it resistant to ad-blockers and gives accurate
revenue — which is what makes the acquisition report in §10.8 trustworthy.

**Attribution.** `gclid`, `gbraid`, `wbraid` and all `utm_*` are captured on landing, stored
in the session, and written to `Appointment.adAttribution`. The current system already
collects this field but nothing consumes it; now it joins bookings to spend.

**Also configure:** Search Console (both language properties), Ads conversion import with
30-day click / 1-day view, and CWV monitoring. Recommend Microsoft Clarity for session replay
in the booking funnel — with input masking on personal data.

---

## 16. Transactional messages

All templates exist in Croatian and English, as React Email components in version control.
Sender: `Studio Marcela <termini@studiomarcela.hr>`. SMS sender ID: `StudioM` `[VERIFY]`.

| Key | Channel | Trigger |
|---|---|---|
| `booking.confirmed` | Email + SMS | Booking created |
| `booking.deposit_required` | Email | Deposit pending |
| `booking.deposit_paid` | Email | Payment succeeded |
| `booking.reminder_72h` | Email | Colour / bridal / keratin only |
| `booking.reminder_24h` | SMS | 24 h before |
| `booking.reminder_2h` | SMS | 2 h before |
| `booking.rescheduled` | Email + SMS | Time changed |
| `booking.cancelled_by_client` | Email | Client cancelled |
| `booking.cancelled_by_salon` | Email + SMS | Salon cancelled — always apologetic, always offers alternatives |
| `booking.stylist_changed` | Email + SMS | Reassignment, with accept / reschedule |
| `booking.followup` | Email | 2 h after — aftercare, review, rebook |
| `booking.rebook_prompt` | SMS | 6 weeks after colour (marketing consent required) |
| `waitlist.slot_available` | SMS | Slot opened — 15-minute hold |
| `client.verify_phone` | SMS | 6-digit code |
| `client.magic_link` | Email | Account access |
| `staff.rota_published` | Email + push | Rota published |
| `staff.absence_decision` | Email | Approved / declined |
| `staff.absence_request` | Email | To the manager |
| `staff.schedule_changed` | Push | An appointment on their day moved |
| `manager.daily_digest` | Email | 07:00 — today's load, gaps, exceptions |
| `manager.enquiry_received` | Email | New group / bridal enquiry, SLA clock starts |

**Example — `booking.confirmed`, SMS (HR)**

```
Studio Marcela — termin potvrđen
Pon 12.8. u 16:30, Prečko
Balayage + fen frizura, ~2 h 45 min, 78 €
Stilist: Ana K.
Izmjena ili otkazivanje: studiomarcela.hr/t/4K9P2
```

Under 160 GSM-7 characters where possible. Croatian diacritics push a message into UCS-2 and
halve the limit to 70 — templates must be tested for length with real diacritics, and
transliteration is **not** acceptable in client-facing copy.

**Example — `booking.confirmed`, email subject lines**

```
HR: Termin potvrđen — pon 12.8. u 16:30, Studio Marcela Prečko
EN: Appointment confirmed — Mon 12 Aug, 16:30, Studio Marcela Prečko
```

Every email: plain-text alternative, dark-mode-safe, no image-only content, real physical
address in the footer, unsubscribe on anything non-transactional.

---

## 17. Performance budget

Enforced in CI. A pull request that breaches the budget fails.

| Metric | Budget |
|---|---|
| LCP (mobile p75) | < 2.0 s |
| INP | < 200 ms |
| CLS | < 0.05 |
| TTFB | < 400 ms |
| JS, first load, per route | < 140 KB gzipped |
| CSS total | < 40 KB gzipped |
| Any single image | < 200 KB |
| Hero image | < 160 KB |
| Fonts | ≤ 4 files, ≤ 180 KB total, `font-display: swap`, subset for Croatian |
| Third-party JS | < 60 KB, all deferred |
| Lighthouse Performance, mobile | ≥ 90 |
| Lighthouse SEO / Best Practices / A11y | 100 / ≥ 95 / 100 |

**Techniques:** AVIF/WebP with `next/image`, explicit dimensions on every image, priority
loading for the LCP element only, lazy below the fold, route-level code splitting, prefetch
on intent, Brotli, and third-party scripts loaded with `next/script` `afterInteractive`.

**Specific to this rebuild:** the booking page currently ships 483 KB, of which 374 KB is
reCAPTCHA. Replacing it with SMS verification (§9.3) removes 77% of the page weight before a
single other optimisation.

---

## 18. Accessibility

**Target: WCAG 2.2 AA.** Not aspirational — tested and enforced.

- Every interactive element reachable and operable by keyboard, with a visible focus ring
  (never `outline: none` without a replacement).
- Logical focus order; focus trapped in modals and returned on close.
- Semantic landmarks; one `<h1>`; headings never skip levels.
- All form inputs have persistent labels — never placeholder-as-label. Errors are announced,
  tied to their field with `aria-describedby`, and describe the fix, not just the failure.
- Colour contrast per §4.2, verified automatically.
- Colour is never the only carrier of meaning — appointment status uses shape and text too.
- `prefers-reduced-motion` fully respected (§4.6).
- The booking calendar and time-slot grid are proper ARIA grid patterns with arrow-key
  navigation — a date picker is where accessibility usually fails, and it is the one component
  a client cannot route around.
- Images have meaningful alt text; decorative images `alt=""`.
- Video is muted, captioned where it carries information, and never autoplays with sound.
- Tested with VoiceOver (Safari/iOS) and NVDA (Firefox/Windows) before launch.
- The **dashboard is in scope too** — staff may have accessibility needs, and it is where
  people spend hours.

---

## 19. Security

### 19.1 Application

- All input validated server-side with Zod. Client validation is UX only.
- Prisma parameterises everything; no raw SQL with interpolation.
- Strict CSP, no `unsafe-inline`; HSTS; `X-Content-Type-Options`; `Referrer-Policy`;
  `Permissions-Policy`.
- CSRF tokens on all state-changing form posts.
- Rate limits: booking creation 5/hour/IP, SMS verification 3/hour/number, login 5/15 min,
  API 100/min/token.
- Secrets in the platform's secret store. Never in the repo. A pre-commit secret scan.
- Dependabot plus `pnpm audit` in CI.

### 19.2 Access control

- Every request re-checks role and location scope server-side. **Never trust the client.**
- Object-level authorisation on every record — a Manager at Prečko must not be able to read a
  Sigečica client by guessing an ID. Tested explicitly (§21.2).
- Staff sessions: 12 h trusted device, 30 min idle on shared terminals.
- 2FA mandatory for Owner and Accountant.
- Immediate revocation on deactivation.

> **Carry over from the audit:** the current public `/gallery` page renders an
> `<input type="file">` to logged-out visitors. It is not wired to a form in the HTML, so it
> is most likely an admin control leaking into a public template — but **the upload endpoint's
> authentication must be verified on the existing site before decommissioning**, and if it is
> open it should be closed immediately rather than waiting for this rebuild. `[VERIFY]`

### 19.3 Bot protection without reCAPTCHA

Layered, and lighter than the 374 KB it replaces: SMS verification as the real gate,
rate limiting, a honeypot field, timing analysis (a form completed in under two seconds is
not human), and Cloudflare Turnstile only as an escalation if abuse is actually observed.

### 19.4 Data protection

- TLS 1.3 everywhere; HTTPS-only cookies, `SameSite=Lax`.
- Encryption at rest (database and object storage).
- Client notes, colour formulas, allergies and photographs treated as sensitive: access
  logged, exports restricted to Owner.
- Daily automated backups, 30-day retention, **restore tested quarterly** — an untested backup
  is not a backup.
- No production data in development. Anonymised seed data for local work.

---

## 20. Legal and compliance

### 20.1 GDPR

The salon is the controller; we build to make compliance the default.

- **Lawful basis:** contract for appointment data; consent for marketing and photography;
  legitimate interest for fraud prevention and no-show records.
- **Granular, separated consent.** Marketing email, marketing SMS, and photography are three
  decisions, never one checkbox, never pre-ticked. Recorded in `ConsentRecord` with timestamp,
  IP and source URL (Art. 7 accountability).
- **Cookie banner:** reject-all is as prominent as accept-all. Nothing but strictly-necessary
  cookies fires before a choice. Analytics and Ads are gated.
- **Client rights, self-service** in `/racun`: access, export (JSON + PDF), rectification,
  erasure, and withdrawal of consent in one tap.
- **Erasure with a caveat:** appointment records needed for tax and accounting are retained
  and pseudonymised rather than deleted, and this is explained in the privacy policy.
- **Retention:** client records 3 years after last visit, then anonymised; audit logs
  24 months; notification logs 12 months; CVs from `/karijere` 6 months.
- **Photography:** written consent per client, revocable, and revocation removes published
  images. Staff portraits need their own consent, separately, and it must survive them leaving.
- **Sub-processors** listed in the privacy policy: Vercel, Neon/Railway, Stripe, Infobip,
  Resend, Google, Sentry. **Data stays in the EU** — this is a hosting-region requirement,
  not a preference.
- **DPA** in place with every sub-processor `[CLIENT]`.
- A documented breach-notification procedure (72 hours).

### 20.2 Croatian fiscal obligations

From 1 January 2026, VAT-registered Croatian businesses must issue and receive structured
B2B e-invoices through the e-Račun platform (Fiskalizacija 2.0), with the obligation extending
to remaining entities in 2027.

**Deliberate position: this system is not a fiscal cash register and must not pretend to be.**

- Deposits taken online produce a payment record and a non-fiscal confirmation.
- Fiscal receipts continue to be issued by the salon's existing till and accounting process.
- We provide a clean export (CSV/JSON, and an API) of all online payments for the accountant.
- **Before payments are built, this must be confirmed with the client's accountant.**
  `[CLIENT — blocking for §9.6]` It is the one area where getting it wrong has legal
  consequences, and the correct answer depends on their VAT status and existing setup.

### 20.3 Consumer law

- Prices displayed inclusive of VAT.
- Terms and the cancellation policy accessible before confirmation, not after.
- Distance-selling rules apply to prepaid deposits — the cancellation and refund terms must be
  explicit `[CLIENT — legal review recommended]`.
- Company registration details in the footer (naziv, OIB, sjedište) `[CLIENT]`.

---

## 21. Testing and QA

### 21.1 Unit — Vitest

`packages/scheduling` is the priority, at **>95% coverage**: availability computation,
processing-time overlap, buffers, minimum notice, skill filtering, resource contention,
DST transitions, working-hours patterns including A/B weeks, absence subtraction, and the
pricing engine including length modifiers and package discounts.

### 21.2 Integration

API contracts, authorisation on every endpoint (**including negative tests: a Manager at
Prečko must be denied a Sigečica record**), payment webhooks, notification dispatch,
idempotency, and the concurrent-booking race.

### 21.3 End-to-end — Playwright

- Book cold-start, mobile viewport, through to confirmation.
- Book from a location page, a service page, a stylist page, and a gallery item — verifying
  pre-fill in each case.
- Multi-service cart with a hair-length change.
- Deposit-required path through Stripe test mode.
- Reschedule and cancel by manage-token.
- Waitlist notification → booking.
- **Two browsers racing for the last slot.**
- Hold expiry mid-form.
- Staff: create, drag-move, mark no-show, request and approve absence, edit working hours,
  publish a rota, and confirm the availability change propagates to the public booking flow.
- **A colour appointment booked into another client's processing window** — the feature that
  earns the money must have an explicit end-to-end test.
- Both languages, both viewports.

### 21.4 Automated quality gates

axe-core on every page and every dashboard screen; Lighthouse CI against §17; contrast
verification of the token set; a missing-translation-key check; a link checker; and the
CI rule from §6.6 that fails the production build if any reference photograph is referenced.

### 21.5 Pre-launch checklist

- [ ] All 7 location pages: unique copy ≥ 350 words, correct H1/H2, own schema
- [ ] Every `[VERIFY]` in this document resolved
- [ ] Every `[CLIENT]` dependency received
- [ ] Opening hours confirmed and live for all 7
- [ ] Every service has a price and a duration; AirTouch and flamboyage resolved
- [ ] Redirect map (§14.7) verified against a crawl of the old site
- [ ] Rich Results Test passes for every template
- [ ] hreflang reciprocal and correct; `lang` attribute correct per language
- [ ] GBP: all 7 claimed, NAP-consistent, pointing at location pages
- [ ] GA4, Ads conversion import, Search Console verified for both properties
- [ ] Stripe live keys; a real deposit taken and refunded end to end
- [ ] SMS delivery confirmed to Croatian numbers on all three major networks
- [ ] Every email template rendered in Gmail, Outlook, Apple Mail, light and dark
- [ ] Staff accounts created; every stylist has logged in once
- [ ] Staff trained (§24)
- [ ] Backup restore rehearsed
- [ ] Privacy policy, terms and cancellation policy live and legally reviewed
- [ ] Load test: 50 concurrent bookings
- [ ] Rollback plan documented and understood

---

## 22. Environments and operations

| Environment | Purpose |
|---|---|
| Local | Docker Postgres, anonymised seed, Stripe/Infobip test modes |
| Preview | Per pull request, seeded, `noindex` |
| Staging | Production-like, client UAT, `noindex`, test payment keys |
| Production | EU region, live keys |

**Branching:** trunk-based, short-lived feature branches, PR required, CI must pass.
**Migrations:** Prisma Migrate, forward-only, reviewed, tested against a production clone.
**Releases:** deploy to staging → client sign-off → production. No Friday deploys.
**Rollback:** instant revert on Vercel; database migrations must be backward-compatible for
one release so a revert never strands the schema.

**Launch sequencing.** Run the new site on a staging domain until UAT passes; cut DNS during
the quietest window (Sunday evening); keep the old site available for 30 days at a
`legacy.` subdomain, `noindex`, in case a page needs to be consulted.

**Monitoring and alerting:** uptime on `/`, `/narucivanje` and `/api/v1/availability`; Sentry
error-rate alerts; a **failed-booking alert** to the developer and the owner (a booking flow
that silently breaks is the most expensive failure mode this system has); payment-webhook
failures; SMS delivery-rate drops; and a nightly database backup verification.

**Support after launch:** 30 days of hypercare with a named contact, then an agreed
maintenance retainer `[CLIENT]`.

---

## 23. Content operations

### 23.1 What the client can edit without a developer

Prices, durations, and what a service includes · opening hours and holiday exceptions ·
staff profiles, photographs, and biographies · service descriptions · gallery (upload,
tag, approve) · blog posts · FAQ · homepage offer block · testimonials · location copy ·
all notification template text.

**What requires a developer:** page layouts, new page types, booking-flow logic, and
scheduling rules. This split is deliberate — everything that changes weekly is theirs;
everything that can break the system is not.

### 23.2 Governance

Payload roles mirror §10.1. Draft → preview → publish, with scheduled publishing. Version
history with one-click restore. Croatian is the source language; English is flagged as stale
whenever the Croatian changes.

### 23.3 Editorial plan

The eight existing posts migrate (§7.10). Then two posts a month, each written by or credited
to a named stylist — this feeds the `Person` schema, gives stylists visible expertise, and
gives the blog a reason to exist beyond SEO.

Topic pillars: hair care and problems (already their strongest existing content) · colour
education (balayage vs AirTouch vs classic, and how to choose) · seasonal and occasion styling ·
behind the studio, including the Silky story · client transformations with the formula
explained.

Every post links to at least one service page and one location page in body copy (§5.4).

---

## 24. Delivery plan

Estimates assume one senior full-stack developer plus a designer, with the client responsive
on dependencies. **Photography is on the critical path — commission it in week 1.**

| Phase | Weeks | Deliverables | Gate |
|---|---|---|---|
| **0 · Discovery** | 1–2 | All `[CLIENT]` items gathered; hours confirmed; staff roster; GBP/Ads/Analytics access; accountant confirms §20.2; keyword research; photography booked | Kick-off sign-off |
| **1 · Design** | 2–5 | Design system (§4); homepage, location, service, stylist, booking, dashboard designs; mobile-first; prototype of the booking flow | **Design sign-off** |
| **2 · Foundation** | 4–8 | Repo, CI, database, schema, auth, component library, CMS modelled, i18n | Internal demo |
| **3 · Booking engine** | 7–12 | Scheduling package with full test suite; availability API; booking flow; payments; notifications | **Booking UAT — the critical gate** |
| **4 · Dashboard** | 10–15 | Calendar, appointments, clients, colour formulas, staff, working hours, absence, rota, reporting, audit | **Staff UAT** |
| **5 · Site build** | 12–17 | All pages, all copy, both languages, schema, gallery, blog migration | Content sign-off |
| **6 · Photography** | ongoing → 16 | Shoots, edit, integrate. Replaces every reference image | **No launch without this** |
| **7 · Launch prep** | 17–19 | Redirects, GBP alignment, analytics, load test, staff training, §21.5 checklist | **Go/no-go** |
| **8 · Launch** | 19 | DNS cut, monitoring, hypercare | Live |
| **9 · Hypercare** | 19–23 | Daily 404 and error monitoring, ranking watch, funnel tuning | Handover |

**Roughly 19 weeks to launch.** The two most likely causes of slippage are photography and
client dependencies — both are visible in Phase 0 for that reason.

**Then:**

- **Phase 10 — Weddings engine** (§7.6): the English destination-wedding funnel, group
  booking, concierge partnerships. Highest expected revenue return of any post-launch work.
- **Phase 11 — Retail**: Silky products online, gift cards, subscriptions.
- **Phase 12 — Growth**: dedicated Ads landing pages wired to booking attribution, loyalty
  expansion, referral mechanics.

### 24.1 Staff training

Non-negotiable, and the most common reason systems like this fail after launch.

- Two sessions per location, on-site, 90 minutes, before go-live.
- Separate sessions for stylists (their day, their clients, colour formulas, photo upload) and
  managers (calendar, staff, absence, rota, reporting).
- One-page laminated quick reference per role, in Croatian, for the staff room.
- Short screen-recorded videos in the dashboard help menu.
- A named super-user per location who gets extra time and becomes the first line of support.
- **A parallel-running fortnight** where the paper diary continues alongside the system, so
  nobody loses a booking while learning. Retire paper only once a full week reconciles.

---

## 25. Open questions and client dependencies

### 25.1 Blocking — cannot build without these

| # | Item | Blocks |
|---|---|---|
| 1 | **Opening hours for all 7 locations**, per day, plus holiday practice | §7.2, §9.5, §11 |
| 2 | **Staff roster**: who works where, employment type, which services each is certified for | §10.5, §9.5 |
| 3 | **Deposit decision** — yes/no, and the amounts in §9.6 | §9.6, §20.3 |
| 4 | **Cancellation policy** wording | §9.8, §20.3 |
| 5 | **Accountant's confirmation** on §20.2 fiscal handling | §9.6 payments |
| 6 | **Confirmed prices per location** where they differ; AirTouch and flamboyage priced | §7.3, §7.5 |
| 7 | **Photography budget approved and shoot booked** | §6, launch |
| 8 | Access: Google Business Profile ×7, Analytics, Ads, domain DNS, current hosting | §14.6, §15, §22 |
| 9 | Company legal details — naziv, OIB, sjedište, VAT status | §20.3 |
| 10 | Staff consent policy for names and portraits on the public site | §7.4, §20.1 |

### 25.2 Needed before the relevant phase

11. Frizer to Go travel zones and surcharges · 12. Loyalty programme rules (earn, redeem,
expiry) · 13. Group and bridal package pricing · 14. Careers: salary range and benefits ·
15. Whether Silky retail sells online in Phase 11 · 16. Neighbourhood, transport and parking
detail for all seven `[VERIFY]` · 17. Existing client data to migrate, and in what format ·
18. Brand assets: logo in vector, any existing guidelines · 19. Preferred maintenance
arrangement after hypercare.

### 25.3 Recommendations awaiting a decision

| Recommendation | Rationale | Risk if declined |
|---|---|---|
| Take deposits on colour and above | ~45% fewer no-shows; combined with reminders, sub-5% | The largest single revenue lever is left unpulled |
| Publish stylist names and portraits | 57% prefer booking a named stylist; drives retention | The team page becomes decorative |
| Commission proper photography | The entire "feel like you're in the studio" premise | The site looks like every competitor's |
| Build the Dubrovnik weddings funnel in Phase 10 | Highest-value untapped segment they already have the assets for | Continues to be given away to competitors |
| Enable processing-time overlap | 20–30% more capacity, no new hires | Capacity stays on the table |
| Rename locations by district | Nobody searches "Studio Marcela IV" | Local search underperforms |
| Verify the `/gallery` upload endpoint now | Possible unauthenticated upload on the live site | Security exposure, today, before this project ships |

### 25.4 Things I have assumed — correct me

- The Croatian market expects to pay in salon; online prepayment beyond a deposit would be
  unusual. **Deposits only.**
- Stylists have smartphones and will use a PWA. If not, the dashboard needs a desktop-first
  reception workflow instead, which changes §10.3.
- The seven salons share one service catalogue with per-location price variance, rather than
  genuinely different offerings. `[VERIFY]`
- Dubrovnik operates seasonally with different hours, and possibly closes off-season.
  `[VERIFY]` — this materially affects §11 `OpeningHoursException`.
- There is no existing digital client database to migrate. If there is, migration becomes a
  work package of its own.

---

## 26. Appendix — service catalogue

Taken verbatim from the current published price list, to be confirmed per location.
This is the seed data for `Service` (§11).

### Šišanje i oblikovanje kose

| Usluga | Cijena |
|---|---|
| Žensko šišanje | 15–25 € |
| Fen frizura | 14–25 € |
| Šišanje i fen frizura | 29–50 € |
| Pranje kose — žensko | 5 € |
| Pranje kose — muško | 5 € |
| Muško šišanje | 15 € |
| Muško šišanje mašinicom | 10 € |
| Dječje šišanje — muško (do 10 g.) | 10 € |
| Dječje šišanje — žensko (do 10 g.) | 20 € |
| Dječje šišanje i fen frizura — žensko (do 10 g.) | 30 € |
| Korištenje figara | 8 € |
| Šišanje šiški | 5 € |
| Sušenje kose | 5 € |
| Pletenica | 5 € |
| Tanjenje kose | 10 € |

### Bojanje i kemijski procesi

| Usluga | Cijena |
|---|---|
| Bojanje | 40 € |
| Pramenovi | 50 € |
| Preljev | 40 € |
| Balayage pramenovi | 50 € |
| Bojanje izrasta | 40 € |
| **Paket pramenovi — sve uključeno** | **95 €** |
| **Paket bojanje — sve uključeno** | **55 €** |
| Paket bojanje Dan žena 2026 | 49 € |
| Nadoplata za bojanje izrasta uz pramenove | 15 € |
| Preljev uz pramenove | 35 € |
| Preljev za vrhove | 35 € |
| Nadoplata za dvobojne pramenove | 15 € |
| Nadoplata za dužinu/gustoću kose | 7 € |
| AirTouch | `[CLIENT — not published]` |
| Flamboyage | `[CLIENT — not published]` |

### Njega kose i tretmani

| Usluga | Cijena |
|---|---|
| Silky tretman — šampon i maska | 15 € |
| Silky argan tretman | 15 € |
| Silky njega kose | 25 € |
| Silky maska | 6 € |
| Silky ampula | 5 € |
| Silky arganovo ulje | 2 € |
| Masaža vlasišta | 7 € |
| pH-C5 tretman | 40 € |
| pH-C5 tretman i frizura | 50 € |
| Ugradnja ekstenzija (kom) | 4 € |
| Podizanje ekstenzija (kom) | 1 € |

### Svečane prigode

| Usluga | Cijena |
|---|---|
| Svečana frizura | 40 € |
| Svečana frizura Hollywood | 60 € |
| Vjenčana frizura | 50 € |
| Probna vjenčana frizura | 40 € |

### Make up

| Usluga | Cijena |
|---|---|
| Make up | 52 € |
| Svečani make up | 60 € |
| Ugradnja trepavica | 15 € |
| Bojanje obrva | 10 € |

### Usluge to go

| Usluga | Cijena |
|---|---|
| Frizura to go | 70 € |
| Vjenčana frizura to go | 80 € |
| Makeup to go | 95 € |

**Hair-length categories** applied across the catalogue: kratka · poluduga · duga ·
extra duga · ekstenzije.

**Standing note on the price list:** *„Cijene se mogu razlikovati ovisno o lokaciji —
provjerite sa svojim stilistom za konačnu ponudu."* This is why §11 carries
`ServiceLocationPrice`.

---

## Sources

Research underpinning the conversion, no-show, SEO and compliance decisions:

- [Zenoti — Salon booking flow optimisation](https://www.zenoti.com/thecheckin/salon-medspa-booking-flow-revenue) — 68% booking abandonment, 59% abandon without instant confirmation, 73% mobile, 57% prefer stylist-specific booking
- [SchedulingKit — Salon industry statistics 2026](https://schedulingkit.com/statistics/salon-industry-statistics) — no-show rates
- [BookingBee — Reducing salon no-shows](https://bookingbee.ai/reduce-salon-no-shows/) — deposit and reminder effectiveness
- [European Commission — eInvoicing in Croatia](https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108879/eInvoicing+in+Croatia) — Fiskalizacija 2.0
- [Arc4 — Local landing pages](https://arc4.com/local-landing-pages/) and [SEO Ninja — Multi-location SEO](https://www.seoninja.com/blog/seo/multi-location-seo/) — per-location schema, cannibalisation
- Croatian booking aggregators reviewed as competitive context: [SrediMe](https://www.sredime.hr/zagreb/frizerski-saloni), [Zoyya](https://zoyya.com), [Narudzbe.hr](https://narudzbe.hr/usluge/frizerski-saloni/)

*End of document.*
