# Plan: forge depth references — iteration 2 (Clarify + Peer-review)

## Goal

Continue the references/ deepening from iteration 1 by covering the next two phases that `forge` actually owns: **Clarify** and **Peer-review**. After this iteration, four of forge's six executable phases (Clarify, Build, Peer-review, Verify) have dedicated depth references; Preflight and Finish remain with their existing in-`SKILL.md` rules.

## Priority adjustment from iteration 1

Plan v1 named the iteration 2 candidates as `grilling.md` and `diagnosis.md`. On second look, `diagnosis` is a poor fit for this iteration because forge does not have a Diagnose phase — it lists bug/diagnosis as an **unsupported route** and points users elsewhere. Writing a `diagnosis.md` reference when no orchestrator phase consumes it would create a discipline document with no caller, which is the opposite of what the references pattern is for.

Replacing `diagnosis.md` with `peer-review.md` keeps iteration 2 anchored to phases forge actually runs. `diagnosis.md` is not abandoned — it returns later, paired with the larger question of whether forge should add a `DIAGNOSE` route (separate decision, separate plan).

## Scope (this iteration)

In scope:
- Author `references/grilling.md` — Clarify phase discipline (question patterns, ambiguity checklist depth, anti-patterns, edge cases for skip conditions and CONTEXT.md conflicts).
- Author `references/peer-review.md` — Peer-review phase discipline (independent review meaning, two-axis depth, severity definitions and triage, subagent prompt patterns, anti-patterns like performative agreement and fabricated findings).
- Update `forge/SKILL.md` to add pointer lines at the Clarify and Peer-review phases (same pattern as iteration 1).

Out of scope:
- `diagnosis.md`, `prototyping.md`, `architecture.md`, `planning.md`, `subagent-patterns.md`, `finishing.md` — future iterations.
- Adding a `DIAGNOSE` route to forge — separate decision.
- DAILY route — separate decision (still on hold from iteration 1).
- Changing forge's phase structure or exit gates.

## Tasks

### Task 1: grilling.md
- **Create** `skills/forge/references/grilling.md`
- **Sections**:
  - Core principle: ambiguity is a load-bearing signal, not friction
  - Question discipline (one question at a time; recommended answer with reasoning; codebase reads instead of asks)
  - The 5-category ambiguity checklist, deepened with concrete per-category patterns and probing questions
  - CONTEXT.md interaction (domain glossary as authority; how to challenge user language that conflicts)
  - Anti-patterns: shotgun questioning, vibes-based clarify ("looks clear enough"), answering own questions, asking what the codebase already answers
  - Edge cases: user says "skip clarify" prematurely; no CONTEXT.md exists; user pushes back on every question
  - The exit gate sentence form ("Ambiguity checklist: 0 items; user confirmed at <timestamp>: <quote>")
- **Verification**: file exists; every banned question pattern has a replacement; every edge case has a recommended response

### Task 2: peer-review.md
- **Create** `skills/forge/references/peer-review.md`
- **Sections**:
  - Why independence matters (author bias is recency bias; the diff is the artifact, not the process)
  - Two-axis review depth — Standards (CLAUDE.md / CONTEXT.md / observed conventions) vs Spec (clarify output / plan file content)
  - Severity definitions sharpened — what makes a finding Critical vs Important vs Minor, with examples
  - Triage rules and when to push back on a finding ("I believe this is wrong because <reason>")
  - Subagent prompt patterns — what the prompt must contain so the review is auditable
  - Anti-patterns: performative agreement, fabricated findings, suggestion-without-reasoning, conflating Standards with Spec, severity inflation
  - Edge cases: review returns no findings (is that a real "no issues" or a lazy pass?); review returns mass findings; user defers an Important finding
  - The exit gate sentence form ("Every Critical and Important finding: <list with action taken>")
- **Verification**: file exists; severity definitions are concrete (each level has examples); the subagent prompt template is reproducible

### Task 3: Wire forge SKILL.md
- **Edit** `skills/forge/SKILL.md`:
  - Clarify phase: add `> **For the deeper discipline — see `references/grilling.md`.**`
  - Peer-review phase: add `> **For the deeper discipline — see `references/peer-review.md`.**`
- **Do not** duplicate references content into SKILL.md
- **Verification**: `grep references/grilling.md skills/forge/SKILL.md` and the same for peer-review return at least one hit each

### Task 4: End-to-end review and commit
- **Read** forge SKILL.md top to bottom — does it still flow as an orchestrator?
- **Read** both new references end to end — depth check
- **Cross-check** pointer targets exist
- **Commit + push** with evidence-based verification sentence
- **Verification**: explicit "I observed: forge reads coherently; both references exist; pointer lines verified by grep" before commit

## Verification (overall)

- `ls skills/forge/references/` shows four files (`tdd-discipline.md`, `verification.md`, `grilling.md`, `peer-review.md`)
- `grep -n "references/" skills/forge/SKILL.md` returns four pointer hits
- forge SKILL.md line count grows by ~6 (four pointer lines + spacing) — no content duplication
- ADR 0005's "first iteration" framing remains accurate; this iteration is documented in this plan file (no new ADR needed unless the approach changes)

## Non-goals (be explicit)

- No new ADR — the deepening approach is unchanged; ADR 0005 covers it
- No `DAILY` route, no `DIAGNOSE` route in this iteration
- No content rewrites in iteration 1 modules (tdd-discipline, verification stay as they are)
