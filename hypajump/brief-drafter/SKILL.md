---
name: brief-drafter
description: Use when turning messy client inputs such as ZIPs, folders, call transcripts, Slack notes, emails, or back-and-forth discovery into a concise HypaJump client brief. Reads and classifies supporting documents when present, organizes copies under ~/proposals/<client-slug>/documents/, writes ~/proposals/<client-slug>/README.md, and attaches the README.md file back to Slack.
version: 1.3.0
author: HypaJump
license: MIT
metadata:
  hermes:
    tags: [hypajump, proposal, automation, client-brief, discovery, documents, transcript]
    related_skills: [ocr-and-documents, technical-brief-maker]
---

# HypaJump Brief Drafter

## Overview

Turn messy client discovery material into a clean client brief and, when files are provided, an organized proposal folder.

This skill has two valid modes:

1. **Transcript-only mode:** if the user only provides a transcript, Slack notes, or call summary, create only `README.md`.
2. **Client-folder mode:** if the user provides ZIP/folder/supporting documents, read the documents, classify what each file is, copy organized versions into the project proposal folder, and document the map in `README.md`.

Core output:

```text
~/proposals/<client-slug>/README.md
```

If supporting files exist, also create:

```text
~/proposals/<client-slug>/documents/
~/proposals/<client-slug>/documents/README.md
```

This becomes the source of truth for `technical-brief-maker`.

## When To Use

Use this skill when the user provides any combination of:

- A client ZIP or folder containing transcripts, notes, PDFs, Word docs, spreadsheets, screenshots, emails, samples, templates, or reference data.
- A raw transcript or pasted call notes without a ZIP.
- A Slack thread where the client/context is being discussed over several back-and-forth messages.
- A request such as “infer what they want to build”, “make the client brief”, “summarize what is manual now”, “organize the client docs”, or “prepare the proposal workspace”.

Do not use this skill to decide final technical feasibility or stack. Use `technical-brief-maker` after the README exists.

Do not use this skill to create the proposal deck. Use `proposal-maker` after both `README.md` and `TECHNICAL-BRIEF.md` exist.

## Core Output

Always create or update:

```text
~/proposals/<client-slug>/README.md
```

When source files/examples/templates exist, also create or update:

```text
~/proposals/<client-slug>/documents/
~/proposals/<client-slug>/documents/README.md
```

`<client-slug>` must be inferred from the client/project name when possible. If unclear, choose a safe temporary slug and mark it at the top of the README as needing confirmation.

The client/project name and slug must be written near the top of `README.md` because later skills use this file to locate `TECHNICAL-BRIEF.md` and proposal materials.

Do not create `SPEC.md`, `IMPLEMENTATION-SPEC.md`, or `OPERATIONS-SPEC.md` in this skill. Technical feasibility and technology choices belong in `technical-brief-maker`.

## Input Handling

### ZIP or folder input

- Safely extract ZIPs into an isolated run folder before reading them.
- Preserve original files. Never rename, delete, or overwrite raw client files.
- Skip OS noise such as `__MACOSX/`, `.DS_Store`, `Thumbs.db`, and temporary Office lock files.
- Protect against unsafe archive entries: absolute paths, `../` traversal, symlinks escaping extraction root, and silent overwrites.
- Infer purpose from actual content, not folder names. Messy folder names are often meaningless.

### Transcript or conversation input

- Treat transcripts, Slack snippets, call notes, and user-provided summaries as first-class inputs.
- Infer what the client is trying to build from the conversation, even without supporting documents.
- Separate explicit facts from assumptions.
- If the transcript shows repeated back-and-forth, capture the evolution of the request and the latest apparent intent.
- If there are no supporting files, do not invent a `documents/` folder. Just create `README.md`.

### Mixed input

When both files and transcript exist, use the transcript to understand motivation and the files to ground concrete examples, templates, data, and outputs.

## Workflow

1. Inspect all available input.
   - Identify the primary source: transcript, client email, brief doc, meeting notes, or folder/package.
   - Extract readable text from common document formats when needed.
   - Inspect screenshots or embedded images if they appear to contain workflow/output details.

