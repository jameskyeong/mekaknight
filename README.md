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

Built on two pillars: **`/powertasking`** — a self-contained development orchestrator that drives the full flow from one command — and **compound engineering** baked into the structure, so every session deposits artifacts that lift the next one.

The rest (issue tracking, inspection) are opt-in utilities — supplementary, not required.

<br clear="right" />

## How `/powertasking` is different from other skill packs

Most skill packs (superpowers, Matt Pocock, etc.) hand you a toolbox of discrete disciplines and ask you to remember which one to invoke when. Each invocation starts fresh. `/powertasking` inverts both halves:

### Pillar 1 — One command, smart pipeline

1. **One command, full pipeline.** You type `/powertasking` (or `/powertasking fix the login bug`). Powertasking runs the whole flow — you never pick which sub-skill to call next.
2. **Auto-routing by intent.** After Clarify, powertasking *infers* what kind of work this is and picks one of 4 routes. You don't choose; it decides.
3. **Different phase shapes per route.** DIAGNOSE writes the reproduction test before the fix. PROTOTYPE relaxes TDD on purpose. These aren't relabeled flows — they're different phase orders.
4. **No-soft-language verification.** Every phase boundary rejects "should work", "seems fine", "looks good". Verification means running the command and observing the output.
5. **Tracker-free core.** Powertasking itself never reads or writes Notion. Issue tracking is a separate, opt-in surface.
6. **Self-contained.** Zero dependency on superpowers, Matt Pocock, or any other skill pack — every discipline lives inside `skills/powertasking/references/`. See [ADR 0001](docs/adr/0001-self-contained-orchestrator.md).

### Pillar 2 — Compound engineering, in one skill

Each `/powertasking` session deposits durable artifacts in your repo so future sessions start ahead. **Five channels, all automated — bundled into one orchestrator**, no skill composition required. Discipline runs as part of the same flow that builds the code:

| Channel | How powertasking deposits | What compounds |
|---|---|---|
| **Plan files** | Auto — PLAN route writes `docs/plans/<feature>.md` | Resumable contracts. `/powertasking docs/plans/<feature>.md` re-enters from the first incomplete task across sessions. |
| **Regression tests** | Auto — DIAGNOSE route adds the *minimized* reproduction test to the suite permanently | Bugs compound into protection. The net grows with every fix. |
| **ADRs** | Auto-prompted — **Retrospective phase** proposes an ADR when an architectural choice was made | Decision history accumulates in `docs/adr/`. Future sessions know *why*. |
| **Discipline references** | Auto-prompted — Retrospective proposes a `references/<phase>.md` append when a new failure mode surfaces | In-repo, editable discipline that grows with the project. Not vendor-locked. |
| **Domain glossary** | Auto-prompted — Retrospective proposes a CONTEXT.md entry when new terminology was introduced | Language stays consistent across sessions and contributors. |

The Retrospective phase runs between Verify and Finish, checks each channel against a threshold, and proposes deposits one at a time. Silent exit when no channel qualifies — performative deposits are explicitly rejected. See [ADR 0007](docs/adr/0007-retrospective-phase.md).

> Your repo gets *easier to work in* over time. That's the compound part.

## `/powertasking` — Development Orchestrator

### The 4-way router

After Clarify, powertasking picks **one** route based on the kind of work. Each route is a meaningfully different phase shape — not the same flow renamed.

| Route | When | Phase shape | Why it's different |
|---|---|---|---|
| **DIRECT** | Small contained change. 1-4 commits, tightly-grouped files. | Build → Peer-review → Verify → Finish | Skips plan file. No ceremony for a one-shot change. |
| **PLAN** | Medium feature. 5-15 commits, 2-4 files with shared state. | Plan file → user confirms → sequential Build | Plan file becomes the contract; cross-session pickup runs off it. |
| **DIAGNOSE** | Bug-first work. Reproduction steps, error messages, "it's broken". | Reproduce → Minimize → Investigate → Fix → Regression-prevent | The reproduction test is written *first* and stays in the suite as the regression net. |
| **PROTOTYPE** | Throwaway exploration. "How should this look", "try a few approaches". | Time-boxed variations (relaxed TDD) → user reviews → Discard or Promote | TDD is intentionally relaxed. Promote = restart as a fresh PLAN run, not a graduation. |

