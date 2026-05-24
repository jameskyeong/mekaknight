# Config File Schema

Per-project config stored at `.claude/tracking-issue.json`. Must be included in `.gitignore`.

## Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `notionApiKey` | string | required | Notion Internal Integration token (`ntn_` prefix) |
| `databases.issueTracker.id` | string (UUID) | required | Issue tracker Notion DB ID |
| `databases.issueTracker.templatePageId` | string (UUID) | optional | Body template reference page ID |
| `defaults.assigneeId` | string (UUID) | optional | Default assignee Notion User ID |
| `defaults.assigneeName` | string | optional | Default assignee display name |

### Property Map

Maps logical roles to actual Notion DB property names. This allows the same skills to work with any language or naming convention.

| Field | Type | Required | Description |
|---|---|---|---|
| `databases.issueTracker.propertyMap.status` | string | required | Name of the select property used for issue status |
| `databases.issueTracker.propertyMap.severity` | string | required | Name of the select property used for severity/priority |
| `databases.issueTracker.propertyMap.tags` | string | required | Name of the multi_select property used for tags/labels |
| `databases.issueTracker.propertyMap.assignee` | string | required | Name of the people property used for assignee |
| `databases.issueTracker.propertyMap.reason` | string | optional | Name of the rich_text property for developer notes (written during resolve) |
| `databases.issueTracker.propertyMap.source` | string | optional | Name of the rich_text property for feedback source/attribution (who reported) |

### Status Map

Maps logical workflow states to actual select option values in the DB.

| Field | Type | Required | Description |
|---|---|---|---|
| `databases.issueTracker.statusMap.pending` | string | required | Option value representing "pending" / not-started state |
| `databases.issueTracker.statusMap.waiting` | string | optional | Option value representing a secondary "waiting" state (queried alongside pending) |
| `databases.issueTracker.statusMap.inProgress` | string | required | Option value representing "in progress" state |
| `databases.issueTracker.statusMap.readyToDeploy` | string | required | Option value representing "ready to deploy" state |

### Severity Options

| Field | Type | Required | Description |
|---|---|---|---|
| `databases.issueTracker.severityOptions` | string[] | required | Ordered array of severity/priority option values (highest to lowest) |

## Example

```json
{
  "notionApiKey": "ntn_xxxxx",
  "databases": {
    "issueTracker": {
      "id": "abc12345-aaaa-bbbb-cccc-0123456789ab",
      "templatePageId": "def12345-aaaa-bbbb-cccc-0123456789ab",
      "propertyMap": {
        "status": "Status",
        "severity": "Priority",
        "tags": "Tags",
        "assignee": "Assignee",
        "reason": "Reason",
        "source": "Source"
      },
      "statusMap": {
        "pending": "Pending",
        "inProgress": "In Progress",
        "readyToDeploy": "Ready to Deploy"
      },
      "severityOptions": ["P0", "P1", "P2", "P3"]
    }
  },
  "defaults": {
    "assigneeId": "26ad872b-594c-8175-83a0-0002bcffe6d0",
    "assigneeName": "James"
  }
}
```

## Reading Pattern

```bash
# Core config
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')
TEMPLATE_PAGE=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.templatePageId // empty')
ASSIGNEE_ID=$(cat .claude/tracking-issue.json | jq -r '.defaults.assigneeId // empty')

# Property map — actual DB property names
STATUS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.status')
SEVERITY_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.severity')
TAGS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.tags')
ASSIGNEE_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.assignee')
REASON_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.reason // empty')
SOURCE_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.source // empty')

# Status map — actual select option values
PENDING_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.pending')
IN_PROGRESS_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.inProgress')
READY_TO_DEPLOY_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.readyToDeploy')

# Severity options
SEVERITY_OPTIONS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.severityOptions[]')
```
