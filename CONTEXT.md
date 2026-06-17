# mekaknight

Claude Code plugin that provides production-readiness skills for AI-built apps. Skills are invoked as `/mekaknight:<skill-name>` in Claude Code sessions.

## Language

### Orchestration

**Powertasking**:
The development orchestrator skill (`/mekaknight:powertasking`). Takes raw requirements through a disciplined pipeline — clarify → route → build → review → verify → finish — to produce production-grade code. The router branches 4-way: **DIRECT** / **PLAN** for feature work, **DIAGNOSE** for bugs, **PROTOTYPE** for throwaway exploration. Each phase hardens the work one pass at a time — no phase boundary is crossed on soft language.
_Avoid_: workflow (ambiguous — see Flagged Ambiguities), temper (v1 name, retired), forge (v2.0 name, retired)

**Production-readiness gate**:
The architectural concept spanning the mekaknight v2.0 pipeline: **powertasking** builds the code, an **inspection layer** (currently `mekaknight:security-check` alone) checks service-configuration security, **ship-check** issues the final verdict. Not a single skill — the emergent property of these working in sequence. v2.0 ships the inspection layer as security-only; multi-axis inspection (design / quality / performance / dependencies) is post-v2.0 work, deliberately not promised — see [ADR 0010](docs/adr/0010-launch-v0.1-security-only.md).
_Avoid_: workflow, pipeline (too generic), launch-check (a never-shipped umbrella name — the actual layer is "the inspection skills launch invokes")

**Cross-cutting verify gate**:
A discipline enforced at every phase boundary within **powertasking**: no phase may declare completion without running verification commands and directly observing the output. "Should work" and "seems to pass" are treated as "not verified."
_Avoid_: check, validation (too vague)

**Discipline references**:
The modular library at `skills/powertasking/references/`. Each module deepens one powertasking phase (or one cross-cutting concern) — principles, anti-patterns, edge cases — so powertasking's depth does not depend on external skills. `SKILL.md` is the orchestrator; each phase carries a pointer to its reference. See [ADR 0005](docs/adr/0005-forge-depth-references.md) for the rationale.
_Avoid_: helpers, support files (too vague — these are load-bearing discipline)

**Retrospective**:
The powertasking phase that runs between **Verify** and **Finish** to deposit this session's learnings into the repo's compound-engineering channels. Checks three channels in order — ADR (`docs/adr/`), discipline references (`skills/powertasking/references/`), CONTEXT.md domain glossary — and proposes a deposit only when the channel's threshold is met. Silent exit is the expected outcome for routine small changes; the phase is successful when it correctly identifies that no deposit is needed. See [ADR 0007](docs/adr/0007-retrospective-phase.md) and [`references/retrospective.md`](skills/powertasking/references/retrospective.md).
_Avoid_: documentation phase (Retrospective is for compounding artifacts, not user-facing docs), post-mortem (post-mortems are for failures; Retrospective runs on green Verify), wrap-up (too vague — Retrospective has explicit per-channel thresholds).

**Eval discipline**:
The automated regression net at `eval/` that catches drift between skill *declarations* (cross-cutting gates, inline-gloss rule, banned-language list) and skill *content*. v1 is static — check modules in `eval/checks/` apply to fixture files in `eval/fixtures/` plus the repo's skill markdown. Wired as `prepublishOnly`, so `npm publish` refuses on a failing build. v2 will add headless `claude -p` session evals against the same check library; deferred per [ADR 0009](docs/adr/0009-eval-discipline-v1.md). The fixtures are split into **positive** (ideal powertasking output, must pass declared checks) and **negative** (intentionally-bad samples that *must* trigger a named check) — the latter are unit tests for the checks themselves.
_Avoid_: tests (overlaps with code tests; eval discipline is for skill prose), linting (lint suggests style; eval enforces declared rules), QA (too vague), CI (an enforcement mechanism, not the discipline itself).

### Positioning

**Compound engineering**:
The architectural principle — the second of mekaknight's two pillars alongside the **powertasking** orchestrator — that each session must deposit durable artifacts in the repo so future sessions start ahead. The five compounding channels and how they fill: **plan files** in `docs/plans/` (auto, PLAN route), **DIAGNOSE regression tests** in the test suite (auto, DIAGNOSE route), **ADRs** in `docs/adr/` (auto-prompted by Retrospective phase, Channel 1), **discipline references** in `skills/powertasking/references/` (auto-prompted by Retrospective, Channel 2), **CONTEXT.md** domain glossary (auto-prompted by Retrospective, Channel 3).

The term is **not mekaknight's coinage** — EveryInc's [compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) is the dominant claim-holder in the Claude Code ecosystem (37 skills, "Official Compound Engineering plugin"). mekaknight ships an architectural variant: same principle (cross-session artifact deposit so the codebase gets easier to work in), bundled into a single self-contained orchestrator rather than a multi-skill suite the user composes. EveryInc's channels (STRATEGY.md, brainstorms, pulse-reports, code-review patterns, implementation plans) overlap in spirit with ours but are organized differently. See [ADR 0008](docs/adr/0008-compound-engineering-positioning.md) for the positioning decision.

