# Throughline — marketing site

The public marketing site for a career-coaching portal. It is the first page
prospects find. Niche: **career changers** pivoting into the careers that
matter in **2026**, with a specialty in roles reshaped by **AI / automation**.

> "Throughline" is a working brand name (it means *your experience is the thread
> carried into the new career*). It's easy to swap — see **Renaming the brand**
> below.

## Positioning

> For experienced professionals (10–20 yrs) who feel stuck or quietly threatened
> by AI and want a real pivot but fear starting over, **Throughline** is the
> AI-era career-change coaching program that maps your existing experience onto
> the roles that matter in 2026 and walks you through the switch — unlike generic
> coaching marketplaces (you self-serve) or executive placement firms (they only
> optimize the career you're leaving).

Core message: **this isn't starting over — it's repositioning what you already
built.** The enemy is *the slow slide* (waiting until you're forced to move).

The copy was developed with a simulated expert panel: **Dan Kennedy**
(direct-response: headline, USP, villain, risk reversal, honest urgency),
two **career-change coaches** in the lineage of Herminia Ibarra's *Working
Identity* (the PIVOT method, voice-of-customer, before/after, 2026 roles), and
an **April Dunford-style positioning + CRO strategist** (page structure, name,
trust-without-testimonials, CTA strategy).

## Tech

Self-contained static site. No build step, no dependencies.

- `index.html` — the homepage (all sections)
- `styles.css` — hand-authored design system (no framework)
- `script.js` — scroll reveals, the throughline scroll rail, hero thread draw
- `assets/favicon.svg`

Fonts load from Google Fonts (Fraunces / Hanken Grotesk / Spline Sans Mono).

### Run it

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

Deploy anywhere that serves static files (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3, or a classic host — matching the doc's "marketing site is a
separate phase from the app" architecture).

## Design signature

A literal **throughline**: a thread that runs down the page, its color shifting
from a cool *dusk* (stuck) to a warm *dawn* (arrived). It fills as you scroll
(left rail on wide screens) and draws itself in the hero — encoding the promise
that your experience carries through the change. Respects
`prefers-reduced-motion`.

## Before you publish — fill these in

The site ships with honest placeholders, **not** invented proof. Replace:

1. **Booking link** — the primary CTA currently points to
   `mailto:hello@throughline.coach`. Swap for your real scheduler (Cal.com,
   Calendly, etc.). Search `#book` and the `mailto:` links.
2. **Contact email** — `hello@throughline.coach` appears in the CTA and footer.
3. **The 2-min assessment** — the secondary CTA (`#assessment`) currently
   anchors to the footer as a placeholder. Wire it to a real quiz / email
   capture when ready.
4. **Pricing** — intentionally not shown (revealed on the call). Add a pricing
   section only if you want it public.
5. **Case studies** — the four pivot stories are clearly labeled *illustrative
   composite examples*, not testimonials. Replace with real, consented client
   stories once you have them (and keep the disclaimer until you do).
6. **"PIVOT Method™" / "Clear-Path Guarantee"** — verify you can defend the ™
   and honor the guarantee terms before publishing. Adjust wording to match what
   you'll actually deliver.
7. **Coach credibility** — the trust strip claims ICF-credentialed coaches and a
   research-backed method. Make sure these are true for your roster.

## Renaming the brand

Replace "Throughline" in `index.html` (brand text appears in the nav, footer,
copyright, and `<title>`/meta) and update the tagline in the footer. The logo is
inline SVG in the nav and footer plus `assets/favicon.svg`.
