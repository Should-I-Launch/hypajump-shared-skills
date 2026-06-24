---
name: hypajump-template-audit
description: Audit existing HypaJump client projects against the current hypajump-project-template, explain template drift file-by-file, and ask before applying updates so project customizations are not overwritten.
version: 1.0.0
author: Bintang Putra
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [hypajump, template, audit, drift, projects]
    related_skills: [hypajump-project-initializer]
---

# hypajump-template-audit

Audit one or more existing HypaJump client projects against `Should-I-Launch/hypajump-project-template`.

Use this when the template has new instructions/files and older client projects may be outdated.

## Required interaction

1. Ask the user which scope to audit:
   - all known HypaJump projects under `~/projects`, or
   - specific project names/repos, e.g. `pure-piping`, `motorbiz`, `biotech`.
2. If the user names a project loosely, resolve common aliases:
   - `purepiping` → `pure-piping`
   - `motorbase`, `motorbiz`, `motor-biz` → confirm which local/repo folder exists; prefer `motorbiz` for the client project repo.
   - `biotech` → `biotech`
3. Run the audit only. Do **not** update files yet.
4. Present a grouped report:
   - files missing from the project but present in the template,
   - files changed in both places,
   - template-only changes that look safe to copy,
   - project customizations that must be preserved.
5. Ask the user what to update:
   - all safe updates,
   - only selected files,
   - skip everything.
6. Apply only the user-approved updates.

## Source of truth

Template repo:

```bash
~/projects/hypajump-project-template
# remote: Should-I-Launch/hypajump-project-template
```

If missing locally:

```bash
cd ~/projects
git clone https://github.com/Should-I-Launch/hypajump-project-template.git hypajump-project-template
```

Always refresh before audit:

```bash
cd ~/projects/hypajump-project-template
git fetch --all --prune
git checkout master || git checkout main
git pull --ff-only
```

For each project, also fetch latest:

```bash
cd ~/projects/<project>
git fetch --all --prune
```

Do not assume the working tree is clean. Run `git status --short` and warn before editing dirty projects.

## Audit method

Use the template file list as the baseline, ignoring generated/heavy folders:

```text
.git
node_modules
dist
__pycache__
.pytest_cache
.venv
venv
.ruff_cache
```

Ignore local secret files:

```text
.env
.env.local
.env.production
.DS_Store
```

For each template file:

- missing in project → candidate add
- byte-identical → current
- different → read both template and project versions before recommending anything

Important: do not stop at `diff says different`. Read the files and explain the semantic difference.

Useful command:

```bash
python3 - <<'PY'
from pathlib import Path
base=Path.home()/'projects/hypajump-project-template'
projects=[Path.home()/'projects/pure-piping', Path.home()/'projects/motorbiz', Path.home()/'projects/biotech']
ignore_dirs={'.git','node_modules','dist','__pycache__','.pytest_cache','.venv','venv','.ruff_cache'}
ignore_files={'.env','.env.local','.env.production','.DS_Store'}
base_files=[p.relative_to(base) for p in base.rglob('*') if p.is_file() and not (set(p.relative_to(base).parts)&ignore_dirs) and p.name not in ignore_files]
for proj in projects:
    if not proj.exists():
        print(f'## {proj.name}: missing local folder')
        continue
    same=[]; diff=[]; missing=[]
    for rel in base_files:
        q=proj/rel
        if not q.exists(): missing.append(str(rel))
        elif q.read_bytes()==(base/rel).read_bytes(): same.append(str(rel))
        else: diff.append(str(rel))
    print(f'\n## {proj.name}')
    print(f'template files: {len(base_files)} | same {len(same)} | changed {len(diff)} | missing {len(missing)}')
    print('missing:', ', '.join(missing) or '-')
    print('changed:', ', '.join(diff) or '-')
PY
```

Then inspect changed files with `git diff --no-index` or direct reads. Keep output focused:

```bash
git diff --no-index -- ~/projects/hypajump-project-template/<file> ~/projects/<project>/<file> | sed -n '1,220p'
```

## Recommendation rules

Classify each changed/missing file:

### Safe to copy from template

Use when the project has no meaningful customization and the template adds generic instructions, docs, placeholder files, or tooling.

Examples:

- `.gitkeep`
- generic `README.md` sections that do not mention client specifics
- shared `.agents/skills/...` files if the project copy only lags behind template and has no project-specific content

### Needs merge

Use when both sides contain useful content.

Examples:

- root `AGENTS.md` has project-specific context plus new template operating rules
- `README.md` has client-specific stage notes plus new template stage layout
- contract docs have client-specific commercial language plus new template alignment sections

### Do not overwrite

Use when the project file is intentionally client-specific.

Examples:

- project brief content
- engineering response content
- proposal/contract content already tailored to the client
- app docs customized for deployed client infra

## Update method

Prefer the smallest safe change:

1. Add missing generic files from template with `cp` or `write_file`.
2. For changed files, patch only the new template instruction into the project file.
3. Never replace a project file wholesale unless the report explicitly says it has no project-specific content and the user approved it.
4. After edits, show `git diff --stat` and a short list of edited files.

## Output format

Default to a short decision-first report. Do **not** include a full per-file essay unless the user asks for details.

```text
Template: <commit>
Project: <name> <commit>

Verdict: <up-to-date / safe to update / needs manual merge>

Action recommended:
- Safe update: <N> files — <file1>, <file2>, ...
- Needs merge: <N> files — <file1>, ...
- Skip: <N> files — <file1>, ...

Why:
- <one-line reason for the important bucket>
- <one-line note for any customization risk>

Mau apply yang mana?
- all safe updates
- selected files: <list>
- show details first
- skip
```

Only show detailed per-file notes when:

- a file is `needs merge`,
- a file may overwrite client-specific content,
- the user chooses `show details first`, or
- there are 5 or fewer changed files.

Detailed notes must still be one-liners:

```text
<file> — <safe copy / merge / skip>: template changes <X>; project custom has <Y>; action <Z>.
```

## Safety

- Never delete project-only files during this audit.
- Never overwrite client-specific content without explicit approval.
- Do not commit automatically unless the user asks.
- If a repo has uncommitted changes, ask before editing.
- If the project folder is missing, offer to clone from `Should-I-Launch/<repo>` if GitHub CLI/auth is available.
