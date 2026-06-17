# Peer-review Discipline — Independent Diff Review

Reference for powertasking's **Peer-review** phase. The Peer-review section of `SKILL.md` defines the surface mechanics (spawn an agent with a two-axis prompt, triage findings by severity, fix Critical/Important or explicitly defer). This document is the deeper discipline — why independence matters, how to make severity calls that are not arbitrary, what makes a review prompt actually produce useful findings, and the anti-patterns that turn the review into theater.

The non-negotiable: **the reviewer sees the diff, not the journey.** Everything Peer-review produces is grounded in what the code now is, not in how it came to be that way. Author recency bias is the thing this phase exists to defeat.

---

## Why independence matters

The author of code has spent the last hour (or day, or week) inside the change. They know which lines were hard, which were obvious, which were almost wrong before they fixed them. That knowledge — useful while writing — is a *liability* during review. It makes the author skim over places the code is in fact still wrong, because their memory fills in the version that was almost there.

A fresh reviewer reads only the artifact. They have no version-in-their-head to fill in gaps. If the code does not communicate the intent without the author's memory, the reviewer surfaces it as a finding. That is the value: not new information, but the *absence* of the author's memory.

This is also why peer-review uses a separate subagent in powertasking rather than asking the same agent to self-review. The same agent, re-reading its own work, has the version-in-memory problem at full strength. A subagent dispatched with only the diff and the spec has no such version; it reviews what is actually there.

---

## The two axes

Every review covers two axes simultaneously. Conflating them produces fuzzy findings; separating them produces sharp ones.

### Axis 1 — Standards compliance

Standards are the project's "how we do things here." Sources, in priority order:

1. **`CLAUDE.md`** (project root) — explicit behavioral instructions for the model. These take precedence.
2. **`CONTEXT.md`** — domain glossary, decisions, naming conventions.
3. **Existing conventions observed in the surrounding files** — the unwritten rules. Naming, error handling, file organization, test layout.

Standards findings answer: *Does the new code match how this codebase has decided to do things?* A function named `handle_auth` when every other handler in the project is named `handleAuth` is a Standards finding, even if it works correctly.

### Axis 2 — Spec compliance

The Spec is the Clarify output or plan file content — what the user asked for and agreed to. Spec findings answer: *Does the implementation fulfill every requirement, and does it stay within scope?*

- **Missing.** A requirement from Clarify that the diff does not implement.
- **Drifted.** A requirement implemented in a way that does not match the agreed shape.
- **Added.** Behavior the diff implements that Clarify did not request (scope creep).

Standards and Spec are evaluated independently. Code can be standards-compliant and spec-deficient (looks like the codebase, does not do what was asked) or spec-compliant and standards-violating (does the right thing the wrong way). Both kinds of findings count.

---

## Severity definitions, sharpened

Severity is the single most-abused field in code review. "Critical" gets applied to everything; "Minor" gets applied to anything the reviewer is unsure about. The discipline:

### Critical

A finding is Critical if **shipping the code as-is would cause incorrect behavior, security exposure, or data loss.** Concretely:

- The code does not do what Spec asked.
- The code does what Spec asked but breaks an existing contract that other callers depend on.
- The code introduces a vulnerability (injection, missing auth check, secret exposure, missing CSRF, missing input validation at a trust boundary).
- The code can corrupt or lose data (mutation without backup, transaction missing, race condition on shared state).
- The code introduces a regression in a test that was previously green.

If a Critical finding is real, Build re-runs (RED → GREEN → REFACTOR for the fix), then Peer-review re-runs. Critical is the only severity that triggers a re-loop.

### Important

A finding is Important if **shipping the code as-is would make the codebase materially harder to evolve or read,** but does not break correctness. Concretely:

- Standards violation: naming, file organization, error handling pattern.
- Missing test coverage for a Spec requirement (the requirement is implemented, but if the implementation drifts later, no test will catch it).
- Test that asserts on implementation details rather than behavior — fragile to refactor.
- Duplication of an existing pattern (the project has a helper for X, the diff reinvented X).
- Documentation gap that the next reader will pay for (the change is non-obvious and no comment / doc explains why).

Important findings are fixed unless the user explicitly defers. Deferral is allowed but should be cheap: "I'm aware, will address in a follow-up issue" — captured, not lost.