Deeper process-learning compounding (DIRECT-route Clarify-answer reuse, Peer-review meta-pattern extraction, cross-session retrospective accumulation) is **open work** — out of scope for v2.0 per ADR 0007's status note.
_Avoid_: continuous integration (overloaded term), AI feedback loop (too vague — compound engineering specifically means artifact deposit into the repo), context engineering (different — that's about runtime prompt assembly, not durable repo artifacts), claiming the term as mekaknight's coinage (it isn't — attribute EveryInc as the wider home).

### Routing

**DIRECT**:
A **powertasking** routing decision for small, contained changes (1-4 commits, tightly-grouped files). Skips plan file creation and proceeds straight to build.
_Avoid_: simple, small (subjective)

**PLAN**:
A **powertasking** routing decision for medium-scope features (5-15 commits, 2-4 files with shared state). Produces a plan file in `docs/plans/` before sequential task execution.
_Avoid_: roadmap, spec (different things)

**DIAGNOSE**:
A **powertasking** routing decision for bug-first work. Five steps: Reproduce (write a test that fails because of the bug) → Minimize (trim until the test exercises only the bug-causing surface) → Investigate (hypothesis-driven code reading) → Fix (standard GREEN discipline) → Regression-prevent (the minimized test stays in the suite permanently). The minimized reproduction test is the regression net. See [ADR 0006](docs/adr/0006-forge-route-expansion.md).
_Avoid_: debug, troubleshoot (too vague — DIAGNOSE is the route name with a specific phase order)

**PROTOTYPE**:
A **powertasking** routing decision for throwaway exploration ("which design fits", "try a few approaches"). TDD is intentionally relaxed; two or three meaningfully different variations are built within a time-box; the user reviews and chooses Discard (default), Promote-to-Plan (kicks off a fresh PLAN run on the chosen variation), or Re-Clarify (the question was wrong). Prototype code does not graduate to production — Promote means restart with full discipline. See [ADR 0006](docs/adr/0006-forge-route-expansion.md).
_Avoid_: spike (too informal — PROTOTYPE has explicit phase order and exit gate), POC (overloaded term)

### Inspection

**Security-check**:
Alpha utility (`/mekaknight:security-check`) for service-configuration security inspection — Supabase RLS gaps, secret-key client exposure, missing Stripe webhook signatures. v0.1 ships in v2.0 but is **off the marketing surface** (see ADR 0004): the author does not rely on it daily, and three live company codebases returned zero BLOCK findings during dogfooding. Reachable for users who want it; future direction (wrap, deep, or sunset) is deferred to v2.1+. Named for the lockdown step before a mech sortie.
_Avoid_: harden (v1 name, retired), lock (v2.0 name, retired), production-readiness gate (security-check is not the gate in v2.0; see ADR 0004).

### Ship-check ecosystem

**Ship-check**:
Alpha utility (`/mekaknight:ship-check`) that issues a **security** GO / NO-GO verdict from `security-check`'s findings. v0.1 is deliberately security-only — there is no design / quality / performance axis, and multi-axis aggregation is not promised (see [ADR 0010](docs/adr/0010-launch-v0.1-security-only.md)). Ships in v2.0 but is **off the marketing surface** for the same reason as security-check (see ADR 0004). The output reads "LAUNCH READY?". Future direction tied to whether post-launch users ask for it.
_Avoid_: ship-ready (v1 name, retired), launch (v2.0 name, retired), production-readiness gate (deferred from v2.0 surface), multi-axis aggregator (overclaims v0.1 — that framing was retired in ADR 0010).

### Issue tracking

**Tracker-setup**:
The tracker uplink skill (`/mekaknight:tracker-setup`). One-time Notion connection — API key, database, property mapping, defaults.
_Avoid_: setup-issue (v1 name, retired), link (v2.0 name, retired)

**Report-issue**:
The issue flagging skill (`/mekaknight:report-issue`). Parses a prompt into Notion issues, auto-groups related items, verifies against the codebase, creates pages with proper template blocks.
_Avoid_: tag (v2.0 name, retired)

**Resolve-issue**:
The issue resolution skill (`/mekaknight:resolve-issue`). Fetches pending issues, brainstorms solutions via **powertasking**, implements fixes, updates Notion status.
_Avoid_: strike (v2.0 name, retired)

### Legacy

**workflow-external**:
The preserved v1.x orchestrator (`skills/workflow-external/SKILL.md`) that depended on superpowers and Matt Pocock skills. Kept as reference; not actively maintained.
_Avoid_: old workflow, legacy workflow

## Flagged ambiguities

**"workflow"**: Previously used for both the orchestrator skill name AND the general concept of mekaknight's pipeline. Resolved: the skill is now **powertasking**; the concept is **production-readiness gate**. The word "workflow" should only appear when referring to the preserved **workflow-external**.

## Example dialogue

> **Dev**: "I want to wire security-check into the powertasking pipeline."
> **Domain expert**: "Powertasking has a Ship-check slot that activates when inspection skills are available — that's the wiring point. But for v2.0 the slot stays inert: powertasking skips it with a note, and `security-check` runs standalone."
> **Dev**: "So how does ship-check fit in?"
> **Domain expert**: "Ship-check is a separate skill the user invokes when they want a deploy verdict. It calls `security-check`, reads the findings, and issues a security GO / NO-GO. It is not a multi-axis aggregator — that framing was retired in [ADR 0010](docs/adr/0010-launch-v0.1-security-only.md). v0.1 is security-only by design, and post-v0.1 expansion is gated on real user demand, not pre-announced."
