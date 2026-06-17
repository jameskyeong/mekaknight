# Clarify Discipline — Grilling for Ambiguity

Reference for powertasking's **Clarify** phase. The Clarify section of `SKILL.md` enforces the surface rule (one question at a time; recommended answer with reasoning; ambiguity checklist must reach zero; 2-3 approaches proposed before Route). This document is the deeper discipline — why the rule exists, how to actually grill an ambiguity to the ground, and what to do at the awkward edges (the user wants to skip, no domain doc exists, every question feels like friction).

The non-negotiable: **ambiguity is a load-bearing signal, not friction.** Every question you do not ask now becomes a question you answer wrong later, in code, where it costs much more to revisit.

---

## Why grilling matters

A grill is not interrogation — it is the act of narrowing a vague intent until it is specific enough to drive code. Most "the model did the wrong thing" failures are not model failures; they are failures of Clarify. The user said "add user auth" and the model picked one of fifteen possible interpretations, all of which produce working code, none of which match what the user actually wanted.

The cost of a missed ambiguity:
- At Clarify time: one sentence to surface, one sentence to resolve.
- At Build time: a wasted RED → GREEN → REFACTOR cycle on the wrong behavior, plus the cost of reverting.
- At Verify time: a green test suite that confirms the wrong feature.
- At review time: a PR that the user has to redirect — and the most expensive case, a PR that *looks correct* and ships, because the divergence from intent is too subtle to catch from the diff alone.

The grilling discipline trades a few minutes of friction at Clarify for the cost of the entire downstream wrong path.

---

## How to question

### One question at a time

Multi-question messages produce partial answers. The user answers the first question, ignores the second, and the third gets lost in the response. The agent then either re-asks (annoying) or proceeds with two of three answers, which is worse — incomplete clarification dressed as complete clarification.

The rule: ask the **single most decision-blocking question** you have right now. Wait. Read the answer. Ask the next single most decision-blocking question.

The discipline is not "no compound questions ever" — it is "no compound questions when the questions are independent." A genuinely conditional question ("if X then Y, otherwise Z?") is one decision, not two.

### Recommended answer, with reasoning

Every question carries a recommended answer and a one-sentence why. This converts the interaction from "make me think for you" into "agree with my recommendation, or tell me which constraint I missed." Three benefits:

- **Cheaper for the user.** Saying "yes, your recommendation is fine" is faster than thinking through the question from scratch.
- **Reveals the model's mental model.** If the recommendation is wrong, the user catches it immediately — and the catch teaches the model something about the project that no further question would have surfaced.
- **Forces commitment.** Recommending pulls the model out of "endless options" mode and into a stake-in-the-ground stance the user can refine.

Bad: "Should errors return null or throw exceptions?"
Good: "I recommend throwing — the rest of the codebase uses thrown errors for invalid input, and silent nulls would diverge from that convention. OK?"

### Read the codebase before asking

If a question can be answered by reading the project — naming convention, existing pattern, type signature, prior decision — the agent reads. Asking the user a question whose answer is in `package.json` two lines down is friction without value, and it teaches the user that Clarify is hot air rather than disciplined narrowing.

The heuristic: if you can predict the answer with >80% confidence from a 30-second skim of the codebase, do the skim. Confirm with the user only when the codebase answer is ambiguous or contradicted by something in the prompt.

### Challenge user language that conflicts with CONTEXT.md

If `CONTEXT.md` exists, its glossary is the authority on domain terms. When the user's prompt uses a domain word in a different sense than `CONTEXT.md` defines, the model surfaces the conflict explicitly:

> "CONTEXT.md defines `tenant` as the billing entity, but your message uses `tenant` for an authenticated user. Are you using the term loosely, or do you actually mean the billing entity here?"

The model does not silently translate. Silent translation hides the conflict and produces code that is correct under the glossary but wrong under the user's actual intent — or vice versa. Surfacing the conflict trains both sides on the shared vocabulary.

---

## The 5-category ambiguity checklist, deepened

The orchestrator-level checklist names five categories. Here is what disciplined coverage looks like inside each.

### 1. Scope boundaries — what is in, what is out

For every feature, name the included and the excluded surfaces. "Add user auth" — does it include:

- Sign-up? Sign-in? Password reset? Email verification? Magic links? OAuth providers? 2FA?
- Session management? Token refresh? Logout?
- Account deletion? Account suspension? Account export?
- Admin-side user listing? Bulk operations?
- Audit logging of auth events?

The discipline is not "list every possibility every time." It is "after the user describes the change, name the three closest neighboring features and ask whether each is in or out." Neighboring features are the ones the user is most likely to assume by default.

Common scope ambiguities:
- "Frontend only" — does the backend already exist and just needs wiring, or are you adding the backend too?
- "Just fix the bug" — does the fix include the regression test, or just the patch?
- "Update the migration" — does that include backfilling existing rows, or only new rows?

### 2. Edge cases — what about the weird inputs

Every behavior has edges. The discipline is to ask the edges *before* writing the test, not after the code ships.

