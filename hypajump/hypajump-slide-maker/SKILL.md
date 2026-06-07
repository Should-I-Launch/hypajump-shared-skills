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

## What this skill does

1. Reads the Engineering Response brief from `03_engineering_response/`.
2. Picks a kebab-case deck id (e.g. `acme-engineering-response`).
3. Maps each brief section into deck pages.
4. Applies the HypaJump design system (palette, fonts, components).
5. Writes `slides/<kebab-id>/index.tsx` + drops assets into `slides/<kebab-id>/assets/`.
6. Loads `hypajump-slide-initializer` to render the deck in the foundry.

## How it uses OpenSlide skills

This skill is the **HypaJump content layer** on top of OpenSlide's authoring skills:

- **`create-slide`** — consulted for the overall slide authoring workflow (picking an id, planning page roles, committing to a visual direction, writing `index.tsx`).
- **`slide-authoring`** — consulted for the technical reference (1920×1080 canvas, type scale, layout rules, file contract, assets, transitions).
- **`hypajump-slide-initializer`** — used to install/find the foundry, symlink the deck, register it in `.folders.json`, and run the dev server.

This skill **skips the user-interview phase** of `create-slide` because the Engineering Response brief already provides the topic, scope, structure, and visual direction (HypaJump).

## Inputs

- `project_path` — absolute path to the client project repo.
- `deck_id` — kebab-case identifier. If omitted, derive from client name + `engineering-response`.
- `brief_path` — path to the brief file. Defaults to the first found of:
  - `03_engineering_response/ENGINEERING_RESPONSE.md`
  - `03_engineering_response/<CLIENT>_ENGINEERING_BRIEF.md`

## Section → page mapping

| Engineering Response section | Deck page role |
| --- | --- |
| Problem / workflow removed | Cover + context |
| Behaviour outcome | What it makes happen |
| Core mechanism | Core engine / key idea |
| Modules + user flows | What we build + User flows |
| Operations & security | Security & Ops spec |
| Product preview | Product preview (image assets) |
| Tech stack & deployment | Tech stack (deltas only) |
| Build estimate | Build estimate + cost drivers |

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

1. Read the brief.
2. Derive or confirm `deck_id`.
3. Create `slides/<deck_id>/` and `slides/<deck_id>/assets/`.
4. Plan pages using the section mapping above. Keep the page count tight (6–10 pages is standard).
5. Write `index.tsx` with:
   - imports and `design` export
   - inline `Title`, `Eyebrow`, `Footer`, `Pill`
   - one `Page` component per section
   - `meta` export with title and `createdAt`
   - default export array
6. Copy mockups/screenshots/diagrams into `assets/` and import them.
7. Load `hypajump-slide-initializer` to symlink, register, and render the deck.

## Constraints from slide-authoring (read that skill before writing)

- Canvas is fixed 1920 × 1080. Design in absolute pixels.
- Content padding: 100–160 px from edges.
- Vertical budget = 1080 − top padding − bottom padding. Do not overflow.
- One idea per page. Split rather than squeeze.
- Hero title: 140–200 px. Body: 32–44 px.
- Use `var(--osd-*)` for colors/fonts/sizes so the Design panel can tweak them.
- Use `useSlidePageNumber()` for page numbers; never hardcode.

## Boundary

- No pricing, guarantees, care tiers, or referral programme — those belong to stage 04.
- Build-days and infra/API cost drivers only.
- Do not modify `package.json`, `open-slide.config.ts`, or other decks.
