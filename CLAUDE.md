# mekaknight

Developer productivity skills for Claude Code. Built on two pillars:

1. **`/forge`** — signature skill. Self-contained development orchestrator with auto-routing. One command drives the full flow.
2. **Compound engineering** — every session deposits durable artifacts in the repo across five channels: plan files (auto, PLAN route), regression tests (auto, DIAGNOSE route), ADRs / discipline references / CONTEXT.md domain glossary (auto-prompted by the Retrospective phase). The codebase gets *easier to work in* over time. Distinguishes mekaknight from per-invocation discipline libraries like superpowers.

The other skills (issue tracking, inspection) are supplementary utilities you can opt into.

## Signature skill

- **`/forge`** — Self-contained development orchestrator: clarify → route → build-with-tests → review → verify → **retrospective** → finish. 4-way router (DIRECT/PLAN for features, DIAGNOSE for bugs, PROTOTYPE for throwaway exploration). Strict TDD, relentless clarification, no-soft-language verification at every phase boundary. Retrospective proposes ADR / references / CONTEXT.md deposits when the session produced learnings worth keeping. **Tracker-free** — never reads or writes Notion.

## Supplementary skills

### Inspection (alpha)

- **`/lock`** — Inspect a project for service-configuration security holes (Supabase RLS gaps, secret-key client exposure, missing webhook signature verification). Reports PASS/WARN/BLOCK with fix suggestions.
- **`/launch`** — One-line GO / NO-GO deploy verdict. Aggregates inspection findings (currently `/lock`) into a single binary decision.

### Notion issue tracking (optional integration)

- **`/link`** — Configure Notion API key, connect databases, detect templates, set defaults.
- **`/tag`** — Report issues to a Notion database. Parses prompts, verifies against codebase, creates pages with proper template blocks.
- **`/strike`** — Fetch pending issues, brainstorm solutions (invokes `/forge` internally), implement fixes, update status.

## Configuration

Only the Notion tracking skills require configuration. Each project stores its config in `.claude/tracking-issue.json` (gitignored). Run `/link` to create it. `/forge`, `/lock`, `/launch` need no setup.

See `CONTEXT.md` for domain glossary and `docs/adr/` for architectural decisions.

## Requirements

- **`/forge`** — no external dependencies.
- **`/lock`, `/launch`** — no external dependencies.
- **`/link`, `/tag`, `/strike`** (Notion integration only) — `curl`, `jq`, and a [Notion Internal Integration](https://www.notion.so/my-integrations) token.

## Versioning policy

Use strict semver when running `npm version`. **Do not default to minor for every change** — classify by the change's primary intent:

| Change | Bump |
|---|---|
| Bug fix, doc/spec gap fill, shell compat patch, fixing existing inconsistency | **patch** (`x.x.+1`) |
| New skill file, new command, new workflow Phase, genuinely new capability the user can invoke | **minor** (`x.+1.0`) |
| Skill/command rename, breaking signature change | **major** (`+1.0.0`, commit prefix `feat!:`) |

Borderline rule of thumb: if the change *primarily* closes a gap in existing behavior (even if a small new behavior is added as side-effect), use **patch**. If it introduces a meaningfully invocable new capability, use **minor**.
