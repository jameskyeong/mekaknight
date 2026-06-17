# Communication Style — Inline-Gloss Discipline

Reference for powertasking's **cross-cutting communication gate**. `SKILL.md` defines the surface rule (gloss non-obvious identifiers inline on first mention, 5–15 char gloss, three forbidden shapes). This document is the deeper discipline — why dense identifier-only output breaks user understanding, the subtle ways agents fall into it, what to do at each phase boundary, and the edge cases.

The non-negotiable: **a user-facing summary is for the user, not for the code.** If the reader cannot follow the change without opening the file, the summary failed — regardless of how technically accurate the identifiers are.

---

## The core principle

Powertasking produces user-facing text at almost every phase boundary: Clarify questions, Route decisions, Build summaries, Peer-review reports, DIAGNOSE conclusions, Verify reports, Retrospective proposals, Finish notes. Each of these is the **only window** the user has into what just happened — they did not watch the tool calls, they did not read the diff line-by-line, they are not (yet) holding the code's vocabulary in their head.

When powertasking writes `combineQuality 에서 curvature 분기 제거`, the user sees four atoms — three of them opaque without grepping the codebase. The technical content is correct; the communication is broken. The fix is not to dumb the content down. The fix is to **carry the identifier's meaning forward in the prose** so the reader does not have to re-derive it.

A glossed summary has three components:

1. **The identifier** — exact, copy-pasteable, so the user can grep for it.
2. **A short parenthetical** — 5–15 characters in the response language, naming what the identifier *is* in this codebase.
3. **The action or claim** — what was done, decided, observed.

If component 2 is missing on first mention, the summary is asserting expertise the reader does not yet have.

---

## What counts as "non-obvious"

The rule applies to identifiers and abbreviations the reader cannot decode from natural-language intuition alone. Categories:

| Category | Examples | Gloss? |
|---|---|---|
| Internal function (project-specific) | `combineQuality`, `analyzeStroke`, `applyMigration` | **Yes** |
| Internal variable / parameter | `dirCos`, `curvDiffAbs`, `zeroPx`, `guideKAbs` | **Yes** |
| Single-letter or symbol | `κ`, `θ`, `Δt`, `λ` | **Yes** |
| Project-coined abbreviation | `RLS`, `anon-key`, `webhook-sig`, `RED/GREEN` | **Yes** |
| Domain term introduced this session | "spiral bleed", "corner leniency" | **Yes (first time)** |
| Standard programming term | `test`, `import`, `commit`, `null`, `branch` | **No** |
| Common framework API | `useState`, `fetch`, `console.log` | **No** |
| Term already used earlier this conversation | (any) | **No (already established)** |
| Term defined in repo CONTEXT.md the user already read | (any) | **No (gloss optional)** |

When uncertain, gloss. The cost of an unnecessary 8-character parenthetical is near zero; the cost of unglossed jargon that loses the reader is much higher.

---

## Gloss-length budget

The gloss is a **navigation aid, not a definition**. It should fit in the reader's parsing flow without breaking the sentence.

- **5–15 characters** in the response language. Korean: roughly 3–7 syllables.
- One concept per gloss. If you need two clauses, the parenthetical is too long — split the sentence instead.
- No nested parentheses inside the gloss.
- No re-introducing the identifier inside its own gloss (`combineQuality(combineQuality 함수)` — banned, see Anti-patterns).

Examples within budget:

| Identifier | Good gloss | Why |
|---|---|---|
| `combineQuality` | `(품질 등급 결합 함수)` — 13 chars | Names the role |
| `dirCos` | `(방향 코사인 유사도)` — 10 chars | Expands the abbreviation |
| `κ` | `(곡률)` — 2 chars | Symbol → word |
| `zeroPx` | `(매칭 임계 거리)` — 8 chars | Translates the constant |
| `RLS` | `(행 단위 권한)` — 6 chars | Korean for Row-Level Security |

Over-budget examples to avoid:

