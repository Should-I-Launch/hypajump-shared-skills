# HypaJump Shared Skills

Shared Hermes skills for the HypaJump team. Clone this repo into `~/.hermes/skills/` on every Hermes machine so skills are auto-discovered.

## Setup (per machine, one time)

```bash
git clone git@github.com:Should-I-Launch/hypajump-shared-skills.git ~/.hermes/skills/hypajump-shared-skills
```

Hermes scans `~/.hermes/skills/` recursively (`rglob SKILL.md`), so every skill in this repo is auto-discovered after clone — no `hermes skills install` needed.

## Updating

```bash
cd ~/.hermes/skills/hypajump-shared-skills && git pull
```

New/updated skills are picked up on the next Hermes session (`/new` or restart).

## Structure

```
hypajump-shared-skills/
├── hypajump/
│   ├── context/SKILL.md                       — load/bootstrap project→Linear→repo→path context (workspace-agnostic)
│   ├── linear-project-context/SKILL.md        — how to record decisions: detail in description, one-liner in comment
│   ├── meeting-summarizer/SKILL.md            — summarize a meeting transcript WITH project context (context-first)
│   ├── hypajump-project-initializer/SKILL.md  — scaffold a new client project from template
│   ├── hypajump-slide-initializer/SKILL.md    — foundry mechanics (install, symlink, run)
│   └── hypajump-slide-maker/SKILL.md          — deck content (brief → sections, theme)
├── openslide/
│   ├── create-slide/SKILL.md                  — OpenSlide: workflow for authoring a new deck
│   ├── create-theme/SKILL.md                  — OpenSlide: create a reusable slide theme
│   ├── slide-authoring/SKILL.md               — OpenSlide: technical reference for pages
│   └── apply-comments/SKILL.md                — OpenSlide: apply inspector comment markers
└── README.md
```

## Project context (read this if you work on HypaJump projects)

Three skills work together so any Hermes agent — yours, a colleague's, or a fresh one on a
VPS — can pick up a project conversation without starting blind:

- **`context`** — invoked at the start of any project conversation. It resolves your
  workspace dir, reads (or BOOTSTRAPS from Linear) a single `context.md` mapping each
  project → Linear project, GitHub repo, and local path, then pulls the relevant Linear
  issue so you know where things stand. It is **workspace-agnostic**: it does not assume
  anyone's folder layout (see setup below).
- **`linear-project-context`** — the convention for recording decisions/updates/blockers:
  full detail folded into the Linear issue DESCRIPTION, a one-line summary in a COMMENT,
  never deleting the issue's Goal/intent.
- **`meeting-summarizer`** — summarize a meeting transcript context-first: gather context
  via `context` before summarizing, so topics map to real Linear issues and next steps.

### Setup for these (per machine, one time)

1. **Linear API key** — set `LINEAR_API_KEY` in your env (`hermes setup` or `~/.hermes/.env`).
   This is the only hard requirement; the `context` skill can bootstrap everything else
   from Linear.
2. **Workspace dir (optional)** — the skill auto-detects your workspace by looking for an
   existing `context.md` in `~/Desktop/work`, `~/work`, `~/projects`, `~/hypajump`, or the
   cwd. To pin a specific location, set `HYPAJUMP_WORK_DIR=/path/to/your/work`. On a fresh
   machine with none of these, it creates one (`~/work` on Linux, `~/Desktop/work` on macOS).
3. **soul.md line (recommended)** — add this to your `~/.hermes/SOUL.md` so the agent always
   loads context before answering a project question:

   > **Project context (ALWAYS load first).** Whenever a conversation touches a HypaJump
   > project, invoke the `context` skill BEFORE answering — you start a new chat per topic,
   > so you begin with no memory. It resolves the workspace dir, reads (or bootstraps from
   > Linear) `context.md`, and pulls the relevant Linear issue so you're grounded. To record
   > decisions/updates/blockers, follow `linear-project-context`.

## OpenSlide note

`current-slide` from OpenSlide is intentionally omitted because it depends on `node_modules/.open-slide/current.json` relative to the dev-server cwd. Our workflow runs the dev server from the machine-local foundry (`~/.openslide-foundry`) while the deck source lives in the project repo via symlink, so that path resolution does not match.

## Related repos

- `Should-I-Launch/hypajump-project-template` — 5-stage monorepo template (used by project-initializer)
- `Should-I-Launch/hypajump_template` — app boilerplate (FastAPI + React + Postgres), seeded into stage 05
