---
name: hypajump-slide-initializer
description: Install/find the OpenSlide foundry, symlink a repo's deck into it, and run the dev server for HypaJump Engineering Response decks.
version: 1.0.0
author: Bintang Putra
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hypajump, openslide, deck, foundry, slides]
    related_skills: [hypajump-slide-maker]
---

# hypajump-slide-initializer

Machine-side skill for rendering HypaJump OpenSlide decks.

## What this skill does

- Finds or installs a reusable OpenSlide foundry on the machine (`~/.openslide-foundry` by default; configurable per machine).
- Symlinks a project's deck folder (`slides/<kebab-id>/`) into the foundry's `slides/` directory.
- Installs dependencies and runs `npm run dev` so the deck renders.

## Foundry policy

- The foundry is **machine-local**, not committed to any project repo.
- Project repos store **only** `slides/<kebab-id>/index.tsx` + `slides/<kebab-id>/assets/`.
- Never copy `package.json`, `node_modules`, `open-slide.config.ts`, `tsconfig.json`, or `dist/` into the project repo.
- Decks are edited in the project repo; the foundry reads them via symlink.

## Default paths

- Foundry root: `~/.openslide-foundry`
- Foundry slides dir: `~/.openslide-foundry/slides/`
- Project deck: `<project>/03_engineering_response/slides/<kebab-id>/`

## One-time machine setup

This section covers both the OpenSlide foundry and the Hermes skills needed to author and render decks.

### 1. Install the OpenSlide foundry

If `~/.openslide-foundry` does not exist:

```bash
npx @open-slide/cli init ~/.openslide-foundry --no-git
cd ~/.openslide-foundry
npm install
# Install fonts required by the HypaJump theme
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

### 2. Install the HypaJump shared skills repo

The shared skills repo contains both HypaJump skills (`hypajump-slide-maker`, `hypajump-project-initializer`, this skill) and the OpenSlide authoring skills (`create-slide`, `create-theme`, `slide-authoring`, `apply-comments`). Hermes auto-discovers skills from `~/.hermes/skills/` recursively.

If `~/.hermes/skills/hypajump-shared-skills` does not exist:

```bash
git clone https://github.com/Should-I-Launch/hypajump-shared-skills.git ~/.hermes/skills/hypajump-shared-skills
```

If it already exists, pull the latest version:

```bash
cd ~/.hermes/skills/hypajump-shared-skills && git pull
```

After this, Hermes will know about:

- `hypajump-project-initializer`
- `hypajump-slide-initializer`
- `hypajump-slide-maker`
- `create-slide`
- `create-theme`
- `slide-authoring`
- `apply-comments`

A new Hermes session (`/new` or restart) may be needed for newly cloned skills to be discovered.

## Symlink a project deck

Given a project deck path `<project>/03_engineering_response/slides/<kebab-id>/`:

```bash
cd ~/.openslide-foundry/slides
ln -s <project>/03_engineering_response/slides/<kebab-case-id> <kebab-case-id>
```

If a symlink or folder with the same name already exists, replace it after confirming with the user (or abort).

## Register the deck

OpenSlide reads `.folders.json` to know which slide folders exist. Add the deck id:

```bash
cd ~/.openslide-foundry/slides
# Read current .folders.json
# Add "<kebab-case-id>" to the "folders" array
# Write it back
```

Example `.folders.json` after registering one deck:

```json
{
  "folders": [
    "testco-engineering-response"
  ],
  "assignments": {}
}
```

Without this step, `npm run dev` and `npm run build` will not see the deck.

## Run the deck

```bash
cd ~/.openslide-foundry
npm run dev
```

The dev server URL is printed by OpenSlide (usually `http://localhost:3000` or similar). Open it in a browser.

## Build/preview (when ready)

```bash
cd ~/.openslide-foundry
npm run build
npm run preview
```

## How other skills use this

`hypajump-slide-maker` loads this skill when it needs to render a deck. It passes:

- `project_path` — absolute path to the project repo.
- `deck_id` — kebab-case identifier for the deck (e.g. `motorbiz-engineering-response`).

This skill returns:

- `foundry_path` — absolute path to the foundry.
- `deck_symlink_path` — absolute path to the symlink in the foundry.
- `dev_url` — the local URL where the deck is running.

## OpenSlide skills in the foundry

The OpenSlide CLI (`npx @open-slide/cli init`) scaffolds its own `.agents/skills/` inside the foundry:

- `create-slide` — workflow for authoring a new deck.
- `create-theme` — create a reusable slide theme.
- `slide-authoring` — technical reference for pages.
- `apply-comments` — apply inspector comment markers.

These are available when you work inside the foundry directory (`~/.openslide-foundry`).

The project repo also carries its own `.agents/skills/` (copied from the template) with HypaJump-specific skills. Use whichever matches your cwd:
- In the project repo → HypaJump skills (`hypajump-slide-maker`, etc.).
- In the foundry → OpenSlide skills (`create-slide`, `slide-authoring`, etc.).

## Troubleshooting

- **"Cannot find module @open-slide/core"** — run `npm install` inside `~/.openslide-foundry`.
- **Font missing** — ensure `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` are installed in the foundry.
- **Symlink already exists** — remove or replace it; never nest symlinks.
- **Deck not showing** — check that `index.tsx` exports `design`, `meta`, and `pages` per OpenSlide conventions.
