# TDD Discipline — RED → GREEN → REFACTOR

Reference for forge's **Build** phase. The Build section of `SKILL.md` enforces the loop at the orchestration level; this document is the deeper discipline — the rules, the anti-patterns, the edge cases that make the loop actually work instead of becoming theater.

The non-negotiable: **a failing test exists before a line of implementation is written.** Every shortcut around this rule produces code that looks complete but cannot be evolved with confidence later. If implementation got written before its test, the recovery is deletion and a fresh RED — not retrofitting a test around the existing code.

---

## The loop

Each cycle has three steps. Each step has a single exit condition. Do not move forward until the exit condition is observed.

| Step | Action | Exit condition |
|---|---|---|
| **RED** | Write one failing test that names the next behavior. | The test runs, fails with a message that matches your prediction, and the failure points at the missing behavior (not at a typo, not at a setup error). |
| **GREEN** | Write the minimum code to make that test pass. | The test runs and passes. Every other previously-passing test still passes. Output observed directly. |
| **REFACTOR** | Improve structure with tests staying green. | Tests pass after each individual change. The structure is meaningfully clearer or the duplication is meaningfully reduced. If neither, do not refactor. |

A cycle is **one behavior**. Not one feature, not one file. If the next test you want to write would require two or more independent behaviors to pass, you are sizing the cycle too large.

---

## RED — the failing test

### Pick the smallest meaningful behavior

The right test for RED is the smallest behavior that, once green, leaves the system observably more correct than it was. Not the simplest test you can think of — the simplest *meaningful* one.

Good: `it("rejects an empty username")`. The behavior is one validation rule; the test is small.
Bad: `it("validates the form")`. The behavior is unbounded — multiple rules will collapse into one cycle, and you will not know which one drove which line of code.

If the test description contains the word "and", split it. If it contains "should work correctly", you have not picked a behavior — you have picked a vibe.

### Predict the failure before running

Before running the failing test, state out loud (or in your head) what failure message you expect. Then run it. If the actual failure does not match your prediction:

- **Test passes unexpectedly** — STOP. The feature already exists, or the test is hitting a stub, or the assertion is too weak. Investigate. Do not write implementation against a test that passes.
- **Different error from expected** — typically a setup or import issue, not the missing behavior. Fix the setup first; otherwise you are about to implement code in response to a misleading signal.
- **Error message points at a stack frame inside the test harness** — the test is malformed. Fix the test before continuing.

The prediction matters because it converts "the test failed" from a vague green light into specific evidence about *what* failed.

### Assert on behavior, not implementation

Tests that assert on the public-visible behavior survive refactors. Tests that assert on internal structure (which private method was called, which intermediate variable held what value, the exact SQL string emitted) break the moment anyone reorganizes the code, even when the behavior is unchanged.

Symptoms that you are asserting on implementation:
- The test changes whenever a renaming, an extraction, or an internal restructuring happens — even though the inputs and outputs are unchanged.
- The test imports private/internal symbols, not the public API.
- The test uses mock-call-count assertions (`expect(mock).toHaveBeenCalledTimes(3)`) where the count is not actually a contract — just a snapshot of the current implementation.

A test that breaks on every refactor is not a regression net. It is a tripwire on your own movement.

---

## GREEN — the minimum implementation

### "Minimum" is literal

The implementation in GREEN is the **least code that makes this test pass**, not the least code that makes "the feature" work. If the test asserts on one input/output pair, returning the expected output for that single case is a legitimate first step. Generalization is not GREEN's job — it is REFACTOR's.

The fastest way to violate this is to think "well, while I'm here, I should handle the other cases too." That is scope creep at GREEN, and it produces code that has no test driving it.

If you find yourself writing implementation that the test does not exercise:
- STOP.
- **Delete the extra code.** Do not keep it "as reference"; do not keep it while you author a test around it — a test written against code that already exists passes without ever having failed, which proves nothing.
- If the next behavior genuinely needs that code, write the next RED test first and let it pull the implementation back in, written fresh.

There is no other option. Implementation without a test driving it is technical debt the moment it is written.

### Cheating is allowed at GREEN

Hard-coding a return value to pass a single test is fine. So is using a literal where a calculation belongs. So is duplicating logic that "obviously" should be shared. **GREEN is permission to be ugly.** The point is to get to "test passes, output observed" with the smallest possible step, then let the next RED force generalization or let REFACTOR consolidate.

