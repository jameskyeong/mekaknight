# Subagent Dispatch Discipline

Reference for powertasking's **subagent usage** across all phases. The Peer-review phase has its own subagent dispatch case (covered in `references/peer-review.md`); this document is the cross-cutting discipline for every other dispatch — when to fan out, how to construct prompts that produce auditable work, how to fan back in, and the anti-patterns that turn dispatch from a tool into an abdication.

The non-negotiable: **dispatching a subagent does not transfer responsibility.** The orchestrator still owns the work product. The subagent's report is one input the orchestrator audits, not a black-box outcome to accept on faith.

---

## Why dispatch at all

Three legitimate reasons to dispatch a subagent rather than do the work inline:

### 1. Context-budget hygiene

Long-running orchestration accumulates context: file reads, command outputs, intermediate analyses. Some of that context is load-bearing for the rest of the run; some is not. Work that produces a *lot* of intermediate context but only a small final answer (e.g., "search the codebase for every reference to X and tell me which usages still apply") burns the orchestrator's window on artifacts it does not need.

Dispatching a subagent for this kind of work lets the subagent absorb the intermediate context and return only the small final answer. The orchestrator's window stays clean for decisions that need it.

### 2. Independence from author bias

Peer-review is the canonical case: the implementing agent has version-in-memory bias and cannot effectively review its own diff. A fresh subagent with only the diff and the spec gives an independent read.

This generalizes: any time the orchestrator's prior decisions would bias its current evaluation, a subagent that did not make those prior decisions provides a cleaner read.

### 3. Genuinely parallel independent work

Two pieces of work that do not share state and do not depend on each other can be done in parallel by two subagents while the orchestrator waits for both. The orchestrator's wall-clock time drops; correctness is unaffected because nothing was contested.

The independence has to be real. If the two pieces share state (the same files, the same database, the same in-flight branch), parallel dispatch produces races and contradictions — see Anti-patterns.

---

## When to dispatch vs do it inline

A decision tree:

```
Will the work produce a lot of intermediate context the orchestrator does not need?
├─ Yes → dispatch (context hygiene)
└─ No → ↓

Will the orchestrator's prior decisions bias the current evaluation?
├─ Yes → dispatch (independence)
└─ No → ↓

Are there 2+ pieces of work that genuinely do not share state?
├─ Yes → dispatch in parallel
└─ No → ↓

Do it inline.
```

Most of powertasking's work is inline. Dispatch is for the cases above, not the default.

---

## Prompt construction

A subagent prompt must contain enough for the subagent to produce auditable work. At minimum:

### 1. Role and constraint

State what the subagent is and what it does *not* have access to. "You are an independent code reviewer. You have NOT seen the implementation process — only the diff and the spec." The negative constraint matters: it tells the subagent it cannot assume context that does not exist in the prompt.

### 2. Context

Whatever the subagent needs to do the work. For research: the question, the relevant directories, the search patterns. For review: the diff, the spec, the standards excerpts. For an evaluation: the artifact being evaluated and the criteria.

If the orchestrator does not give the subagent enough context, the subagent fabricates context from training-time priors — and the result is fluent but wrong.

### 3. Inputs

Concrete, named. Not "look at the auth code" — `src/auth.ts`, `src/middleware/auth.ts`, `tests/auth.test.ts`. Specific paths or specific patterns. A subagent dispatched to "look at the auth code" without paths reads everything plausible, burns context, and returns a survey.

### 4. Output format

The orchestrator must specify the shape of the response. "For each finding, output Severity / File:line / Issue / Suggestion." "Return a numbered list of files with one-line justifications." Without an output format, the subagent's response style varies, and the orchestrator's parsing logic has to compensate.

### 5. Evidence requirements

The most-skipped section, and the most important. The subagent must return the raw evidence the orchestrator can audit, not just its conclusions.

- For test runs: the final summary line, the test names that passed or failed.
- For file reads: the exact lines that supported the conclusion (with line numbers).
- For search results: the matched files and the matched lines.
- For diff analysis: the diff hunk being commented on.

Without this clause, "the tests pass" comes back from the subagent and the orchestrator has no way to verify whether the tests actually ran. With this clause, the orchestrator gets `Tests: 47 passed, 47 total` and can confirm the claim.

### 6. Negative permission — admitting "I do not know"

State explicitly that the subagent may return "I did not find X" or "I am not confident." Without this, the subagent treats the question as a task that must be completed and fabricates an answer rather than reporting the gap.

---

## Evidence requirements — making subagent claims auditable

A subagent claim of success without evidence is the same anti-pattern as the orchestrator's own soft language ("should work", "seems to pass") — it has just been laundered through a dispatch.

The discipline:

- The subagent's prompt requires raw output.
- The orchestrator reads the raw output before treating the claim as verified.
- If the subagent returns a claim ("tests pass") without the raw output, the orchestrator either re-dispatches with a sharper prompt or runs the verification inline.

This is the corollary to `references/verification.md`'s "trust no agent's claim of success without raw output" rule, applied to dispatched work.

---

## Parallel dispatch — when and how

### When it works

Two pieces of work are genuinely independent:
- They read disjoint files.
- They do not write to the same files.
- They do not depend on the same in-flight state (no shared branch, no shared database row).
- The orchestrator can use both results as inputs to its next decision.

Examples that work:
- Search the codebase for usages of pattern A; in parallel, search for usages of pattern B.
- Audit module X against standards; in parallel, audit module Y against standards.
- Read CLAUDE.md for relevant rules; in parallel, read CONTEXT.md for relevant glossary.

