# Add eval discipline v1 to mekaknight (static checks + golden fixtures, no headless session eval)

mekaknight has been at `2.0.0-alpha.*` for multiple releases, and the most recent quality regression (forge producing identifier-soup output that the user had to manually surface) revealed a structural gap: there is no automated way to detect when a skill's actual content drifts from its declared discipline. Every alpha→beta transition has been faith-based. This ADR records the decision to **add an eval discipline at `eval/` that runs static checks on skill prose plus golden-fixture verification** as the v1 — deliberately deferring real `claude -p` headless session evals to v2.

## Considered options

### Option A — Ship a static check + golden fixture suite now; defer headless session eval to v2 (chosen)

**Argument for**: The highest-value-lowest-cost drift is **internal inconsistency** — SKILL.md files contradicting their own declared rules, supplementary skills missing inherited cross-cutting gates, version desync between `package.json` and `marketplace.json`, broken cross-reference links. All of that is detectable from the repo content alone, deterministically, in milliseconds, at zero API cost. Wiring it as `prepublishOnly` makes the discipline a publish-time gate, not optional hygiene. Golden fixtures (hand-written ideal forge outputs) plus negative fixtures (intentionally-bad samples that *must* trigger specific checks) double as unit tests for the checks themselves. The check modules take a plain content string, which means the same library extends naturally to v2 — only the *input source* changes (fixture file vs. headless session output).

**Argument against**: A static check on the skill *files* is not the same as a check on what `/forge` *produces in a real session*. There is a class of failure (non-deterministic model behavior under varied prompts) that v1 cannot catch. Calling this a "regression net" overstates what it actually nets — it nets file-level drift, not session-level quality.

**Mitigation**: Be honest about the scope in `eval/README.md` and the SKILL.md retrospective phase — v1 catches drift, v2 catches behavior. Encode the same check functions to take plain strings so v2 can reuse them against headless output without re-authoring the rule logic.

**Decision**: Promote. v1 hits real drift at zero cost and unblocks the path to beta by making the discipline visible and enforced. v2 (headless session eval) can be added incrementally on the same check library when API cost and runtime non-determinism are explicitly budgeted for.

### Option B — Build full headless `claude -p` session eval as v1 (rejected)

**Argument for**: Only real session evals prove that `/forge` produces the right behavior under real prompts. Anything less is a proxy. Going straight to the real signal avoids the trap of v1 quality drift inside the eval itself.

**Argument against**: Each fixture is a paid Claude API call — running the suite on every commit becomes expensive fast. Outputs are non-deterministic, so checks must be structural (regex/shape) rather than exact-match, which is harder to author. Multi-minute runtime breaks the "run before publish" loop. Most damaging: the failure mode of "model output flickers between fail and pass across runs" creates flaky-test fatigue, which erodes the discipline itself. Without the static check foundation already in place to anchor the rules, v2 has no shared check library to reuse — every session eval becomes a one-off script.

**Decision**: Rejected for v1. Promoted to v2, contingent on a budgeted API cost line and a flake-tolerance policy. Build v1 first to seed the check library, then layer v2 on top.

### Option C — Document the discipline but do not enforce it programmatically (rejected)

**Argument for**: Writing a `STYLE.md` or extending `references/communication-style.md` is cheaper than building infrastructure. If contributors read and apply the rules, that should be enough.

**Argument against**: The very incident that triggered this ADR — `/forge` producing identifier soup *despite* the rules existing in `references/` already — is direct evidence that documentation-only discipline does not hold. Rules without enforcement decay. The compound-engineering pillar's whole premise is that durable artifacts beat tribal knowledge; an unenforced rule is tribal knowledge with a markdown URL.

**Decision**: Rejected. The compound-engineering thesis requires that rules be reified into checks, not just sentences.

## Consequences

- `eval/` is created as a top-level directory in the repo, with `checks/`, `fixtures/`, `run.mjs`, and `README.md`.
- `package.json` gains `scripts.eval` (developer-facing) and `scripts.prepublishOnly` (publish gate). `npm publish` now refuses to publish a failing build.
- Every cross-cutting discipline added in the future (next to verification + communication-style) should land with at least one check module + one negative fixture so the rule is *enforced from day one*, not just documented.
- Forge's Retrospective phase gains a new implicit channel: "did this session reveal a rule that should become a new eval check?" Not formalized in `SKILL.md` yet — revisitable if the pattern repeats.
- v2 (headless session eval) remains open work. Tracked in `docs/plans/jameskyeong/v2-launch-todo.md`. Not on the beta-blocking critical path; beta promotion is gated on v1 enforcement + outside dogfooding, per the alpha→beta path discussed during ADR drafting.
