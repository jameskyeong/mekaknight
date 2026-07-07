# Plan: forge route expansion — add DIAGNOSE + PROTOTYPE

## Goal

Promote two of forge's currently-unsupported routes (bug diagnosis, prototype exploration) to first-class routes alongside DIRECT and PLAN. With the references depth already in place from iterations 1-4, forge has the discipline scaffolding to handle these workflows directly without punting to external skills.

Two other unsupported routes are **explicitly not promoted** in this plan:

- **DAILY**: rejected. DIRECT already covers daily-sized work; the user's "daily development" concern was about depth, which the references resolved, not about needing yet another route.
- **ARCHITECT**: rejected. PRD-level, multi-session work overlaps with the existing tracker (`/strike`, `/tag`) and is too large for a single `/forge` invocation. Out of forge's responsibility scope.

ADR 0006 records the inclusion/rejection decisions.

## Scope (this iteration)

In scope:
- Author `references/diagnosis.md` — bug-first workflow (Reproduce → Minimize → Investigate → Fix → Regression-prevent).
- Author `references/prototyping.md` — throwaway exploration workflow (Clarify constraints → Build variations with relaxed TDD → User review → Discard or Promote-to-Plan).
- Update `forge/SKILL.md`:
  - Add DIAGNOSE and PROTOTYPE rows to the route table.
  - Add Route → DIAGNOSE sub-section.
  - Add Route → PROTOTYPE sub-section.
  - Update the "Unsupported routes" section — remove the bug and prototype entries (now supported); keep the PRD/architect entry.
- Add `docs/adr/0006-forge-route-expansion.md`.
- Update `references/README.md` index — remove "gated" status for diagnosis and prototyping; keep `architecture.md` as still-gated.
- Update `CONTEXT.md` Routing section to add DIAGNOSE and PROTOTYPE entries.

Out of scope:
- DAILY route. ADR 0006 documents why not.
- ARCHITECT route. ADR 0006 documents why not.
- Rewriting iteration 1-4 modules.
- Changes to existing DIRECT or PLAN routes.

## Tasks

### Task 1: ADR 0006
- **Create** `docs/adr/0006-forge-route-expansion.md`
- Sections:
  - Context (references depth from ADR 0005 enables route absorption)
  - Decision (promote DIAGNOSE + PROTOTYPE; reject DAILY + ARCHITECT)
  - Considered options for each candidate (include / reject with reasoning)
  - Consequences (router now branches 4-way; two new reference modules; SKILL.md grows by route sections; CONTEXT.md gains two routing entries)
- **Verification**: ADR follows existing 0001-0005 format

### Task 2: diagnosis.md
- **Create** `skills/forge/references/diagnosis.md`
- Sections:
  - Core principle: the failing test that captures the bug is the goal of Reproduce; everything else follows
  - Reproduce step: write a test that fails because of the bug (not because of setup)
  - Minimize step: trim the reproduction until only the bug-causing surface remains
  - Investigate step: hypothesis-driven code reading; do not start changing code without a hypothesis
  - Fix step: minimum change that makes the reproduction test pass; standard GREEN discipline
  - Regression-prevent step: the reproduction test stays in the suite forever; nothing else changes that masks it
  - Anti-patterns: changing code without a hypothesis, hypothesis-shopping, "fixing" the test instead of the bug, declaring victory without re-running the full suite
  - Edge cases: cannot reproduce locally, bug is intermittent, repro requires production data, bug is in dependencies
  - Relationship to other phases — Build's TDD discipline applies once Reproduce succeeds
- **Verification**: file exists; each step has a sharp exit condition; anti-patterns trace back to real failure modes

### Task 3: prototyping.md
- **Create** `skills/forge/references/prototyping.md`
- Sections:
  - Core principle: prototypes answer a question; they are not delivery
  - Time-box discipline — every prototype has a budget; when it expires, the question is answered (positively or negatively) or it is killed
  - Variation discipline — multiple approaches in parallel, not one approach iterated forever
  - TDD intentionally relaxed — tests get in the way of throw-away exploration; the discipline reasserts when the chosen variation goes into PLAN
  - User review — the prototype's output is for the user to see and decide, not for the agent to declare done
  - Discard vs Promote-to-Plan — most prototypes should Discard; Promote-to-Plan kicks off a fresh PLAN run on the chosen approach
  - Anti-patterns: prototype that becomes production silently, "while I'm here" production-grade code in the prototype, no time-box, single approach treated as exploration, skipping the review step
  - Edge cases: prototype reveals the original question was wrong, user wants to ship the prototype as-is, prototype touches shared files
  - Relationship to PLAN — the Promote path explicitly says "now restart with a fresh PLAN," not "keep going on this branch"
- **Verification**: file exists; the throwaway-vs-production boundary is sharp; Promote path is explicit

### Task 4: forge SKILL.md route expansion
- **Edit** `skills/forge/SKILL.md`:
  - Route table: add DIAGNOSE and PROTOTYPE rows
  - Add "Route: DIAGNOSE" sub-section with pointer to `references/diagnosis.md`
  - Add "Route: PROTOTYPE" sub-section with pointer to `references/prototyping.md`
  - "Unsupported routes" section: remove the bug/diagnosis bullet, remove the UI/prototype bullet; keep the PRD/architect bullet
- **Verification**: route table has 4 rows; SKILL.md still flows; no content duplication from references

### Task 5: references/README.md sync
- **Edit** `skills/forge/references/README.md`:
  - Update phase mapping table to include DIAGNOSE and PROTOTYPE rows
  - Update "Future modules" section — remove diagnosis and prototyping; keep `architecture.md` listed as gated on a decision (and document that ADR 0006 rejected ARCHITECT for now)
- **Verification**: every module file has a row; gated list is current

### Task 6: CONTEXT.md sync
- **Edit** `CONTEXT.md`:
  - Add DIAGNOSE entry under Routing
  - Add PROTOTYPE entry under Routing
- **Verification**: grep "DIAGNOSE" and "PROTOTYPE" in CONTEXT.md returns the new entries; existing entries intact

### Task 7: End-to-end verification and commit
- Read forge SKILL.md top to bottom — orchestration flow still coherent
- Read new diagnosis.md and prototyping.md end to end — depth check
- Verify ADR + plan + README + CONTEXT all consistent
- Commit + push with evidence-based verification sentence

## Verification (overall)

- `ls skills/forge/references/` shows 9 items (7 from before + diagnosis.md + prototyping.md)
- `grep -n "references/" skills/forge/SKILL.md` returns hits including the two new modules
- Route table in SKILL.md contains DIRECT, PLAN, DIAGNOSE, PROTOTYPE (4 rows)
- `ls docs/adr/0006-forge-route-expansion.md` exists
- `grep -n "DIAGNOSE\|PROTOTYPE" CONTEXT.md` returns hits

## Non-goals (be explicit)

- No DAILY route
- No ARCHITECT route
- No changes to DIRECT or PLAN routes
- No rewrites of iteration 1-4 modules
- No promotion of currently-deferred Ship-check slot
