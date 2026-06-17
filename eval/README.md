# mekaknight — eval discipline (v1)

A **static check + golden fixture** regression net for the skill prose. Catches drift between what each skill *declares* it does (cross-cutting gates, inline-gloss rule, banned-language list) and what its content actually contains.

**v1 limit**: this does NOT invoke `/powertasking` headlessly. It checks the skill files themselves + hand-written fixture samples representing ideal powertasking output. Real session evals (running `claude -p` against fixture prompts) are v2.

See [ADR 0009](../docs/adr/0009-eval-discipline-v1.md) for the static-vs-session-eval scoping decision.

---

## Run

```bash
npm run eval
```

Exit code is 1 if any check fails. Also runs automatically via `prepublishOnly` — `npm publish` will refuse to publish a failing build.

---

## Layout

```
eval/
├── README.md                       ← this file
├── run.mjs                         ← orchestrator
├── checks/                         ← reusable check modules
│   ├── no-banned-phrases.mjs       ← powertasking verification banned soft-language
│   ├── inline-gloss-discipline.mjs ← first-mention gloss + identifier-soup detection
│   ├── version-sync.mjs            ← package.json ↔ marketplace.json
│   ├── link-validity.mjs           ← markdown link target existence
│   └── cross-cutting-gates-present.mjs ← skills declare/inherit powertasking gates
└── fixtures/                       ← hand-written sample outputs
    ├── good-build-summary.md       ← positive — should pass declared checks
    ├── good-diagnose-conclusion.md ← positive
    ├── good-peer-review-finding.md ← positive
    ├── bad-banned-phrase.md        ← negative — must fail no-banned-phrases
    └── bad-identifier-soup.md      ← negative — must fail inline-gloss-discipline
```

---

## How checks are wired

Three runner buckets:

| Bucket | What it does | Check shape required |
|---|---|---|
| **Fixture checks** | Apply per-fixture checks declared in fixture frontmatter | `export function check(content) -> { ok, findings }` |
| **File link checks** | Walk `skills/`, `docs/`, root `*.md`; verify link targets exist | `export async function checkFile(filePath, content) -> { ok, findings }` |
| **Repo checks** | Inspect the repo as a whole (cross-file invariants) | `export async function checkRepo(rootDir) -> { ok, findings }` |

A check module exports its `id` (string), a `description`, and **one** of `check` / `checkFile` / `checkRepo` (the runner picks based on what's exported).

---

## Fixture frontmatter

Positive fixtures (output the eval *expects to pass* the listed checks):

```yaml
---
type: positive
checks:
  - no-banned-phrases
  - inline-gloss-discipline
---
```

Negative fixtures (output crafted to *trigger* a specific check — runner counts FAIL as success):

```yaml
---
type: negative
expectFail: inline-gloss-discipline
---
```

Negative fixtures are the unit tests for the checks themselves. If you change a check, make sure its negative fixture still triggers.

---

## Adding a new check

1. Drop a `.mjs` file in `eval/checks/`.
2. Export `id`, `description`, and one of `check` / `checkFile` / `checkRepo`.
3. If it's a fixture check (`check`), add at least one negative fixture in `eval/fixtures/` declaring `expectFail: <new-id>` so the check itself is verified.
4. Wire any positive fixtures that should pass it (add the id to their `checks:` list).
5. `npm run eval` — confirm new check appears in the results table.

---

## Adding a new fixture

1. Drop a markdown file in `eval/fixtures/` with the frontmatter shown above.
2. Make the body realistic — a real shape of powertasking output, not synthetic test data.
3. `npm run eval` — confirm it runs and passes (positive) or triggers (negative) the declared checks.

---

## Why static + fixtures (and not real session eval) for v1

A "real" eval would call `claude -p "<prompt>"` against each fixture, capture powertasking's output, and apply the same checks. We deliberately deferred that to v2:

- **API cost** — each fixture is a real Claude session.
- **Non-determinism** — same prompt produces different outputs; check criteria must be structural, which is harder to write.
- **Slow** — multi-minute runs vs sub-second static checks.

v1 catches the high-value-low-cost drift: SKILL.md files contradicting their own declared rules, broken cross-references, supplementary skills missing inherited gates, version desync. v2 will add real-session evals on top of the same check library — checks are deliberately written to take a plain content string so they apply to both fixture text and session output.
