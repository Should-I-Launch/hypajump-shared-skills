---
name: hypajump-slide-maker
description: Map an Engineering Response brief into an OpenSlide deck using the HypaJump theme and section structure.
version: 0.1.0
author: Bintang Putra
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hypajump, openslide, deck, content, engineering-response]
    related_skills: [hypajump-slide-initializer]
---

# hypajump-slide-maker

Content skill for turning a HypaJump Engineering Response into an OpenSlide deck.

## What this skill does

- Reads the Engineering Response brief from `03_engineering_response/`.
- Maps each section into OpenSlide pages per the HypaJump theme.
- Writes `slides/<kebab-id>/index.tsx` + drops assets into `slides/<kebab-id>/assets/`.
- Loads `hypajump-slide-initializer` when the deck needs to be rendered.

## Section mapping

| Engineering Response section | Deck section |
| --- | --- |
| Problem / workflow removed | Cover + context slide |
| Behaviour outcome | What it makes happen |
| Core mechanism | Core engine / key idea |
| Modules + user flows | What we build + User flows |
| Operations & security | Security & Ops spec |
| Product preview | Product preview (assets) |
| Tech stack & deployment | Tech stack (deltas only) |
| Build estimate | Build estimate + cost drivers |

## Theme

Use the HypaJump design export verbatim:

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

## Workflow

1. Read `03_engineering_response/ENGINEERING_RESPONSE.md` (or `<CLIENT>_ENGINEERING_BRIEF.md`).
2. Pick or create `slides/<kebab-id>/`.
3. Write `index.tsx` with `design`, `meta`, and `pages` exports.
4. Copy mockups/screenshots into `assets/`.
5. Load `hypajump-slide-initializer` to render the deck.

## Boundary

- No pricing, guarantees, care tiers, or referral programme — those belong to stage 04.
- Build-days and infra/API cost drivers only.
