---
name: hypajump-dns
description: "HypaJump Cloudflare DNS management — setup, list, add, delete, update DNS records for hypajump.ai via cf-hypajump MCP server."
version: 1.0.0
author: Miza
platforms: [linux, macos]
metadata:
  hermes:
    tags: [hypajump, cloudflare, dns, devops]
---

# HypaJump DNS Manager

Manage DNS records for **hypajump.ai** via the `cf-hypajump` MCP server (Cloudflare code mode). Covers all HypaJump subdomains: Ramjet, CopyFlo, Oz Oils, HomeCare, and infrastructure services.

---

## Setup Requirements

Before using this skill, a Cloudflare API token must be registered as an MCP server.

### Step 1: Create a Cloudflare API Token

1. Go to **https://dash.cloudflare.com/profile/api-tokens**
2. Click **Create Token** → **Create Custom Token**
3. Give it a name like `HypaJump MCP Agent`
4. Add permissions:
   - `Zone:Zone:Read`
   - `Zone:DNS:Edit`
   - `Account:Account Settings:Read`
5. Set Zone Resources to **All Zones** (or `hypajump.ai` only)
6. Click **Continue to Summary** → **Create Token**
7. Copy the token (starts with `cfut_` or similar)

### Step 2: Register MCP Server

```bash
hermes config set mcp_servers.cf-hypajump.url "https://mcp.cloudflare.com/mcp"
hermes config set mcp_servers.cf-hypajump.timeout 60
hermes config set mcp_servers.cf-hypajump.headers '{"Authorization":"Bearer <YOUR_TOKEN>"}'
```

Then add to platform toolsets:
```bash
hermes config set platform_toolsets.cli '["browser","clarify","code_execution","cronjob","delegation","file","image_gen","mcp-cf-hypajump","mcp-context7","mcp-morph-mcp","memory","session_search","skills","terminal","todo","tts","vision","web","x_search"]'
```

Restart Hermes Agent for the new tools to appear.

---

## Zone Info

| Domain | Zone ID | MCP Server |
|--------|---------|------------|
| hypajump.ai | `15e24c6a7bbdfe13ad381ebe1c14ecf6` | cf-hypajump |

---

## DNS Management Workflows

All commands are JavaScript async arrow functions executed via the **`execute`** tool of `cf-hypajump`.

### 1. List All DNS Records

```javascript
async () => {
  const r = await cloudflare.request({
    method: "GET",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    query: { per_page: 100 }
  });
  return {
    total: r.result_info?.total_count || r.result.length,
    records: r.result.map(rec => ({
      id: rec.id,
      name: rec.name,
      type: rec.type,
      content: rec.content,
      ttl: rec.ttl,
      proxied: rec.proxied,
      priority: rec.priority,  // for MX
      comment: rec.comment,
      tags: rec.tags
    }))
  };
}
```

### 2. List Records by Type (filtered)

```javascript
async () => {
  const r = await cloudflare.request({
    method: "GET",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    query: { per_page: 100, type: "CNAME" }
  });
  return r.result.map(rec => ({
    id: rec.id, name: rec.name, content: rec.content
  }));
}
```

### 3. Add A Record

```javascript
async () => {
  const r = await cloudflare.request({
    method: "POST",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    body: {
      type: "A",
      name: "subdomain",   // "subdomain" → subdomain.hypajump.ai; "@" → root
      content: "1.2.3.4",  // IPv4 address
      ttl: 1,              // 1 = Auto
      proxied: true        // true = orange cloud (CDN), false = DNS only
    }
  });
  return { id: r.result?.id, success: r.success, errors: r.errors };
}
```

### 4. Add CNAME Record

```javascript
async () => {
  const r = await cloudflare.request({
    method: "POST",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    body: {
      type: "CNAME",
      name: "subdomain",
      content: "target.example.com",
      ttl: 1,
      proxied: true
    }
  });
  return { id: r.result?.id, success: r.success };
}
```

### 5. Add MX Record

```javascript
async () => {
  const r = await cloudflare.request({
    method: "POST",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    body: {
      type: "MX",
      name: "@",             // root domain
      content: "aspmx.l.google.com",
      priority: 1,           // lower = higher priority
      ttl: 1,
      proxied: false         // MX records should NOT be proxied
    }
  });
  return r;
}
```

### 6. Add TXT Record

```javascript
async () => {
  const r = await cloudflare.request({
    method: "POST",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    body: {
      type: "TXT",
      name: "@",
      content: "v=spf1 include:_spf.google.com ~all",
      ttl: 1,
      proxied: false
    }
  });
  return r;
}
```

