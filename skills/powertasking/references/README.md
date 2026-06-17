# Powertasking — Discipline References

This folder is powertasking's **discipline library**. `SKILL.md` is the orchestrator (which phase comes next, what the exit gate is). Each module here goes deeper on the discipline of a specific phase — the principles, the patterns, the anti-patterns, the edge cases — so that powertasking's depth no longer depends on external skills.

Reading the phase's module at phase entry is **mandatory** — `SKILL.md`'s reference-loading gate enforces it. These modules hold the anti-pattern tripwires the orchestrator deliberately omits, and a tripwire that is not in context cannot interrupt anything.

See [ADR 0005](../../../docs/adr/0005-forge-depth-references.md) for the rationale.

## Phase mapping

| Powertasking phase | Reference module | One-line summary |
|---|---|---|
| Preflight | _(inline in SKILL.md)_ | Mechanical environment check; no separate discipline |
| **Clarify** | [`grilling.md`](grilling.md) | Ambiguity as load-bearing signal; one-question discipline; 5-category checklist deepened |
| **Route → PLAN** | [`planning.md`](planning.md) | Plan file as contract; task sizing; dependencies; out-of-scope as scope guard |
| **Route → DIAGNOSE** | [`diagnosis.md`](diagnosis.md) | Bug-first workflow: Reproduce → Minimize → Investigate → Fix → Regression-prevent |
| **Route → PROTOTYPE** | [`prototyping.md`](prototyping.md) | Throwaway exploration; TDD intentionally relaxed; Discard vs Promote-to-Plan |
| **Build** | [`tdd-discipline.md`](tdd-discipline.md) | RED/GREEN/REFACTOR exit conditions; anti-patterns; legacy / incidents / UI / integration edges |
| **Peer-review** | [`peer-review.md`](peer-review.md) | Independence vs author bias; two-axis review; sharpened severity definitions |
| Ship-check | _(slot, deferred)_ | Activates when production-readiness skills are wired in |
| **Verify** (cross-cutting) | [`verification.md`](verification.md) | Evidence before assertion; expanded forbidden language; per-phase evidence catalog |
| **Retrospective** | [`retrospective.md`](retrospective.md) | Compound-engineering deposit at session end — three channels (ADR / references / CONTEXT.md), per-channel thresholds, performative-deposit anti-patterns |
| **Finish** | [`finishing.md`](finishing.md) | The four branch options sharpened; commit discipline; git-safety anti-patterns |
| _Cross-cutting_ | [`subagent-patterns.md`](subagent-patterns.md) | When and how to dispatch subagents without abdicating responsibility |
| _Cross-cutting_ | [`communication-style.md`](communication-style.md) | Inline-gloss discipline for user-facing summaries — what to gloss, length budget, per-phase patterns, anti-patterns |

## Reading order

If you are new to powertasking, read in this order:

1. **`SKILL.md`** (in the parent directory) — get the overall orchestration shape.
2. **[`verification.md`](verification.md)** — the cross-cutting gate that every other phase consults.
3. **[`grilling.md`](grilling.md)**, then **[`tdd-discipline.md`](tdd-discipline.md)** — the two phases daily development hits most often.
4. **[`peer-review.md`](peer-review.md)** — the independence discipline; pairs with `subagent-patterns.md`.
5. **[`planning.md`](planning.md)**, then **[`finishing.md`](finishing.md)** — the phases that bracket a longer change.
6. **[`subagent-patterns.md`](subagent-patterns.md)** — the cross-cutting dispatch discipline.
7. **[`communication-style.md`](communication-style.md)** — the cross-cutting user-facing inline-gloss discipline.

If you are auditing a completed `/powertasking` run, the relevant module is the one for whichever phase you are auditing — each module ends with a section explaining how that phase relates to the others.

## What makes a reference module a reference module

- **One phase, one document.** Cross-cutting modules (verification, subagent-patterns) are clearly marked as such.
- **Principles, not procedures.** `SKILL.md` has the procedure; the references explain why each step exists.
- **Anti-patterns are first-class.** Every module names the failure modes the discipline exists to prevent.
- **Edge cases have recommended responses.** Not "do what feels right" — specific guidance for the awkward shape.
- **Evidence-based exit sentences.** Each phase's exit gate is stated as a single sentence the orchestrator must produce.

## Future modules

Tracked in `docs/plans/forge-depth-references-vN.md`. Currently open:

- `architecture.md` — gated on a decision to promote PRD-scale architecture work to a supported route. ADR 0006 rejected ARCHITECT for v2.0 because PRD-level work overlaps with the existing tracker (`/resolve-issue`, `/report-issue`) and exceeds powertasking's single-session responsibility scope. Revisitable if post-launch usage signals demand.

These modules will not be added until powertasking has a phase that consumes them. A module with no caller is documentation orphan; the references folder exists to back powertasking's orchestration, not to host orphaned discipline.
