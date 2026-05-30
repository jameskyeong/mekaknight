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

The signature skill is **`/forge`** — a self-contained development orchestrator. Tell it what you want; it drives the full flow: clarify → route → build with strict TDD → peer-review → verify → finish. One command, one entry point, no external skill chain to remember.

The rest (issue tracking, inspection) are opt-in utilities — supplementary, not required.

<br clear="right" />

## How `/forge` is different

Most skill packs hand you a toolbox of discrete disciplines and ask you to remember which one to invoke when. `/forge` inverts that:

1. **One command, full pipeline.** You type `/forge` (or `/forge fix the login bug`). Forge runs the whole flow — you never pick which sub-skill to call next.
2. **Auto-routing by intent.** After Clarify, forge *infers* what kind of work this is and picks one of 4 routes. You don't choose; it decides.
3. **Different phase shapes per route.** DIAGNOSE writes the reproduction test before the fix. PROTOTYPE relaxes TDD on purpose. These aren't relabeled flows — they're different phase orders.
4. **No-soft-language verification.** Every phase boundary rejects "should work", "seems fine", "looks good". Verification means running the command and observing the output.
5. **Tracker-free core.** Forge itself never reads or writes Notion. Issue tracking is a separate, opt-in surface.
6. **Self-contained.** Zero dependency on superpowers, Matt Pocock, or any other skill pack — every discipline lives inside `skills/forge/references/`. See [ADR 0001](docs/adr/0001-self-contained-orchestrator.md).

## `/forge` — Development Orchestrator

### The 4-way router

After Clarify, forge picks **one** route based on the kind of work. Each route is a meaningfully different phase shape — not the same flow renamed.

| Route | When | Phase shape | Why it's different |
|---|---|---|---|
| **DIRECT** | Small contained change. 1-4 commits, tightly-grouped files. | Build → Peer-review → Verify → Finish | Skips plan file. No ceremony for a one-shot change. |
| **PLAN** | Medium feature. 5-15 commits, 2-4 files with shared state. | Plan file → user confirms → sequential Build | Plan file becomes the contract; cross-session pickup runs off it. |
| **DIAGNOSE** | Bug-first work. Reproduction steps, error messages, "it's broken". | Reproduce → Minimize → Investigate → Fix → Regression-prevent | The reproduction test is written *first* and stays in the suite as the regression net. |
| **PROTOTYPE** | Throwaway exploration. "How should this look", "try a few approaches". | Time-boxed variations (relaxed TDD) → user reviews → Discard or Promote | TDD is intentionally relaxed. Promote = restart as a fresh PLAN run, not a graduation. |

### Flexible entry & resume

- **Resume mid-flow** — `/forge docs/plans/<feature>.md` re-enters the plan, skips Clarify+Route, picks up from the first incomplete task.
- **Skip Clarify** — say "skip clarify" or "requirements are clear" when you've already specced the work.
- **Called from `/strike`** — the Notion issue title + body seeds Clarify automatically.

### Phases at a glance

```
preflight → clarify → route → build (strict TDD) → peer-review → ship-check (slot) → verify → finish
```

- **Relentless clarification** — the 5-category ambiguity checklist must reach 0 items before Route.
- **Strict TDD** — RED → GREEN → REFACTOR for every unit. No skipped tests, no commented-out tests, no "TODO: add test later".
- **Independent peer-review subagent** — fresh perspective on the diff, free from author recency bias.
- **Branch finish is explicit** — local merge / open PR / keep branch / discard. Not an afterthought.

> Decision history: [ADR 0001](docs/adr/0001-self-contained-orchestrator.md) (self-contained), [ADR 0005](docs/adr/0005-forge-depth-references.md) (depth via references), [ADR 0006](docs/adr/0006-forge-route-expansion.md) (DIAGNOSE + PROTOTYPE).

---

## Supplementary skills

### 🔬 Inspection (alpha)

Ships in v2.0 but not the v2.0 headline — the author doesn't use them daily and dogfooding didn't surface real findings. Available if you want them; future direction tied to post-launch feedback. See [ADR 0004](docs/adr/0004-narrow-v2-to-forge-and-tracker.md).

| Command | What it does |
|---|---|
| `/lock` | v0.1 inspection for Supabase RLS gaps, secret-key client exposure, missing Stripe webhook signatures |
| `/launch` | v0.1 GO / NO-GO deploy verdict aggregating lock's findings |

### 🗂 Notion issue tracking (optional integration)

Notion-backed issue lifecycle. From a Slack-pasted blob of bug reports to grouped, codebase-verified tickets — and back out into shippable fixes.

| Command | What it does |
|---|---|
| `/link` | One-time Notion connection — API key, database, property mapping, defaults |
| `/tag` | Parse a prompt into issues, auto-group related items, verify against the codebase, create pages |
| `/strike` | Pick a pending issue, call `/forge` to implement, update status with a human-readable outcome note |

**Why it's different** — issue titles are written as user-visible problems, not git commit messages. Cross-functional readers (PMs, support, customers) can scan the tracker without engineering context.

## Installation

```bash
claude plugins marketplace add https://github.com/jameskyeong/mekaknight.git
claude plugins install mekaknight
```

## Requirements

- [Claude Code](https://claude.ai/claude-code) — required for all skills.
- **`/forge`, `/lock`, `/launch`** — no external dependencies.
- **`/link`, `/tag`, `/strike`** — `curl`, `jq`, and a [Notion Internal Integration](https://www.notion.so/my-integrations) token.

## License

[MIT](LICENSE)