### 7. Delete DNS Record

```javascript
// Get record_id from List first, then:
async () => {
  const r = await cloudflare.request({
    method: "DELETE",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records/{record_id}"
  });
  return r;
}
```

### 8. Update / Patch Record

```javascript
// PATCH only changes specified fields (Partial update)
async () => {
  const r = await cloudflare.request({
    method: "PATCH",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records/{record_id}",
    body: {
      content: "5.6.7.8",   // only update content
    }
  });
  return r;
}
```

### 9. Batch Export All Records (BIND format)

```javascript
async () => {
  const r = await cloudflare.request({
    method: "GET",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records/export"
  });
  return r;
}
```

### 10. Filter by Subdomain (per project)

```javascript
// Filter by subdomain prefix — e.g., all records for ramjet:
async () => {
  const r = await cloudflare.request({
    method: "GET",
    path: "/zones/15e24c6a7bbdfe13ad381ebe1c14ecf6/dns_records",
    query: { per_page: 100 }
  });
  return r.result
    .filter(rec => rec.name.startsWith("ramjet."))
    .map(rec => ({ id: rec.id, name: rec.name, type: rec.type, content: rec.content }));
}
```

---

## HypaJump Project DNS Patterns

Each HypaJump project follows a standard pattern of DNS records. Here is the reference at time of writing — current state may vary (use List to verify).

### Common Infrastructure

```yaml
* (wildcard):       A → 170.64.182.105 (proxied: false)
dokploy:            A → 170.64.182.105 (proxied: true)
slides:             A → 170.64.182.105 (proxied: true)
```

### Per-Project Clerk Records (Standard Set)

Each project needs these 6 records when setting up Clerk authentication on a production domain:

```yaml
{project}:             A → 170.64.182.105 (proxied: true)
accounts.{project}:    CNAME → accounts.clerk.services
clerk.{project}:       CNAME → frontend-api.clerk.services
clk._domainkey.{project}:  CNAME → dkim1.<clerk-service>.clerk.services
clk2._domainkey.{project}: CNAME → dkim2.<clerk-service>.clerk.services
clkmail.{project}:     CNAME → mail.<clerk-service>.clerk.services
```

| Project | Subdomain Prefix | DKIM Service Key |
|---------|-----------------|------------------|
| Ramjet | `ramjet` | `yfsgd9xb3w49` |
| CopyFlo | `copyflo` | `yx9hgqgaou6m` |
| Oz Oils | `oz-oils` | `bbcogao8xv6w` |
| HomeCare | `home-care` | `o8he8wwot6sl` |

> **Clerk Migration Note:** Migrating Clerk from development (`clerk.{project}.{dev-domain}`) to production (`{project}.hypajump.ai`) requires:
> 1. All 6 Clerk DNS records above are created and verified
> 2. Clerk Dashboard → Path-based routing → Update production domains
> 3. Test login flow end-to-end on production URL

### Email Records

```yaml
@ (root):                MX → Google Workspace (5 servers, priority 1/5/5/10/10)
mail:                    MX → Mailgun (priority 10/20/30), with SPF + DKIM + DMARC
bot:                     MX → Zoho (priority 10/20/50), with SPF + DKIM + DMARC + verification
```

---

## Common Record Types Quick Reference

| Type | Content | Example | Notes |
|------|---------|---------|-------|
| A | IPv4 | `170.64.182.105` | Direct IP |
| AAAA | IPv6 | `2001:db8::1` | Rarely used |
| CNAME | Domain | `accounts.clerk.services` | Cannot be at root |
| TXT | Text | `"v=spf1 ... ~all"` | SPF, DKIM, verification |
| MX | Domain | `aspmx.l.google.com` | Must include `priority` |
| NS | Domain | `monroe.ns.cloudflare.com` | Rarely modified |

---

## Pitfalls & Notes

- **TTL=1** = Auto — Cloudflare default, keep this unless you need specific caching
- **CNAME at root** is NOT allowed. Use A record with proxy (orange cloud) or CNAME flattening
- **MX records MUST be unproxied** (`proxied: false`) — email won't work through Cloudflare proxy
- **Record ID** — always get from List first before delete/update, never hardcode
- **Auth header** — the `cf-hypajump` MCP server uses Bearer token in `headers` config
- **GoDaddy leftovers** — after migrating nameservers to Cloudflare, old GoDaddy NS records and `_domainconnect.*` entries in the zone can be safely deleted
