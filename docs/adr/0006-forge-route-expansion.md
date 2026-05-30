# Expand forge supported routes to include DIAGNOSE and PROTOTYPE

ADR 0005 built the references/ scaffolding so forge's discipline depth no longer depends on external skills. With four iterations of references in place — covering Clarify, Route PLAN, Build, Peer-review, Verify (cross-cutting), Finish, and subagent dispatch — forge is now deep enough to absorb workflows that previously had to be punted to other skills. This ADR records which currently-unsupported routes get promoted and which do not. We decided to **promote DIAGNOSE (bug-first work) and PROTOTYPE (throwaway exploration)** to first-class routes alongside DIRECT and PLAN, and to **leave DAILY and ARCHITECT unpromoted**. Each decision has a different reason; recording them together keeps the route-expansion logic auditable in one place.

## Considered Options

### Candidate 1 — DAILY route (rejected)

**Argument for**: The user explicitly stated forge should serve daily development, not only production gating. A lighter route that skips Peer-review or full Verify could lower the friction for one-line fixes and small changes.

**Argument against**: The user's "daily" concern was about depth, not about routes — and the references work resolved depth. DIRECT already handles small contained changes (1-4 commits, no plan file, no docs checkpoint); adding DAILY would mean *also* skipping Peer-review or Verify, which removes discipline exactly where small-change author bias is highest. The wrong direction.

**Decision**: Rejected. DIRECT covers daily-sized work; the references covered the daily-depth concern.

### Candidate 2 — DIAGNOSE route (chosen)

**Argument for**: Bug-first work is a regular part of development. Currently forge punts to `mattpocock-skills:diagnose`, which is exactly the external-dependency pattern ADR 0001 retired. Bug work follows a specific discipline (Reproduce → Minimize → Investigate → Fix → Regression-prevent) that fits naturally into a phase-based orchestration. Adding it to forge brings bug work under the same self-contained roof as feature work.

**Argument against**: Adds router complexity; requires authoring `diagnosis.md` with real depth (the reference module that backs the route).

**Decision**: Promote. The argument for is strong (self-containment, common workflow), the argument against is manageable (one new route, one new module).

### Candidate 3 — PROTOTYPE route (chosen)

**Argument for**: UI exploration and design variation work is common; currently forge punts to `mattpocock-skills:prototype`. Same self-containment argument as DIAGNOSE. Prototype work has a distinct discipline (time-box, multiple variations, intentionally relaxed TDD, user review) that justifies its own route rather than forcing it through DIRECT or PLAN.

**Argument against**: Prototypes intentionally relax TDD, which is the strictest part of forge's discipline. There is a real risk that "I'm just prototyping" becomes an escape hatch from rigor.

**Mitigation**: The `prototyping.md` reference module makes the throwaway-vs-production boundary sharp. Promote-to-Plan explicitly says "restart with a fresh PLAN," not "keep going on this branch." The discipline reasserts the moment the prototype's chosen variation goes into PLAN.

**Decision**: Promote with the mitigation built into the reference module.

### Candidate 4 — ARCHITECT / PRD route (rejected)

**Argument for**: Multi-session feature work that needs a PRD before any code is written is a legitimate workflow forge could in principle handle.

**Argument against**: PRD-level work overlaps with the existing tracker (`/strike`, `/tag`). A single `/forge` invocation is the wrong unit of work for a multi-week feature; PRDs decompose into multiple plan files across multiple sessions. ARCHITECT would expand forge's responsibility scope dramatically — from "one development cycle" to "multi-session feature shepherding" — and would compete with the tracker rather than complement it.

**Decision**: Rejected. PRD-level work stays out of forge's responsibility; users write a PRD in `docs/prd/` and break it into multiple `/forge` sessions. The "Unsupported routes" section retains its PRD entry as guidance.

## Consequences

- **Router branches 4-way.** The Route table in `SKILL.md` grows from 2 rows (DIRECT, PLAN) to 4 (DIRECT, PLAN, DIAGNOSE, PROTOTYPE). Each route has its own sub-section in `SKILL.md` and its own reference module.
- **Two new reference modules.** `references/diagnosis.md` and `references/prototyping.md` are authored at the same depth as the iteration 1-4 modules. The "Future modules" list in `references/README.md` shrinks accordingly.
- **CONTEXT.md gains routing entries.** DIAGNOSE and PROTOTYPE are now part of mekaknight's domain language and are named there alongside DIRECT and PLAN.
- **The "Unsupported routes" section in SKILL.md shrinks.** The bug/diagnosis bullet and the UI/prototype bullet are removed (they are now supported). The PRD/architect bullet stays as guidance.
- **forge's responsibility scope is now phase-aligned with most common dev workflows.** Features (DIRECT, PLAN), bugs (DIAGNOSE), and design exploration (PROTOTYPE) all have first-class support. Only PRD-level multi-session work explicitly defers elsewhere.
- **The TDD-relaxation in PROTOTYPE is a deliberate, scoped exception.** It applies only when the user explicitly entered PROTOTYPE; it does not bleed back into DIRECT/PLAN/DIAGNOSE.
- **The Promote-to-Plan path closes the prototype loop.** A chosen prototype variation does not silently graduate to production code; it restarts as a fresh PLAN run with full discipline.

## Status

Active. Iteration 5 ships the route additions and the two reference modules. ADR 0001's "self-contained" identity is now extended to four workflow types (feature DIRECT, feature PLAN, bug DIAGNOSE, design PROTOTYPE) — only PRD-scale work explicitly stays outside.
