---
name: hyperframes-video
description: "HyperFrames video production pipeline for HypaJump — produce short videos (promos, explainers, news clips) using HTML→MP4 renderer. 7-stage workflow: brand → source → brainstorm → Claude Design handoff → design output → asset generation → refine/render → export. Integrates with Hermes tools, linear-project-context, and existing project workflows."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hyperframes, video, heygen, pipeline, media, hypajump]
---

# HyperFrames Video Production Pipeline

Produce short videos (product promos, AI-news clips, explainers, social cuts) using the HyperFrames HTML→MP4 renderer. This skill maps the 7-stage template workflow to Hermes tools and provides prerequisite checks, stage-by-stage guidance, and integration with existing HypaJump workflows.

---

## Prerequisites (Step 0 — verify before any work)

| Requirement | Check command | Minimum version |
|-------------|-------------|-----------------|
| Node.js | `node -v` | 22+ |
| FFmpeg | `ffmpeg -version` | any recent |
| HyperFrames CLI | `hyperframes --version` | 0.6+ |
| GitHub CLI (gh) | `gh --version` | 2.0+ |

**Install if missing:**
```bash
# macOS
brew install node ffmpeg
npm install -g hyperframes

# Ubuntu/Debian
sudo apt install nodejs ffmpeg
npm install -g hyperframes
```

**Optional — AI skills for agent context:**
```bash
npx skills add heygen-com/hyperframes
```

**MCP video server (optional, not required):**
`mcp-video` from KyaniteLabs is a third-party MCP server that wraps FFmpeg. It is **not required** for this workflow. The HyperFrames template's AGENTS.md mentions MCP tools as a future-proofing pattern, but the actual implementation uses CLI commands via `terminal` exclusively. Do not install `mcp-video` unless explicitly requested.

---

## Repository & Template

## Repository & Template

| Resource | Location |
|----------|----------|
| Template repo | `Should-I-Launch/hyperframes-video-template` (private) |
| Local clone | `~/Desktop/work/hyperframes-video-template` |
| Per-video working copy | `~/Desktop/work/<video-slug>/` (fresh clone per video) |
| **HypaJump project integration** | `<project>/07_video/` (seeded inside hypajump-project-template) |

**Create per-video copy (standalone):**
```bash
# Path A — GitHub repo (preferred for team sharing)
gh repo create Should-I-Launch/<video-slug> \
  --template Should-I-Launch/hyperframes-video-template \
  --private \
  --description "HyperFrames video: <video-slug>"
gh repo clone Should-I-Launch/<video-slug>

# Path B — Local only (fast, no remote)
git clone https://github.com/Should-I-Launch/hyperframes-video-template.git <video-slug>
cd <video-slug>
rm -rf .git && git init -q && git add -A && git commit -q -m "init: <video-slug>"
```

**Create inside HypaJump project (recommended for client work):**
```bash
cd <project-repo>/  # e.g. oz-oils-lead-gen/

# Seed 07_video from hyperframes-video-template
git clone https://github.com/Should-I-Launch/hyperframes-video-template.git 07_video
cd 07_video
rm -rf .git && git init -q

# Set project title and brand pointer
# (see Brand Detection section below)
```

---

## 7-Stage Pipeline

### Stage 00 · Brand (Foundation)
**Folder:** `00_brand/`  
**File:** `BRAND_KIT.md`  
**What:** Verify colour tokens, typography, motion style, voice defaults. For Hypajump house videos use as-is. For client videos, duplicate as `BRAND_KIT_CLIENT.md` and override tokens.  
**Hermes action:** `read_file` on `BRAND_KIT.md`. No tool calls needed.

### Stage 01 · Source Material
**Folder:** `01_source_material/`  
**Files:** `SOURCE_INVENTORY.md`, `CLAIMS_AND_SOURCES.md`, `LINKS.md`  
**What:** List all raw assets, tag every claim as FACT/VIEW/UNVERIFIED, collect URLs.  
**Hermes action:** `read_file` existing files, `write_file` to create/update. No external tools.

### Stage 02 · Brainstorm
**Folder:** `02_brainstorm/`  
**Files:** `BRAINSTORM_NOTES.md`, `CREATIVE_ROUTES.md`, `SELECTED_DIRECTION.md`, `SCRIPT.md`  
**What:** Interview Brett (one question at a time), route video type, produce 3 creative routes, lock script with scene table + FACT/VIEW tags.  
**Hermes action:** `read_file` templates, `write_file` to fill. Use `clarify` for Brett interview.  
**Quality gate:** Script must be complete with VOICE_ENGINE and NARRATOR set before moving on.