### Flexible entry & resume

- **Resume mid-flow** — `/powertasking docs/plans/<feature>.md` re-enters the plan, skips Clarify+Route, picks up from the first incomplete task.
- **Skip Clarify** — say "skip clarify" or "requirements are clear" when you've already specced the work.
- **Called from `/resolve-issue`** — the Notion issue title + body seeds Clarify automatically.

### Phases at a glance

```
preflight → clarify → route → build (strict TDD) → peer-review → ship-check (slot) → verify → retrospective → finish
```

- **Relentless clarification** — the 5-category ambiguity checklist must reach 0 items before Route.
- **Strict TDD** — RED → GREEN → REFACTOR for every unit. No skipped tests, no commented-out tests, no "TODO: add test later".
- **Independent peer-review subagent** — fresh perspective on the diff, free from author recency bias.
- **Retrospective** — proposes ADR / references / CONTEXT.md deposits when the session produced learnings worth keeping. Silent exit otherwise.
- **Branch finish is explicit** — local merge / open PR / keep branch / discard. Not an afterthought.

> Decision history: [ADR 0001](docs/adr/0001-self-contained-orchestrator.md) (self-contained), [ADR 0005](docs/adr/0005-forge-depth-references.md) (depth via references), [ADR 0006](docs/adr/0006-forge-route-expansion.md) (DIAGNOSE + PROTOTYPE), [ADR 0007](docs/adr/0007-retrospective-phase.md) (Retrospective).

---

## Supplementary skills

### 🔬 Inspection (alpha)

Ships in v2.0 but not the v2.0 headline — the author doesn't use them daily and dogfooding didn't surface real findings. Available if you want them; future direction tied to post-launch feedback. See [ADR 0004](docs/adr/0004-narrow-v2-to-forge-and-tracker.md).

| Command | What it does |
|---|---|
| `/security-check` | v0.1 inspection for Supabase RLS gaps, secret-key client exposure (Next.js `"use client"` paradigm), missing Stripe webhook signatures |
| `/ship-check` | v0.1 security GO / NO-GO deploy verdict from security-check's findings (security-only by design — multi-axis aggregation is not promised, see [ADR 0010](docs/adr/0010-launch-v0.1-security-only.md)) |

> **Framework note**: security-check's secret-key check assumes a Next.js-style client/server boundary. SvelteKit / Nuxt / Remix may receive false PASSes on that specific check — manual review recommended for those stacks until framework-specific detection lands.

### 🗂 Notion issue tracking (optional integration)

Notion-backed issue lifecycle. From a Slack-pasted blob of bug reports to grouped, codebase-verified tickets — and back out into shippable fixes.

| Command | What it does |
|---|---|
| `/tracker-setup` | One-time Notion connection — API key, database, property mapping, defaults |
| `/report-issue` | Parse a prompt into issues, auto-group related items, verify against the codebase, create pages |
| `/resolve-issue` | Pick a pending issue, call `/powertasking` to implement, update status with a human-readable outcome note |

**Why it's different** — issue titles are written as user-visible problems, not git commit messages. Cross-functional readers (PMs, support, customers) can scan the tracker without engineering context.

## Installation

```bash
claude plugins marketplace add https://github.com/jameskyeong/mekaknight.git
claude plugins install mekaknight
```

## Requirements

- [Claude Code](https://claude.ai/claude-code) — required for all skills.
- **`/powertasking`, `/security-check`, `/ship-check`** — no external dependencies.
- **`/tracker-setup`, `/report-issue`, `/resolve-issue`** — `curl`, `jq`, and a [Notion Internal Integration](https://www.notion.so/my-integrations) token.

## License

[MIT](LICENSE)
