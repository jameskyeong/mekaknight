# PROTOTYPE Discipline — Throwaway Exploration

Reference for forge's **PROTOTYPE route**. The Route → PROTOTYPE section of `SKILL.md` enforces the phase order (Clarify constraints → Build variations → User review → Discard or Promote-to-Plan). This document is the deeper discipline — why prototypes are throwaway by default, the time-box and variation rules that prevent prototype-into-production drift, and what to do when the prototype reveals the original question was wrong.

The non-negotiable: **a prototype answers a question; it is not delivery.** The output is not the deliverable; the *answer* is. The prototype code itself is throwaway by default; the chosen direction goes into a fresh PLAN run with full discipline.

---

## Why PROTOTYPE is a route, not just "use DIRECT"

The DIRECT and PLAN routes carry forge's full discipline: TDD, Peer-review, Verify, Finish branch decision. That discipline is appropriate when the goal is delivery. For exploration — "how should this look", "try a few approaches", "I'm not sure which design fits" — the discipline becomes friction. You cannot write a failing test for "looks better than the alternative." TDD does not apply to a question whose answer is "let me see them side by side."

A dedicated route makes the discipline relaxation explicit and scoped. It says: for this work, TDD is relaxed, multiple variations are expected, output is throwaway by default. The user knows the rules are different; the agent does not silently drop discipline that would otherwise apply.

The scoping is important. The relaxation lives in PROTOTYPE and only PROTOTYPE. The discipline reasserts the moment a variation graduates to PLAN.

---

## Core principles

### Prototypes answer questions

Before any code, the question the prototype is answering must be stateable in one sentence. "How should the onboarding flow be structured?" is a question. "Build the onboarding" is not — that is delivery.

If the question cannot be stated, PROTOTYPE has not started. Clarify is where the question gets sharpened; PROTOTYPE assumes the question is sharp before the first variation is built.

### The output is the answer, not the code

When PROTOTYPE finishes, the user has an *answer* to the question — "the dropdown approach is the right one," "neither of these works, the real question is different," "approach B is closest but needs X changed." The code that produced the answer is the means; the answer is the end.

This framing prevents the most common prototype failure: the user looks at the output, says "great, ship it," and the prototype code lands in main without ever being subjected to the discipline that production code requires.

### Throwaway by default

Every prototype starts with the assumption that the code is discarded after the answer is known. Promote-to-Plan is the exception, not the default — and even Promote starts a *fresh PLAN run*, not "keep building on the prototype branch."

---

## Time-box discipline

Every prototype has a budget. When the budget expires, the question is either answered (then the route exits) or it is killed (then the route exits with "the question is unanswered with this much effort; either re-Clarify the question or accept the unknown").

Typical budgets:
- **Small prototype** (single approach, low stakes): 30 minutes - 2 hours.
- **Medium prototype** (2-3 variations to compare): 2-4 hours.
- **Large prototype** (architectural exploration): half day to a day.

If a prototype is running past its budget, the discipline is to stop. Either:
- The question turned out to be larger than expected — surface this to the user, propose a re-Clarify or a budget extension.
- The prototype's chosen approach is fighting the codebase or the constraints — that itself is the answer (the approach does not fit), and the route can exit with that finding.

A prototype with no time-box becomes work that never ends, often producing code that drifts toward production-grade without ever being subjected to PLAN's discipline. The budget is what prevents the drift.

---

## Variation discipline

A prototype that builds one approach and iterates on it is not exploration — it is delivery without tests. Exploration means multiple variations evaluated against each other.

The discipline:
- **Two or three variations minimum.** A single variation cannot answer "which approach fits"; the answer requires comparison.
- **Variations are meaningfully different.** Two variations that differ only in styling are not exploration; they are micro-iteration. Variations should differ in structure, approach, or trade-off — the things the user actually needs to choose between.
- **Each variation is small enough to build within the time-box.** If a single variation takes the whole budget, the variations are too detailed; back off to higher-level sketches.
- **Variations are presented side by side.** The user reviews them as a group; the choice is comparative.

---

## TDD intentionally relaxed

Prototype code does not require tests. Specifically:

- No RED step. The "test" of a prototype is "the user looks at it."
- No GREEN scope discipline. Prototype code can use literals, hardcoded values, copy-pasted patterns — whatever is fastest to get the variation visible.
- No REFACTOR. The code is throwaway; refactoring it is wasted effort.
- No Peer-review subagent dispatch. The user is the reviewer.
- No Verify suite expansion. The full test suite still runs (existing tests should still pass after a prototype touches files), but no new tests are added for prototype-only code.

This is the deliberate scoping mentioned above. The TDD reference module (`tdd-discipline.md`) names "throwaway spike" as a situation where TDD does not apply; PROTOTYPE is forge's first-class home for that situation.

**Where TDD reasserts**: when a variation is Promoted to PLAN, the PLAN run starts from scratch — fresh Clarify (with the prototype's findings as input), fresh PLAN file, fresh RED tests. The prototype code does not graduate; the answer it produced graduates.

---

## User review — the explicit step

Prototypes do not Finish without an explicit user review step. The agent does not declare "the prototype is good" — that is the user's call. The discipline:

- Present the variations to the user. For UI prototypes, run them and screenshot; for code prototypes, link to the branch / files / scratch outputs; for data prototypes, show the resulting tables / outputs.
- State the trade-offs the agent observed in each variation. "A is faster but more complex; B is simpler but has the X limitation."
- Let the user decide: Discard all, Promote variation N, or Re-Clarify (the question turned out to be wrong).

The agent's role is to surface; the user's role is to choose.

---

## Discard vs Promote-to-Plan

### Discard (the default)

After review, the answer the prototype produced enters the user's mental model; the prototype code is deleted. The branch is discarded (per `references/finishing.md`'s Discard option).

The discipline before Discard:
- Capture what the prototype taught you. The answer goes in `CONTEXT.md`, an issue comment, a doc, or wherever future work would benefit from knowing it. The point of the prototype is the *answer*; the answer must survive the code's deletion.
- Confirm with the user.

### Promote-to-Plan

The chosen variation is the right direction; build it for production. The discipline:

- **Do not keep building on the prototype branch.** The prototype's code does not graduate.
- **Start a fresh PLAN run.** Use the prototype's chosen approach as input to Clarify; let PLAN produce its plan file the normal way; execute with full TDD, Peer-review, Verify.
- **The prototype branch is discarded after Promote completes.** Its work has been absorbed into the PLAN; the branch itself has no further purpose.

Promote is an explicit handoff. The boundary between exploration and delivery is at the handoff, not somewhere in the middle of a single branch.

---

## Anti-patterns

### Prototype becomes production silently

The user says "ship it" while looking at the prototype output; the agent commits the prototype code to main; production now contains code that has not been subjected to TDD, Peer-review, or Verify.

The fix: Promote-to-Plan is the explicit-graduation path; "looks good, ship" is not. If the user wants to ship, the right move is Promote and let PLAN produce production-quality code on the chosen approach. The prototype's "ship it" is shorthand for "this direction is correct" — translate it into a Promote.

### "While I'm here" production-grade work in the prototype

The agent is prototyping a UI flow but decides to refactor the underlying state machine "since I'm in the file." The refactor is production-shaped work hidden inside a prototype branch — it bypasses Peer-review and Verify.

The fix: prototype work is scoped to answering the prototype's question. Adjacent production work — even when "right there" — happens in a separate PLAN run.

### No time-box

The prototype has been running for a week. There is no defined "done." The code grows; the user has not reviewed yet because "it's not ready." The prototype is now an open-ended project without the discipline that open-ended projects need.

The fix: every prototype has a budget stated up front. If the budget needs to extend, the extension is a deliberate decision, not drift.

### Single approach treated as exploration

The agent builds one design, iterates on it, polishes it, presents it as a prototype. The user has not been given a choice; the "exploration" was implementation.

The fix: prototypes carry multiple variations. If only one variation makes sense, the work is probably DIRECT or PLAN, not PROTOTYPE.

### Skipping the review step

The agent finishes the variations and commits / merges / promotes without surfacing them to the user. The user's role as decider has been bypassed.

The fix: PROTOTYPE always ends with a user-review step. The agent does not exit the route without the user's explicit choice (Discard / Promote / Re-Clarify).

