# Retrospective Discipline — Compounding Deposit

Reference for forge's **Retrospective** phase. The Retrospective section of `SKILL.md` enforces the surface mechanics (run between Verify and Finish, three channel checks, propose-not-impose). This document is the deeper discipline — why the phase exists, per-channel thresholds, anti-patterns, and edge cases.

The non-negotiable: **the deposit decision is the user's, not the agent's.** Forge proposes; the user accepts, edits, or skips. Performative deposits — ADRs for one-line CSS fixes, glossary entries for terms that already exist, references appended with paraphrased SKILL.md content — are worse than no deposit at all.

---

## Why Retrospective is an explicit phase

Forge's compound engineering pillar rests on five channels: plan files, DIAGNOSE regression tests, ADRs, discipline references, and CONTEXT.md domain glossary. Two of them — plan files (PLAN route) and regression tests (DIAGNOSE route) — deposit automatically as a side effect of running the route. The other three do not.

Without an explicit prompt, ADRs / references / CONTEXT.md only grow when the user remembers to update them. In practice that means they don't grow. The compounding promise becomes infrastructure-only — the channels exist, but the deposits don't happen.

Retrospective makes the deposit decision visible at the moment when the session's learnings are still fresh — between Verify (success confirmed) and Finish (branch decision). The friction is one to three short prompts; the value is that the three missing channels actually accumulate.

---

## The three channels

Each channel has a specific threshold. The discipline is not "ask three questions every session" — it is "ask each question only when the threshold is met, propose concrete content when it is."

### Channel 1 — ADR

**Threshold**: An architectural choice was made during this session whose *reasoning* will be valuable to a future session asking "why did we do it this way?"

Trigger signals (any of):
- A non-obvious decision between two or more viable options.
- A decision constrained by something not visible in the code (regulatory requirement, partner contract, prior incident).
- A decision that retires or supersedes a prior pattern.
- A decision that explicitly *rejects* an alternative the next person is likely to reconsider.

Not an ADR:
- A small implementation detail with one obvious answer.
- A bug fix (the commit message carries the why).
- A refactor that follows existing patterns.
- A decision already documented in another ADR.

**Proposal format** (if threshold met):

```
ADR proposal: <short title>

Context: <1-2 sentences on the constraint or trigger>
Decision: <what was chosen>
Considered options: <brief list of alternatives evaluated>
Consequences: <follow-on implications, including what becomes harder>

Save to docs/adr/NNNN-<slug>.md? [y/edit/n]
```

The agent proposes the next ADR number based on `ls docs/adr/`. Filename is kebab-case.

### Channel 2 — Discipline references

**Threshold**: A phase revealed a new failure mode, anti-pattern, edge case, or recurring issue *that the existing reference does not already cover*.

Trigger signals (any of):
- A Verify check caught an issue that should have been blocked earlier.
- A Peer-review found a pattern that recurs in this codebase.
- A Clarify ambiguity surfaced that the 5-category checklist almost missed.
- A new edge case appeared in DIAGNOSE/PROTOTYPE that wasn't anticipated.
- A subagent dispatch revealed a coordination pattern worth recording.

Not a reference update:
- A one-off mistake that's unlikely to recur.
- A finding already documented in the relevant reference.
- A paraphrase of existing SKILL.md content.

**Proposal format** (if threshold met):

```
Reference update proposal: <references/<phase>.md>

Section to append: <existing section name, or "new section: <name>">

Content:
<draft paragraph or bullet — concrete, attributable, with enough context to be useful out of session>

Append? [y/edit/n]
```

The agent identifies the right reference file (one of `grilling.md`, `planning.md`, `diagnosis.md`, `prototyping.md`, `tdd-discipline.md`, `peer-review.md`, `verification.md`, `finishing.md`, `subagent-patterns.md`, `retrospective.md`).

### Channel 3 — CONTEXT.md domain glossary

**Threshold**: A term was introduced, redefined, or contested during this session, and future contributors will need to use it consistently.

Trigger signals (any of):
- A new feature name was coined and used across files.
- A term meant something specific in this session that differs from the obvious reading.
- An "Avoid" antonym surfaced — a term users will *almost* reach for that means something else.
- A renaming happened (old term → new term) and the old should be flagged as deprecated.

Not a glossary update:
- A term that already has a glossary entry.
- A throwaway phrase used once.
- A standard programming term with no project-specific meaning.

**Proposal format** (if threshold met):

```
CONTEXT.md glossary proposal:

Term: <name>
Section: <existing section name, or "new section: <name>">

Entry:
**<Term>**:
<definition — one to three sentences, ground in concrete project artifacts>
_Avoid_: <one or two confusable terms with brief reason>

Append? [y/edit/n]
```

---

## The phase mechanics

