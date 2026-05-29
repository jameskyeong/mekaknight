<p align="center">
  <img src="docs/banner.jpg" alt="mekaknight" />
</p>

<p align="center">
  <em>Developer productivity skills for <a href="https://claude.ai/claude-code">Claude Code</a></em>
</p>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/install-claude%20plugin-1a1a1a?style=flat-square" alt="install" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square" alt="MIT" /></a>
  <img src="https://img.shields.io/badge/skills-6-1a1a1a?style=flat-square" alt="6 skills" />
</p>

---

<img align="right" src="docs/mekaknight-hero.jpg" width="220" alt="mekaknight character" />

A small, opinionated set of skills that plug into Claude Code. Built around two ideas:

- **A development flow that knows when to slow down** — clarify before designing, design before building, verify before claiming done.
- **Issue tracking that reads like a problem statement, not a commit message** — titles and notes stay readable for PMs, support, customers.

<br clear="right" />

## Skills

### 🛠  Development Orchestrator

Self-contained development pipeline. Takes raw requirements through a disciplined flow — clarify → build → review → verify → finish — without depending on any external skill plugins.

| Command | Purpose |
|---|---|
| `/forge` | Full development flow — clarify, build, review, verify, finish |

**Phases** — preflight → clarify → **route** → build (strict TDD) → peer-review → ship-check (slot) → verify → finish.

The router fans out by task type. **Tracker-free** — forge itself never reads or writes Notion (use `/strike` separately if Notion integration is needed). Every artifact lives in the repo.

> **Resume across sessions**: `/forge docs/plans/<feature>.md` — re-enters the plan and picks up from incomplete tasks.

| Route | When | Path |
|---|---|---|
| **DIRECT** | Small, contained change (1-4 commits, tightly-grouped files) | Build immediately, no plan file |
| **PLAN** | Medium feature (5-15 commits, 2-4 files with shared state) | Plan file → user confirms → sequential build |

**What's different from a plain TDD chain**

- Relentless clarification before building — the 5-category ambiguity checklist must reach 0 items before Route.
- Strict TDD enforced — RED → GREEN → REFACTOR for every unit of work, no skipped tests.
- Independent peer-review subagent — fresh perspective on the diff, free from author recency bias.
- "Done" is gated by no-soft-language verification — phrases like "should work" are banned in completion claims.
- The branch finish is an explicit step (local merge / open PR / keep branch / discard) — not an afterthought.

> `forge` is self-contained — no external skill dependencies. See [ADR 0001](docs/adr/0001-self-contained-orchestrator.md) for the decision rationale.

### 🔒  Security Inspection & Launch Verdict

Catch the configuration-level holes static scanners miss, then aggregate findings into a single deploy decision.

| Command | Purpose |
|---|---|
| `/lock` | Inspect a project for service-configuration security holes (Supabase RLS, secret-key client exposure, Stripe webhook signatures). Reports PASS/WARN/BLOCK with fix suggestions. |
| `/launch` | One-line GO / NO-GO deploy verdict. Aggregates inspection findings into a single binary decision. |

### 🗂  Issue Tracking

Notion-backed issue lifecycle. From a Slack-pasted blob of bug reports to grouped, codebase-verified tickets — and back out into shippable fixes.

| Command | Purpose |
|---|---|
| `/link` | One-time Notion connection — API key, database, property mapping, defaults |
| `/tag` | Parse a prompt into issues, auto-group related items, verify against the codebase, create pages |
| `/strike` | Pick a pending issue, brainstorm a fix, implement, update status with a human-readable outcome note |

**Why it's different** — issue titles are written as user-visible problems, not git commit messages. Cross-functional readers (PMs, support, customers) can scan the tracker without engineering context.

## Installation

```bash
claude plugins marketplace add https://github.com/jameskyeong/mekaknight.git
claude plugins install mekaknight
```

## Requirements

- [Claude Code](https://claude.ai/claude-code)
- `curl` + `jq` (issue tracking skills)
- A [Notion Internal Integration](https://www.notion.so/my-integrations) token (issue tracking skills)

## License

[MIT](LICENSE)