### Minor

A finding is Minor if **the user might want to know, but the codebase is fine without the fix.** Concretely:

- Stylistic preference where the project's convention is unclear or neutral.
- Optimization opportunity that is unlikely to be load-bearing.
- A "while we're here" suggestion that is unrelated to the change but would be nice.

Minor findings are reported, not blocked. They do not cause re-loops, they do not require deferral notes, they exist for the user's awareness.

---

## When to push back on a finding

The agent who is implementing powertasking may receive a finding that is technically wrong — the reviewer is missing context, misreading the diff, or pattern-matching to a Standards rule that does not apply. The discipline:

- Push back with reasoning. State the specific reason the finding is wrong: "The reviewer flagged X as a regression, but the test the reviewer cited is exercising the old contract that ADR 0007 explicitly retired. The new contract is correct."
- Do not silently ignore. If a finding is reviewed and rejected, that rejection is captured: "Critical at src/auth.ts:42 — rejected because <reason>."
- Do not agree performatively. "Good point" followed by no change is the worst possible response — it tells the user the agent processed the finding when it did not.

Pushing back on a real Critical finding because you have a feeling is reckless; pushing back on a misapplied Standards finding because you can articulate why is correct. The discipline is to require articulation either way.

---

## The subagent prompt — what it must contain

The peer-review subagent receives a prompt with at minimum:

1. **Role and constraint.** "You are an independent code reviewer. You have NOT seen the implementation process — only the diff and the spec."
2. **The Standards axis content.** Relevant excerpts from CLAUDE.md / CONTEXT.md, and a one-paragraph summary of observed conventions from the surrounding files.
3. **The Spec axis content.** Either the Clarify output (for DIRECT route) or the plan file content (for PLAN route).
4. **The diff.** `git diff <baseline-sha>..HEAD` or equivalent. The baseline is the Docs Checkpoint commit from Route, or the branch root for DIRECT.
5. **The output format.** Each finding must include Severity, File:line, Issue, Suggestion.
6. **The "no false findings" instruction.** "If no issues found, state 'No issues found' — do not invent findings."

That last instruction matters more than it sounds. A subagent dispatched without it tends to produce findings on every review, because "review with no findings" feels like a failed task. Explicitly permitting an empty review is what makes the reviews credible when they do contain findings.

### Variants by route

- **DIRECT route**: the Spec content is shorter (just Clarify output). The diff is smaller. The review tends to surface fewer findings but should still be run — a clean review is a green light, not a skipped phase.
- **PLAN route**: the Spec content is the plan file. The diff spans multiple commits if PLAN.3 produced per-task commits. The review reads each task's commit individually if the plan file structures it that way.

---

## Anti-patterns

### Performative agreement

Receiving a finding and saying "good catch, I'll address it" — and then not addressing it, or addressing it superficially without re-running tests. The fix tracks back to nothing; the next reviewer (or the same reviewer in a follow-up pass) finds the same issue still present.

The fix: every accepted finding produces a specific action — a commit, a deferral note, or a rejection-with-reasoning. The action is recorded next to the finding so the trail is auditable.

### Fabricated findings

A review that produces findings because "a good review has findings." The findings are plausible-sounding but, on inspection, point at code that is correct or at conventions the project does not actually enforce. These pollute the triage step and erode trust in future reviews.

The fix: the "if no issues found, state 'No issues found'" instruction in the subagent prompt. Plus, when triaging, the implementing agent should be willing to mark a finding as **rejected — not a real issue**, with a one-sentence reason.

### Suggestion without reasoning

A finding that says "this should be different" without explaining why. The implementing agent cannot evaluate whether to accept it, because the criterion is hidden. These findings tend to be either Standards-by-vibe or Spec-by-misreading.

The fix: every finding includes both the issue and the suggestion, *and* the rationale should be derivable from the Standards or Spec content the reviewer was given. If a finding does not trace back to either axis, it is Minor at most, and probably should not be a finding at all.

### Conflating Standards with Spec

A finding that says "this does not match the spec" but actually points at a naming convention violation. Or vice versa: "this is named wrong" but the real issue is that it does not do what Clarify asked. Mislabeled axes confuse triage and make the deeper issue harder to fix.

