# jameskill

Notion issue tracker integration for Claude Code.

## Available Skills

- `/tracking-issue-report` — Report issues to a Notion database. Parses prompts, verifies against codebase, creates pages with proper template blocks.
- `/tracking-issue-resolve` — Fetch pending issues, brainstorm solutions, implement fixes, update status.
- `/tracking-issue-setup` — Configure Notion API key, connect databases, detect templates, set defaults.

## Configuration

Each project stores its config in `.claude/tracking-issue.json` (gitignored). Run `/tracking-issue-setup` to create it.

## Requirements

- `curl` (HTTP calls to Notion API)
- `jq` (JSON parsing)
- A Notion Internal Integration token
