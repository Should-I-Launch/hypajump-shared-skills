---
name: linear-workskill
description: "Linear task management for the HypaJump ENG team — create issues, fetch assigned tasks, add comments. English only, assign to yourself by default, status=Todo, project required, labels matched from the existing list. Fetch excludes backlog unless explicitly told otherwise."
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [linear, issues, tasks, productivity, hypajump]
---

# Linear Workskill — HypaJump ENG Task Management

Always communicate in **English** when using this skill.

Auth: this skill reads the `LINEAR_API_KEY` environment variable. Set it in
`~/.hermes/.env` (recommended) — never hardcode the key in this file or pass it inline in
a terminal command (Hermes redacts inline values to `***`, which corrupts the key and
causes HTTP 401). Each person uses their OWN personal Linear API key (Linear → Settings →
Account → Security & access → Personal API keys).

## Constants (ENG Team, HypaJump Workspace)

```
ENG team ID: bbc7bca7-036e-463b-b500-933036baff44
```

Your own user id is not hardcoded — resolve it at runtime with `viewer { id }` (see the
"assign to yourself" note in Operation 3).

### Workflow States (ENG Team)

| Type       | State ID                              | Name         |
|------------|---------------------------------------|--------------|
| unstarted  | a6feb182-6a1b-4101-b974-bf0730c46329 | Todo         |
| started    | 5d90c735-a82f-4717-bd03-306ee606856d | In Progress  |
| started    | 7bddaf7e-9f6f-45e4-9bff-a880dc5a152f | blocked      |
| completed  | 42a1adf5-a335-4b3d-b5da-70633d902cb1 | In Review    |
| completed  | b7fd030d-eeda-43c1-ba46-64ae62e9005a | Done         |
| backlog    | 9049b1fb-c262-4e23-84a9-5b68acd2fb2e | Backlog      |

**Todo state ID (for new issues):** `a6feb182-6a1b-4101-b974-bf0730c46329`

### Labels (ENG team)

| ID                                    | Name              |
|---------------------------------------|-------------------|
| 42e47d3c-3c9e-4854-9c76-e48158010cc8 | Testing Feedback  |
| 8f940ef4-ced5-48da-888f-0a26ccac62eb | Investigation     |
| f30a918e-bd63-4a7a-9110-1b0d28acad90 | Discovery         |
| 75ecd9aa-88bc-4b53-8615-6805189d0787 | Quote             |
| 2c6d3ff7-3894-4a79-8b28-438048a3ee74 | GHL               |
| dc0374ac-e6e3-41a0-a302-57e245a41f43 | Launch            |
| a60d1fa3-2a1e-48eb-8f8d-86a923b6c635 | Backend           |
| fd56501a-9367-494d-86aa-230b332d9be4 | General Task      |
| c2d33851-be75-4de3-91e8-4c17ab693d08 | Improvement       |
| bb66913d-ea81-48c6-998e-32fc46080cdb | Feature           |
| 824b4021-b029-4303-8e2e-bc895c3ab630 | Bug               |

Note: labels are team-scoped. The ENG labels above are valid for ENG issues. The "Task"
label is a SAL-team label and will be rejected on ENG issues — use "General Task" instead.
If a label id is rejected, query the team's own labels: `team(id:"<ENG>"){ labels { nodes { id name } } }`.

### Projects

| ID                                    | Name                              |
|---------------------------------------|-----------------------------------|
| 007933ed-1ab2-492c-9efa-7a1ae40b645f | HJ004 — Biotech Engineering       |
| f9a393f7-b2e2-4131-afd4-d1078a655658 | Google Business Profile           |
| 6cca80ab-5fc3-4e85-b290-3aed68129cee | HJ003 — MotorBiz                  |
| b52b2125-8b23-4337-a803-700d447d0aaa | NZ Law Firm                       |
| e02d2420-0590-4539-a87d-5b530742b1af | Oz Oils                           |
| 1e0c26f6-07c9-4e4f-929c-fd089797de95 | Content Factory                   |
| 4900e46c-1b81-499e-8dd1-65791bea9c1a | Ramjet Tranche Two                |
| 7f3fa87e-1730-4ed8-80ca-0c3486135c8f | HypaJump Internal Engineering     |

Project ids can change as projects are added — if unsure, query live: `projects(first:50){ nodes { id name } }`.

### Available Teams

