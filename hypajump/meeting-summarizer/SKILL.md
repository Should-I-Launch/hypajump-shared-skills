---
name: meeting-summarizer
description: "Summarize a meeting transcript WITH project context, not blind. Trigger when given a meeting transcript / notes and asked to summarize. Step 1 is ALWAYS to gather context (invoke the `context` skill) so you understand what the meeting is actually about before summarizing: which projects/issues it touches, where each one stands, and what the right next steps are. Designed to run on a fresh Hermes agent that starts with only a Linear API key."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [meeting, summary, transcript, context, linear, hypajump]
---

# Meeting Summarizer — Context-First

A raw meeting transcript is unintelligible without project context. People say "Oz Oils",
"the SMTP thing", "MoBiz symbols", "the 20x" — none of that means anything to a fresh
agent until it knows the projects, their Linear issues, and where they stand. So you NEVER
summarize cold. You gather context FIRST, then summarize against it.

This skill is built to run on a fresh Hermes agent (e.g. on a VPS) whose only credential is
a Linear API key. It leans on the `context` skill to bootstrap everything else.

## Trigger

The user gives you a meeting transcript / notes (file, paste, or attachment) and asks for a
summary, action items, or "what was this about".

## Procedure

### Step 1 — Read the transcript and extract the surface signals

Read the full transcript. Pull out, as a working list:
- Which **projects / products / clients** are named or implied (e.g. Oz Oils, MotorBiz,
  Biotech, Ramjet, CopyFlo).
- Decisions, blockers, commitments, and "we'll do X next" statements.
- People and who owns what.

Don't write the summary yet — you don't understand it well enough.

### Step 2 — Gather context (MANDATORY, before summarizing)

Invoke the **`context` skill**. It will:
- Resolve the workspace dir and read or BOOTSTRAP `context.md` from Linear (fresh agent:
  it builds the project→Linear→repo→path mapping from `list-projects`).
- For each project the transcript touches, pull the Linear issue DESCRIPTION (canonical
  current state) and recent one-liner COMMENTS (decision changelog).
- Optionally clone/inspect a repo or check email only if the meeting hinges on code- or
  email-level detail.

Now map each transcript topic to its real project + Linear issue, and to where that work
actually stands. This is what turns "the SMTP thing" into "ENG-110, blocked on Graph API
credentials from Zee".

### Step 3 — Think: what is this meeting actually about?

With context loaded, reconcile the transcript against reality:
- What was genuinely decided vs. just floated?
- Does a decision change an existing issue's status/plan? (e.g. unblocks it, reverses a
  prior approach.)
- What's a brand-new item with no issue yet?

### Step 4 — Write the summary

Structure (prose for context/decisions, bullets only for action items — Bintang's pref):

```
# Meeting Summary — DD Month YYYY
Participants: ...

## <Topic / Project 1>  (Linear: <issue id + title, or "no issue yet">)
What was discussed — in prose, grounded in the project's actual state.
Decision(s): ...
Where it stands now (per Linear): ...
Next steps:
- actionable next step (owner if known)

## <Topic / Project 2>  (Linear: ...)
...

## New / unmapped items
- things raised that have no Linear issue yet (flag for triage)
```

For every topic, tie it to a Linear issue id where one exists, and state the next step in
terms of the real context — not a vague "discuss further".

### Step 5 — Output

Present the summary. If the user wants it saved or recorded to Linear, do that explicitly
(per `linear-project-context`) — do NOT auto-write to Linear just from summarizing.

## Language

Default to Bintang's preferred language for the summary (Indonesian) unless the transcript
or user indicates otherwise. Keep Linear content English.

## Pitfalls

- NEVER summarize before Step 2. A cold summary mislabels topics and invents next steps.
- A fresh agent has no `context.md` and nothing cloned — that's expected. The `context`
  skill bootstraps the mapping from Linear; don't bail out.
- Only the Linear API key is guaranteed. If `gh`/email aren't configured, skip those
  sources silently and rely on Linear.
- Don't paste raw timestamps or dump the transcript back — extract meaning.
- Capture tension/disagreement (push-back, compromises) — that's usually the important part.
- Summarizing is read-only by default. Don't create issues or post comments unless asked.
