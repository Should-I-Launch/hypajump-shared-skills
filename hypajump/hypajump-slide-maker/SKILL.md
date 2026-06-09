---
name: hypajump-slide-maker
description: Read an Engineering Response brief and automatically create an OpenSlide deck under slides/<kebab-id>/ using the HypaJump theme. Delegates technical authoring details to the OpenSlide create-slide and slide-authoring skills.
version: 1.0.0
author: Bintang Putra
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hypajump, openslide, deck, content, engineering-response]
    related_skills: [hypajump-slide-initializer, create-slide, slide-authoring]
---

# hypajump-slide-maker

Turns a HypaJump Engineering Response brief into a complete OpenSlide deck.

## Mandatory alignment contract

Before planning or writing any deck, read `03_engineering_response/ENGINEERING_RESPONSE_ALIGNMENT.md` from the project repo. Treat it as the acceptance criteria, not a reference. The deck is not ready unless it matches:

- §7 crosswalk: Cover, What we build — modules, User flows, Core engine / key idea, Operations & security, What gets delivered, Product preview, Tech stack & deployment, Build estimate.
- §4 boilerplate rule: Tech stack documents deltas only. Do not restate standard FastAPI, React, Postgres, Clerk, Docker, CI, or routine dashboard behaviour.
- §6 theme rule: exact HypaJump `design` export, fonts, components, footer brand line.
- §10 checklist: source-data gate visible, open questions carried, mockups/wireframes included, build-days and infra/API cost drivers present, no commercial proposal content.

If the brief structure differs from the alignment crosswalk, map the brief into the alignment crosswalk. Do not mirror the brief headings blindly.

## What this skill does

1. Reads `03_engineering_response/ENGINEERING_RESPONSE_ALIGNMENT.md`.
2. Reads the Engineering Response brief from `03_engineering_response/`.
3. Picks a kebab-case deck id (e.g. `acme-engineering-response`).
4. Maps the brief into the alignment crosswalk page roles.
5. Applies the HypaJump design system (palette, fonts, components).
6. Writes `slides/<kebab-id>/index.tsx` + drops assets into `slides/<kebab-id>/assets/`.
7. Loads `hypajump-slide-initializer` to copy the deck into the foundry and render it.

## How it uses OpenSlide skills

This skill is the **HypaJump content layer** on top of OpenSlide's authoring skills:

- **`create-slide`** — consulted for the overall slide authoring workflow (picking an id, planning page roles, committing to a visual direction, writing `index.tsx`).
- **`slide-authoring`** — consulted for the technical reference (1920×1080 canvas, type scale, layout rules, file contract, assets, transitions).
- **`hypajump-slide-initializer`** — used to install/find the foundry, copy the deck into the foundry, register it in `.folders.json`, and run the dev server.

This skill **skips the user-interview phase** of `create-slide` because the Engineering Response brief already provides the topic, scope, structure, and visual direction (HypaJump).

## Inputs

- `project_path` — absolute path to the client project repo.
- `deck_id` — kebab-case identifier. If omitted, derive from client name + `engineering-response`.
- `brief_path` — path to the brief file. Defaults to the first found of:
  - `03_engineering_response/ENGINEERING_RESPONSE.md`
  - `03_engineering_response/<CLIENT>_ENGINEERING_BRIEF.md`

## Section → page mapping

Use the `ENGINEERING_RESPONSE_ALIGNMENT.md §7` crosswalk as the source of truth. Standard page order:

| Alignment section | Deck page role | Rules |
| --- | --- | --- |
| Cover | Cover | Project name, one-line app description, build window/days |
| What we build — modules | What We Build | 2–4 customer-readable modules, not internal CRUD/task breakdown |
| User flows | User Flow | Step sequence per role, e.g. `Create job → Upload PDFs → Process → Review → Export` |
| Core engine / key idea | Core Engine | The differentiated mechanism in plain language |
| Operations & security | Security & Ops | Database, auth, storage, backup/recovery, audit logging |
| What gets delivered | Delivery Scope | Milestones plus explicit in/out scope boundary |
| Product preview | Product Preview | Real mockup/screenshot/wireframe asset or JSX wireframe; must fit canvas |
| Tech stack & deployment | Tech Stack | Deltas only vs HypaJump boilerplate + hosting/API decisions |
| Build estimate | Build Estimate | Milestones × effort/days + infra/API cost drivers only |
| Source data / open questions | Source Data Gate | Required when blockers or estimate conditions remain |

Do not use the old brief-heading mapping as the page plan. The deck exists to feed Brett's proposal containers.

