# Slide Sync — Disaster Recovery

Step-by-step to rebuild the entire slide-sync system from scratch if Hermes, skills, or config are lost on should-i.

## Prerequisites

- SSH access to should-i (root@170.64.182.105)
- GitHub: `gh` CLI authenticated (account: ChaostixZix)
- GH repos must have `HERMES_WEBHOOK_SECRET` set (should survive agent wipe since it's GitHub-side)

## 1. Install Hermes Agent on should-i

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

## 2. Create webhook HMAC secret

```bash
openssl rand -hex 32
# Save this — it must match the HERMES_WEBHOOK_SECRET in GitHub repo secrets
```

## 3. Configure webhook platform in Hermes config

Edit `~/.hermes/config.yaml`:

```yaml
platforms:
  webhook:
    enabled: true
    host: "0.0.0.0"
    port: 8644
    secret: "<secret-from-step-2>"
```

Also add webhook toolset:

```yaml
platform_toolsets:
  webhook:
    - terminal
    - file
    - web
    - skills
```

And whitelist sudo nginx reload:

```yaml
command_allowlist:
  - sudo nginx -s reload
  - sudo systemctl reload nginx
```

Set webhook cron mode:

```yaml
approvals:
  cron_mode: auto_approve
```

## 4. Create the webhook skill

```bash
mkdir -p ~/.hermes/skills/productivity/hypajump-slide-webhook-sync
cat > ~/.hermes/skills/productivity/hypajump-slide-webhook-sync/SKILL.md << 'ENDOFSKILL'
---
name: hypajump-slide-webhook-sync
description: Webhook-triggered: sync OpenSlide decks on push. Pulls repo, copies changed decks into foundry, rebuilds, reloads nginx, notifies Slack.
category: productivity
---

# HypaJump Slide Webhook Sync

Triggered by GitHub Action webhook when `**/slides/*/index.tsx` changes on push.

## Workflow

### 1. Parse payload
The webhook delivers JSON:
```json
{
  "repo": "Should-I-Launch/motorbiz",
  "branch": "main",
  "decks": [
    {"deck_id": "motorbiz-proposal", "path": "03_engineering_response/slides/motorbiz-proposal/index.tsx"}
  ]
}
```

### 2. Clone repo
Use `gh repo clone` (authenticated via gh auth token):
```bash
cd /tmp && rm -rf slide-sync-tmp && gh repo clone {repo} slide-sync-tmp -- --depth 1 --filter=blob:none --single-branch -b {branch}
```

### 3. Copy deck folders into foundry
For each deck, strip `/index.tsx` from path to get folder, then:
```bash
rm -rf /root/.openslide-foundry/slides/{deck_id}
cp -r /tmp/slide-sync-tmp/{deck_dir} /root/.openslide-foundry/slides/{deck_id}
```

### 4. Update .folders.json if new deck
Check if deck_id exists in assignments. If not, add folder object + assignment. Use `python3 -c` to read/modify JSON. Schema: objects with `id`/`name`/`icon`, NOT string array.

### 5. Rebuild foundry
```bash
cd /root/.openslide-foundry && npm run build
```

### 6. Fix nginx permissions
```bash
chmod o+x /root && chmod -R o+rX /root/.openslide-foundry/dist
```

### 7. Reload nginx
```bash
sudo nginx -s reload
```

### 8. Notify Slack
```bash
echo "✅ Slide sync: {repo} ({branch}) — {deck_ids} rebuilt. http://slides.hypajump.ai:8889/" | hermes send --to slack:#assistant
```

### 9. Cleanup
```bash
rm -rf /tmp/slide-sync-tmp
```

## Pitfalls
- Use `gh repo clone`, not `git clone git@github.com` — SSH deploy keys are disabled.
- Absolute paths for all operations.
- `.folders.json` must use object schema, not strings.
- `rm -rf` foundry copy before `cp -r` so renamed files don't accumulate.
ENDOFSKILL
```

## 5. Register webhook subscription

```bash
hermes webhook subscribe slide-sync \
  --skills hypajump-slide-webhook-sync \
  --prompt 'Slide sync triggered: {repo} on branch {branch}. Changed decks: {decks}. Follow hypajump-slide-webhook-sync skill: clone, copy decks to foundry, rebuild, nginx reload, then notify Slack #assistant via hermes send --to slack:#assistant.' \
  --description 'Slide sync → #assistant' \
  --secret '<secret-from-step-2>'
```

## 6. Add GitHub SSH host key

```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

## 7. Open firewall and start gateway

```bash
ufw allow 8644/tcp comment "Hermes webhook"
ufw reload
systemctl --user enable hermes-gateway
systemctl --user start hermes-gateway
```

## 8. Verify

```bash
# Local
curl -s -X POST http://localhost:8644/webhooks/slide-sync -H "Content-Type: application/json" -d '{"test":true}'
# Expected: {"error":"Invalid signature"} (means it's alive, just auth missing)

# Remote
echo -n '{"repo":"Should-I-Launch/motorbiz","branch":"main","decks":[{"deck_id":"motorbiz-proposal","path":"03_engineering_response/slides/motorbiz-proposal/index.tsx"}]}' | openssl dgst -sha256 -hmac "<secret>"
# Use the signature in X-Hub-Signature-256 header
```

## 9. Update GH secrets if secret changed

If you generated a new secret in step 2, update `HERMES_WEBHOOK_SECRET` in all 6 repos:

```bash
for repo in hypajump-project-template motorbiz biotech oz-oils-lead-gen alias-mae pure-piping; do
  gh secret set HERMES_WEBHOOK_SECRET --repo Should-I-Launch/$repo -b"<new-secret>"
done
```
