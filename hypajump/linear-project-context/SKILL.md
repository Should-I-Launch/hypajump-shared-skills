---
name: linear-project-context
description: "Record every project decision, update, or blocker in Linear so context is never lost. Full detail goes in the issue DESCRIPTION (so AI reading via MCP/API gets the context immediately); a one-liner summary of the decision goes in a COMMENT (so the human-readable changelog records what was decided and when). Use whenever a decision is made, a project moves forward, something is blocked, or context needs preserving."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [linear, context, decisions, project-management, hypajump]
---

# Linear Project Context — Decision & Update Recording

Linear is the durable home for project context. Every meaningful decision, update,
blocker, or change must land in Linear so neither humans nor agents lose the thread
between sessions.

Load the `linear` and `linear-workskill` skills for the API mechanics (auth, IDs,
GraphQL helpers). This skill defines the **convention**, not the plumbing.

## STOP — read this before you touch Linear

The #1 mistake (and the reason this skill exists): dumping a long multi-paragraph
**comment** with all the detail, and NOT editing the description. That is WRONG. Detail
lives in the description. Comments are one line. Always.

Mandatory order — do BOTH, in this order, every time:

1. FIRST edit the issue **description** (`issueUpdate`) — fold ALL the detail in there.
2. THEN add ONE comment — a single line summarizing the decision, nothing more.

If you only do one of the two, you did it wrong. If your comment is longer than one
sentence, you did it wrong — the detail belonged in the description.

### Hard rule on comment length

A comment is **ONE sentence, max ~280 characters, no bullet lists, no headings, no
multi-paragraph body** (the Bob signature lines are the only allowed extra lines). If
what you're about to post has bullets, numbered steps, multiple paragraphs, links to
PRs with explanation, or a "plan" — STOP. That is description content. Edit the
description with it, then write a one-line comment pointing at the decision.

### Self-check before posting any comment

Ask yourself:
- Did I edit the description with the full detail FIRST? If no → go do that.
- Is my comment one sentence? If no → move the rest into the description.
- Does the description now stand alone as the current truth without the comment? If no → fix the description.

## The two-channel rule

For every decision / update / blocker, write to BOTH places on the relevant issue:

1. **DESCRIPTION = the living source of truth (full detail).**
   The description holds the complete, current context: goal, latest status, plan,
   blockers, decisions and their rationale. This is what an AI agent reads first via
   MCP/API, so it must be self-contained and always current. You EDIT the description
   to keep it accurate — fold new context into the right section (e.g. a `# Status
   (latest — <date>)` block), don't let it rot or contradict itself.

2. **COMMENT = the one-liner changelog entry.**
   Every time you change the description because of a decision/update/blocker, add a
   SHORT one-line comment recording WHAT was decided and (implicitly) when. Comments
   are the append-only audit trail of decisions over time; the description is the
   consolidated current picture. Comments are NOT where detail lives — keep them to one line.

So: detail → description (edited/consolidated). Decision record → comment (one-liner, append-only).

## NEVER delete the Goal / original intent

Editing the description means ADD or REVISE the parts that changed — NOT rewrite the
whole thing from scratch and NOT drop context that's still valid. The **Goal / intent**
section of an issue is sacred: preserve it verbatim unless the goal itself genuinely
changed. Same for any still-relevant background, constraints, or scope.

When you update:
- Keep the existing `# Goal` (and other still-true sections) intact.
- Add a fresh `# Status (latest — <date>)` / `# Decisions` block, or revise the specific
  section that changed.
- Only remove text that is now factually wrong or fully superseded — and if you do,
  fold the still-useful bits into the current picture rather than deleting context wholesale.

Think "amend the living document", not "replace the document".

## Examples — WRONG vs RIGHT

Scenario: Ramjet (ENG-99) becomes unblocked; you decided to stay on Kratos (no Clerk),
opened revert PR #3, and mapped the backup scope.

WRONG (what actually happened once):
- Description: left untouched.
- Comment: a 6-paragraph dump with numbered decisions, backup scope bullets, full
  migration plan, and PR link with explanation.
→ Detail trapped in a comment, description stale, goal not preserved as canonical truth.

RIGHT:
- Description: keep the existing `# Goal`. Add `# Status (latest — 2026-06-09)` (unblocked
  → Todo), a `# Decisions` block (stay on Kratos; PR #3 reverts main to 3654f071), a
  `# Backup scope` block, and the `# Migration plan`. Everything detailed lives here.
- Comment (one line): "Unblocked → Todo. Locked: stay on Kratos (no Clerk/SOPS); PR #3
  reverts main to pre-Clerk 3654f071; migrate both DBs + Kratos secrets to Dokploy."
  + Bob signature.

## When to record

Record when ANY of these happen:
- A decision is made (technical choice, scope change, approach picked, tradeoff accepted).
- A project moves forward (milestone reached, phase done, handoff).
- Something is blocked (waiting on a person, credential, external dependency).
- Context worth preserving for the next session/agent is discovered.

Do NOT spam a comment for every intermediate recon step — only for actual decisions,
status changes, and blockers. (Matches `linear-workskill` pitfall #10: don't auto-post
after every discovery step.)

## Procedure

1. **Find the issue.** Map the project to its Linear issue/project via
   `~/Desktop/work/context.md`. If no issue exists for the work, create one
   (see `linear-workskill` Operation 3) and put the full context in the description.

2. **Update the description (full detail).** Read the current description, fold in the
   new context. Keep a clear structure, e.g.:
   ```
   # Goal
   # Status (latest — YYYY-MM-DD)   <- update this each time
   # Plan
   # Blockers
   # Decisions log (optional: bullet of dated decisions with rationale)
   ```
   Edit via `issueUpdate(id, input: { description })`.

3. **Add the one-liner comment (decision record).** One sentence stating the decision/update/blocker.
   Examples:
   - "Decided: migrate Oz Oils email from SMTP to Microsoft Graph API (tenant blocks basic auth)."
   - "Blocked: waiting on Zee for Graph API Tenant/Client ID + secret."
   - "Phase 1 (equipment list extraction) approach confirmed; phase 2 (symbols) needs ML fallback."
   End every comment with the Bob signature (per `linear-workskill` Operation 5):
   ```
   Cheers! Bob
   Bintang Hermes Assistant
   ```

## Consolidation pitfall

If an issue has accumulated multiple long comments that each carry detail (the old
pattern), consolidate: move the substantive context into the description, then delete
the now-redundant comments. Going forward, keep detail in the description and comments
as one-liners. (This is exactly what was done to ENG-99 and ENG-110.)

## Pitfalls

- FIRST edit the description, THEN comment. Never comment-only.
- Comment = one sentence, ≤~280 chars, no bullets/headings/multi-paragraph. Detail goes in the description.
- NEVER delete the Goal / original intent or other still-valid context. Add or revise, don't wipe and rewrite.
- Don't let the description and comments contradict — the description is canonical and
  must be edited to stay current; comments are historical one-liners, not edited.
- Don't dump full detail into comments. One line each.
- Don't post a comment unless there is a real decision/status-change/blocker.
- Always map via `~/Desktop/work/context.md` so you write to the correct issue/project.
- English only for all Linear content (per `linear-workskill`).