### How to fan back in

The orchestrator waits for all parallel subagents to return. Each returns its evidence-bearing report in the prompt-specified format. The orchestrator integrates them — usually by listing each finding by source agent, deduplicating where overlap is real, surfacing contradictions for the user to resolve.

If two parallel agents return contradictory conclusions on the same artifact, the contradiction is itself a signal — usually that the artifact was ambiguous, that the standards were under-specified, or that one agent had a context gap. The orchestrator does not silently pick one; it surfaces the contradiction with both supporting evidence chains.

---

## Anti-patterns

### Dispatch as abdication

The orchestrator dispatches a subagent because the task is hard or the orchestrator is unsure how to do it, and then accepts the subagent's response without auditing. This is dispatch as delegation of *responsibility*, not just labor. The orchestrator still owns the work product; "the subagent said so" is not evidence.

The fix: every subagent return is read with the same skepticism the orchestrator applies to its own claims. Subagents are tools, not authorities.

### Trusting subagent claims without raw output

Discussed above. The single most common dispatch failure: subagent says "done"; orchestrator marks it done; nothing was actually verified. The Build phase, peer-review phase, and verify phase all have this failure mode.

The fix: every dispatch prompt requires raw output; every return is read for the raw output before being trusted.

### Parallel dispatch on shared state

Two subagents are sent to "improve the auth flow" simultaneously, both editing `src/auth.ts`. They race; one's edits clobber the other's; the orchestrator gets back two reports that contradict the file's actual state. Or worse: they each commit, and the orchestrator now has two parallel commits with conflicting changes.

The fix: parallel dispatch requires disjoint write surfaces. Reads can overlap; writes cannot. If two agents need to modify the same file, they run sequentially.

### Dispatching work that is faster inline

Spawning a subagent has overhead: prompt construction, context warm-up, return-and-audit. For small tasks (read one file, run one command), the overhead exceeds the savings.

The rule of thumb: if the work would take fewer than 3-5 tool calls inline, do it inline. If it would take 15+ tool calls and produces a small final answer, dispatch.

### Vague prompts

"Look at the codebase and tell me if anything is wrong." The subagent has no scope, no criteria, no output format, and no evidence requirement. Whatever it returns is unauditable and the orchestrator cannot tell whether the absence of findings is "nothing found" or "did not look carefully."

The fix: every dispatch prompt names the scope (which files), the criteria (what counts as "wrong"), the output format, and the evidence requirement.

### Cascading dispatch without a budget

Subagent A dispatches subagent B, which dispatches subagent C. The orchestrator can no longer audit any of it — each layer adds an unaudited claim. By the time the result returns, no one knows whether the underlying work was actually done.

The fix: powertasking's orchestrator dispatches; subagents do not dispatch further subagents (with rare exceptions for well-scoped recursive cases). If a subagent's work needs further fan-out, the subagent reports back and the orchestrator dispatches the next layer.

---

## Edge cases

### Subagent times out or partially completes

The subagent ran out of context, hit a tool error, or stopped without finishing. The orchestrator receives a partial report. The discipline:

- Do not treat the partial report as complete.
- Identify what is done and what is not.
- Either re-dispatch with a narrower scope (split the original work) or pick up the remainder inline.

### Subagent returns "no findings" or empty result

This may be a real clean result, or it may be a lazy pass. Signals it is lazy rather than real:

- The diff was large but the review report is empty.
- The standards excerpts were comprehensive but the report did not reference any of them.
- The output format was not followed.

The fix: re-dispatch with a sharper prompt — name specific files to check, specific criteria to verify, specific evidence to report. If the sharper dispatch also returns clean, trust it.

### Subagent surfaces a question the orchestrator cannot answer

The subagent encountered an ambiguity that needs the user's input. The discipline:

- The subagent reports the question with the context that surfaced it.
- The orchestrator surfaces the question to the user (it does not answer on the user's behalf).
- After the user responds, the orchestrator either continues inline with the new information or re-dispatches the subagent with the answer added to its prompt.

### Subagent returns work that contradicts the orchestrator's prior understanding

The orchestrator believed X; the subagent's evidence shows Y. Two failure modes to avoid:

- **Capitulate.** "Subagent said Y, so Y." This is dispatch as abdication. The subagent's evidence might be wrong; the orchestrator audits.
- **Dismiss.** "Subagent is wrong because I believed X." This is author bias projected onto the subagent. The orchestrator audits the evidence either way.

The middle path: the orchestrator reads the subagent's raw evidence, compares it against its own prior basis, and either updates its understanding or surfaces the contradiction to the user with both sides of the evidence.

---

## Relationship to powertasking's other phases

- **Clarify** is rarely dispatched — the value of Clarify is the orchestrator's direct interaction with the user, and a subagent loses the user-facing channel. Dispatch in Clarify is for sub-tasks like "search the codebase for existing patterns that answer this question."
- **Route → PLAN** sub-step is inline; the plan file is a contract between the orchestrator and the user, not something to delegate.
- **Build** is mostly inline (TDD cycles require the orchestrator to think about behavior). Dispatch in Build is for sub-tasks like "scan for callers of this function before the rename" — research that informs the cycle.
- **Peer-review** is the canonical dispatch case. See `references/peer-review.md` for the specifics.
- **Verify** can dispatch parallel sub-agents for independent checks (one for typecheck, one for lint, one for tests) if the wall-clock matters, but the orchestrator still reads each output directly.
- **Finish** is inline; the branch decision is between the orchestrator and the user.
