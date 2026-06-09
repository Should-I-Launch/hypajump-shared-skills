# Linear → Slack Integration Troubleshooting Reference

## Session: ENG-121 (2026-06-06)

### Problem
Linear Slack integration appeared connected, but notifications (comments, status changes) were not reaching Slack.

### API Investigation

**Query: list integrations**
```graphql
query {
  integrations(first: 20) {
    nodes { id service createdAt updatedAt organization { name } }
  }
}
```
Result: 3 integrations found:
- `slack` (org-level, connected 2026-06-06)
- `slackPersonal` (user-level)
- `slackProjectPost` (project-level)

**Query: team Slack flags**
```graphql
query {
  teams(first: 10) {
    nodes {
      id name key
      slackNewIssue
      slackIssueStatuses
      slackIssueComments
    }
  }
}
```
Result: ENG team had all three flags = `true`.

**Query: webhooks**
```graphql
query { webhooks(first: 20) { nodes { id label url enabled } } }
```
Result: empty (expected for native Slack integration).

### Root Cause

The API flags (`slackNewIssue`, `slackIssueStatuses`, `slackIssueComments`) only indicate which notification **types** are enabled. They do NOT confirm a Slack channel is mapped. Linear requires:
1. Workspace integration connected (`slack` service node exists)
2. A channel selected per team/project in UI settings
3. `@Linear` bot invited to that Slack channel

Without step 2, notifications have no destination.

### Invalid Fields to Avoid

These fields do NOT exist on `Team` or `Organization` and will return `GRAPHQL_VALIDATION_FAILED`:
- `slackChannel`
- `slackIssueAdded`
- `slackIssueNew`
- `slackIssueStatusUpdated`
- `slackComment`
- `slackIssueAddedToTriage`

### Fix Steps

1. Linear → Settings → Integrations → Slack → verify workspace connected
2. Team settings → Slack notifications → choose channel
3. In Slack: `/invite @Linear` to the chosen channel
4. Test with a comment on an issue

### Documentation Source

Linear official docs: https://linear.app/docs/slack
Key section: "Notifications setup" — team, project, personal, and view subscriptions each require separate channel selection.
