<p align="center">
  <img src="docs/banner.jpg" alt="jameskill" />
</p>

<p align="center">
  <em>Developer productivity skills for <a href="https://claude.ai/claude-code">Claude Code</a></em>
</p>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/install-claude%20plugin-1a1a1a?style=flat-square" alt="install" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square" alt="MIT" /></a>
  <img src="https://img.shields.io/badge/skills-4-1a1a1a?style=flat-square" alt="4 skills" />
</p>

---

A small, opinionated set of skills that plug into Claude Code. Built around two ideas:

- **Issue tracking that reads like a problem statement, not a commit message** — titles and notes stay readable for PMs, support, customers.
- **A workflow that knows when to slow down** — clarify before designing, design before building, verify before claiming done.

## Skills

### 🗂  Issue Tracking

Notion-backed issue lifecycle. From a Slack-pasted blob of bug reports to grouped, codebase-verified tickets — and back out into shippable fixes.

| Command | Purpose |
|---|---|
| `/setup-issue` | One-time Notion connection — API key, database, property mapping, defaults |
| `/report-issue` | Parse a prompt into issues, auto-group related items, verify against the codebase, create pages |
| `/resolve-issue` | Pick a pending issue, brainstorm a fix, implement, update status with a human-readable outcome note |

**Why it's different** — issue titles are written as user-visible problems, not git commit messages. Cross-functional readers (PMs, support, customers) can scan the tracker without engineering context.

### 🛠  Workflow

Structured development flow that orchestrates [Matt Pocock skills](https://github.com/mattpocock/skills) and [superpowers](https://github.com/obra/superpowers) into a single chain: from problem statement to merged implementation.

| Command | Purpose |
|---|---|
| `/workflow` | Full development flow — clarify, build, review, verify, finish |

**Phases** — clarify → grill → **route** → build → architecture → quality/security → independent code review → verify → finish.

The router fans out by task scope, not just task type:

| Route | When | Skill chain |
|---|---|---|
| **Bug** | Reproducible broken behavior | `diagnose` |
| **Exploration** | UI shape or data model unclear | `prototype` |
| **Large cross-session** | 3+ modules, multiple sessions, AFK pickup | PRD + Notion issues |
| **Medium in-session** | Coherent feature, multiple dependent tasks, one session | `writing-plans` → `subagent-driven-development` |
| **Small clear** | Single contained change | Direct TDD |

**What's different from a plain TDD chain**

- Domain documentation (`CONTEXT.md`, ADRs) gets refined every run — not as a one-off effort.
- Reviews run as isolated reviewer subagents (`requesting-code-review`), so the reviewer has no recency bias from writing the code.
- "Done" is gated by `verification-before-completion` — soft language like "should work" doesn't pass.
- The branch finish (`finishing-a-development-branch`) is an explicit step, not an afterthought.

> Requires both [Matt Pocock skills](https://github.com/mattpocock/skills) and [superpowers](https://github.com/obra/superpowers) installed at `~/.claude/skills/` or as plugins. The workflow halts at Phase −1 (Preflight) if any required skill is missing — no silent skips.

## Installation

```bash
claude plugins marketplace add https://github.com/jameskyeong/jameskill.git
claude plugins install jameskill
```

## Requirements

- [Claude Code](https://claude.ai/claude-code)
- `curl` + `jq` (issue tracking skills)
- A [Notion Internal Integration](https://www.notion.so/my-integrations) token (issue tracking skills)

## License

[MIT](LICENSE)