| ID                                    | Key  | Name               |
|---------------------------------------|------|--------------------|
| ea899c2c-c51b-480b-bc1e-501859eb7ec8 | SAL  | Sales & Marketing  |
| bbc7bca7-036e-463b-b500-933036baff44 | ENG  | Engineering        |

## Common Helper (GraphQL via Python)

Reads the key from the environment — no hardcoded secret.

```python
import os, json, urllib.request
key = os.environ["LINEAR_API_KEY"]
url = "https://api.linear.app/graphql"
def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": key
    }, method="POST")
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())
```

Run inside `execute_code` so the env var is available and the key never appears in a
terminal command line.

---

## Operation 1: Add Comment

Add a comment to an existing issue by identifier (e.g. ENG-113).

### Rules
- Use the issue identifier (e.g. `ENG-113`) as the `issueId` field.
- English only.
- Keep comments concise — one line for decision/status records (see `linear-project-context`).

### Mutation

```python
result = gql(
    "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body createdAt } } }",
    {"input": {"issueId": identifier, "body": comment_text}}
)
```

---

## Operation 2: Fetch Your Assigned Tasks

Fetch issues assigned to you. Resolve your user id with `viewer { id }`, then filter by
state types **unstarted, started** — exclude **backlog** unless explicitly asked.

### Rules
- Default: fetch only `Todo` (unstarted), `In Progress` (started), `blocked` (started).
- Do not include `backlog` unless the user explicitly says to.
- Return title, identifier, state, priority, project name, and url. English output.

### Query

```python
me = gql("query { viewer { id } }")["data"]["viewer"]["id"]
result = gql(
    """
    query($assigneeId: String!, $stateTypes: [String!]) {
      issues(filter: { assignee: { id: { eq: $assigneeId } }, state: { type: { in: $stateTypes } } },
             first: 50, orderBy: updatedAt) {
        nodes { identifier title priority state { name type } project { name } url updatedAt }
      }
    }
    """,
    {"assigneeId": me, "stateTypes": ["unstarted", "started"]}  # add "backlog" only if asked
)
```

### Priority labels
0 = None, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low

---

## Operation 3: Create Issue

Create a new issue with these **mandatory rules**:

1. **Status must be Todo** — set `stateId` to `a6feb182-6a1b-4101-b974-bf0730c46329` (Todo, unstarted). NOT Backlog.
2. **Project is required** — set `projectId`. If the user doesn't specify a project or you're unsure which it belongs to, **ask before creating**. Do not guess.
3. **English only** — title and description always in English.
4. **Assign to yourself by default** — resolve your own id via `viewer { id }` and set `assigneeId` to it, unless the user asks to assign someone else (then resolve that person via `users { nodes { id name email } }`).
5. **Labels** — pick the most appropriate ENG label(s) from the list above. Use label IDs, not names.
6. **Priority** — infer from context or use 2 (High) as default.

### Label matching guide
- Bug fixes → `Bug` (824b4021-b029-4303-8e2e-bc895c3ab630)
- New features → `Feature` (bb66913d-ea81-48c6-998e-32fc46080cdb)
- Discovery/research/recon → `Discovery` (f30a918e-bd63-4a7a-9110-1b0d28acad90)
- Investigation/probing → `Investigation` (8f940ef4-ced5-48da-888f-0a26ccac62eb)
- Backend work → `Backend` (a60d1fa3-2a1e-48eb-8f8d-86a923b6c635)
- Improvements/optimizations → `Improvement` (c2d33851-be75-4de3-91e8-4c17ab693d08)
- Launch activities → `Launch` (dc0374ac-e6e3-41a0-a302-57e245a41f43)
- Testing/QA → `Testing Feedback` (42e47d3c-3c9e-4854-9c76-e48158010cc8)
- GHL-related → `GHL` (2c6d3ff7-3894-4a79-8b28-438048a3ee74)
- Quotes/pricing → `Quote` (75ecd9aa-88bc-4b53-8615-6805189d0787)
- General tasks / fallback → `General Task` (fd56501a-9367-494d-86aa-230b332d9be4)

### Create mutation

```python
me = gql("query { viewer { id } }")["data"]["viewer"]["id"]
result = gql(
    "mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title url } } }",
    {
        "input": {
            "title": "Title here",
            "description": "Description in English",
            "teamId": "bbc7bca7-036e-463b-b500-933036baff44",
            "projectId": "PROJECT_UUID",
            "assigneeId": me,
            "stateId": "a6feb182-6a1b-4101-b974-bf0730c46329",
            "priority": 2,
            "labelIds": ["LABEL_UUID"]
        }
    }
)
```

