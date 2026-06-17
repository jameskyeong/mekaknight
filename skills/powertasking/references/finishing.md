# Finish Discipline — Commit and Branch Decision

Reference for powertasking's **Finish** phase. The Finish section of `SKILL.md` enforces the surface mechanics (commit if uncommitted, present four branch options, no auto-merge or auto-push). This document is the deeper discipline — when each branch option is the right call, the git-safety rules that prevent silent damage, and the awkward edges (working tree not clean, conflicts, PR cannot be opened, resolve-issue caller).

The non-negotiable: **the branch decision is the user's, not the agent's.** Powertasking's job is to surface the four options clearly and capture the choice; it does not auto-merge, auto-push, or auto-delete.

---

## Why Finish is an explicit phase

The default in most agentic workflows is "commit, push, open PR, done." That default is convenient but it removes a real decision from the user. Sometimes the work is exploratory and should be discarded. Sometimes it should be kept on the branch but not merged yet. Sometimes a local merge is right because the project is solo. Sometimes a PR is required because the team has a review process. The default-to-PR or default-to-merge collapses these four cases into one and silently loses optionality.

Finish makes the choice visible so the user makes it consciously. The friction is the value: it costs the user one sentence of input, and in return the branch ends up where it should be rather than where the default would have put it.

---

## The four options sharpened

Each option has a specific situation it fits. The discipline is not "let the user pick whatever" — it is "present each option with the situation it matches."

### 1. Local merge

Use when:
- Solo project, no review process exists.
- The work is complete, tested, ready for `main`.
- The user owns `main` and merges directly when work is done.

Do not use when:
- The project has a PR review requirement (CODEOWNERS, branch protection, team convention).
- Other work is in-flight on `main` that you have not pulled in (rebase or merge `main` into the feature branch first).
- The branch's tests passed but the full `main` post-merge state has not been verified.

After local merge:
- Run the full test suite on `main` after the merge — the merge itself can produce a state that neither side tested.
- Decide whether to delete the feature branch immediately or keep it as a recovery point.

### 2. Open PR

Use when:
- Team workflow with a code-review step.
- Solo project but the user wants the PR view (file-by-file diff, comment surface) for self-review or future reference.
- A CI gate runs on PRs that needs to pass before merge.

Before opening the PR:
- Push the branch (`git push -u origin <branch>` if first push).
- Verify the branch is up-to-date with `main` (the PR view will surface conflicts otherwise).
- Draft the PR body — what the change does, why, how to test. The PR body matters more than the commit messages because it is the artifact a reviewer reads first.

Do not auto-open the PR before the user has chosen this option. "Open PR" requires the user's explicit consent because pushing makes the work visible to others.

### 3. Keep branch

Use when:
- The work is paused (waiting on a dependency, waiting on user clarification on a follow-up).
- The work informed a decision but is not ready to merge.
- The branch is a long-running exploration and ships in a future iteration.
- The work has intentional uncommitted state the user wants to come back to.

Difference from Discard: Keep means "I will come back to this." Discard means "I am done with this."

After Keep:
- Do not push (unless the user explicitly asks). Pushing makes the work visible and partial work usually should not be.
- Do not delete the branch.
- Capture in a comment / TODO somewhere why the branch is kept and what unblocks it.

### 4. Discard

Use when:
- The work was exploratory and the answer is "no, do not ship this."
- The work was a spike; it informed the decision but the actual implementation will be different.
- The work duplicates something already shipping on another branch.

Before Discard:
- Confirm with the user. Discard is irreversible if the branch is also deleted.
- Capture what the spike taught you in the issue / docs / `CONTEXT.md` so the discard does not lose the learning.

After Discard:
- Delete the branch locally (`git branch -D <branch>` only after the user confirms).
- Do not push and force-delete remote branches automatically; ask first if the remote also needs cleanup.

---

## Commit message discipline

### Type prefix

Use the conventional prefix:

| Prefix | When |
|---|---|
| `feat:` | New user-visible behavior |
| `feat!:` | Breaking change to user-visible behavior (major version bump) |
| `fix:` | Bug fix; existing behavior corrected |
| `refactor:` | Structural change, no behavior change |
| `docs:` | Documentation only |
| `chore:` | Tooling, dependencies, build scripts |
| `test:` | Test additions or refactors; no production behavior change |

The prefix is not decorative. Tools (changelog generation, semver bump detection) read it. `feat!:` is the specific signal for "major version bump required."

### What goes in the body

Two-line message minimum for non-trivial work:
- **Subject line.** What changed, in one sentence. Imperative voice. Under 72 characters if possible.
- **Body.** Why this change exists. What it does not do. What follow-up issues, if any, exist.

A commit body that only restates the subject in more words is noise. A body that explains the why — including the why-now and why-this-shape — is what makes the commit useful six months later when someone is reading `git blame`.

### AI attribution is forbidden

Per the user's global instructions: no `🤖 Generated with Claude Code` lines, no `Co-Authored-By: Claude` trailers, no other AI markers. Commit messages read as if the user wrote them. This is a hard rule, not a preference.

### Semver bump on `npm version`

When the work warrants a version bump (per CLAUDE.md's "Versioning policy"):

| Change | Bump |
|---|---|
| Bug fix, doc/spec gap, shell compat patch, existing-behavior fix | `patch` |
| New skill, new command, new workflow phase, new invocable capability | `minor` |
| Rename, breaking signature change | `major` (commit prefix `feat!:`) |

Borderline rule: if the change primarily closes a gap in existing behavior, use `patch` even if a small new behavior is added as a side effect. If it introduces a meaningfully invocable new capability, use `minor`.

---

## Git-safety anti-patterns

These are the operations that are silently destructive — they look like a normal step but produce a state that is hard or impossible to recover from. The discipline is to refuse them unless the user has explicitly requested the operation.

### Auto-push without explicit user choice

Pushing makes the work visible to others. Until the user has chosen "Open PR" (or explicitly asked for a push), do not push. A pushed bad commit, even amended away later, leaves traces on remote and in CI history.

### `--no-verify`

Bypassing the pre-commit hook is the same shape as bypassing the test gate at Build. The pre-commit hook exists because the project decided certain checks must run before commits. Skipping it produces a commit that the project's discipline considered insufficient.

If a hook fails, the discipline is to fix the underlying issue, not to bypass the hook. The only exception is when the user explicitly says "skip the hook" — and even then, the agent should surface the cost ("the format check will not run on this commit; CI may catch it later").

### `--amend` on commits already pushed

Amending a commit changes its SHA. If the commit has been pushed, the remote and the local now have different histories at that point. Recovery requires force-push (which has its own problems) or accepting a divergent history.

Rule: amend only commits that have not been pushed. For pushed commits, create a new commit on top with the correction.

### `--amend` after a failed pre-commit hook

A particularly subtle trap. When a pre-commit hook fails, the commit did *not* happen. Running `git commit --amend` then modifies the *previous* commit, not the one you thought just failed. The fix-up message is now attached to the wrong commit, and the actual change you wanted to commit is still uncommitted.

Rule: after a hook failure, fix the issue, re-stage, and create a new commit. Do not amend.

### `git reset --hard` as a "clean up"

`reset --hard` discards uncommitted work permanently. Used carelessly it removes the user's in-progress changes that the agent did not realize were intentional.

Rule: never `reset --hard` unless the user has explicitly asked. Before any destructive operation, surface what would be lost: "this would discard the following uncommitted changes: <list>. Continue?"

### Force push to shared branches

Force-pushing `main`, `master`, `develop`, or any other shared branch overwrites history that other people have based work on. It is the single most-disruptive git operation.

Rule: refuse to force-push to shared branches. Force-push is allowed (still with warning) only to feature branches the user owns.

### Deleting branches with uncommitted state

`git branch -D` (force delete) removes a branch even if it has unmerged commits. The commits become unreachable; recovery requires `git reflog` and is not always possible.

Rule: before deleting any branch, verify that all commits on it are either merged or intentionally discarded. The "Discard" option in Finish includes this check; ad-hoc `git branch -D` does not.

---

## Edge cases

### Working tree is not clean at Finish

The user is on the "Keep branch" path and intentionally has uncommitted changes. The Finish exit gate is *not* "working tree clean for all options" — it is "working tree shows the intended state for the chosen option."

- For Local merge / Open PR: all intended changes are committed; working tree is clean.
- For Keep branch with intentional uncommitted state: working tree shows exactly the changes the user intends to leave uncommitted.
- For Discard: working tree state does not matter because the branch is being discarded; the user's intentional uncommitted changes go with it.

### Merge conflict on Local merge

Merging the feature branch into `main` produces a conflict. The discipline:

- Do not automatically resolve the conflict using either side wholesale.
- Surface the conflicting files and let the user decide the resolution.
- After resolution, re-run the full test suite on the merged state — the resolution itself can produce a state neither branch tested.
- Only then commit the merge.

### PR cannot be opened

`gh pr create` fails because the branch is not pushed, the user is not authenticated, or branch protection blocks the PR. Each failure has a different recovery:

- Not pushed: push first, then retry.
- Not authenticated: surface the auth instruction to the user (`gh auth login`); do not silently swallow.
- Branch protection: the protection is configured for a reason; report it to the user and let them decide whether to escalate.

### "Keep branch" with intentional uncommitted state

The user explicitly wants to leave a half-written file uncommitted (often a scratch / notes file). The discipline:

- Confirm with the user which files are intentionally uncommitted.
- Do not run `git add .` blindly; you would accidentally commit the scratch.
- The Finish exit sentence captures this: "User chose: Keep branch. Intentional uncommitted state: <files>."

### Resolve-issue caller integration

When powertasking is invoked from `mekaknight:resolve-issue`, Finish has one extra responsibility: signal back to resolve-issue for Notion status transition. The discipline:

- Powertasking still presents the four options to the user.
- After the user's choice, powertasking passes control back to resolve-issue with the outcome.
- Resolve-issue (not powertasking) handles the Notion update.

The branch decision and the issue tracker update are separate steps owned by separate skills. Powertasking does not touch Notion directly; resolve-issue does not make the branch decision.

---

## The exit gate sentence

Per `references/verification.md` evidence form:

> Ran `git status`. Observed: `<exact output>`. User chose: `<option>`. `<option-specific evidence>`.

Examples:

> Ran `git status`. Observed: `nothing to commit, working tree clean`. User chose: Open PR. Ran `gh pr create --title "..." --body "..."`. PR opened at `<url>`.

> Ran `git status`. Observed: `On branch feature/x, your branch is ahead of 'origin/main' by 3 commits, working tree clean`. User chose: Local merge. Ran `git checkout main && git merge --no-ff feature/x`. Merge succeeded. Ran `pnpm test`. Observed: `Tests: 47 passed`.

> Ran `git status`. Observed: `On branch feature/spike, untracked: notes.md`. User chose: Keep branch with intentional uncommitted state (notes.md). No push, no merge.

> User chose: Discard. Confirmed irreversible. Ran `git checkout main && git branch -D feature/spike`. Observed: `Deleted branch feature/spike (was <sha>)`.

If the sentence cannot be stated with the option and the evidence, Finish has not exited.

---

## Relationship to powertasking's other phases

- **Verify** must be green before Finish runs. A Finish on a red state ships broken code, and "fix it in main" is the wrong place to do that work.
- **Peer-review** must have its Critical and Important findings resolved or explicitly deferred before Finish. A Finish that bypasses unresolved Critical findings is the most expensive kind of shortcut.
- **Build** produced the commits Finish either pushes, merges, or discards. The commit messages from Build determine the changelog and the PR description, so Build's commit discipline (type prefixes, no AI attribution, body explains why) is part of what makes Finish succeed.
- **Clarify** decided the work's purpose; Finish decides where the work ends up. If Clarify was vague, Finish often discovers the work product is not what the user wanted — at which point the right move is sometimes Discard, sometimes Keep, but rarely the merge that "would have made it look done."