The fix: the output format requires the reviewer to attribute each finding to one axis. The implementing agent reads the attribution; if it does not make sense, push back and ask for clarification.

### Severity inflation

Calling every finding Critical because Important "sounds weaker." Or calling every finding Minor because Critical "sounds harsh." Both erode the triage signal.

The fix: the sharpened severity definitions above. When in doubt, the reviewer should default down a level (Important rather than Critical, Minor rather than Important) — inflation is the more common direction of error.

### Self-review by the implementing agent

The implementing agent reading its own diff and calling it Peer-review. The author bias problem in full force. The findings will all be either too narrow ("I added a comment that could be more precise") or too broad ("this whole change should be different"), with little in the middle that an independent reviewer would surface.

The fix: powertasking dispatches an actual subagent for this phase. The implementing agent is allowed to triage the findings, but is not allowed to *be* the reviewer.

---

## Edge cases

### Review returns "No issues found"

This is allowed and should not be treated as a failure. Sometimes the change is small, the spec is precise, and the implementation matches. A clean review is a green light.

But — the implementing agent should sanity-check: is this *really* a clean review, or did the subagent prompt fail to give the reviewer enough context to find issues? Signals that the review is lazy rather than clean:

- The diff is large but the review is empty.
- The diff touches files with strong existing conventions, and the reviewer did not even comment on conformance.
- The spec has many requirements and the reviewer did not enumerate which were verified.

When in doubt, re-dispatch with a sharper prompt: "Specifically verify that each of these requirements is implemented: [list]."

### Review returns mass findings (10+)

If a review surfaces 10+ findings on a normal-sized diff, something is wrong upstream — usually Clarify was vague or Build skipped steps. The discipline:

- Triage by severity first. Often the bulk is Minor or false-positive, and the real Important findings are 1-2.
- If the real findings cluster around a single root cause (e.g., "the implementation does not match the spec at all"), the fix is to re-Clarify or re-Build, not to address each finding individually.
- If the findings are genuinely distributed across many small issues, fix the Critical and Important, defer the Minor, and note the volume as a process signal — Clarify was probably too shallow.

### User defers an Important finding

The user is allowed to defer an Important finding. The discipline:

- The deferral is captured in the commit message or in a follow-up issue, not lost.
- The deferral note states *what* was deferred and *why* — "deferring the missing test for the success path; will add in PR #N."
- Critical findings cannot be deferred. If the user wants to ship a Critical finding unaddressed, that is a project-level decision (the user, not Peer-review, owns ship/no-ship) — but powertasking's role is to surface the cost clearly, not to silently agree.

### The reviewer makes a Critical mistake (e.g., calls correct code broken)

Push back with specific reasoning, as above. The push-back is captured. If the user reads the diff and agrees with the reviewer rather than the implementer, the implementer fixes; if the user agrees with the implementer, the rejection stands.

---

## The exit gate sentence

The Peer-review exit gate is also evidence-based:

> **Findings:** `<N>`. Critical: `<list with action taken>`. Important: `<list with action taken or deferral note>`. Minor: `<list, noted only>`. **All Critical and Important findings resolved or explicitly user-deferred.**

A clean review is also acceptable:

> **Findings: 0.** Subagent reviewed `<diff baseline>..HEAD` against `<spec source>`. Output: "No issues found."

If the implementing agent cannot state this sentence with a specific list of findings and actions, Peer-review has not exited.

---

## Relationship to powertasking's other phases

- **Clarify** produces the Spec axis content. A vague Clarify produces a weak Spec axis, which makes Peer-review's spec-compliance review weaker. Peer-review can flag this — "the spec is too vague to verify" is itself a finding — but the deep fix is upstream.
- **Build** produces the diff Peer-review reads. A Build that skipped REFACTOR will produce a diff with structural issues the reviewer will flag; a Build that scope-crept at GREEN will produce a diff with implementation outside the spec. Both are Build-level discipline failures surfacing here.
- **Verify** does not depend on Peer-review's findings directly, but Critical findings that triggered a re-loop should have their tests captured — so Verify's full suite includes them.
- **Finish** is downstream. The branch decision (merge / PR / keep / discard) does not happen until Peer-review's exit gate is met. If findings remain unaddressed, Finish does not run.