- `combineQuality(거리·방향·곡률을 모두 받아 stroke 의 품질 등급을 산출하는 핵심 함수)` — 35 chars, too verbose; split into prose
- `dirCos(가이드 stroke 의 tangent vector 와 사용자 stroke 의 tangent vector 간 cosine similarity)` — wraps a line; rewrite as a sentence

When the natural gloss exceeds budget, **lift the explanation into the prose itself**:

```
✗ combineQuality(거리·방향·곡률을 종합해 등급 매기는 함수) 에서 curvature 분기 제거
✓ combineQuality(품질 등급 함수) 에서 curvature 분기 제거 — 이제 거리와 방향 두 축만으로 판정함
```

---

## Per-phase patterns

Each powertasking phase produces different shapes of user-facing text. The rule is the same; the application differs.

### Clarify

Questions about the codebase will often mention internal terms. Gloss them so the user can answer without grepping.

```
✗ analyzeStroke 가 spiral-bleed 도 거르나요, 아니면 따로 처리해야 하나요?
✓ analyzeStroke(stroke 분석 함수) 가 spiral-bleed(나선형 잔존 신호) 도 거르나요, 아니면 따로 처리해야 하나요?
```

### Build (RED / GREEN / REFACTOR summaries)

Test names and identifiers being introduced both need glosses. The reader has not seen the file yet.

```
✗ RED: test_no_user_kappa_required 작성 완료, combineQuality 호출 시 curvDiffAbs 인자 빠짐 확인
✓ RED: test_no_user_kappa_required(곡률 인자 제거 후에도 동작해야 한다는 회귀 테스트) 작성 완료. combineQuality(품질 등급 함수) 호출 시 curvDiffAbs(곡률 차이 절대값) 인자 누락 확인
```

### Peer-review (reporting findings)

Severity claims that reference internal symbols must gloss them or the severity is unparseable.

```
✗ Important: combineQuality 의 guideKAbs 기본값이 0 일 때 corner-leniency 분기 누락
✓ Important: combineQuality(품질 등급 함수) 의 guideKAbs(가이드 곡률 절대값) 기본값이 0 일 때 corner-leniency(코너 부근 판정 완화) 분기 누락
```

### DIAGNOSE (root-cause explanations)

The hypothesis-confirm step often involves chains of identifiers. Glosses keep the chain followable.

```
✗ finite-difference 노이즈가 per-point user κ 를 흔들어 combineQuality 가 강제 bad 등급을 매김
✓ finite-difference(인접 점 차분으로 곡률 추정하는 방식) 의 노이즈가 per-point user κ(각 sample 의 사용자 stroke 곡률) 를 흔들어, combineQuality(품질 등급 함수) 가 강제 bad 등급을 매김
```

### Retrospective (proposing deposits)

ADR proposals, reference updates, and CONTEXT.md additions are themselves user-facing summaries. Apply the rule to the proposal *and* to the prose around it.

```
✗ ADR 제안: combineQuality 의 curvature 분기 제거 사유 기록
✓ ADR 제안: combineQuality(품질 등급 결합 함수) 에서 곡률(curvature) 비교를 제거한 사유 기록
```

### Finish (commit summary)

Commit messages themselves follow project convention — no gloss in the subject line. But the user-facing summary that surrounds the commit *does* need glosses.

```
✗ Built: combineQuality 단순화, analyzeStroke 의 user κ 계산 제거. 커밋했음.
✓ Built: combineQuality(품질 등급 함수) 단순화 및 analyzeStroke(stroke 분석 함수) 의 user κ(사용자 곡률) 계산 제거. 커밋했음.
```

---

## Anti-patterns

### Identifier soup

Three or more consecutive un-glossed internal identifiers in one bullet or sentence. The reader's working memory collapses.

```
✗ combineQuality 에서 curvDiffAbs 인자를 빼고 analyzeStroke 에서 dirCos 계산만 유지
```

Fix: gloss the first occurrence of each, or restructure into separate bullets.

### Jargon cascades

A sentence whose only non-jargon words are syntactic connectives (`에서`, `의`, `로`, `를`). This is identifier soup's prose form.