1. **Run only after Verify exits green.** If Verify failed, fix Verify first; do not retrospect on broken work.
2. **Check each channel in order.** ADR → references → CONTEXT.md. Each check is independent — the agent decides whether the threshold is met for that channel and proposes only when it is.
3. **Threshold check is silent when no.** If no channel threshold is met, the phase exits with a one-line note ("No compounding-worthy artifacts surfaced this session") and proceeds to Finish. Do not invent deposits to make the phase feel productive.
4. **Propose, never impose.** Each proposal asks `[y/edit/n]`. The user owns the final wording. The agent does the drafting work so the user doesn't have to context-switch.
5. **One proposal at a time.** If multiple channels qualify, present them sequentially — not as a batch. Each accept/edit/reject decision is independent.
6. **Write the accepted deposit immediately.** On `y` or `edit-then-y`, the agent writes the file (creates or appends) and `git add`s it. The deposit becomes part of the same commit as the implementation, not a follow-up.
7. **Skipped deposits leave a one-line breadcrumb (optional).** If the user rejects an ADR proposal, the agent may note "user declined ADR for <topic>" in the session output — useful if the same topic surfaces in a future session.

---

## Anti-patterns

### Performative deposit

Writing an ADR / reference update / glossary entry because the phase exists and "we should deposit something." The result is noise that future sessions have to ignore — worse than nothing.

**The cure**: hold the threshold strictly. If no channel qualifies, the phase exits silently. The phase is successful when it correctly identifies *no* deposit is needed.

### Paraphrasing SKILL.md into a reference

Appending content to a reference that just restates what `SKILL.md` already says, with no new principle or pattern. References are for depth that exceeds the orchestrator, not for echoing it.

**The cure**: every reference update must contain at least one piece of information that is not already in `SKILL.md` or in the reference. If not, reject.

### ADR for a bug fix

Bug fixes don't get ADRs; the commit message carries the why. An ADR is for a *decision* — a choice between viable alternatives with reasoning. A bug is a fix for a wrong, not a choice among rights.

**The cure**: if the only thing to record is "we found bug X and fixed it Y way", that's the commit message + the regression test, not an ADR.

### Glossary entry without "Avoid"

A glossary term without an `_Avoid_` line tends to drift — readers don't know what *not* to call it. CONTEXT.md's discipline is that every term carries the confusable alternatives explicitly.

**The cure**: require at least one `_Avoid_` antonym per glossary entry. If you can't think of one, the term is probably too obvious to need an entry.

### Batch-style deposit proposals

Presenting all three channel proposals at once ("Here are the ADR draft, reference update, and glossary entry — accept all?"). This invites blanket acceptance or blanket rejection, defeating the per-channel threshold discipline.

**The cure**: present one at a time. Each gets its own accept/edit/reject decision.

### Treating Retrospective as the "documentation phase"

Retrospective is for *compounding artifacts* — durable deposits that lift future sessions. It is not for tutorial documentation, user-facing READMEs, or marketing copy. Those have their own homes.

**The cure**: every retrospective deposit must answer "what does a *future forge session in this repo* benefit from knowing?" If the answer is "nothing — this is for external readers," reject.

---

## Edge cases

### Multiple sessions of the same plan

If `/forge docs/plans/<feature>.md` resumes a prior session, the Retrospective runs on the *completed-this-session* tasks, not the whole plan. The threshold checks compare against the project state, not the session boundary — if the prior session already deposited an ADR for this feature's architectural choice, this session does not propose a duplicate.

### Strike-caller integration

When `/forge` is invoked by `/strike`, the Retrospective still runs. Deposits proposed here are independent of the Notion status update strike performs after Finish. An ADR or reference deposit may happen even if the issue itself is rejected by the user during strike.

### PROTOTYPE Discard

If PROTOTYPE exits with Discard (the prototype is thrown away), Retrospective still runs — *the variations themselves* may have produced learnings worth depositing even though the code is discarded. Specifically: which approaches didn't work and why often belongs in a reference or an ADR-as-negative-decision.

### PROTOTYPE Promote-to-Plan

If PROTOTYPE exits with Promote, Retrospective runs at the *end of the fresh PLAN run*, not at the prototype's exit. The Promote restarts the flow; the deposit decision belongs to the production-grade PLAN session, not the throwaway prototype session.

### User declines all proposals

If the user rejects every channel proposal, the phase exits successfully — declining is a valid outcome. Do not treat rejection as failure.

### No proposals to make

If no channel threshold is met, the phase exits with one line: "Retrospective: no compounding-worthy artifacts this session." This is the most common outcome for DIRECT-route small changes and is correct.

### Retrospective deposit causes Verify to need to re-run?

It should not — Retrospective only writes to `docs/adr/`, `skills/forge/references/`, and `CONTEXT.md`. None of these affect lint/typecheck/test outcomes. If for some reason a deposit touches a file that does (e.g., a markdown linter is wired into the build), re-run Verify before Finish.
