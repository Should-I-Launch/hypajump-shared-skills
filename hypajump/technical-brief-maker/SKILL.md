---
name: technical-brief-maker
description: Use after a HypaJump client README brief exists and Bintang wants a final technical brief for proposal feasibility, not coding implementation planning. Reads ~/proposals/<client-slug>/README.md, evaluates all discovered automation flows, researches viable technologies with Context7/web docs, discusses recommendations with Bintang, waits until final, then writes ~/proposals/<client-slug>/TECHNICAL-BRIEF.md and attaches it to the active Slack thread.
version: 1.0.0
author: HypaJump
license: MIT
metadata:
  hermes:
    tags: [hypajump, technical-brief, feasibility, automation, proposal, context7]
    related_skills: [brief-drafter, proposal-maker]
---

# HypaJump Technical Brief Maker

## Overview

Turn a completed client README brief into a final technical brief for proposal and feasibility evaluation.

This is not a coding implementation plan. It is not about deciding v1/v2 engineering scope. The goal is to understand whether the client’s requested automations are feasible, what technology/mechanisms could deliver them, what risks exist, and what should be represented in the final proposal.

Output:

```text
~/proposals/<client-slug>/TECHNICAL-BRIEF.md
```

When invoked from Slack, the final response must attach the actual Markdown file using `MEDIA:/absolute/path/to/TECHNICAL-BRIEF.md`.

## When To Use

Use this skill when:

- `~/proposals/<client-slug>/README.md` already exists.
- Bintang wants to evaluate feasibility and technical approach for the proposal.
- The user asks for technical brief, feasibility, “pakai teknologi apa”, “possible atau tidak”, automation mechanisms, or proposal-ready technical notes.
- Multiple client flows exist and all should be considered in the proposal.

Do not use this skill to infer the original client intent from raw files. Use `brief-drafter` first.

Do not use this skill to make slides. Use `proposal-maker` after `README.md` and `TECHNICAL-BRIEF.md` are ready.

## Core Principles

- Cover all meaningful automation flows discovered in the README. Do not ask whether a discovered flow is “in scope” for the proposal unless it is genuinely unclear whether it belongs to the client request.
- Do not frame the work as v1/v2 engineering delivery. Detailed developer scoping can happen later outside this proposal workflow.
- Bintang is the primary solution thinker. Hermes recommends, researches, pressure-tests, and documents.
- The brief should answer: “Can we automate this?”, “How might we automate it?”, “What technologies/libraries/services would we likely use?”, “What are the risks?”, and “What should the proposal promise carefully?”
- The solution may be simple or mixed: scripts, document automation, spreadsheet workflows, internal dashboard, browser automation, API integrations, LLM extraction, deterministic templating, human review gates, Zapier/n8n-style automation, or web app.
- Use the existing HypaJump stack as context, not as a requirement. Prefer simpler tools when they fit the client problem better.
- Use Context7 for implementation docs when a library/framework/API choice matters.
- Use web research/vendor docs when Context7 is insufficient.
- Finalize only when Bintang says “final”, “lock”, “oke final”, or equivalent.

## Workflow

1. Locate and read the client brief.
   - Prefer an explicit path from the user.
   - Otherwise infer from `~/proposals/<client-slug>/README.md`.
   - If multiple candidate clients exist, ask briefly which one.

2. Identify all automation flows in the README.
   - Treat every meaningful flow as part of proposal feasibility by default.
   - Do not ask “should we include flow A or B?” when the client clearly requested both.
   - Instead, identify how each flow can be automated and how confident we are.

3. Summarize to Bintang.
   - List the flows found.
   - State the likely technical mechanism for each.
   - Highlight feasibility concerns and decision points.

4. Discuss recommendation with Bintang.
   - Offer practical approaches for each flow.
   - Include tradeoffs: reliability, build complexity, maintainability, data sensitivity, client UX, human review, and proposal risk.
   - Ask only questions that affect feasibility, proposal promise, technology choice, pricing confidence, or risk.

5. Research technologies/mechanisms.
   - Use Context7 for framework/library docs, e.g. document generation, PDF filling, Word templating, background jobs, auth, storage, queues, browser automation, testing, OCR, spreadsheet parsing.
   - Use web/vendor docs for SaaS APIs, Adobe Sign, government/legal-aid systems, calendar APIs, pricing-sensitive or platform-specific limitations.
   - Prefer primary docs. Keep citations concise and tied to specific recommendations.

6. Wait for final.
   - Do not write the final `TECHNICAL-BRIEF.md` while the approach is still unsettled.
   - It is okay to maintain draft notes in the conversation.

7. Write `~/proposals/<client-slug>/TECHNICAL-BRIEF.md`.
   - Base it on README plus confirmed discussion and research.
   - Include all flows, feasibility, recommended technologies, risks, assumptions, and proposal notes.

8. Deliver the Markdown file.
   - In Slack, attach the actual Markdown file in the final response using `MEDIA:/absolute/path/to/TECHNICAL-BRIEF.md`.
   - Do not only paste the content.
   - Do not only provide the folder path.
   - Include a short summary plus the `MEDIA:` attachment.
   - If the path contains spaces, copy it to `/tmp/<client-slug>-TECHNICAL-BRIEF.md` first and attach that copy.

## TECHNICAL-BRIEF.md Skeleton

Use this structure and adapt as needed:

```markdown
# <Client / Project Name> — Technical Brief

Client slug: <client-slug>
Source brief: ./README.md
Status: Draft / Final
Last updated: <date>

## 1. Executive technical summary

<Can this be automated? What is the recommended overall approach?>

## 2. Automation flows covered

<List every discovered flow. Include all flows relevant to the proposal.>

## 3. Feasibility by flow

### Flow 1 — <name>

Current manual process:
<Brief recap.>

Automation mechanism:
<How this can be automated.>

Recommended technology:
<Libraries, APIs, services, document mechanisms, AI usage.>

Human review / safety:
<Where a human must approve.>

Feasibility: High / Medium / Low
Reason:
<Short reason.>

Risks / unknowns:
<Important caveats.>

### Flow 2 — <name>

<Repeat.>

## 4. Recommended technical approach

<Overall architecture/mechanism for proposal purposes. Keep it technology-focused, not a developer ticket plan.>

## 5. AI usage boundaries

<Where AI helps, where deterministic logic should own the output, and where human review is mandatory.>

## 6. Data, documents, and integrations

<Inputs, outputs, templates, document formats, storage, third-party systems, APIs, manual handoffs.>

## 7. Technology notes / candidate stack

<Specific libraries/services/frameworks and why they are plausible. Include the existing HypaJump stack as context when relevant, but do not force it if a simpler automation is better.>

## 8. Testing and validation approach

<How we can prove the automation works using provided samples/golden cases. This is feasibility validation, not a full engineering QA plan.>

## 9. Proposal notes

<What the proposal can confidently promise, what should be worded carefully, and what assumptions should be surfaced.>

## 10. Research references

<Concise links to docs used.>
```

## HypaJump Existing Stack Context

Use this as context from prior HypaJump work, not as a mandatory stack. Mention it as an option only when it fits the client’s automation problem.

- Frontend: Next.js.
- Backend option 1: Python with FastAPI.
- Backend option 2: Go with Gin.
- Database: PostgreSQL.
- Cache / broker / fast state: Redis.
- Python background automation: Celery workers and Celery Beat for scheduled jobs.
- Hosting / deployment: Dokploy.

Do not force this stack onto every proposal. Some automations are better as a simple script, spreadsheet workflow, Zapier/n8n automation, document-processing pipeline, or manual-review workflow. The technical brief should compare the simplest viable mechanism against the existing stack when useful.

## Research Guidance

Use Context7 when researching:

- Word/document templating libraries.
- PDF filling/extraction libraries.
- OCR/document parsing libraries.
- Next.js / React only if a dashboard or web UI is actually needed.
- FastAPI/backend API only if service architecture matters to feasibility.
- Auth/storage/queue/testing libraries when relevant.
- Browser automation or RPA frameworks if no API exists.

Use web search or vendor docs when researching:

- Adobe Sign APIs and webhook capabilities.
- Google/Microsoft calendar APIs.
- Government/legal-aid system integration constraints.
- SaaS API limitations.
- Deployment/runtime constraints.
- Current product capabilities.

## Feasibility Language

Use practical feasibility ratings:

- High: clear inputs/outputs, available templates/APIs/libraries, low ambiguity, human review covers risk.
- Medium: feasible but depends on template cleanup, third-party access, data quality, manual handoff, or client confirmation.
- Low: blocked by missing access, unclear rules, unavailable APIs, high legal/compliance uncertainty, or unreliable source data.

## Slack / Delivery Behavior

If this skill is invoked from a Slack thread:

- Keep discussion in that thread.
- When final, attach the actual `TECHNICAL-BRIEF.md` file via `MEDIA:/absolute/path/to/TECHNICAL-BRIEF.md`.
- Do not paste the full Markdown unless the user explicitly asks for inline content.
- Do not start a new channel or DM unless the user asks.

If invoked from webhook/config.yaml delivery:

- Deliver the Markdown file to Slack when possible.
- Expect Bintang to reply in Slack and continue discussion from that thread.

## Common Pitfalls

1. Treating this as developer implementation planning. This is proposal feasibility and technology recommendation.
2. Asking whether to include clearly requested flows. Include all discovered client-requested flows in the technical brief.
3. Splitting into v1/v2 too early. Detailed engineering scope comes later.
4. Assuming every solution is a web app.
5. Treating the existing HypaJump stack as mandatory. It is context, not a rule.
6. Recommending libraries/frameworks without checking current docs when details matter.
7. Omitting AI boundaries and human review for sensitive workflows.
8. Saving as `SPEC.md`; this skill writes `TECHNICAL-BRIEF.md`.
9. Pasting content instead of sending the Markdown file. In Slack, attach it with `MEDIA:/absolute/path/to/TECHNICAL-BRIEF.md`.

## Verification Checklist

- [ ] `~/proposals/<client-slug>/README.md` was read.
- [ ] All meaningful automation flows from README are covered.
- [ ] Feasibility is evaluated per flow.
- [ ] Context7/web research was used where technology details required current docs.
- [ ] Bintang confirmed the recommendation is final before finalizing.
- [ ] `~/proposals/<client-slug>/TECHNICAL-BRIEF.md` exists.
- [ ] Technical brief includes feasibility, technology recommendations, AI boundaries, data/integration notes, testing/validation approach, and proposal notes.
- [ ] Final Slack response attaches the actual Markdown file via `MEDIA:/absolute/path/to/TECHNICAL-BRIEF.md`.
