# Slide Sync — Auto-deploy OpenSlide Decks

When you push changes to `**/slides/*/index.tsx` in any HypaJump project repo, the deck is automatically rebuilt on `should-i` and served at `https://slides.hypajump.ai`.

## How it works

```
Push → GitHub Action (slide-sync.yml)
  → POST http://should-i:8644/webhooks/slide-sync (HMAC-SHA256)
  → Hypa (Hermes agent on should-i) loads hypajump-slide-webhook-sync
  → Clone repo → copy deck to foundry → npm run build → nginx reload
  → Slack notification to #assistant
```

## Skills involved

| Skill | What it does |
|---|---|
| `hypajump-slide-webhook-sync` | Handles webhook: clone, copy deck, rebuild foundry, nginx reload, Slack notify |
| `hypajump-slide-initializer` | Manual deck init + dev server setup (not part of the webhook flow) |
| `hypajump-slide-maker` | Creates new decks from briefs (not part of the webhook flow) |

The webhook skill lives on `should-i` at `~/.hermes/skills/productivity/hypajump-slide-webhook-sync/SKILL.md`. It is NOT committed to this repo — it runs server-side.

## Client-facing deck sharing (current limitation)

OpenSlide builds one single React SPA. All decks (`slides/*/`) are bundled into one JS payload. Client-side routing (`/s/:deckId`) handles navigation. This means:

- Anyone who can access any deck can navigate to every other deck via the browser UI or address bar.
- Nginx path-rules alone CANNOT prevent access to other decks — once the SPA loads, routing is client-side and never touches nginx again.
- The home page (`/`) lists every deck by name, even if clicking them would return 403.

Per-deck build (filtering `.folders.json` to one deck, building to a separate `dist-<deck>/` folder, serving via unguessable nginx token prefix) is the planned fix but blocked: OpenSlide has no CLI build flag for per-deck output yet.

For now, share individual decks with clients via manual HTML/PDF export from the OpenSlide UI.

## Server

- **Host:** should-i (170.64.182.105)
- **Foundry:** /root/.openslide-foundry/
- **Nginx:** port 8889 → /root/.openslide-foundry/dist/
- **Webhook:** Hermes gateway port 8644, HMAC secret
- **Live URL:** https://slides.hypajump.ai

## Repos with auto-sync

- hypajump-project-template (source — new projects auto-inherit)
- motorbiz
- biotech
- oz-oils-lead-gen
- alias-mae
- pure-piping

## Adding a new repo

1. Copy `.github/workflows/slide-sync.yml` from any configured repo.
2. Set `HERMES_WEBHOOK_SECRET` in repo Secrets (Settings → Secrets and variables → Actions).
3. Done. Next push to any slide file triggers the webhook.

## Disaster recovery

If the Hermes agent or skills are wiped from should-i, see the [recovery guide](./slide-sync-recovery.md).
