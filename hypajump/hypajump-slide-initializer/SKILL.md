---
name: hypajump-slide-initializer
description: Copy a repo's OpenSlide deck into the local OpenSlide foundry, register it, and run the dev server for HypaJump Engineering Response decks.
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
- Copies a project's deck folder (`slides/<kebab-id>/`) into the foundry's `slides/` directory.
- Registers the deck using the correct `.folders.json` object schema.
- Installs dependencies and runs `npm run dev` so the deck renders.

## Foundry policy

- The foundry is **machine-local**, not committed to any project repo.
- Project repos store **only** `slides/<kebab-id>/index.tsx` + `slides/<kebab-id>/assets/`.
- Never copy `package.json`, `node_modules`, `open-slide.config.ts`, `tsconfig.json`, or `dist/` into the project repo.
- Decks are edited in the project repo first, then copied into the foundry for rendering.
- **Do not symlink decks into the foundry.** Symlinked decks have caused OpenSlide sidebar/home metadata failures in this environment. Copy the deck folder instead.

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

## Copy a project deck

Given a project deck path `<project>/03_engineering_response/slides/<kebab-id>/`:

```bash
# Verify source exists first
ls <project>/03_engineering_response/slides/<kebab-id>/index.tsx

# Replace foundry copy
rm -rf ~/.openslide-foundry/slides/<kebab-id>
cp -R <project>/03_engineering_response/slides/<kebab-id> ~/.openslide-foundry/slides/<kebab-id>
```

If a foundry folder with the same name already exists, it is a render copy. Replace it from the project source after confirming there are no uncommitted foundry-only edits to preserve.

## Register the deck

OpenSlide reads `.folders.json` to know which folder groups exist and which slides belong to them. The schema is **not** an array of strings. It must use folder objects with `id`, `name`, and `icon`, plus `assignments` mapping slide id → folder id.

Example `.folders.json` after registering one deck:

```json
{
  "folders": [
    {
      "id": "testco-engineering-response",
      "name": "TestCo Engineering Response",
      "icon": { "type": "emoji", "value": "📄" }
    }
  ],
  "assignments": {
    "testco-engineering-response": "testco-engineering-response"
  }
}
```

Bad schema that crashes the sidebar/home shell:

```json
{
  "folders": ["testco-engineering-response"],
  "assignments": {}
}
```

If `folders` is an array of strings, OpenSlide components receive `icon: undefined` and can throw errors like `can't access property "type", icon is undefined` or `dropTarget is null`.

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
- `deck_copy_path` — absolute path to the copied deck folder in the foundry.
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

- **Overflow or footer collision** — build success is not proof of visual fit. From the project repo, run `node .agents/skills/openslide/slide-authoring/scripts/check-slide-overflow.mjs <deck_id>` while the foundry dev server is running. Main content must stay above y=900; split dense pages instead of shrinking type below the slide-authoring scale.
- **`slide.default is undefined` on the foundry home page** — at least one folder under `~/.openslide-foundry/slides/*/index.tsx` does not export a default non-empty `Page[]`. This can be an unrelated old deck, not the deck you just copied. Scan all foundry decks with `for f in ~/.openslide-foundry/slides/*/index.tsx; do echo "$f"; grep -n "export default" "$f" || true; done`. Old OpenSlide decks that use `export const pages = [{ id, render }]` must be converted to zero-prop `const PageName: Page = () => (...)` components plus `export default [PageName] satisfies Page[]`.
- **"Cannot find module @open-slide/core"** — run `npm install` inside `~/.openslide-foundry`.
- **Font missing** — ensure `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` are installed in the foundry.
- **Sidebar crashes with `icon is undefined` or `dropTarget is null`** — fix `.folders.json`; `folders` must be objects with `id`, `name`, and `icon`, and `assignments` must map slide id to folder id.
- **Deck not showing** — check that `index.tsx` exports `design`, `meta`, and a default non-empty `Page[]`; current OpenSlide does not use `export const pages`. Also check that `.folders.json` assigns the deck id to a folder id.
- **Deck changes not appearing** — re-copy the project deck into `~/.openslide-foundry/slides/<kebab-id>`; the foundry uses a copy, not a symlink.
