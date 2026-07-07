# Plan: forge depth references — iteration 1 (TDD + verification)

## Goal

Close the depth gap between `forge` and `workflow-external` without reintroducing external skill dependencies. Build a modular `skills/forge/references/` system that the forge orchestrator consults at the right phases, starting with the two highest-traffic discipline areas: **TDD** and **verification-before-completion**.

This iteration is **scoped to two modules**. Subsequent iterations will add `grilling`, `diagnosis`, `prototyping`, `architecture`, `planning`, `subagent-patterns`, `peer-review`, and `finishing`.

## Why this approach

ADR 0001 chose self-containment over depth because dependencies were unacceptable. That tradeoff still stands — but the depth gap is real, and the user's feedback is that forge should serve daily development too, not only production gating. The path forward is to absorb depth **inside** the plugin: the references directory becomes forge's own discipline library, owned and evolved by mekaknight.

Tradeoff: ownership cost (we maintain the patterns ourselves, no upstream osmosis) in exchange for one-install independence + consistent UX + ability to evolve in lockstep with forge's phases.

## Scope (this iteration)

In scope:
- Create `skills/forge/references/` directory.
- Author `references/tdd-discipline.md` — comprehensive RED → GREEN → REFACTOR discipline, anti-patterns, edge cases (e.g. test-after, mock-overuse, premature refactor, refactor-on-red).
- Author `references/verification.md` — evidence-before-assertion discipline, expanded forbidden language, observation patterns, disguised-verification anti-patterns, per-phase verification command catalog.
- Update `forge/SKILL.md` to reference both modules at the Build phase and the cross-cutting verification gate respectively.
- Author `docs/adr/0005-forge-depth-references.md` to record the deepening decision.

Out of scope (future iterations):
- Other 8 reference modules (grilling, diagnosis, prototyping, architecture, planning, subagent-patterns, peer-review, finishing).
- Adding a `DAILY` route — separate decision, will revisit after these two modules land.
- Changing forge's phase structure itself (only adding reference pointers).

## Tasks

### Task 1: Create references directory + tdd-discipline.md
- **Create** `skills/forge/references/tdd-discipline.md`
- **Sections**:
  - Core loop (RED → GREEN → REFACTOR) with explicit per-step exit conditions
  - The minimum-test rule (smallest failing test that drives the next behavior)
  - GREEN minimum-code rule (least code to pass — no scope creep)
  - REFACTOR scope rule (structure-only, no behavior change, tests stay green)
  - Anti-patterns: test-after-code, mock-overuse, refactor-on-red, scope creep at GREEN, skipping REFACTOR, asserting on implementation details
  - Edge cases: existing legacy code, time-pressured fixes, UI/visual changes, integration boundaries
  - Decision tree: when TDD does not apply (prototypes, exploratory spikes, throwaway code)
- **Verification**: file exists; document is concrete (every rule has an example or anti-example); cross-references forge phases by name

### Task 2: verification.md
- **Create** `skills/forge/references/verification.md`
- **Sections**:
  - Core principle: evidence precedes assertion
  - Expanded forbidden-language list (beyond current SKILL.md)
  - Observation patterns (read the actual output, not a summary; never trust subagent claims of success without raw output)
  - Disguised verification anti-patterns (logging the command but not the result; running tests in a different env than the one being claimed; partial output reads)
  - Per-phase verification command catalog (Clarify, Build, Peer-review, Verify, Finish)
  - When tests cannot be run (UI, infra, external services): substitute evidence requirements
  - The "I observed X" sentence format and why it is non-negotiable
- **Verification**: file exists; every gate from forge's existing exit-gate table is covered; every forbidden phrase has a concrete replacement

### Task 3: Wire forge SKILL.md to references
- **Edit** `skills/forge/SKILL.md`:
  - Build phase: add a `**See `references/tdd-discipline.md` for the full discipline.**` pointer line
  - Cross-cutting verification gate section: add a `**See `references/verification.md` for the full discipline.**` pointer line
- **Do not** duplicate the references content into SKILL.md — SKILL.md remains the orchestrator
- **Verification**: forge SKILL.md still reads end-to-end without the references, but references add depth when consulted

### Task 4: ADR 0005 — depth references decision
- **Create** `docs/adr/0005-forge-depth-references.md`
- **Sections**:
  - Context (depth gap acknowledged in ADR 0001; user feedback that forge should serve daily dev)
  - Decision (modular references inside the plugin, no external skill deps)
  - Considered options (rejected: hybrid optional external; rejected: inline everything in SKILL.md; chosen: references/ subfolder)
  - Consequences (ownership cost; opportunity for forge-specific tuning; first two modules ship with this iteration)
- **Verification**: ADR follows existing 0001-0004 format

### Task 5: End-to-end review
- **Read** forge SKILL.md from top to bottom — does the orchestrator still flow cleanly?
- **Read** each new references file end to end — depth check: would a fresh agent following this produce work meaningfully closer to the external skills' quality?
- **Cross-check** that pointer lines in SKILL.md point to files that exist
- **Verification**: explicit "I observed: forge reads coherently end to end; both references exist at correct paths; pointer lines verified by file existence" statement before commit

### Task 6: Commit + push
- Single commit covering all changes
- Message style: `feat: deepen forge with TDD + verification references`
- No AI attribution (per user's global CLAUDE.md)

## Verification (overall)

- `ls skills/forge/references/` shows `tdd-discipline.md` and `verification.md`
- `grep -n "references/tdd-discipline.md\|references/verification.md" skills/forge/SKILL.md` returns at least one hit per file
- `ls docs/adr/0005-forge-depth-references.md` exists
- forge SKILL.md is not bloated (no content duplication from references)

## Non-goals (be explicit)

- Not implementing a `DAILY` route in this iteration
- Not rewriting forge's phase structure
- Not catching up on all 11 external skills — only 2 highest-priority modules
- Not promising depth parity with grill-me, tdd, verification-before-completion after this iteration alone — this is iteration 1 of an ongoing investment