The teams that have the most trouble with TDD are usually trying to skip this principle — wanting GREEN to also be REFACTOR. It cannot be both. Compress them and you lose the signal that tells you whether your tests are actually driving design.

### Observe the pass directly

The exit condition for GREEN is the same as the cross-cutting verification rule: read the output. Not "the test should pass now" — the actual output, the actual green line, the actual count of passed tests. If you cannot show the output, you have not finished GREEN.

This rule has saved more time than any other in the loop. Tests that *should* pass but in fact silently fail (because of a typo'd import, an environment variable, a stubbed function) are the single most common source of "completed work" that turns out not to be done.

---

## REFACTOR — structure only, behavior unchanged

### What REFACTOR is

Improving the shape of code without changing what it does. Renames, extractions, consolidations, breaking apart god functions, moving code closer to where it is used. Every step is followed by re-running the test suite to confirm behavior is unchanged.

### What REFACTOR is not

Adding new behavior. Fixing bugs you noticed while refactoring. "While I'm here" anything. Each of these is a separate RED → GREEN cycle. Mixing them into REFACTOR is the fastest path to a refactor that breaks something and you cannot tell what.

### The two-test rule

Do not refactor until the same idea appears in two tests. One test passing is not enough information to know what is essential and what is incidental. Two tests reveal which parts are required by the contract and which were just convenient at the moment. Refactoring on a single example often produces an abstraction that the second example will not fit.

### Refactor on green, never on red

If a test is failing, do not refactor. The only thing you should be doing during a red is implementing to make it pass (GREEN) or reverting to the last green state. Refactoring during red mixes two signals — "did my structural change break something" and "is the new behavior implemented yet" — and you cannot separate them later.

### Stop when the structure is clearer

The exit condition for REFACTOR is subjective but bounded: the structure is meaningfully clearer than it was, or the duplication is meaningfully reduced. Not "perfectly clean" — that is a moving target that produces endless rework. The right question is "would the next person on this code understand it faster than they would have five minutes ago?" If yes, stop. If no, you have over-refactored — consider reverting.

---

## Anti-patterns

### Test-after

Writing the implementation first, then writing tests that confirm what you already wrote. This produces tests that always pass (because they were authored against working code) but do not constrain future changes. The hallmark is tests that mirror the implementation's structure exactly — one test per branch in the function, one test per line of code, no asymmetry between what the user cares about and what the code does internally.

The fix: when you catch yourself test-after, the test you should write is **for a behavior that does not yet exist** — a missing case, an edge case, an error path. That puts you back in RED and recovers the discipline. And if the untested implementation is still uncommitted, the recovery is stronger: delete it and start from RED — deletion is what removes the bias the existing code would impose on the tests you write next.

### Mock-overuse

Mocking every collaborator turns the test into a description of internal call patterns rather than a verification of behavior. The test passes because the mocks return what the test expects, not because the system actually does the right thing. When the real collaborator changes its contract, the mocked tests do not catch it.

The rule: mock the boundary, not the interior. Mock the HTTP client at the edge of your code, mock the database driver at the boundary, but inside your own domain logic, prefer real objects. If "this would be hard without a mock" is the reason for the mock, that is usually a design signal — the code under test has more responsibilities than it should.

### Scope creep at GREEN

Writing more implementation than the failing test demands, because "the next test will need it anyway." Every extra line of GREEN code is implementation without a test driving it. If the next test does need it, write the next test first and let it pull the implementation.

### Refactor-on-red

Restructuring the code while a test is failing. You lose the ability to localize problems — "did my restructuring break this, or was it already failing?" If you spot a refactor while red, write it on a sticky note (literal or metaphorical) and come back to it after GREEN.

### Skipping REFACTOR

Going RED → GREEN → next RED forever, never cleaning up. The code accumulates duplication and structural debt until each new test takes longer to write than the last. The signal that REFACTOR is being skipped: each new feature feels harder than the previous one, even though the system is supposedly improving with every test.

The fix: end every two GREEN cycles by asking "do I see duplication that the next test will reinforce if I do not consolidate now?" If yes, refactor now.

### Asserting on incidental output

Tests that fail when an error message is reworded, when a timestamp format changes, when a log line moves. These tests guard nothing — they just create maintenance load when the system improves. Assert on the contract, not the prose.

### "I'll come back and add a test"

The cycle in which you write GREEN implementation and tell yourself you will write the test next. You will not. Even if you do, you have lost the design signal that comes from authoring the test first — you have authored implementation, then validated it against itself. RED before GREEN is not a procedural preference; it is the mechanism by which the test forces design pressure on the code.

---

## Edge cases

### Existing legacy code with no tests

You cannot write a failing test against code that already does the thing. The work here is not to retroactively TDD the entire codebase — that is busywork. The work is to **add a characterization test** that pins the current behavior (even if it is wrong), then make the change you actually wanted to make with a normal RED → GREEN cycle against the characterization baseline.

If the legacy code is too entangled to test, you have a refactoring task before the TDD task. Extract a seam, write the characterization test against the seam, then proceed.

### Time pressure / production incident

Strict TDD slows you down deliberately. In an active incident, that tradeoff inverts — speed matters more than discipline, and the post-incident write-up captures the test. The right move is:
- Apply the smallest change that resolves the incident, even without a test.
- Open a follow-up task to add the regression test before merging anything else into the affected area.
- The regression test for the incident is non-negotiable; it is what prevents the same incident from recurring. Skipping the test "because we already fixed it" is how the same incident recurs in six weeks.

This is not permission to drop TDD in non-incident work because the work feels urgent. Real incidents are rare. Most "urgent" work is just unscheduled work.

### UI / visual changes

You cannot meaningfully RED a "the button should be more aligned" test. UI alignment is verified by looking at it. The TDD discipline still applies to the parts of UI code that have behavior — event handlers, state transitions, conditional rendering — and the test is for that behavior, not for pixels.

For pure visual work, the discipline is screenshot-based and the orchestration is: capture the current screenshot, make the change, capture the new screenshot, compare. This is verification, not TDD, but the principle (evidence before claim) is the same.

### Integration boundaries

You cannot fully test the integration with a third-party API in a unit test. The discipline split:
- The **adapter** (your code that calls the API) gets tests that mock the network at the lowest reasonable layer. These tests verify your code's contract with the adapter, not the API's behavior.
- The **integration** (does our system actually talk to the real API correctly) gets a separate test suite that hits a sandbox or a recorded fixture, run less often, treated as a verification step rather than a development driver.

Both layers exist. The unit-level layer is where TDD lives; the integration layer is where verification lives.

### Prototypes and exploratory spikes

Code written to learn something and then thrown away is not subject to TDD. The whole point of a spike is to find out what you do not yet know — you cannot write a test for that. The discipline is:
- Be explicit that this is a spike. Time-box it.
- When the spike resolves what you wanted to learn, **throw it away**. Do not edit it into "production code" — that path produces untested code that masquerades as tested because the spike's existence creates the illusion of intent.
- Start fresh with RED, using what the spike taught you.

---

## When TDD does not apply

| Situation | Why not | What to do instead |
|---|---|---|
| One-line config change | No behavior to test that the change itself does not trivially encode | Make the change, verify the system still boots and the config is read |
| Pure documentation | No code path | Write the doc; have someone read it |
| Throwaway spike | Discovery, not delivery | Time-box, learn, discard, start fresh |
| Active production incident | Speed matters more than discipline | Smallest safe change; regression test as the immediate follow-up |
| Visual UI alignment | Not behavior; pixel-level | Screenshot before/after; reviewer eyeballs |
| Migrating between equivalent libraries with existing tests | No new behavior, existing tests are the regression net | Run existing tests after each step of the migration |

The list is short on purpose. The instinct to say "TDD does not apply to *this* work" is wrong much more often than it is right.

---

## Relationship to forge's other phases

- **Clarify** must reach 0 ambiguities before Build starts. If RED makes you discover an ambiguity ("what should this return when input is empty?"), that is a Clarify failure — go back, resolve, return.
- **Peer-review** reads the diff, not the cycle. The diff should tell the story by itself: tests added, implementation matching the tests, refactors visible as their own commits or commit-message lines.
- **Verify** runs the full suite, not just this cycle's test. If the full suite was green before Build started and is not green now, something broke that this cycle's tests did not catch. That is a coverage gap; add the missing test before declaring Verify green.
- **Finish** is downstream of all of this. The branch decision (merge / PR / keep / discard) is about the work product; the discipline that produced it is the loop above.
