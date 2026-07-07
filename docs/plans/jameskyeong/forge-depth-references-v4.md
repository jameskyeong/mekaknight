# Plan: forge depth references — iteration 4 (subagent patterns + index + CONTEXT sync)

## Goal

Close out the references work that does not require route-structure decisions. Three pieces:

1. Add `subagent-patterns.md` — a cross-cutting module covering when and how forge dispatches subagents (peer-review, parallel research, scoped sub-tasks). Currently distributed thinly across `SKILL.md` and `peer-review.md`; consolidating gives the orchestrator one place to point.
2. Add `skills/forge/references/README.md` — an index listing the seven modules with one-line summaries and phase mapping. Makes the references folder navigable without opening every file.
3. Update `CONTEXT.md` — add domain language for the references pattern (what `references/` is, why it exists) so future contributors and agents understand the structure.

Everything in this iteration is additive and does not touch forge's phase structure, route options, or exit gates. The remaining open decisions (DAILY route, DIAGNOSE route, prototyping/architecture promotion) are deferred and surfaced to the user after this iteration ships.

## Scope (this iteration)

In scope:
- Author `references/subagent-patterns.md`
- Author `references/README.md` (index)
- Add one cross-cutting pointer line to `forge/SKILL.md` for subagent patterns (separate from peer-review's pointer; this one covers the general dispatch discipline)
- Update `CONTEXT.md` to add language for the references pattern

Out of scope:
- DAILY route, DIAGNOSE route, prototyping/architecture promotion — these all require user decisions and are deferred to a separate conversation after this iteration ships
- New ADR — approach unchanged from ADR 0005
- Rewrites to existing modules

## Tasks

### Task 1: subagent-patterns.md
- **Create** `skills/forge/references/subagent-patterns.md`
- **Sections**:
  - Why dispatch a subagent at all (context-budget hygiene, independence, parallelizable independent work)
  - When to dispatch vs do it inline (decision tree)
  - Prompt construction — role, context, inputs, output format, evidence requirements
  - Evidence requirements — every subagent return must carry the raw output the orchestrator can audit
  - Parallel dispatch patterns — when several agents can run independently and how to fan in
  - Anti-patterns: dispatching to avoid responsibility, trusting subagent claims of success without raw output, dispatching parallel agents on shared state, dispatching for work that is faster inline
  - Edge cases: subagent times out or partially completes, returns no findings (real vs lazy), surfaces a question that needs the user
  - Relationship to `peer-review.md` (peer-review is one specific subagent-dispatch case)
- **Verification**: file exists; prompt template is reproducible; every anti-pattern has a recovery move

### Task 2: references/README.md (index)
- **Create** `skills/forge/references/README.md`
- **Sections**:
  - One-paragraph explanation: what `references/` is, why it exists (pointer back to ADR 0005)
  - Phase mapping table — each forge phase + the reference module that deepens it
  - One-line summary per module
  - Reading order suggestion for someone new to forge
- **Verification**: every existing module is listed; phase mapping matches what `SKILL.md` actually points to

### Task 3: CONTEXT.md sync
- **Edit** `CONTEXT.md` to add:
  - A short entry under `Language` → `Orchestration` (or a new sub-section) defining "references" / "discipline references" as the modular library inside `skills/forge/`
  - Cross-link to ADR 0005
- **Verification**: grep for "references" in CONTEXT.md returns the new entries; existing language entries stay intact

### Task 4: SKILL.md cross-cutting pointer
- **Edit** `skills/forge/SKILL.md`:
  - Near the top of the file (after the opening paragraph, before the cross-cutting verification gate) add a pointer to `references/README.md` so readers know the references folder exists and can navigate it
  - Or alternatively, add it once at the cross-cutting section
- Add the subagent-patterns pointer at the Peer-review section's subagent dispatch area, or as a second cross-cutting reference
- **Verification**: `grep -n "references/README.md\|references/subagent-patterns.md" skills/forge/SKILL.md` returns hits for both

### Task 5: End-to-end verification and commit
- Read forge SKILL.md top to bottom
- Read new files (subagent-patterns.md, references/README.md) end to end
- Verify CONTEXT.md update reads naturally
- Commit + push with evidence-based verification sentence

## Verification (overall)

- `ls skills/forge/references/` shows seven items (six discipline files + README.md)
- `grep -n "references/" skills/forge/SKILL.md` returns more pointer hits than before (six existing + one or two new)
- `grep -n "references" CONTEXT.md` returns the new entries
- No new ADR
- No changes to phase structure, routes, exit gates

## Non-goals (be explicit)

- No DAILY route in this iteration
- No DIAGNOSE route in this iteration
- No prototyping/architecture promotion
- No new ADR
- No rewrites of iteration 1-3 modules