```
✗ analyzeStroke 의 user κ 의 노이즈로 combineQuality 의 curvature 분기가 false-bad 를 유발
```

Fix: rewrite with verbs and glosses that carry meaning.

### Pseudo-explanation

Glossing an identifier with the identifier itself (or a trivial rephrasing). Tells the reader nothing.

```
✗ combineQuality(combineQuality 함수) — 0 information added
✗ dirCos(dirCos 값) — 0 information added
✗ zeroPx(zeroPx 상수) — 0 information added
```

Fix: name what the thing *does* or *represents*, not what it is syntactically.

### Glossing the obvious

Glossing terms the reader already understands. Wastes parsing budget and signals condescension.

```
✗ test(테스트) 를 import(임포트) 하고 commit(커밋) 했습니다
```

Fix: only gloss what the rule's "Yes" categories cover.

### Glossing inside code blocks

Code blocks should be valid code. Put glosses in the surrounding prose, not inside the block.

```
✗
   combineQuality(distSq, dirCos(방향 코사인 유사도), guideKAbs)

✓ 위 시그니처에서 dirCos(방향 코사인 유사도) 인자는 그대로 유지됨.
   combineQuality(distSq, dirCos, guideKAbs)
```

### Gloss drift across sessions

A term glossed one way in session A and another way in session B confuses the reader who reads both. If CONTEXT.md defines the term, **use CONTEXT.md's wording** in the gloss. If not, propose adding it during Retrospective Channel 3.

---

## Edge cases

### The user pre-established the term

If the user wrote `analyzeStroke` in their message or in an earlier turn of this conversation, treat it as established — no gloss needed on your first mention. Glossing it back is condescending.

### CONTEXT.md already defines the term

Glossing in CONTEXT.md's exact wording is acceptable but not required — the user may or may not have read CONTEXT.md recently. When in doubt, gloss the first occurrence in this response and skip subsequent ones.

### Long identifier names

A 30-character identifier (e.g., `validateStrokeAgainstGuideShape`) with a 12-character gloss makes the sentence unwieldy. Two options:

1. **Trust the name** — if the identifier itself is self-glossing (`validateStrokeAgainstGuideShape` reads in English), skip the parenthetical and explain the *role* in the surrounding prose instead.
2. **Alias it** — introduce it once with gloss, then refer to it by a short noun phrase: `validateStrokeAgainstGuideShape(검증 함수)` once, then "검증 함수" subsequently.

### Subagent output passing through powertasking

When a Peer-review subagent or DIAGNOSE subagent returns findings to powertasking, those findings *enter* user-facing text. Powertasking must gloss any unglossed identifiers in the subagent's output before relaying. Do not pass identifier soup through.

### Non-Korean responses

The rule is language-agnostic. The gloss matches the response language. Examples:

```
English: combineQuality (the quality-grade combiner) drops the curvature branch
Japanese: combineQuality(品質判定の結合関数) から curvature(曲率) 分岐を削除
```

The 5–15 character budget is in the response language's natural units (characters for CJK, words for English-style languages — aim for 1–3 words).

### Code-review and diff narration

When powertasking narrates a diff (typically in Peer-review or Verify), every identifier in the narration follows the rule. The diff itself, shown in a code block, does not.

---

## Why this rule earns its place

Without this discipline, powertasking's correctness-of-content masks failure-of-communication. The user reads "combineQuality 에서 curvature 분기 제거", accepts it because powertasking has been correct in this session before, and only later realizes — when grepping or when the next bug surfaces — that they did not actually understand what changed. The cost lands in the next session: re-reading code to recover context, asking powertasking to re-explain, or worst, approving a change whose implications the user mis-modeled.

Glossing on first mention reverses this. The reader builds the mental model alongside the prose, retains it across the session, and can grep with confidence because each identifier was anchored to its role on its first appearance.

The rule trades a few characters per identifier for a durable, shared vocabulary inside the session. That is a trade powertasking always wins.