- **Empty.** What happens when the input is `""` / `[]` / `{}` / `null` / `undefined`?
- **Too large.** What happens at 10x the expected size? At the documented limit + 1?
- **Duplicate.** What happens when the same input arrives twice? Idempotent? Conflict? First-wins?
- **Concurrent.** Two callers at the same time? Race conditions? Locking? Last-write-wins?
- **Malformed.** What happens when the input does not parse, has the wrong shape, has the right shape with the wrong values?
- **Unauthorized.** What happens when the caller lacks permission? Silent skip? Loud error? Different error per surface?

The grill does not need to ask every edge for every change. It asks the edges that are *load-bearing for this change*. For a CRUD endpoint, "what if the row does not exist" is load-bearing; "what if the JSON is invalid" usually is not, because the framework handles it.

### 3. Term definitions — what does the word actually mean

Disambiguation work. The same word means different things in different conversations.

- "User" — the authenticated person, the database row, the Stripe Customer, the LinkedIn profile?
- "Delete" — soft (`deleted_at` set), hard (row removed), archived (moved to cold storage), purged (all references erased)?
- "Send" — synchronously, queued, scheduled, retried-on-failure?
- "Active" — currently online, in the last 30 days, paying, not paused?

Surfacing the wrong definition early is cheap. Discovering at PR time that "active users" meant "paying users" rather than "logged in within 30 days" is expensive.

### 4. Conflicts with existing code

Two failure modes here:

- **Overlap.** The new code duplicates or contradicts existing code. The grill: "Is there a `handleAuth` function already? Should this extend it or replace it?"
- **Breakage.** The new code changes a behavior other callers depend on. The grill: "This change to `formatUser` will affect every caller — do they all want the new format?"

Reading the surrounding code (not asking the user) usually finds the overlap and breakage faster. The user is asked only when the codebase answer is ambiguous or when the user's preference matters (extend vs replace is often a stylistic call).

### 5. Success criteria — how do we know it works

The grill version of this is "what specific test would prove this works, and what would the failing version of that test look like?"

If the user cannot describe the success test, the requirement is still vague — not because the user is wrong, but because the next step (Build, which is TDD) cannot start without a failing test. The Clarify exit gate has not been met.

Common ambiguous success criteria and their sharper forms:

| Vague | Sharp |
|---|---|
| "It should work" | "Calling `POST /login` with valid credentials returns a 200 and a token; with invalid credentials returns a 401 with no body" |
| "Make it faster" | "p95 latency on `/search` drops from current 800ms to under 300ms, measured on the production query workload" |
| "Looks better" | "Margin between header and content is 16px on mobile; the search bar is centered horizontally" |
| "Fix the bug" | "After the fix, the reproduction steps in issue #142 no longer produce the error" |

---

## Proposing approaches — the step between checklist-zero and Route

A clean checklist tells you the *problem* is understood. It says nothing about whether the *solution shape* has been examined. Jumping from checklist-zero straight to Route means the first design the model happened to think of becomes the design — first-idea anchoring, unexamined.

The discipline:

- **Two or three approaches, meaningfully different.** Different in structure, dependency choice, or trade-off — not the same idea with different naming. If two candidates would produce nearly the same diff, they are one approach.
- **Lead with the recommendation.** Same pattern as question-asking: state which approach you recommend and the one-or-two-sentence reasoning. The user agrees or redirects — both are cheap.
- **Name the trade-off, not just the description.** "Approach B is simpler but couples the validator to the route handler" gives the user something to decide on; "Approach B uses middleware" does not.
- **Scale honestly.** For a change where only one approach is genuinely viable, present that single approach in 2-3 sentences and state *why* the alternatives are not viable ("a second approach would require the schema migration we excluded from scope"). The step shrinks; it does not disappear. Naming why the alternatives lose is itself a check that they were considered.
- **The user chooses.** The chosen approach is what Route sizes and what the plan file (PLAN route) encodes. An approach the user never saw cannot be the one that ships.

### Anti-pattern: the inevitable-single-option presentation

Presenting one approach with "this is the standard way" framing when real alternatives exist. This is the approach-level version of answering your own questions — it wears the grammar of a proposal while removing the user's decision. If the model cannot name a second approach *or* explain why none exists, the solution space has not been explored; do the exploration before presenting.

---

## Anti-patterns

### Shotgun questioning

Firing five questions at once and waiting for a list of answers. The user answers two, half-answers one, misses two. The agent then proceeds as if all five were answered. The result is a Clarify phase that produced less clarity than no questions at all, dressed up as thorough.

The fix: one question, one answer, then the next question. The friction is the point.

### Vibes-based clarify

"It looks clear enough." This is the soft-language anti-pattern from `references/verification.md` showing up at Clarify time. If the agent has *not* run through the five-category checklist explicitly, the agent does not know whether it is clear; it has a hopeful feeling.

The fix: write down each category's residual ambiguities, even if the answer is "none." The act of writing forces the check.

### Answering your own questions

The agent asks a question, then in the same message says "well, probably you want X, so I'll just do that." That is not asking — that is unilateral decision dressed in the grammar of a question. If the agent has high enough confidence to "just do it," the question was unnecessary. If the agent is unsure, asking and then immediately overriding the answer trains the user to ignore the questions.