### Stage 03 · Claude Design Handoff
**Folder:** `03_claude_design_handoff/`  
**Files:** `CLAUDE_DESIGN_PROMPT.md`, `ASSET_CHECKLIST.md`, `HANDOFF_BRIEF.md`, `HANDOFF_ALIGNMENT.md`  
**What:** Fill paste-ready prompt for Claude Design (claude.ai/design). Attach `claude-design-hyperframes.md` + brand kit + verified claims. Include `[BRAND TOKENS]`, `[NARRATION + TIMING]`, `[AVATAR REGION: yes/no]`, `[B-ROLL: yes/no]` blocks.  
**Hermes action:** `read_file` source files, `write_file` to produce prompt. **Do not submit to Claude Design — Brett does the browser hop.**

### Stage 04 · Claude Design Output
**Folder:** `04_claude_design_output/`  
**Files:** `INTAKE_NOTES.md`  
**What:** Brett downloads ZIP from Claude Design, puts in `zips/`. Agent extracts to `extracted/<project>/`, verifies 4 required files (`index.html`, `preview.html`, `README.md`, `DESIGN.md`), runs lint.  
**Hermes action:** `terminal` for `unzip`, `hyperframes lint`, `hyperframes inspect`. `read_file` for `DESIGN.md`.

### Stage 05 · Asset Generation
**Folder:** `05_asset_generation/`  
**Sub-folders:** `voiceover/`, `avatar/` (optional), `clips/` (optional)  
**Files:** `ASSET_LOG.md`  
**What:** Generate voiceover (swappable engine: hyperframes-tts / heygen / elevenlabs), optional HeyGen presenter, optional AI b-roll clips (Veo / Kling / Sora / Gemini Omni).  
**Hermes action:**
- Voiceover: `terminal` for `hyperframes tts` + `hyperframes transcribe`
- Avatar: external hop (HeyGen web app) — Brett generates, drops `avatar.mp4`
- B-roll: external hop (Veo/Kling/Sora/Gemini web apps) — Brett generates, drops `takes/*.mp4`
- Log: `write_file` for `ASSET_LOG.md`

### Stage 06 · Refine and Render
**Folder:** `06_refine_and_render/`  
**Files:** `RENDER_NOTES.md`, `QA_CHECKLIST.md`  
**What:** Composite voice/captions/avatar/b-roll onto HTML, sync animation timing to real voiceover, polish, render draft + final.  
**Hermes action:**
- `terminal` for `hyperframes lint`, `hyperframes preview`, `hyperframes render --quality draft --output draft.mp4`, `hyperframes render --quality high --output output.mp4`
- `write_file` for `RENDER_NOTES.md`

### Stage 07 · Exports
**Folder:** `07_exports/`  
**Sub-folders:** `final/`, `thumbnails/`, `stills/`, `captions/`, `delivery_notes/`  
**Files:** `DELIVERY_SPECS.md`, `REVISION_LOG.md`  
**What:** Version final MP4, copy captions, export thumbnails/stills, write delivery notes, check platform specs.  
**Hermes action:** `terminal` for `cp`, `hyperframes still` (if available). `write_file` for delivery notes and revision log.

---

## Tool Mapping: Hermes vs HyperFrames

| Task | Hermes Tool | HyperFrames CLI |
|------|-------------|-----------------|
| Structural check | `terminal` | `hyperframes lint` |
| Preview | `terminal` | `hyperframes preview` |
| Render | `terminal` | `hyperframes render` |
| Add audio | `terminal` | `hyperframes add audio` |
| Add captions | `terminal` | `hyperframes subtitles` |
| PiP presenter | `terminal` | manual FFmpeg |
| Chroma key | `terminal` | manual FFmpeg |
| Merge clips | `terminal` | manual FFmpeg |
| Extract thumbnail | `terminal` | `hyperframes still` |
| Video info | `terminal` | `ffprobe` |

**Default:** Use `terminal` with `hyperframes` CLI. The HyperFrames template's AGENTS.md mentions MCP tools as a future-proofing pattern, but the actual implementation uses CLI commands via `terminal` exclusively. Do not install `mcp-video` unless explicitly requested.

---

## Brand Detection (Dual Mode)

This skill supports **two brand modes**: Hypajump house brand (default) or client brand (override).

### When working inside a HypaJump project repo (`<project>/07_video/`)

1. **Check for client brand assets** in the project pre-sales stages:
   - `02_project_brief/` — may contain client brand guide, colours, logo
   - `03_engineering_response/` — may contain client screenshots, UI grabs
   - `01_initial_engagement/` — may contain client website, reference material

2. **Brand kit selection logic:**
   - If `07_video/00_brand/BRAND_KIT_CLIENT.md` exists → use client brand
   - Else if client brand assets found in pre-sales stages → create `BRAND_KIT_CLIENT.md` from them
   - Else → use `BRAND_KIT.md` (Hypajump house default)

3. **Document the choice** in `07_video/00_brand/AGENTS.md` so all downstream stages know which brand kit to reference.

### When working standalone (not inside a project repo)

- Always use `BRAND_KIT.md` (Hypajump house default) unless explicitly instructed to use a different brand.
- To use a client brand, create `BRAND_KIT_CLIENT.md` in `00_brand/` and update stage 03 prompt to reference it.

### Brand kit inheritance

