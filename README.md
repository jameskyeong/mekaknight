# jameskill

Notion issue tracker integration for [Claude Code](https://claude.ai/claude-code). Report, resolve, and manage issues directly from your terminal.

## Features

- **Report issues** — Parse natural language into structured Notion issues with proper templates
- **Resolve issues** — Fetch pending issues, brainstorm solutions, implement fixes, update status
- **Auto-setup** — Guided configuration with automatic DB schema detection and property mapping
- **Codebase verification** — Cross-reference reported issues against actual code before creating
- **Any language** — Works with any Notion DB regardless of column names or language

## Installation

Add the jameskill marketplace to Claude Code:

```bash
claude mcp add-marketplace https://github.com/jameskyeong/jameskill.git
```

Or clone and install manually:

```bash
git clone https://github.com/jameskyeong/jameskill.git ~/.claude/skills/jameskill
```

## Quick Start

### 1. Setup

```
/tracking-issue-setup
```

The setup wizard will:
- Ask for your Notion Integration token
- Connect to your issue tracker database
- Auto-detect property types and map them (status, severity, tags, assignee)
- Detect your page template structure
- Save config to `.claude/tracking-issue.json`

### 2. Report Issues

```
/tracking-issue-report
Feedback from site visit (2026-05-15):
1. Close button on review popup is too small for seniors (P1)
2. Color palette has too many options — simplify to one palette (P2)
3. Touch responsiveness is poor across the app — blocker (P0)
```

The skill will:
- Split into individual issues
- Verify each against the codebase
- Create Notion pages with full template blocks (headings, callouts, dividers)
- Report results with Notion URLs

### 3. Resolve Issues

```
/tracking-issue-resolve
```

The skill will:
- Fetch all pending issues, sorted by severity (P0 first)
- Show in-progress issues you can resume
- On selection: change status to "In Progress" → brainstorm → implement → "Ready to Deploy"

## Configuration

Each project stores its config in `.claude/tracking-issue.json` (auto-added to `.gitignore`):

```json
{
  "notionApiKey": "ntn_xxx",
  "databases": {
    "issueTracker": {
      "id": "your-database-id",
      "templatePageId": "template-page-id",
      "propertyMap": {
        "status": "Status",
        "severity": "Priority",
        "tags": "Labels",
        "assignee": "Assignee",
        "reason": "Notes"
      },
      "statusMap": {
        "pending": "Todo",
        "inProgress": "In Progress",
        "readyToDeploy": "Done"
      },
      "severityOptions": ["P0", "P1", "P2", "P3"]
    }
  },
  "defaults": {
    "assigneeId": "notion-user-id",
    "assigneeName": "Your Name"
  }
}
```

The `propertyMap` and `statusMap` are auto-generated during setup — you don't need to write them manually.

## Requirements

- [Claude Code](https://claude.ai/claude-code)
- `curl`
- `jq` ([install guide](https://jqlang.github.io/jq/download/))
- A [Notion Internal Integration](https://www.notion.so/my-integrations) token

## Skills Reference

| Skill | Command | Description |
|---|---|---|
| Report | `/tracking-issue-report` | Create issues from a prompt |
| Resolve | `/tracking-issue-resolve` | Work on pending issues |
| Setup | `/tracking-issue-setup` | Configure Notion connection |

## License

[MIT](LICENSE)
