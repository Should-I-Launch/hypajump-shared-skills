---
name: hypajump-project-initializer
description: Scaffold a new HypaJump client project from the 5-stage template and seed stage 05 with the app boilerplate.
version: 1.0.0
author: Bintang Putra
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hypajump, project, scaffold, initializer, template]
    related_skills: [hypajump-slide-maker, hypajump-slide-initializer]
---

# hypajump-project-initializer

Scaffolds a new HypaJump client project.

## What this skill does

- Clones `Should-I-Launch/hypajump-project-template` into a new project folder.
- Renames the root folder to `{year}-{client_name}`.
- Removes the template's `.git` history so the new project starts clean.
- Seeds `05_build/app/` with the app boilerplate from `Should-I-Launch/hypajump_template`.
- Leaves stages 01–04 empty and ready for the brief/engineering workflow.

## Inputs

- `client_name` — human-readable client name (e.g. `AcmeCorp`).
- `year` — engagement year (e.g. `2026`).
- `output_parent` — absolute path where the project folder should be created. Defaults to the current working directory.

## Outputs

A folder at `{output_parent}/{year}-{client_name}/` containing:

```
2026-AcmeCorp/
├── 01_initial_engagement/          ← from project template
├── 02_project_brief/               ← from project template
├── 03_engineering_response/        ← from project template
├── 04_commercial_proposal/         ← from project template
├── 05_build/
│   ├── AGENTS.md                   ← build-stage context from template
│   └── app/                        ← clone of hypajump_template (boilerplate)
│       ├── AGENTS.md               ← boilerplate code conventions
│       ├── README.md               ← boilerplate getting-started docs
│       ├── backend/
│       ├── frontend/
│       └── docker-compose.yml
├── AGENTS.md                       ← root project context
└── README.md                       ← root project readme
```

## Important seeding notes

- The boilerplate's `README.md` will replace the placeholder `05_build/app/README.md`. This is expected.
- The boilerplate's `AGENTS.md` becomes `05_build/app/AGENTS.md` and governs code conventions there. `05_build/AGENTS.md` (one level up) governs the build stage folder itself. Hermes loads whichever matches your cwd.
- Always remove `.git/` from the seeded boilerplate so the client project keeps its own history.
- After seeding, update Traefik hostnames in `.env` and `docker-compose.yml` from `hypajump.<IP>.sslip.io` to the client-specific name.
- The template includes `.agents/skills/` with HypaJump and OpenSlide authoring instructions. These are readable by any agent tool (Hermes, Claude Code, Codex, Cursor) that scans `.agents/skills/`. They travel with the project repo automatically.

## One-time command

```bash
CLIENT_NAME="AcmeCorp"
YEAR="2026"
OUTPUT_PARENT="/home/ubuntu/projects"
PROJECT_SLUG="${YEAR}-${CLIENT_NAME}"
TEMPLATE_REPO="https://github.com/Should-I-Launch/hypajump-project-template.git"
BOILERPLATE_REPO="https://github.com/Should-I-Launch/hypajump_template.git"

# 1. Clone the 5-stage template
mkdir -p "${OUTPUT_PARENT}"
cd "${OUTPUT_PARENT}"
git clone "${TEMPLATE_REPO}" "${PROJECT_SLUG}"
cd "${PROJECT_SLUG}"
rm -rf .git

# 2. Seed stage 05 with the app boilerplate
rm -rf 05_build/app
git clone "${BOILERPLATE_REPO}" 05_build/app
cd 05_build/app
rm -rf .git
cd ../..

# 3. Done — the folder is ready for the brief/engineering workflow
```

## Post-init workflow

After running this skill:

1. Stages 01–02 are ready for the Project Brief workflow.
2. Stage 03 is ready for the Engineering Response workflow.
3. Stage 05/app is ready for engineering once the proposal is approved.

Do not commit the boilerplate's `.git` into the new project. The new project should be initialised as its own repo when the team is ready.

## Troubleshooting

- **"Folder already exists"** — abort or prompt the user to choose a different slug.
- **Boilerplate clone fails** — check network / repo access.
- **Template clone fails** — verify the template repo URL.
- **Two AGENTS.md files in 05_build** — this is correct. `05_build/AGENTS.md` for the stage, `05_build/app/AGENTS.md` for the code. Work inside the folder whose context you need.
