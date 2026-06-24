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
│   ├── hypajump-dns/SKILL.md               — Cloudflare DNS management for hypajump.ai
│   ├── hypajump-project-initializer/SKILL.md  — scaffold a new client project from template
│   ├── hypajump-template-audit/SKILL.md        — audit client projects against the project template
│   ├── hypajump-slide-initializer/SKILL.md    — foundry mechanics (install, symlink, run)
│   └── hypajump-slide-maker/SKILL.md          — deck content (brief → sections, theme)
├── openslide/
│   ├── create-slide/SKILL.md                  — OpenSlide: workflow for authoring a new deck
│   ├── create-theme/SKILL.md                  — OpenSlide: create a reusable slide theme
│   ├── slide-authoring/SKILL.md               — OpenSlide: technical reference for pages
│   └── apply-comments/SKILL.md                — OpenSlide: apply inspector comment markers
└── README.md
```

Note: `current-slide` from OpenSlide is intentionally omitted because it depends on `node_modules/.open-slide/current.json` relative to the dev-server cwd. Our workflow runs the dev server from the machine-local foundry (`~/.openslide-foundry`) while the deck source lives in the project repo via symlink, so that path resolution does not match.

## Related repos

- `Should-I-Launch/hypajump-project-template` — 5-stage monorepo template (used by project-initializer)
- `Should-I-Launch/hypajump_template` — app boilerplate (FastAPI + React + Postgres), seeded into stage 05