### Promote without restart

The user picks variation B; the agent extends variation B on the prototype branch, adds tests, opens a PR. The "Promote" was a name change without a discipline change — the production code is still riding on the prototype's relaxed-TDD foundation.

The fix: Promote means *restart with a fresh PLAN*. The prototype's directory may be referenced as input ("approach B looked like this"), but the PLAN run authors fresh code with fresh tests.

---

## Edge cases

### The prototype reveals the question was wrong

You set out to answer "how should the onboarding flow be structured" and discover, mid-prototype, that onboarding flow is the wrong place to make the change — the user's real problem is in account setup. The prototype has answered a different question than the one stated.

The fix:
- Stop the current variations.
- Surface the discovery to the user. "Prototyping the onboarding flow surfaced that the real question is X. Continue with onboarding variations, or re-Clarify around X?"
- Let the user redirect. If they want to pivot, restart Clarify with the new question; the work done on the original question is captured as a finding (the original question was not the right one), and the prototype's branch is Discarded.

### User wants to ship the prototype as-is

The user looks at the variations, picks one, and says "this is great, just deploy it." The prototype code is not deployment-quality.

The fix: translate "deploy it" into Promote. Surface the cost: "I can deploy this as-is, but the prototype code skipped tests, peer-review, and the full verify suite. The cleaner path is Promote to PLAN — same approach, but with the discipline that catches the issues prototype-grade code typically has. Deploy as-is, or Promote?"

If the user still wants to ship as-is, that is their call — but the cost is surfaced, not silently absorbed.

### Prototype touches shared files

The variations need to modify a file that other branches / other features also touch. There is a real risk of accidental commits that conflict with parallel work.

The fix:
- Prototype on a branch from a clean main. Do not prototype on top of an unmerged feature branch.
- If shared files are modified, the modifications are reverted as part of Discard. Promote means the *content* of the modification is reproduced in the fresh PLAN run, not that the modification stays.
- If the prototype's findings require a structural change in shared files, that structural change is its own PLAN run after the prototype concludes — it is not piggy-backed on the prototype's commits.

### Prototype has no clear "answer" — both variations work

After review, the user says "both are fine." This is not a failure; it is information. The discipline:

- Capture the finding ("both A and B work; no strong preference") in the same place the answer would have gone.
- Pick one (often the simpler) and Promote, with the user's confirmation.
- The prototype's value is not always "this is the right answer"; sometimes it is "there is no wrong answer here, pick the simpler one."

---

## The exit gate sentence

PROTOTYPE has a different exit gate from DIRECT/PLAN/DIAGNOSE because the work product is not a committed change. The form:

> **Question**: `<one sentence>`.
> **Variations built**: `<list with one-line summaries>`.
> **Time-box**: `<budget>` (actual: `<time taken>`).
> **User review**: presented at `<timestamp>`. User chose: `<Discard | Promote variation N | Re-Clarify>`.
> **If Discard**: branch deleted; finding captured at `<location>`.
> **If Promote**: fresh PLAN run started at `<plan file path>`; prototype branch discarded.
> **If Re-Clarify**: original question replaced with `<new question>`; restart Clarify.

If the sentence cannot be stated with the user's choice and its follow-on action, PROTOTYPE has not exited.

---

## Relationship to forge's other phases

- **Clarify** sharpens the question the prototype answers. Vague Clarify produces a vague question, which produces variations that do not actually answer anything comparable.
- **Build** (in DIRECT/PLAN form) is what PROTOTYPE is *not*. PROTOTYPE's "build variations" step intentionally relaxes the discipline that DIRECT/PLAN Build enforces.
- **Peer-review** does not run during PROTOTYPE. The user is the reviewer.
- **Verify** still runs the existing test suite to confirm the prototype did not break anything — but no new tests are added for prototype code.
- **Finish** is the route through which Discard or Promote takes effect. Discard maps to `references/finishing.md`'s Discard option; Promote starts a fresh PLAN run, which has its own Finish at the end.
- **PLAN** is the route Promote-to-Plan kicks off. The PLAN run uses the chosen variation as input to its own Clarify, not as a starting branch.
