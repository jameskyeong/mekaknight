---
name: jameskill:workflow
description: >-
  Matt Pocock skill orchestrator — from problem understanding to verified implementation.
  Chains grill-with-docs, tdd, diagnose, prototype, to-prd, to-issues, and improve-codebase-architecture
  based on context. Use when: 'workflow', 'start working on', 'implement this',
  'fix this', 'build this'. Also invoked by tracking-issue-resolve after issue selection.
---

# Workflow — Matt Pocock Skill Orchestrator

Orchestrates Matt Pocock skills into a complete development flow: understand the problem, build it right, and leave the codebase better than you found it.

**Compound engineering guarantee:** Every workflow run improves domain docs, test coverage, and codebase structure — not just the immediate deliverable.

**Hard requirement:** This workflow requires Matt Pocock skills to be available in the current session (via plugin, user-level, or project-level installation). Phase -1 verifies this and **halts the workflow** if any required skill is missing. There is no fallback path — if a required skill cannot be invoked, the workflow stops.

---

## Phase -1: Preflight — Verify Matt Pocock skills

**Goal:** Confirm every required Matt Pocock skill is available before doing anything else.

Check whether the following skills are available in the current session by verifying each appears in the system context's available skill list:

- `grill-me`, `grill-with-docs`, `diagnose`, `prototype`, `to-prd`, `to-issues`, `tdd`, `improve-codebase-architecture`

Skills may be installed as plugins, in `~/.claude/skills/`, or in `.claude/skills/` — the installation method does not matter. What matters is that each skill can be invoked via the Skill tool.

**If any required skill is missing, STOP IMMEDIATELY.** Do not proceed to any other phase. Report to the user:

> Matt Pocock 스킬이 설치되지 않아 workflow를 진행할 수 없습니다.
>
> **누락된 스킬:** [누락 목록]
>
> **설치 방법:**
> - Matt Pocock 스킬 플러그인을 설치하거나, `/mattpocock-skills:setup-matt-pocock-skills`를 실행해주세요.
> - 공식 레포: [mattpocock/skills](https://github.com/mattpocock/skills)
>
> 설치 완료 후 `/jameskill:workflow`를 다시 실행해주세요.

Proceed to Phase 0 only when all required skills are confirmed available.

---

## Phase 0: Clarify — `grill-me`

**Goal:** Reach shared understanding of what the user actually wants.

**MUST invoke `grill-me` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report to the user — do NOT proceed manually.

- Interview the user until every branch of the decision tree is resolved
- If invoked from `jameskill:tracking-issue-resolve`, use the issue title + body as the starting context
- If invoked standalone, use whatever the user provided

**Skip conditions:**
- 사용자가 명시적으로 "skip clarify", "요구사항 확실해", "브레인스토밍 스킵" 등을 요청한 경우만 허용
- 에이전트가 자체적으로 "충분하다"고 판단하여 스킵하는 것은 금지

**Output:** A clear, agreed-upon problem statement.

### Phase 0 exit gate: 모호성 제거 검증

grill-me 완료 후, Phase 1로 넘어가기 전에 반드시 아래 체크리스트를 수행한다.

1. **남은 모호성을 명시적으로 나열한다:**
   - 미결정 사항 (선택지가 열려있는 항목)
   - 범위가 불명확한 항목 (어디까지 해야 하는지 불분명)
   - 암묵적 가정 (명시적으로 확인되지 않은 전제)
   - 용어 혼동 가능성 (같은 단어가 다른 의미로 쓰일 수 있는 경우)
2. **나열된 항목이 1개 이상이면** — 사용자에게 보여주고, 각 항목이 해소될 때까지 grill-me를 계속한다. 모든 항목이 해소되면 다시 1번으로 돌아가 재검증한다.
3. **나열된 항목이 0개가 되어야** Phase 1로 진입한다.

---

## Phase 1: Grill — `grill-with-docs`

**Goal:** Validate the clarified requirements against the project's domain model and documented decisions.

**MUST invoke `grill-with-docs` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.

- Challenge the plan against CONTEXT.md and existing ADRs
- Sharpen terminology to match the project's ubiquitous language
- Update CONTEXT.md / ADRs inline as decisions crystallize

**Compound effect:** Domain documentation gets refined every run.

**Output:** A validated implementation direction with updated docs.

### Phase 1 exit gate: CONTEXT.md 보장

grill-with-docs 완료 후, Phase 2로 넘어가기 전에 반드시 아래 체크리스트를 수행한다.

1. **CONTEXT.md 존재 확인** — 프로젝트 루트에 `CONTEXT.md`(또는 `CONTEXT-MAP.md`)가 있는지 확인한다. 있으면 이 게이트를 통과한다.
2. **없으면, Phase 1에서 다룬 도메인 항목을 명시적으로 나열한다:**
   - 도메인 용어 (프로젝트 고유 개념, 일반 프로그래밍 용어 제외)
   - 용어 간 관계
   - 해소된 모호성
   - ADR로 기록할 만한 결정
3. **나열된 항목이 1개 이상이면** — grill-with-docs의 [CONTEXT-FORMAT.md](mdc:mattpocock-skills/skills/engineering/grill-with-docs/CONTEXT-FORMAT.md) 형식에 맞춰 `CONTEXT.md`를 작성한다. 작성 후 어떤 항목을 넣었는지 사용자에게 보고한다.
4. **나열된 항목이 0개면** — 도메인 컨텍스트가 발생하지 않았음을 사용자에게 보고하고, CONTEXT.md 없이 Phase 2로 진입한다.

---

## Phase 2: Route

Based on Phase 1 output, determine the nature of the work and route accordingly. **Only one route is taken per run.**

### Route A: Bug → `diagnose`

**Signal:** Error reports, stack traces, "it used to work", reproducible broken behavior.

**MUST invoke `diagnose` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow its discipline:
1. Reproduce the bug
2. Minimize the reproduction
3. Form a hypothesis
4. Instrument to verify
5. Fix
6. Regression test

After diagnose completes, proceed to **Phase 3.5** (skip Phase 3 — diagnose already includes the fix + test).

### Route B: Exploration → `prototype`

**Signal:** UI shape is uncertain, data model needs experimentation, "I'm not sure how this should work".

**MUST invoke `prototype` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. It will either:
- Build a runnable terminal app (for state/logic questions)
- Generate multiple UI variations (for design questions)

After the user picks a direction from the prototype, proceed to **Phase 3**.

### Route C: Large feature → `to-prd` → `to-issues`

**Signal:** Phase 1 output contains 3+ distinct tasks, spans multiple modules, or would take multiple sessions.

1. **MUST invoke `to-prd` via the Skill tool** to formalize the requirements into a PRD. If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.
2. **MUST invoke `to-issues` via the Skill tool** to break the PRD into vertical-slice issues. If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.
3. Present the issue list to the user
4. Inform the user they can register issues via `/jameskill:tracking-issue-report` and work each one via `/jameskill:workflow` individually
5. **Stop here** — do not attempt to implement all issues in one run

### Route D: Clear feature → Phase 3 directly

**Signal:** None of the above. Requirements are clear, scope is contained, ready to build.

Proceed directly to **Phase 3**.

---

## Phase 3: Build — `tdd`

**Goal:** Implement the solution with test-driven development.

**MUST invoke `tdd` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow the red-green-refactor loop strictly:
1. **RED** — Write a failing test first
2. **GREEN** — Write minimal code to make it pass
3. **REFACTOR** — Clean up while keeping tests green
4. Repeat until the feature is complete

**Skip conditions:**
- UI-only work with no testable logic (per project CLAUDE.md: "No tests for UI-only components")
- Route A already completed fix + test via diagnose

**Output:** Working implementation with tests.

---

## Phase 3.5: Architecture — `improve-codebase-architecture`

**Goal:** Check whether the new code fits well structurally, and fix what can be fixed now.

**MUST invoke `improve-codebase-architecture` via the Skill tool**, scoped to the files changed in Phase 3 (or Route A). If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.

Review results and act:

| Finding | Action |
|---|---|
| In scope of current work | Fix immediately (loop back to Phase 3 tdd for the fix) |
| Out of scope, small (1-2 lines) | Fix immediately |
| Out of scope, large | Note for the user — suggest `/jameskill:tracking-issue-report` to track separately |

**Compound effect:** Codebase architecture improves incrementally with every workflow run.

**Output:** Cleaner codebase + list of deferred improvements (if any).

---

## Phase 4: Review — Two-Axis Code Review

**Goal:** Two-axis code review before declaring done. Standards and Spec are reviewed independently so one axis cannot mask the other.

> **Note:** Matt Pocock의 `review` 스킬이 현재 `in-progress` 상태로 개발 중입니다. 해당 스킬이 stable (`skills/engineering/`)로 승격되면, 이 Phase를 Skill 호출로 전환하세요. 그때까지는 아래 인라인 프로세스를 따릅니다.

### 4.1: Determine the diff

Capture the changes made since this workflow started. Compare the current state against the commit where Phase 3 (or Route A's diagnose) began, using the merge-base comparison. Also note the commit list for context.

### 4.2: Collect review sources

**Standards sources** — any project documents that define how code should be written:
- Project instruction files (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`)
- Domain documentation (`CONTEXT.md`, per-module context files)
- Architectural decisions (`docs/adr/`)
- Machine-enforced standards (linter/formatter configs) — note them but don't re-check what tooling already enforces

**Spec source** — what was agreed to build:
- The problem statement from Phase 0-1 (grill-me + grill-with-docs output)
- If invoked from tracking-issue-resolve: the original issue title + body
- Issue references in commit messages
- PRD from Route C if applicable

### 4.3: Run two reviews in parallel sub-agents

Spawn two `general-purpose` sub-agents simultaneously. They must not share context.

**Standards sub-agent:** Read the standards docs found in 4.2, then read the diff. Report every place the diff violates a documented standard. Cite the standard (file + the rule). Distinguish hard violations from judgement calls. Skip anything tooling enforces. Under 400 words.

**Spec sub-agent:** Read the spec from 4.2, then read the diff. Report: (a) requirements the spec asked for that are missing or partial; (b) behavior in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words.

### 4.4: Aggregate and act

Present the two reports under `## Standards` and `## Spec` headings. Do **not** merge or rerank — keep axes separate.

| Review result | Action |
|---|---|
| Hard violation found | Fix it, loop back to Phase 3 tdd |
| Judgement call flagged | Present to user for decision |
| Both axes pass | Proceed to Phase 5 |

**Output:** Standards + Spec review report, all violations resolved.

---

## Phase 5: Verify

**Goal:** Mechanical verification that nothing is broken.

Run the project's verification suite. Detect which checks are available from the project configuration and run them all:

- **Type checking** — ensure the codebase compiles without type errors
- **Tests** — run the full test suite (or the relevant subset if the project is large)
- **Lint/format** — verify code style and formatting rules pass

If the project has a single command that runs all checks, prefer that over running individual tools.

If any check fails, fix the issue and re-run from Phase 5 (do not re-run earlier phases unless the fix is substantial).

**Output:** All checks green. Work is complete.

---

## Caller integration

### From `jameskill:tracking-issue-resolve`

When invoked from tracking-issue-resolve:
- Phase 0 receives the issue title + body as starting context
- All phases proceed normally
- On completion, control returns to tracking-issue-resolve for status transition + memo

### Standalone usage

When invoked directly via `/jameskill:workflow`:
- User provides the problem/feature description as the argument
- All phases proceed normally
- On completion, summarize what was done

---

## Abort handling

If the user interrupts at any phase:
- Work completed in prior phases (docs updates, tests, code) persists in the working tree
- The user can resume by running `/jameskill:workflow` again with the same context
- No automatic state tracking — the user decides where to pick up
