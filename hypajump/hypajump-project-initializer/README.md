# hypajump-project-initializer

**What this is:** A one-click starter kit for every new HypaJump client project. Instead of manually creating folders and copying files, this skill sets up the entire workspace automatically.

## Why We Built This

Every client project at HypaJump follows the same 5-stage structure. Doing it by hand is repetitive and error-prone. This skill guarantees every project starts with the right folders, the right boilerplate, and the right conventions — so the team can focus on the actual work, not folder setup.

## What You Get

A ready-to-use project folder with:

- **Stages 01–04** — empty and waiting for your brief, engineering response, and proposal
- **Stage 05** — pre-loaded with our FastAPI + React + Docker boilerplate so engineering can start immediately after client approval
- **Project context files** — `AGENTS.md` and `README.md` that help any AI tool (Hermes, Claude Code, Codex, Cursor) understand the project structure

## When to Use This

- Starting a new client engagement
- Spinning up an internal tool (like CopyFlo)
- Any time you need a fresh, properly structured workspace

## How to Use It

Invoke the skill in Hermes with a natural prompt. Tell it the project name and where to put it.

**Example prompts:**

```
/hypajump-project-initializer initialize a new project called oz-oils-lead-gen in /home/ubuntu/projects
```

```
/hypajump-project-initializer scaffold motor-biz-fines here
```

```
/hypajump-project-initializer set up a new workspace for biotech-pid-viewer under ~/projects
```

The skill handles all the cloning, folder setup, and boilerplate seeding automatically.

## What the Folder Looks Like After

```
oz-oils-lead-gen/
├── 01_initial_engagement/    ← discovery notes, transcripts, emails
├── 02_project_brief/         ← the client brief lives here
├── 03_engineering_response/  ← technical response + OpenSlide deck
├── 04_commercial_proposal/   ← client-facing proposal
├── 05_build/
│   ├── AGENTS.md             ← context for the build stage
│   └── app/                  ← FastAPI + React + Docker boilerplate
│       ├── backend/
│       ├── frontend/
│       └── docker-compose.yml
├── AGENTS.md                 ← root project map
└── README.md
```

## Two-Phase Workflow

| Phase | What Happens |
|-------|--------------|
| **Brief phase** | Work in stages 01–04. Stage 05/app stays untouched. |
| **Build phase** | Once the proposal is approved, the boilerplate in 05/app is ready to go. |

## What to Do Next

1. `git init` + `git add -A` + `git commit -m "Initial scaffold"`
2. Create a GitHub repo: `gh repo create Should-I-Launch/APP_NAME --public --source=. --push`
3. Drop your brief materials into `02_project_brief/`
4. Run the pipeline: brief → engineering response → proposal → build

## If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| Folder already exists | Pick a different name or delete the old folder |
| Clone fails | Check your internet or repo access |
| Two AGENTS.md files in 05_build | This is correct — one is for the stage, one is for the code |