2. If supporting files exist, read and classify them.
   - Open or extract enough content to understand what each file is about.
   - Classify files by role: source brief, transcript/call notes, template, completed example, sample input, reference data, billing form, legal/court form, affidavit example, government/MSD form, engagement/adobe-sign pack, screenshot/evidence, integration export, unclear/extra.
   - Note important content, not just filenames. Example: “contoh affidavit domestic violence”, “template billing Form 32B”, “contoh filled legal aid application”, “travel-time reference”, “standard billing wording reference”.

3. Organize documents when files/examples/templates exist.
   - Copy files into `~/proposals/<client-slug>/documents/`.
   - Never move or modify the raw originals.
   - Use clean subfolders by artifact role or workflow stage.
   - Rename copied files with readable prefixes when useful.
   - Write `documents/README.md` describing folder purpose, file role, original path, and notes.

4. Infer client intent.
   - What are they asking HypaJump to help with?
   - What is currently manual or painful?
   - What output, workflow, or operational improvement do they likely want?
   - What parts are confirmed vs inferred?

5. Draft the README.
   - Keep it concise and useful for Bintang and future agents.
   - Focus on current manual workflow, customer-provided facts, source evidence, organized document map, and open questions.
   - Avoid prematurely prescribing a full web app, stack, build phase, v1/v2 scope, or final implementation plan.

6. Save to `~/proposals/<client-slug>/README.md`.
   - Create the folder if it does not exist.
   - If updating an existing README, preserve useful prior notes and clearly add what changed.

7. Deliver the Markdown file.
   - In Slack, attach the actual Markdown file in the final response using `MEDIA:/absolute/path/to/README.md`.
   - Do not only paste the README content.
   - Do not only say where the path is.
   - Include a short one-paragraph summary plus the `MEDIA:` attachment.
   - If the path contains spaces, copy the file to a simple `/tmp/<client-slug>-README.md` path first and attach that copy.

## Organized Document Folder Rules

When source documents exist, use this project-local structure:

```text
~/proposals/<client-slug>/
├── README.md
└── documents/
    ├── README.md
    ├── 01-source-brief/
    ├── 02-transcripts-notes/
    ├── 03-templates/
    ├── 04-completed-examples/
    ├── 05-reference-data/
    ├── 06-billing/
    ├── 07-integrations-signatures/
    └── 99-unclear-extra/
```

Adjust folder names to match the project. For example, a legal automation project may use:

```text
documents/
├── 01-source-brief/
├── 02-call-transcripts/
├── 03-court-form-templates/
├── 04-affidavit-examples/
├── 05-legal-aid-and-msd/
├── 06-billing-forms-and-reference/
└── 99-unclear-extra/
```

Recommended filename prefixes:

- `SOURCE-` for primary briefs/transcripts/emails.
- `TEMPLATE-` for blank forms or reusable templates.
- `EXAMPLE-` for completed examples/sample outputs.
- `REFERENCE-` for lookup tables, wording libraries, travel times, policies, rates.
- `SAMPLE-` for test/sample inputs.
- `INTEGRATION-` for exported files, signature packs, API-related artifacts.
- `UNCLEAR-` for files whose role is not yet known.

`documents/README.md` should include:

- Raw source summary.
- Folder map.
- Per-file list with new path, original path, role, and short content note.
- Missing expected files.
- Unclear files or extraction limitations.

Avoid Markdown pipe tables because Slack does not render them reliably. Use bullets or fenced code blocks.

## README.md Skeleton

Use this structure and adapt headings as needed:

```markdown
# <Client / Project Name> — Client Brief

Client slug: <client-slug>
Status: Draft brief / needs confirmation / confirmed
Last updated: <date>

## What the client seems to want

<Plain-language summary of what to build or improve.>

## Current manual workflow

<What humans do manually today, step by step.>

## Pain points / why this matters

<Time, errors, delays, handoffs, repetitive work, client experience, risk.>

## Inputs and source material

<Transcript, ZIP/folder, emails, docs, samples, screenshots, data exports.>

## Organized document folder

Path: `./documents/`

<Explain how supporting documents were organized. If transcript-only, write “No supporting documents were supplied.”>

## Important facts learned from the customer

<Concrete facts from the brief/transcript/files.>

## Desired outputs or outcomes

<Documents, reports, dashboards, automations, notifications, decisions, handoffs.>

## Constraints and preferences mentioned

<Tools, budget/time expectations, existing systems, non-goals, sensitive data.>

## Assumptions

<Clearly label inferred assumptions.>

## Open questions for Bintang / client

<Only important questions that materially affect proposal, feasibility, pricing, legal/safety risk, integration access, data handling, or client promise. Do not ask admin/housekeeping questions such as confirming client name, project name, or slug; infer them and let the user correct you if needed.>

## Notes for technical-brief-maker

<Useful handoff notes for feasibility and technology evaluation.>
```

## Document Extraction Notes

- For PDFs, use available text extraction/OCR tools when needed.
- For DOCX with embedded media, inspect `word/media/*` if screenshots may contain key details.
- For spreadsheets, identify whether they are sample input, reference data, exported data, or expected output.
- For old Word `.doc/.dot`, mark legacy templates as possible migration inputs.
- If extraction is not possible, record the file and what is unknown instead of pretending it was reviewed.

## Sending All Files Later

If the user asks to “send all files”, “kirim folder”, “kirim semua dokumen”, or similar:

1. Compress the project proposal folder or the requested subfolder into a new ZIP.
2. Use a simple path such as `/tmp/<client-slug>-proposal-files.zip`.
3. Attach the ZIP to Slack using `MEDIA:/tmp/<client-slug>-proposal-files.zip`.
4. Do not paste long file contents into Slack.

Recommended command:

```bash
cd ~/proposals && zip -r /tmp/<client-slug>-proposal-files.zip <client-slug>
```

## Style Rules

- Write in practical Indonesian by default when working with Bintang unless client-facing English is clearly required.
- Be concise. This is a working brief, not a long report.
- Do not overfit to “web app” as the answer. The solution may be a script, spreadsheet automation, internal tool, integration, human-in-the-loop workflow, or web app.
- Do not invent pricing, timelines, final architecture, or build phases.

## Common Pitfalls

1. Producing technical specs too early. This skill only creates the client brief README.
2. Assuming ZIPs are required. A transcript or Slack thread can be enough to infer intent.
3. Treating AI as the whole solution. Capture the manual workflow first; technical evaluation happens later.
4. Asking questions that the files/transcript already answer.
5. Asking admin/housekeeping questions such as confirming client name, project name, or slug. Infer these and let the user correct them if needed.
6. Pasting the README instead of sending the file. In Slack, attach the Markdown file with `MEDIA:/absolute/path/to/README.md`.
7. Leaving supporting documents in the raw extracted folder only. If files exist, copy and organize them under `~/proposals/<client-slug>/documents/`.
8. Classifying by filename only. Read enough content to know whether a file is a template, example, reference, transcript, billing form, etc.
9. Saving outside `~/proposals/<client-slug>/README.md` without user instruction.

## Verification Checklist

- [ ] Input was inspected, whether ZIP/folder/transcript/thread.
- [ ] Original client files were not modified.
- [ ] Client/project name and slug are written near the top of README.
- [ ] `~/proposals/<client-slug>/README.md` exists.
- [ ] If supporting files exist, `~/proposals/<client-slug>/documents/` exists and contains organized copies.
- [ ] If supporting files exist, `documents/README.md` maps each copied file to its original path, role, and content note.
- [ ] README explains what is manual now and what facts were learned from the customer.
- [ ] README includes an organized document folder section, or states that no supporting documents were supplied.
- [ ] Assumptions are separated from confirmed facts.
- [ ] Open questions are decision-changing, not generic.
- [ ] Final Slack response attaches the actual README Markdown file via `MEDIA:/absolute/path/to/README.md`.