| Scenario | Brand Kit Used | Source |
|----------|---------------|--------|
| Hypajump internal promo | `BRAND_KIT.md` | House default (verified from `Should-I-Launch/hypajump`) |
| Client deliverable (no client brand found) | `BRAND_KIT.md` | House default — video is "by Hypajump" |
| Client deliverable (client brand found) | `BRAND_KIT_CLIENT.md` | Extracted from project pre-sales material |
| Client explicitly provides brand guide | `BRAND_KIT_CLIENT.md` | Client-provided assets |

### Quick brand check

```bash
# Inside <project>/07_video/
ls 00_brand/BRAND_KIT_CLIENT.md 2>/dev/null && echo "Client brand" || echo "Hypajump house brand"

# Check pre-sales stages for client assets
find ../../02_project_brief/ ../../03_engineering_response/ -name "*brand*" -o -name "*logo*" -o -name "*colour*" 2>/dev/null
```

---

## Integration with HypaJump Workflows

| Integration | How |
|-------------|-----|
| **Project scaffold** | `hypajump-project-initializer` now seeds `07_video/` as optional stage 07. See `hypajump-project-initializer` skill post-init workflow. |
| **Linear** | ENG-112 (internal) or create new issue per video. Use `linear-project-context` to record decisions. |
| **Project context** | Use `context` skill to resolve workspace. Map video project in `context.md`. |
| **Initializer** | Use `hypajump-project-initializer` to scaffold per-video copy (or use the built-in `.agents/skills/hyperframes-video/hyperframes-video-initializer/SKILL.md`). |
| **Slide sync** | Finished video can be referenced in OpenSlide decks via `hypajump-slide-webhook-sync`. |
| **Email delivery** | Use `bintang-email-management` or Hermes gateway to send video files to clients. |

---

## Quality Bar (from `VIDEO_QUALITY_BAR.md`)

Before calling any export done, confirm:
- Hook in first 2 seconds
- Legible at thumbnail size (320×180)
- Intentional pacing — no dead frames > 0.5s
- Single accent signal per scene (#8D57FB)
- Platform safe margins respected
- Captions accurate (word-level timing, no missing words)
- Audio leveled: narration ≈ -14 LUFS, music ≥ 6 dB below
- Brand tokens correct (accent #8D57FB, text #3B2517, Geist/Inter)
- Zero fabricated claims — every FACT cited in `CLAIMS_AND_SOURCES.md`

---

## Revision Loop

| Change type | Route back to |
|-------------|---------------|
| Small visual/timing fix | Stage 06 (`06_refine_and_render/`) |
| Script or voiceover change | Stage 02 or 05 (`02_brainstorm/` or `05_asset_generation/`) |
| Concept/scene change | Stage 03 (`03_claude_design_handoff/`) — re-prompt Claude Design |

Version naming: `<project-slug>-final-v1.mp4`, `v2`, etc. Never overwrite. Log in `REVISION_LOG.md`.

---

## Pitfalls

1. **HyperFrames CLI ≠ MCP server.** HyperFrames is a CLI tool, not an MCP server. The `mcp-video` server (KyaniteLabs) wraps FFmpeg and optionally HyperFrames CLI. If `mcp-video` is not configured, use `terminal` with `hyperframes` CLI directly.
2. **No `validate` verb.** Real CLI: `init · lint · preview · render · inspect · add`. Never use `validate`.
3. **Node 22+ required.** HyperFrames 0.6+ needs Node 22+. Check with `node -v`.
4. **FFmpeg required.** Not optional — used for encoding and audio mixing.
5. **External hops for avatar/b-roll.** HeyGen presenter and AI b-roll clips are generated outside Hermes (web apps), then dropped into the repo. Agent does not generate them.
6. **Claude Design is manual.** Agent produces the prompt pack; Brett submits to claude.ai/design and downloads the ZIP.
7. **One video = one repo copy.** Never work on multiple videos in one template clone. Use per-video initializer.
8. **Heavy media gitignored.** MP4, ZIP, WAV files are in `.gitignore`. Share renders via Drive/Dropbox, not git.

---

## Quick Reference: One-Liners

```bash
# Check prerequisites
node -v && ffmpeg -version && hyperframes --version

# Init per-video repo
git clone https://github.com/Should-I-Launch/hyperframes-video-template.git my-video
cd my-video && rm -rf .git && git init -q

# Lint extracted Claude Design project
cd 04_claude_design_output/extracted/my-project/
hyperframes lint && hyperframes inspect

# Preview
hyperframes preview

# Draft render
hyperframes render --quality draft --output draft.mp4

# Final render
hyperframes render --quality high --output output.mp4

# TTS + transcribe (stage 05)
hyperframes tts --input script.txt --output voice.wav
hyperframes transcribe voice.wav --output captions.vtt
```

---

## Canonical Names

- This skill: **hyperframes-video**
- The template repo: **hyperframes-video-template**
- The render engine: **HyperFrames** (by HeyGen)
- The pipeline: **7-stage HyperFrames video production pipeline**
