# Add Retrospective phase to forge for automated compound-engineering deposits

mekaknight v2.0 positions itself on two pillars: the `/forge` orchestrator and **compound engineering** — the principle that every session must deposit durable artifacts in the repo so future sessions start ahead. Five compounding channels are named: plan files, DIAGNOSE regression tests, ADRs, discipline references, and CONTEXT.md domain glossary. Of those five, only the first two are deposited *automatically* as a side effect of running a route. The other three (ADR / references / CONTEXT.md) are infrastructure that exists in the repo but only grows when the user manually decides to update it. In practice that means they do not grow at a rate that matches the rest of the project — the compound-engineering promise is half-delivered. This ADR records the decision to **add a Retrospective phase between Verify and Finish** that systematically proposes deposits to the three under-served channels.

## Considered options

### Option A — Add a single Retrospective phase that checks all three channels (chosen)

**Argument for**: One new phase reaches all three under-served channels at once. Phase boundaries are forge's primary discipline mechanism, so the cost of adding one phase is well-understood. The Retrospective check naturally belongs at session end — after Verify has confirmed success, before Finish commits the work — so learnings are still fresh in context but the implementation is already validated. The per-channel threshold discipline (propose only when warranted, silent exit when no channel qualifies) prevents the "performative documentation" failure mode.

**Argument against**: Adds a phase and a reference module to maintain. Some sessions will have nothing to deposit and the phase will exit silently — that overhead, while small, is non-zero. The phase needs careful anti-pattern discipline or it will encourage performative ADRs and noise updates that degrade rather than compound.

**Mitigation**: Author `references/retrospective.md` with sharp per-channel thresholds and explicit anti-patterns (performative deposit, paraphrasing SKILL.md, ADR-for-bug-fix, batch proposals). Make silent exit the *expected* outcome for routine small changes — only meaningful work triggers deposits.

**Decision**: Promote. The single-phase design hits all three gaps at once, the threshold discipline prevents noise, and the cost (one phase, one reference) is in line with prior phase additions (DIAGNOSE / PROTOTYPE per ADR 0006).

### Option B — Distribute deposit prompts across existing phases (rejected)

**Argument for**: Avoids a new phase. Each existing phase already has natural deposit moments — Clarify could prompt for CONTEXT.md term additions, Peer-review could prompt for reference updates, Finish could prompt for ADRs. This co-locates the prompt with the work that triggered it.

**Argument against**: Spreads the compound-engineering discipline thin across the orchestrator instead of concentrating it. Each phase's exit gate gets noisier. The user is asked deposit questions repeatedly during a session instead of once at the end, increasing cognitive load. Most importantly, the *cross-phase* learnings (e.g., "Verify caught what Peer-review missed — that's a reference update for peer-review.md") can only be seen at session end, not from inside the phase that generated them.

**Decision**: Rejected. Compound engineering is a session-level discipline, not a per-phase one — it belongs at session end.

### Option C — Do nothing; leave deposits manual (rejected)

**Argument for**: The infrastructure exists. Users can update ADRs / references / CONTEXT.md when they want. Adding automation risks performative noise.

**Argument against**: Manual deposit means no deposit in practice. mekaknight v2.0 explicitly markets compound engineering as a pillar; leaving three of the five channels manual is a positioning gap. The threshold discipline in Option A addresses the noise concern directly.

**Decision**: Rejected. The positioning gap is real; the noise risk is mitigable.

### Option D — Auto-deposit without prompting (rejected)

**Argument for**: Maximum compounding. Every session writes something to each channel automatically.

**Argument against**: Catastrophic for signal-to-noise. Auto-generated ADRs and references would flood the repo with low-value content that future sessions have to wade through — the *opposite* of compound engineering. The deposit decision is genuinely a judgment call (does this learning generalize? does future-me need it?) that the agent should not make unilaterally.

**Decision**: Rejected. Compounding requires curation, not bulk.

## Consequences

- **Forge gains a new phase between Verify and Finish.** Phase order becomes: preflight → clarify → route → build → peer-review → ship-check (slot) → verify → **retrospective** → finish. The Per-phase exit gates table in `SKILL.md` gains a Retrospective row.
- **One new reference module: `references/retrospective.md`.** Authored at the same depth as ADR 0005's iteration modules — per-channel thresholds, proposal formats, anti-patterns, edge cases.
- **The references README index gains a Retrospective row** mapped to `retrospective.md`.
- **CONTEXT.md gains a Retrospective entry** under Orchestration (the phase becomes part of mekaknight's domain language).
- **The Compound engineering glossary entry in CONTEXT.md is updated** — ADR / references / CONTEXT.md move from "manual deposit" to "auto-prompted via Retrospective phase". The "process-learning compounding not yet realized" caveat narrows: the basic deposit channels are now automated; deeper process-learning compounding (Clarify-answer reuse, Peer-review meta-pattern extraction, post-session retrospectives across multiple sessions) remains open work.
- **README updates the Phases-at-a-glance code block and the Compound engineering table** to reflect that the previously-manual channels are now auto-prompted.
- **No backward compatibility issue.** Retrospective runs after Verify exits green; existing flows are not blocked by it. Sessions that produce no deposits exit the phase with a one-line note and proceed to Finish.
- **Frontmatter description grows by one line** to mention the Retrospective phase. The Use-when triggers are unchanged.
- **Strike-caller integration is unaffected.** Retrospective runs whether forge was invoked standalone or by `/strike`. The Notion status update strike performs after Finish is independent of any deposits made during Retrospective.

## Status

Active. v2.0.0-alpha.5 ships the Retrospective phase and the reference module. The three deferred process-learning compounding gaps (DIRECT-route Clarify persistence, Peer-review meta-pattern extraction, cross-session retrospective accumulation) are explicitly out of scope for v2.0 — revisitable post-launch based on whether the Retrospective phase produces enough deposits to make those gaps visible.
