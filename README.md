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
│   ├── hypajump-slide-initializer/SKILL.md    — foundry mechanics (install, symlink, run)
│   ├── hypajump-slide-maker/SKILL.md          — deck content (brief → sections, theme)
│   └── hypajump-project-initializer/SKILL.md  — create new project from template
└── README.md
```

## Related repos

- `Should-I-Launch/hypajump-project-template` — 5-stage monorepo template (used by project-initializer)
- `Should-I-Launch/hypajump_template` — app boilerplate (FastAPI + React + Postgres), seeded into stage 05