## HypaJump design system

Use this exact `design` export at the top of `index.tsx`:

```tsx
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#FFFFFF', text: '#3B2517', accent: '#8D57FB' },
  fonts: {
    display: "Geist, 'Inter', system-ui, -apple-system, sans-serif",
    body: "Inter, system-ui, -apple-system, sans-serif",
  },
  typeScale: { hero: 180, body: 36 },
  radius: 16,
};
```

Install the two non-shipping fonts in the foundry if they are missing:

```bash
cd ~/.openslide-foundry
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

## Reusable HypaJump components

Inline these paste-ready components inside `index.tsx` (do not create separate files):

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 'var(--osd-size-hero)',
      fontWeight: 900,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--osd-text)',
    }}
  >
    {children}
  </h1>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 28,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'var(--osd-accent)',
    }}
  >
    {children}
  </div>
);
```

### Footer

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 60,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 24,
        color: '#57534E',
      }}
    >
      <span>Hypajump · AI Microapps</span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};
```

### Pill

```tsx
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-block',
      background: 'var(--osd-accent)',
      color: '#FFFFFF',
      padding: '12px 24px',
      borderRadius: 999,
      fontSize: 28,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);
```

## Workflow

1. Read `03_engineering_response/ENGINEERING_RESPONSE_ALIGNMENT.md`.
2. Read the brief.
3. Create a page plan from the alignment §7 crosswalk, not from the brief headings.
4. Check the plan against §10 checklist before writing code.
5. Derive or confirm `deck_id`.
6. Create `slides/<deck_id>/` and `slides/<deck_id>/assets/`.
7. Write `index.tsx` with:
   - imports and exact `design` export
   - inline `Title`, `Eyebrow`, `Footer`, `Pill`
   - one `Page` component per alignment section
   - `meta` export with title and `createdAt`
   - default export array
8. Include a Product Preview wireframe/mockup. If no image asset exists, build a JSX wireframe page and add a note that it is the preview mockup.
9. Load `hypajump-slide-initializer` to copy, register, and render the deck.
10. After every later update to `slides/<deck_id>/index.tsx` or assets, immediately copy the updated deck into the foundry render folder before checking the browser. Do not leave the foundry copy stale.
11. Before opening the foundry home page, validate **all** foundry decks, not only the current deck: every `~/.openslide-foundry/slides/*/index.tsx` must have `export default [PageName, ...] satisfies Page[]`. If the home crashes with `slide.default is undefined`, an unrelated old deck probably still uses the obsolete `export const pages = [{ id, render }]` contract.
12. Run `npm run build` in the foundry.
13. Run `node .agents/skills/openslide/slide-authoring/scripts/check-slide-overflow.mjs <deck_id>` from the project repo while the foundry dev server is running. This headless DOM check must pass; do not rely on manual visual inspection or build success alone.
14. Re-check against alignment §7 and §10 before saying the deck is ready.

## Constraints from slide-authoring (read that skill before writing)

- Canvas is fixed 1920 × 1080. Design in absolute pixels.
- Content padding: 100–160 px from edges.
- Vertical budget = 1080 − top padding − bottom padding. Do not overflow.
- Keep footers clear: content must end above `y=900` when using the standard footer at `bottom: 60px`; y=900–1080 is the reserved footer zone.
- Add `data-slide-page`, `data-slide-content`, and `data-slide-footer` markers so the automated overflow checker can validate every page.
- Build estimate pages are common overflow traps. Use compact rows, split into two pages, or reduce row count rather than letting the footer overlap.
- Specific pitfall: five milestone rows at ~100px height plus heading/eyebrow/gaps will collide with the footer on a 1080px canvas. Split into `Delivery Scope` (milestones) and `Build Estimate` (total + cost drivers), or use ≤4 compact rows per page.
- Treat any content visible behind or below the footer as a failed deck, even if `npm run build` succeeds.
- One idea per page. Split rather than squeeze.
- Use `var(--osd-*)` for colors/fonts/sizes so the Design panel can tweak them.
- Use `useSlidePageNumber()` for page numbers; never hardcode.

## Boundary

- No pricing, guarantees, care tiers, or referral programme — those belong to stage 04.
- Build-days and infra/API cost drivers only.
- Do not modify `package.json`, `open-slide.config.ts`, or other decks.
- Do not use `.map()` for repeated visual cards/rows; instantiate components explicitly so the OpenSlide inspector can edit individual items.
- Do not call the deck ready until the alignment §7 sections and §10 checklist are satisfied.
