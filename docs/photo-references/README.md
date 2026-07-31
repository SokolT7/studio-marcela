# Photo Reference Library

These are **direction references, not final assets.** Every one of them gets replaced by an
original photograph of a real Studio Marcela salon, a real Studio Marcela stylist, or real
Studio Marcela work.

They exist so the photographer, the client and the build team are all looking at the same
thing when we say "warm interior with window light" or "colour dimension close-up".

## Where the files are

The images live in **[`apps/web/public/ref/`](../../apps/web/public/ref/)**, not in this
folder. They are served by the site as placeholders, so they have to sit in the app's public
directory to survive a deploy — one copy, in the place that needs it. This document is the
brief that describes them.

## How to use them

Each image slot in `IMPLEMENTATION_PLAN.md` §6 names one of these files. The written brief
next to it is the specification; the image is the mood. Where the two disagree, **the written
brief wins** — several references are the right composition in the wrong palette, and that is
called out explicitly in the brief.

## Licensing

All files sourced from Unsplash under the [Unsplash License](https://unsplash.com/license),
which permits free commercial and non-commercial use. They are used here for internal
art-direction purposes only.

**None of these images may ship to production.** They are stand-ins. Shipping them would put
generic stock photography on a site whose entire strategic premise is that it shows the real
studio — the exact failure we are fixing.

## What's in the set (26 files, in `apps/web/public/ref/`)

| File | What it actually shows | Use as reference for |
|---|---|---|
| `BRIDAL-01.jpg` | Stylist pinning a floral accessory into a bride's hair | Bridal in progress |
| `BRIDAL-02.jpg` | Stylist working on a bride's updo, side view | Bridal in progress, wider |
| `BRIDAL-03.jpg` | Finished braided updo with pearl comb, close | Bridal result detail — **strongest bridal ref** |
| `CLIENT-01.jpg` | Client laughing, hands in her curls, outside a salon | Testimonial portraits, brand warmth |
| `INTERIOR-01.jpg` | Salon interior, client in chair, large windows, daylight | **Primary interior reference** |
| `INTERIOR-MOOD-01.jpg` | Dark, warm, vintage salon at night | Evening mood only — palette is wrong for us |
| `LOC-EXT-01.jpg` | Brick-fronted salon storefront with signage | Location exterior, street level |
| `LOC-EXT-02.jpg` | Awning storefront, muted tones | Location exterior, alternative |
| `PRODUCT-01.jpg` | Pump bottles on pale background, clean still life | Silky product still life |
| `PRODUCT-02.jpg` | Dark bottles, clean still life | Silky product still life, alternative |
| `RECEPTION-01.jpg` | Reception desk, retail shelving, stylist through an arch | Reception / retail area |
| `RESULT-01.jpg` | Long blonde hair, three-quarter view, salon window light | **Result shot — money frame** |
| `RESULT-02.jpg` | Back view of long balayage hair showing dimension | **Result shot — colour dimension** |
| `STYLIST-ATWORK-01.jpg` | Craftsperson absorbed in work at a bench | Stylist concentrating, unposed |
| `STYLIST-PORTRAIT-01.jpg` | Woman, direct gaze, soft smile, workplace behind her | **Primary stylist portrait reference** |
| `SVC-BLOW-01.jpg` | Woman using a hair dryer, studio lighting | Blow-dry — note: too studio, we shoot in salon |
| `SVC-COLOR-01.jpg` | Macro of hair strands showing a balayage gradient | Colour dimension / texture |
| `SVC-COLOR-02.jpg` | Gloved hands applying colour, foils, client in chair | Colour in progress |
| `SVC-CUT-01.jpg` | Scissors cutting wet hair, close, over the shoulder | Cut in progress |
| `SVC-FOILS-01.jpg` | Foil being placed with a tint brush, hands in frame | Highlights / foils in progress |
| `SVC-MAKEUP-01.jpg` | Makeup brushes in a holder, ring-light bokeh | Makeup station |
| `SVC-MENS-01.jpg` | Barber working on a man's hairline, warm light | Men's cut and beard |
| `SVC-WASH-01.jpg` | Client reclined at the basin, hair being washed | Basin / wash ritual |
| `SVC-WASH-02.jpg` | Row of basin chairs, minimal, high key | Equipment / architectural detail |
| `TEAM-01.jpg` | Small team grouped indoors | Team group shot — reads too "startup", see brief |
| `TOOLS-01.jpg` | Scissors and clippers laid out on orange | Tool flat lay — **palette is wrong**, composition only |

## Known gaps — no reference available, shoot from the written brief

- **Frizer to Go** — a stylist working in a client's home or hotel room.
- **Before / after pairs** — identical framing, identical light, two states.
- **Shopping-centre unit exterior** (SC Prečko) — a salon inside a mall, not a street frontage.
- **Hotel salon exterior** (Rixos, Sheraton) — a salon within a hotel interior.

These four are described in full in `IMPLEMENTATION_PLAN.md` §6.2 and must be shot to the
written brief alone.
