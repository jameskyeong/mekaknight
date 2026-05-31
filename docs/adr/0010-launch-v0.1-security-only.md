# Narrow launch v0.1 to security-only; retire the multi-axis aggregator framing

`mekaknight:launch` v0.1 ships with a single source of findings (`mekaknight:lock`, security) but its SKILL.md and surrounding docs were positioning it as a "multi-axis aggregator" — explicitly promising that `polish` (design) and `dedupe` (quality) "plug into the same aggregation" once they ship. Neither `polish` nor `dedupe` exists in the repo. The `polish`/`dedupe` slots have been "planned" since launch was added; v2.0 will ship without either. Continuing to publish forward-looking aggregator claims while the slots stay empty is a beta-blocking honesty gap: a user who reads launch's description forms an expectation the package cannot meet. This ADR records the decision to **narrow launch v0.1 to a security-only verdict, retire the multi-axis-aggregator framing entirely, and defer the question of multi-axis to post-v0.1 user demand**.

## Considered options

### Option A — Narrow v0.1 to security-only; retire the multi-axis framing in SKILL.md, README, and CONTEXT.md (chosen)

**Argument for**: Matches what launch actually does today. Removes the forward-looking promise that has been unbacked for the entire alpha cycle. A user reading the SKILL.md, README, or CONTEXT.md after this ADR forms an accurate expectation: "launch runs lock and gives a binary verdict on the security findings." No design/quality/performance claim, no plug-in promise, no "v0.2 will fix this." If `polish` or `dedupe` ever ships, the question of whether to extend launch becomes a fresh decision — not a debt to be paid. The narrowing also clarifies launch's value proposition in one sentence (the entire value is the binary decision on top of lock), which makes the supplementary status honest in the same move.

**Argument against**: The "ecosystem will fill in over time" framing made launch feel like a strategic position rather than a thin utility. Stripping it removes the marketing surface that hinted at where mekaknight was headed. Some users might read the narrowed launch as evidence the project is shrinking ambitions rather than holding scope honestly.

**Mitigation**: Pair the narrowing with an explicit ADR statement that post-v0.1 expansion is *not* foreclosed — it is *not pre-announced*. Forge's own Ship-check slot in `skills/forge/SKILL.md` still exists and still notes which inspection-skill names would plug in if they were authored; that slot is the right place to preserve the architectural option without overclaiming it on the launch surface.

**Decision**: Promote. Honest scope is itself a feature — and the user explicitly flagged this overclaiming as alpha-quality during the beta-readiness review.

### Option B — Ship `polish` v0.1 and `dedupe` v0.1 before narrowing, so launch's multi-axis claim is backed (rejected)

**Argument for**: Avoids the narrowing. The aggregator framing becomes truthful as soon as multi-axis inspection exists. v2.0 then ships with launch as the "production-readiness aggregator" the docs always described.

**Argument against**: Shipping two new alpha skills (`polish`, `dedupe`) just to back launch's pre-existing claim is the wrong direction for a beta push. Per the beta-readiness review, beta is reached by *convergence* on what already exists, not by *expansion* into new alpha surfaces. Each new skill adds its own alpha rough edges, its own dogfooding gap, its own eval-discipline burden. Two new alphas to legitimize one overclaim is a net move *away* from beta.

**Decision**: Rejected. The framing was the problem; building skills to fit the framing inverts the right cause-and-effect.

### Option C — Leave the SKILL.md as-is, treat the multi-axis framing as "aspirational" (rejected)

**Argument for**: Cheapest. The wording is already in `forge`'s Ship-check slot too — keep the surfaces consistent.

**Argument against**: Aspirational framing is the failure mode the user named when raising the alpha-vs-beta question. "What you say it does" must match "what it does" — that is the honesty layer the eval discipline (ADR 0009) was added to enforce. Leaving aspirational language in user-facing copy contradicts the discipline this repo just adopted.

**Decision**: Rejected.

## Consequences

- `skills/launch/SKILL.md` — description, `v0.1 scope` paragraph, Step 1 (was listing polish/dedupe as TODO), Step 2 (was distinguishing "Security BLOCK" from "Design/Quality advisory"), Rules (was "launch is an aggregator") all rewritten to reflect security-only scope. New rule added: "Do not market launch as a multi-axis aggregator." Linkback to this ADR included.
- `README.md` — launch row updated to "v0.1 security GO / NO-GO deploy verdict from lock's findings" with an explicit "security-only by design — multi-axis aggregation is not promised" note pointing here.
- `CONTEXT.md` — `Production-readiness gate` entry updated to drop the "launch-check inspects across dimensions (planned)" framing; replaced with "an inspection layer (currently `mekaknight:lock` alone)" and explicit "post-v2.0 work, deliberately not promised" note. `Launch` glossary entry updated to call out the security-only scope. `_Avoid_` lists for both entries extended to forbid the retired terms (`launch-check`, `multi-axis aggregator`). The Example dialogue rewritten to teach the current honest architecture.
- `skills/forge/SKILL.md` — **left as-is**. The Ship-check slot in forge documents the *option* for forge to invoke inspection skills when they exist; it does not make user-facing claims about which skills ship. Out of scope for this ADR. Revisitable separately if the multi-axis framing migrates from launch's surface into forge's.
- Post-v0.1 expansion of launch (design / quality / performance) is now an open question, not a backlog item. Re-opening it requires (a) one of those inspection skills actually existing in the repo, and (b) user demand observed in dogfooding feedback. Neither condition is met today.

This change should be considered alongside [ADR 0004](0004-narrow-v2-to-forge-and-tracker.md) (which moved lock/launch off the v2.0 marketing surface) and [ADR 0009](0009-eval-discipline-v1.md) (which added the enforcement layer that surfaces overclaim drift). Together they form the alpha→beta honesty axis: don't overclaim, don't oversurface, and check both via the eval discipline.
