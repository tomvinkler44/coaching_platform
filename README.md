# Throughline — marketing site

The public marketing site for a career-coaching **marketplace + community**. It
is the first page prospects find. It does three jobs:

1. Tells visitors this site is about **changing careers** — pivoting into a
   different field, with a specialty in the AI-era roles that matter for **2026**.
2. Tells them it's where they **browse and pick the best coach for them** — a
   curated roster of coaches who *specialize in guiding career transitions*.
   Browsing is the main action; an optional matchmaker exists only to help the
   undecided. There is **no forced/auto matching**.
3. Introduces **Accountability Circles** — small peer groups of members making
   the change together (the community layer that sets us apart from a directory).

> Coach claim guardrail: we do **not** claim every coach personally made the same
> move. Coaches "specialize in" / "guide" these transitions — some have made one
> themselves, all have guided others. Keep copy on that side of the line.

> "Throughline" is a working brand name (it means *your experience is the thread
> carried into the new career*). It's easy to swap — see **Renaming the brand**.

## Positioning

> For experienced professionals (10–20 yrs) who feel stuck or quietly threatened
> by AI and want a real pivot, **Throughline** is the coaching **marketplace**
> that matches you with vetted coaches who have personally changed careers into
> AI-era 2026 roles — unlike generic coaching directories (hundreds of profiles
> you vet yourself) or executive placement firms (they only optimize the career
> you're leaving).

Core message: **this isn't starting over — it's repositioning what you already
built, with a guide who's already walked the path.** The enemy is *the slow
slide* (waiting until you're forced to move).

The competitor scan in the source doc (IGotAnOffer, The Muse, Career Contessa,
Noomii, etc.) shaped the marketplace cues used here: hand-vetted/curated coaches,
coach profiles with real industry background, a **free intro / chemistry call**,
filter-by-your-situation, and "choose a coach who's actually done it."

Copy was developed with a simulated expert panel: **Dan Kennedy** (headline,
villain, risk reversal, honest urgency), two **career-change coaches** (Herminia
Ibarra lineage — the transition framing, voice-of-customer, 2026 roles), and an
**April Dunford-style positioning + CRO strategist** (page structure, the name,
trust-without-fabrication).

## Page structure

Nav · Hero (title + "where you are → where you're going" graphic) · trust strip ·
problem / "the slow slide" · why a specialist coach · **How it works** (browse →
meet → choose, 3 steps) · **Coaches** (filterable roster of 8) · 2026 careers ·
**Accountability Circles** (community + waitlist) · who it's for/not for · what it
costs + Right-Fit Guarantee · "Are you a coach?" band · FAQ · final CTA · footer.

## Tech

Self-contained static site. No build step, no dependencies.

- `index.html` — the homepage (all sections)
- `styles.css` — hand-authored design system (no framework)
- `script.js` — scroll reveals, the throughline scroll rail, hero thread draw,
  and the **coach roster filtering**
- `assets/favicon.svg`
- `assets/coaches/coach-1.svg … coach-8.svg` — placeholder coach portraits

Fonts load from Google Fonts (Fraunces / Hanken Grotesk / Spline Sans Mono).

### Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

Deploy anywhere static (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3).

## Design signature

A literal **throughline**: a thread that runs down the page, shifting from a cool
*dusk* (stuck) to a warm *dawn* (arrived). It fills as you scroll (left rail on
wide screens) and draws itself in the hero — encoding the promise that your
experience carries through the change. Respects `prefers-reduced-motion`.

## The coaches are placeholders

The 8 coaches are a **founding-roster mock-up**, clearly labelled illustrative on
the page. Specifically:

- **Portraits** (`assets/coaches/*.svg`) are flat illustrated *placeholders* —
  intentionally not photos of real people. Replace each with a real coach
  headshot (square, ~square crop; the CSS circle-masks them).
- **Names, credentials, and pivots** are invented examples. Replace with real,
  consented coach profiles before launch, and keep the on-page disclaimer until
  the roster is real.
- No fabricated ratings or review counts are shown.
- The filter categories live in `data-cats` on each `.coach` article and the
  `.chip` buttons in `#coachFilters` — keep them in sync when you edit the roster.

## Before you publish — fill these in

1. **Booking / helper flows** — CTAs currently use `mailto:hello@throughline.coach`
   and per-coach intro-call mailto links. Wire up: a real scheduler for intro
   calls (Cal.com, Calendly), the optional "matchmaker" helper (a short quiz), and
   the **Accountability Circles waitlist** capture.
2. **Contact email** — `hello@throughline.coach` appears throughout.
3. **Real coaches** — swap the placeholder portraits and profiles (see above).
4. **Pricing** — intentionally not shown as hard numbers (each coach sets their
   own, revealed in-app). Adjust if you want public pricing.
5. **"Right-Fit Guarantee"** — confirm you can honor the rematch/refund terms.
6. **Credibility claims** — the trust strip and FAQ state coaches are
   ICF-credentialed and vetted; make sure that's true for your roster.

## Renaming the brand

Replace "Throughline" in `index.html` (nav, footer, copyright, `<title>`/meta)
and the footer tagline. The logo is inline SVG in the nav and footer plus
`assets/favicon.svg`.