## Pitfalls

1. **API key from env, never inline** — the helper reads `os.environ["LINEAR_API_KEY"]`. Never hardcode the key in this file and never pass it inline in a terminal command (`***` redaction corrupts it → HTTP 401). Set it in `~/.hermes/.env`.
2. **GraphQL errors in HTTP 200** — always check the response body for an `errors` field even on 200 OK.
3. **New issue status** — if `stateId` is omitted, Linear defaults to Backlog, not Todo. Always set `stateId` explicitly.
4. **Project required** — if no project is named, ask. Never create an issue without a project.
5. **Team scope** — ENG issues use `teamId: "bbc7bca7-036e-463b-b500-933036baff44"`. Labels are team-scoped (the "Task" label belongs to SAL and is rejected on ENG — use "General Task").
6. **Assignee as create-time field** — if `assigneeId` fails in the create mutation, create without it then `issueUpdate` with `assigneeId`.
7. **No backlog by default** — filter `state: { type: { in: ["unstarted", "started"] } }` unless backlog is explicitly requested.
8. **Labels at create time** — if `labelIds` causes a create error, create the issue first then update with `labelIds`.
9. **Fetching by identifier** — `IssueFilter` does not expose `identifier`. To look up by code (e.g. `ENG-99`), filter by `team: { key: { eq: "ENG" } }` and `number: { eq: 99 }` (see Operation 4).
10. **Don't auto-post comments** — only comment on an issue when explicitly asked ("update the task", "post this to Linear"). Don't post after every recon/discovery step; let the user review findings first.

## Operation 4: Fetch Single Issue by Identifier

Use this when you need the full details of one specific issue (e.g. `ENG-99`).

```python
result = gql(
    """
    query {
      issues(filter: { team: { key: { eq: "ENG" } }, number: { eq: 99 } }, first: 1) {
        nodes { id identifier title description priority state { name type } project { name } assignee { name } url updatedAt }
      }
    }
    """
)
```

## Operation 5: Comment style & optional signature

When asked to comment on or update an issue, keep comments concise (one line for a
decision/status/blocker record — see `linear-project-context`). Detail belongs in the
issue description, not the comment.

Signature is OPTIONAL and per-agent. If your agent uses a signature convention (defined in
your own SOUL.md / persona), append it to the comment. This shared skill does NOT mandate
any particular name. Never add a signature to issue descriptions or titles — comments only.

## Operation 6: Troubleshoot Slack Integration

When Slack notifications from Linear aren't arriving, investigate via API before asking the
user to click around in settings.

```python
# 1. Does a Slack integration exist?
gql("query { integrations(first: 20) { nodes { id service createdAt updatedAt } } }")
# 2. Team-level Slack flags (valid fields only)
gql("query { teams(first: 10) { nodes { id name key slackNewIssue slackIssueStatuses slackIssueComments } } }")
# 3. Webhooks (usually empty for native Slack integration)
gql("query { webhooks(first: 20) { nodes { id label url enabled team { name } } } }")
```

### Interpreting results
- **Integration exists but notifications missing** → workspace `slack` integration connected, but the team may have no channel mapped. Linear needs BOTH: integration connected AND a channel chosen per team/project. The flags only mean those notification types are enabled — they do NOT confirm a channel is mapped.
- **No `slack` integration node** → never set up or disconnected. Reconnect via Settings → Integrations → Slack.
- **Flags are `false`** → team notifications disabled; enable in team settings.

### Fix steps (guide the user via UI)
1. Linear → Settings → Integrations → Slack — ensure workspace connected.
2. Team settings → Slack notifications — pick a channel for team ENG.
3. In Slack, `/invite @Linear` to that channel — the bot must be present.
4. Project settings (if applicable) — bell icon → choose channel for project notifications.
5. Personal notifications — user-level, from notification settings.

### Pitfall: invalid GraphQL fields
Do NOT query these — they don't exist on `Team`/`Organization`: `slackChannel`,
`slackIssueAdded`, `slackIssueNew`, `slackIssueStatusUpdated`, `slackComment`,
`slackIssueAddedToTriage`. Valid team fields: `slackNewIssue`, `slackIssueStatuses`,
`slackIssueComments`.

See `references/linear-slack-troubleshooting.md` for a full diagnostic transcript.
See `references/linear-document-download.md` for downloading document attachments from Linear upload URLs.
