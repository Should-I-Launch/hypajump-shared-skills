---
name: context
description: "ALWAYS invoke at the START of any conversation about a project or work item (Oz Oils, MotorBiz, Biotech, Ramjet, CopyFlo, or any HypaJump work), BEFORE answering. Gathers current context so a fresh chat / fresh agent doesn't start blind. Resolves the workspace dir, reads (or BOOTSTRAPS from Linear) the project→Linear→repo→path mapping in context.md, pulls the Linear issue(s), and optionally inspects the local codebase / email. Works on a fully fresh machine that has nothing but a Linear API key. Also defines how to UPDATE context when a project moves forward."
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [context, projects, linear, codebase, hypajump, onboarding, bootstrap]
---

# Context — Load, Bootstrap & Update Project Context

A HypaJump conversation usually starts in a NEW chat (and sometimes on a brand-new agent
on a fresh server) with zero memory of where things stand. Invoke this skill at the START
of any conversation that touches a project or work item, BEFORE answering, so you are
grounded in current reality instead of guessing.

This skill must work in two situations:
- **Established machine** — `context.md` already exists, projects already cloned.
- **Fresh agent / fresh VPS** — only a Linear API key is configured. No workspace, no
  cloned repos, no `context.md` yet. In that case you BOOTSTRAP everything from Linear.

## Step 0 — Resolve the workspace directory

There is one workspace folder that holds project repos and the single `context.md`.
Resolve its path in this order and use the first that applies:

1. `$HYPAJUMP_WORK_DIR` environment variable, if set.
2. `~/Desktop/work` if it exists (Bintang's Mac).
3. `~/work` otherwise (default for a fresh Linux VPS) — create it if missing.

Call this resolved path `$WORK`. The mapping file is always `$WORK/context.md`.

## Step 1 — Get the mapping (read it, or bootstrap it)

`context.md` is the SINGLE source of truth mapping each project → Linear project, GitHub
repo, and local path. Never split context across multiple files.

- **If `$WORK/context.md` exists** → read it. Identify the project the user means and grab
  its Linear project id, repo, and local path.

- **If `$WORK/context.md` does NOT exist (fresh agent)** → bootstrap it from Linear, which
  is the authoritative source of the project list:
  1. Use the `linear` / `linear-workskill` skills to `list-projects` (name + id) for the
     HypaJump workspace / ENG team.
  2. If a GitHub CLI (`gh`) is available and authenticated, `gh repo list Should-I-Launch`
     to get repo URLs, and match repos to projects by name. If `gh` is not available,
     leave repo as `(TBD)`.
  3. Set each project's local path to `$WORK/<repo-or-project-slug>` (the path where it
     WOULD be cloned). Mark it clearly if not yet cloned.
  4. Write `$WORK/context.md` with one entry per project: `Linear: <name> (<id>)`,
     `Repo: <url or TBD>`, `Local: <path>`. Mapping only — no stack/domain prose.

## Step 2 — Pull the live context for the relevant project

Using `linear` / `linear-workskill`, fetch the issue(s) for that project — read the
DESCRIPTION (canonical current state) and recent COMMENTS (one-liner decision changelog).
Filter by the project id from `context.md`. This is the fastest way to learn "what is this
about" and "where did we leave off", and it works even when no code is cloned.

## Step 3 — Inspect the codebase (only if the task needs code-level context)

If the question is about code/behaviour and the repo isn't cloned yet, clone it into the
local path from `context.md` (`gh repo clone` / `git clone`), then read README / AGENTS.md
/ CLAUDE.md, recent git log, and branch/status. Use `mcp_morph_mcp_codebase_search` or
`search_files`/`read_file` for specifics. Skip this for non-code questions — Linear is
usually enough.

## Step 4 — Check email (only if relevant)

If the work hinges on an external party (clients, IT contacts, Brett/Tim/Frank) or a
blocker waiting on someone's reply, check email via `bintang-email-management`. Skip
otherwise. (A fresh VPS agent likely has no email creds — skip silently if unavailable.)

Pull only what the conversation needs. Linear + the mapping is the minimum; add
codebase/email only when the task requires them.

## Step 5 — Update context when things change

- **Project decisions / status / blockers** → record in Linear per the
  `linear-project-context` skill (full detail folded into the issue DESCRIPTION, one-line
  summary in a COMMENT; never delete the issue's Goal/intent).

- **Mapping changes** (new project, new repo, repo cloned to a path, confirmed Linear
  project) → update `$WORK/context.md`. Keep entries to just the mapping (Linear project,
  repo, local path) — no stack/domain prose.

## Pitfalls

- Don't answer project questions from memory or stale assumptions — load context first.
- `context.md` is the ONLY context map file. Never split context across multiple files.
- Don't hardcode `~/Desktop/work` — resolve `$WORK` per Step 0 so this works on the VPS too.
- On a fresh agent, don't give up because nothing is cloned — bootstrap the mapping from
  Linear, and only clone a repo when code-level context is actually needed.
- If `context.md` shows a mapping as TBD/CONFIRM and you can verify it, fix it.
- Respect the no-auto-comment rule: only write to Linear for real decisions/blockers.
