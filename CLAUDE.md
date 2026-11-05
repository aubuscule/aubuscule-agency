# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

```bash
npm run dev
# → http://localhost:3000/
```

Build: `npm run build` · Start prod: `npm start`

Route inputs, components, and i18n namespaces are derived automatically from code via the TypeScript compiler API (shared chrome `Footer.tsx`, `Nav.tsx`, root/locale layouts, and `globals.css` are excluded by policy). After editing page content or components, run `npm run sitemap:stamp` to update `src/lib/sitemap-dates.json` (audit with `node scripts/sitemap-stamp.mjs --explain <path>`). Run `npm run sitemap:check` manually to verify up-to-date hashes (it is not yet wired into CI; a follow-up PR with workflow scope can add it).

## Architecture

Next.js 16 app (App Router, TypeScript). Source in `src/`.

- **`src/app/layout.tsx`** — root layout: fonts (next/font/google), metadata, Nav, Footer, skip link.
- **`src/app/page.tsx`** — single page: Hero → Services → Team → Testimonials → Contact.
- **`src/app/globals.css`** — all CSS (tokens, reset, components, responsive breakpoints). Global only — no CSS Modules.
- **`src/components/Mark.tsx`** — reusable eclipse SVG. Props: `idPrefix` (unique per instance: `n`/`h`/`f`), `inkColor` (default accent, white for footer), `style`, `className`.
- **`src/components/Nav.tsx`** — `'use client'`. Sticky nav with hamburger at < 480 px.
- **`src/components/ContactForm.tsx`** — `'use client'`. Mailto: form handler.
- **`public/img/`** — person photos served as static assets.
- **Responsive breakpoints:** 899 px (tablet), 719 px (large mobile), 479 px (mobile + hamburger).

## Design constraints

See `DESIGN.md` for the full token reference. Hard rules:

- Fonts: `Space Grotesk` (body/headings) + `JetBrains Mono` (labels/tags/numbers) only — loaded from Google Fonts
- Accent: `--accent: #44579c` / `--accent-fg: #e8e6e0`
- `border-radius: 2px` on buttons, `3px` on cards — never pill-shaped
- `box-shadow: 0 1px 3px rgba(0,0,0,.07)` max — no heavier shadows
- No gradients, no emoji in UI, no coloured accents other than `#44579c`

## Screenshots

Playwright screenshots go in `tmp/` (gitignored). When taking screenshots via the playwright MCP, pass a `filename` of `tmp/<name>.png`.

## Sync

The design source lives at `claude.ai/design` project `2130ba76-3f7b-4724-a841-d913eb6ae028`. Use `DesignSync` to read component files or push an updated `DESIGN.md`.
