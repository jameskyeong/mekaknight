# mekaknight

Claude Code plugin that provides production-readiness skills for AI-built apps. Skills are invoked as `/mekaknight:<skill-name>` in Claude Code sessions.

## Language

### Orchestration

**Forge**:
The development orchestrator skill (`/mekaknight:forge`). Takes raw requirements through a disciplined pipeline — clarify → route → build → review → verify → finish — to produce production-grade code. The router branches 4-way: **DIRECT** / **PLAN** for feature work, **DIAGNOSE** for bugs, **PROTOTYPE** for throwaway exploration. Named after the act of forging at the anvil: each phase hammers the code into shape, one strike at a time.
_Avoid_: workflow (ambiguous — see Flagged Ambiguities), temper (v1 name, retired)

**Production-readiness gate**:
The architectural concept spanning the entire mekaknight v2.0 pipeline: **forge** builds the code, **launch-check** inspects it across dimensions (planned), **launch** issues the final verdict. Not a single skill — the emergent property of all three working in sequence.
_Avoid_: workflow, pipeline (too generic)

**Cross-cutting verify gate**:
A discipline enforced at every phase boundary within **forge**: no phase may declare completion without running verification commands and directly observing the output. "Should work" and "seems to pass" are treated as "not verified."
_Avoid_: check, validation (too vague)

**Discipline references**:
The modular library at `skills/forge/references/`. Each module deepens one forge phase (or one cross-cutting concern) — principles, anti-patterns, edge cases — so forge's depth does not depend on external skills. `SKILL.md` is the orchestrator; each phase carries a pointer to its reference. See [ADR 0005](docs/adr/0005-forge-depth-references.md) for the rationale.
_Avoid_: helpers, support files (too vague — these are load-bearing discipline)

### Routing

**DIRECT**:
A **forge** routing decision for small, contained changes (1-4 commits, tightly-grouped files). Skips plan file creation and proceeds straight to build.
_Avoid_: simple, small (subjective)

**PLAN**:
A **forge** routing decision for medium-scope features (5-15 commits, 2-4 files with shared state). Produces a plan file in `docs/plans/` before sequential task execution.
_Avoid_: roadmap, spec (different things)

**DIAGNOSE**:
A **forge** routing decision for bug-first work. Five steps: Reproduce (write a test that fails because of the bug) → Minimize (trim until the test exercises only the bug-causing surface) → Investigate (hypothesis-driven code reading) → Fix (standard GREEN discipline) → Regression-prevent (the minimized test stays in the suite permanently). The minimized reproduction test is the regression net. See [ADR 0006](docs/adr/0006-forge-route-expansion.md).
_Avoid_: debug, troubleshoot (too vague — DIAGNOSE is the route name with a specific phase order)

**PROTOTYPE**:
A **forge** routing decision for throwaway exploration ("which design fits", "try a few approaches"). TDD is intentionally relaxed; two or three meaningfully different variations are built within a time-box; the user reviews and chooses Discard (default), Promote-to-Plan (kicks off a fresh PLAN run on the chosen variation), or Re-Clarify (the question was wrong). Prototype code does not graduate to production — Promote means restart with full discipline. See [ADR 0006](docs/adr/0006-forge-route-expansion.md).
_Avoid_: spike (too informal — PROTOTYPE has explicit phase order and exit gate), POC (overloaded term)

### Inspection

**Lock**:
Alpha utility (`/mekaknight:lock`) for service-configuration security inspection — Supabase RLS gaps, secret-key client exposure, missing Stripe webhook signatures. v0.1 ships in v2.0 but is **off the marketing surface** (see ADR 0004): the author does not rely on it daily, and three live company codebases returned zero BLOCK findings during dogfooding. Reachable for users who want it; future direction (wrap, deep, or sunset) is deferred to v2.1+. Named for the lockdown step before a mech sortie.
_Avoid_: harden (v1 name, retired), production-readiness gate (lock is not the gate in v2.0; see ADR 0004).

### Launch ecosystem

**Launch**:
Alpha utility (`/mekaknight:launch`) that issues a GO / NO-GO verdict by aggregating lock's findings. v0.1 ships in v2.0 but is **off the marketing surface** for the same reason as lock (see ADR 0004). The output reads "LAUNCH READY?". Future direction tied to whether post-launch users ask for it.
_Avoid_: ship-ready (v1 name, retired), production-readiness gate (deferred from v2.0 surface).

### Issue tracking

**Link**:
The tracker uplink skill (`/mekaknight:link`). One-time Notion connection — API key, database, property mapping, defaults.
_Avoid_: setup-issue (v1 name, retired)

**Tag**:
The issue flagging skill (`/mekaknight:tag`). Parses a prompt into Notion issues, auto-groups related items, verifies against the codebase, creates pages with proper template blocks.
_Avoid_: report-issue (v1 name, retired)

**Strike**:
The issue resolution skill (`/mekaknight:strike`). Fetches pending issues, brainstorms solutions via **forge**, implements fixes, updates Notion status.
_Avoid_: resolve-issue (v1 name, retired)

### Legacy

**workflow-external**:
The preserved v1.x orchestrator (`skills/workflow-external/SKILL.md`) that depended on superpowers and Matt Pocock skills. Kept as reference; not actively maintained.
_Avoid_: old workflow, legacy workflow

## Flagged ambiguities

**"workflow"**: Previously used for both the orchestrator skill name AND the general concept of mekaknight's pipeline. Resolved: the skill is now **forge**; the concept is **production-readiness gate**. The word "workflow" should only appear when referring to the preserved **workflow-external**.

## Example dialogue

> **Dev**: "I want to add lock to the forge pipeline."
> **Domain expert**: "You mean adding it to the launch-check slot inside forge? Launch-check is where all inspection skills plug in. Forge itself just orchestrates the build flow — it doesn't inspect."
> **Dev**: "Right. So when forge reaches the launch-check phase, it invokes launch-check, which then calls lock?"
> **Domain expert**: "Eventually, yes — but launch-check doesn't exist yet. For now lock runs standalone, and launch reads lock's output directly to issue GO or NO-GO."
