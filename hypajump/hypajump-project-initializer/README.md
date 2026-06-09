# hypajump-project-initializer

Scaffold a new HypaJump client project in one command. No manual cloning, no renaming folders, no guessing where things go.

## What it does

1. Clones the 5-stage project template into a new folder
2. Seeds stage 05 with the app boilerplate (FastAPI + React)
3. Removes template git history so the new project starts clean
4. Leaves stages 01-04 empty and ready for brief/engineering workflow

## When to use it

- Starting any new client engagement
- Spinning up a new internal tool (like CopyFlo)
- Any time you need a fresh 5-stage workspace

## One command

```bash
APP_NAME="oz-oils-lead-gen"
OUTPUT_PARENT="/home/ubuntu/projects"

mkdir -p "${OUTPUT_PARENT}"
cd "${OUTPUT_PARENT}"

git clone https://github.com/Should-I-Launch/hypajump-project-template.git "${APP_NAME}"
cd "${APP_NAME}"
rm -rf .git

rm -rf 05_build/app
git clone https://github.com/Should-I-Launch/hypajump_template.git 05_build/app
cd 05_build/app
rm -rf .git
cd ../..
```

Replace `APP_NAME` with your project slug (kebab-case, e.g. `motor-biz-fines`, `biotech-pid-viewer`).

## What you get

```
oz-oils-lead-gen/
├── 01_initial_engagement/     ← raw transcripts, emails, discovery notes
├── 02_project_brief/          ← PROJECT_BRIEF.md
├── 03_engineering_response/   ← engineering response + OpenSlide deck
├── 04_commercial_proposal/    ← client-facing proposal
├── 05_build/
│   ├── AGENTS.md              ← build-stage context
│   └── app/                   ← FastAPI + React + Docker boilerplate
│       ├── backend/
│       ├── frontend/
│       └── docker-compose.yml
├── AGENTS.md                  ← root project map
└── README.md
```

## Two phases

1. **Brief phase** — work in 01-04. 05_build/app stays empty.
2. **Build phase** — seed 05_build/app from hypajump_template, then build there.

## Next steps after scaffolding

1. `git init` + `git add -A` + `git commit -m "Initial scaffold"`
2. Create GitHub repo: `gh repo create Should-I-Launch/APP_NAME --public --source=. --push`
3. Add brief material to `02_project_brief/`
4. Work the pipeline: brief → engineering response → proposal → build

## Common issues

- **Folder already exists** — pick a different APP_NAME or delete the existing folder
- **Clone fails** — check network or repo access (should be public)
- **Two AGENTS.md in 05_build** — correct. 05_build/AGENTS.md for stage context, 05_build/app/AGENTS.md for code conventions
