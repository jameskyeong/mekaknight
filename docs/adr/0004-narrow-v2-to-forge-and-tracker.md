# Narrow v2.0 to forge + tracker; defer lock + launch

ADR 0003 pivoted mekaknight v2.0 from a 16-week deep build to a 6-8 week lite, wrap-based architecture (lock wraps semgrep / gitleaks / supabase CLI; launch as the GO/NO-GO surface). On further reflection: the wrap approach still grows external dependencies (semgrep + gitleaks become hard prerequisites), still builds atop tools the author does not personally use day-to-day, and still leaves the value proposition unproven by dogfooding (three live company codebases returned **zero BLOCK findings** with v0.1). The wrap layer's marketing pitch ("one command, one decision") sounds clean, but it advertises another vendor's detection rather than mekaknight's own value. We decided to **narrow v2.0 further**: ship only forge (self-contained orchestrator) and the Notion tracker (link / tag / strike). lock and launch are **kept in the repo but deferred from the v2.0 marketing surface** — they remain invocable for users who want them, but the v2.0 launch story is built entirely on the surfaces the author uses every day and can demonstrate honestly.

## Considered Options

1. **Stay with ADR 0003 (B / lite wrap)** — Rejected because: wrap still requires users to install semgrep + gitleaks; the differentiated marketing surface (launch) still depends on inspection work the author does not personally rely on; and the L2 dogfooding round risks the same zero-BLOCK outcome as v0.1, leaving marketing dry a second time.

2. **Narrow to forge + tracker; defer lock + launch from the v2.0 surface** (chosen) — Ship only the surfaces the author already uses every day. lock and launch remain in the codebase as alpha utilities for users who explicitly want them, but README, marketing, and demo videos do not lead with them. v2.0 surface is forge (development orchestrator) + link/tag/strike (Notion tracker).

3. **Remove lock + launch entirely from the repo** — Rejected because: the v0.1 code works; removing it loses optionality for future users; and a "deferred" label is more honest than deletion when the future direction is uncertain.

## Consequences

- **v2.0 release scope shrinks** from 6-8 weeks to ~**1-2 weeks** of finishing touches: README polish, 1-2 demo videos focused on forge + tracker, marketplace listing. No new skill development required.
- **lock + launch SKILL.md files remain** in `skills/`. The plugin manifest continues to expose them. They are not removed from the marketplace listing — users who discover them can still invoke them. But the README and marketing surface do not lead with them.
- **Marketing pitch shifts** from "production-readiness gate" to **"a development orchestrator that knows when to slow down, plus an issue tracker that reads like a problem statement"** — the v1 value, sharpened.
- **Dogfooding becomes natural**: forge is what the author uses to build features; the tracker is what the author uses to manage them. Twitter / demo content writes itself from real usage rather than synthetic security checks.
- **v2.1+ revisit**: if post-launch users ask for production-readiness work, lock + launch are already in place to grow. If they don't, the surfaces age out gracefully.
- **ADR 0003 is superseded** by this decision; the lite-wrap plan in `docs/plans/v2-lite-pivot.md` is retired (kept as historical record of the path considered).
- **docs that must be updated**: README.md, CONTEXT.md, v2-roadmap.md, v2-skill-catalog.md, v2-vision.md, v2-marketing.md — all need re-alignment to the narrowed v2.0 surface.
- The "vibe coding" marketing angle softens — without lock/launch as the lead, "vibe coding" is no longer the central audience cue. v2.0 audience is "developers who want a disciplined Claude Code workflow and a humane issue tracker".

## Status of ADR 0003

ADR 0003 (B / lite wrap pivot) is **superseded** by this ADR. The reasoning chain — "depth duplicates existing tools, so wrap them" — was correct as far as it went, but did not address the more fundamental question: does the author actually use the inspection layer at all? They do not. Building wrap-or-deep around inspection the author does not personally use produces a tool of uncertain provenance. v2.0 ships the surfaces the author uses every day.
