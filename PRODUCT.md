# Escape Maputo — Product

**One-line:** A personal, photo-first map of cool, kid-friendly, malaria-free getaways within a day's drive of Maputo.

## Register

**brand** — the curation and the visual experience IS the product. This is a discovery surface, not a tool. Functional bones (Leaflet map, filters, detail drawer) sit underneath an editorial visual layer.

## Users

One audience: **Dedi** (CTO, AIgnited, lives in Maputo) and his family. Specifically him scrolling on a phone (`/rc` workflow) on a Friday evening, deciding where to drive his wife and 1-year-old son for the weekend, or planning a week-long winter holiday. Maybe shared with close friends in similar situations later, never marketed.

## Product Purpose

Replace the spreadsheet / Notes-app / Google-Doc that family travelers cobble together. Make destination decisions feel inspired rather than logistical. The user already trusts the dataset (he wrote it). The job of the UI is to *make him want to go*.

## Brand & Tone

- **Editorial** — NYT Travel, Condé Nast Traveler, Airbnb's old "Stories" pages. Quiet authority, not hype.
- **Confident, personal, never corporate.** No "Discover your next adventure!" slop. No emoji-heavy travel-blog energy. No marketing CTAs.
- Copy is matter-of-fact: drive times, altitudes, what works for a toddler. Real, specific.
- Highland / winter / cool-air mood: brisk, foggy mornings, woodsmoke, sandstone, pine. Avoid tropical-beach palette by default.

## Anti-references

- ❌ Generic SaaS dashboard (current state — too neutral, too cyan, too dashboardy).
- ❌ Travel-blog template feel (Squarespace / Wix tropes — heavy gradient overlays, "explore now" CTAs, drop-shadow cards).
- ❌ TripAdvisor / Booking.com card-grid density.
- ❌ Vercel-style minimalism (too cold, too tech-product).
- ❌ Glass / blur as decoration.

## Strategic principles

1. **Photo-first.** Every destination has 6 real Google Places photos. Use them at full bleed wherever it's the best move.
2. **Map remains essential but secondary on first paint.** It's a sidekick, not the hero.
3. **The detail view is a magazine spread**, not a card. Big hero, generous typography, the family_notes shown like editor's pull-quotes.
4. **Mobile is primary.** Dedi reads on a phone. Desktop is a bonus.
5. **No build pipeline.** Drops into `/var/www/maputo/` as static HTML+CSS+JS.

## Constraints

- Static files only (vanilla HTML/CSS/JS + Leaflet).
- Existing dataset (`data.js`) and photo manifest (`photos.json`) are canonical — don't duplicate them.
- Photos must show Google attribution per ToS.
- Streetview/Maps links use the URIs already in `photos.json`.