The fix: either ask and wait, or do not ask. The hybrid is a tell that the model is not respecting the user's input loop.

### Asking what the codebase already answers

"Should we use camelCase or snake_case for the new fields?" — the answer is in every other file in the project. The grill asks the user only when the codebase is silent.

The fix: spend 30 seconds reading the surrounding code before each question. If the answer is there, skip the question.

### Asking philosophical questions

"What is your long-term architectural vision for the auth system?" — too broad for the current change to depend on. The grill stays specific to *this* change: "should this auth flow share the session store with the marketing site's auth, or have its own?"

The fix: every question is sized to the current change. If a question is bigger than the change, it belongs in a PRD discussion, not in Clarify.

### Treating Clarify as a checklist to clear

The 5-category checklist is a tool, not a ceremony. The discipline is to use it as scaffolding for genuine narrowing, not to ask one question per category and call it done. Some categories will have zero residual ambiguities; some will have five. The exit gate is "zero items remaining," not "five questions asked."

---

## Edge cases

### User says "skip clarify" early

The user may genuinely have a clear-cut, well-specified change. Or they may be impatient. The discipline:

- If the prompt itself is already specific (concrete inputs, concrete outputs, concrete success test), honor the skip and proceed.
- If the prompt is vague but the user wants to skip, surface the risk in one sentence: "Skipping Clarify on a vague request usually produces work that has to be redone. The biggest unresolved item I see is X. Skip anyway, or address X first?"
- Do not refuse to skip — the user owns the call.
- Do not silently pretend the skip is fine when it is not. Surface, then defer.

### No CONTEXT.md exists

Without a glossary, the agent has no project-specific authority to challenge user language. The discipline:

- Use prior message context and the user's prompt as the working vocabulary.
- Notice term usage that seems likely to vary (`user`, `tenant`, `account`, `org`, `team`, `customer`) and ask once.
- If the project is large enough to warrant one, gently suggest creating `CONTEXT.md` after the work completes — but do not block this Clarify on it.

### User pushes back on every question

The user is frustrated, the questions feel slow, the user wants to ship. Two failure modes to avoid:

- **Collapse and skip.** The discipline does not bend to social pressure. Skipping the grill because the user is tired produces the same downstream cost as skipping it for any other reason.
- **Cargo-cult the grill.** Asking questions you do not actually need just because "the discipline says so" trains the user to ignore future questions that *are* needed.

The middle path: triage your own list. Ask the **single most decision-blocking question** you have. If the user answers that, you may find the rest resolves itself or can be deferred to a follow-up. The user's irritation is signal that the questions feel low-value — the right response is to raise the per-question value, not to drop the discipline.

### Recurring user across many `/powertasking` sessions

If the same user has answered "we always use Postgres for new schemas" five times, the agent should not ask a sixth. The discipline is to capture standing answers in `CONTEXT.md` or `CLAUDE.md` so they stop being Clarify-time questions.

If those documents do not capture it yet, the agent can mention: "I noticed we have answered the Postgres question several times. Worth adding to `CONTEXT.md`?" — surfacing the durable-decision opportunity without blocking the current Clarify.

### Mid-Clarify discovery that the request itself is wrong

Sometimes the grill reveals that the user is asking for something they should not want. The Clarify discipline:

- Surface the conflict explicitly. "You asked for X. From the codebase, X would conflict with Y. Did you intend X knowing about Y, or did you not know about Y?"
- Do not silently substitute your version. The user owns the decision.
- If the user confirms X anyway, the grill resumes on X. If the user redirects to a different feature, restart Clarify from the new feature's framing.

---

## The exit gate sentence

The Clarify exit gate is the same evidence-based form used in `references/verification.md`:

> **Ambiguity checklist: 0 items.** User confirmed at `<timestamp>`: "`<exact user quote>`."

Both halves are required. "Ambiguity checklist: 0 items" without a user confirmation is the agent declaring its own readiness, not the user's. "User confirmed: proceed" without the checklist is the user trusting the agent's vague sense that things are clear, which puts the responsibility for the unsurfaced ambiguities on the wrong side.

If either half cannot be stated, Clarify has not exited. Either complete the missing half, or surface the blocker.

---

## Relationship to powertasking's other phases

- **Route** (PLAN sub-step) reads the Clarify output to size the work and write the plan file. A Clarify exit with hand-wavy success criteria produces a plan file that cannot be executed — the missing detail surfaces at Build time and forces a re-Clarify.
- **Build (TDD)** depends on Clarify having produced a sharp success test. The very first RED test in Build should be one of the success tests Clarify named. If you cannot write that test from Clarify's output, Clarify did not exit cleanly.
- **Peer-review** reads the Clarify output as the spec axis. Vague Clarify produces a vague spec axis, which makes peer-review weaker — the reviewer cannot tell whether the implementation matches intent if the intent itself was not recorded.
- **Verify** does not consult Clarify directly, but every check it runs traces back to a success criterion that should have come from Clarify.
