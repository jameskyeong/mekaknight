# v2.0 launch TODO

> **Created**: 2026-05-30 (집)
> **Status**: scope finalized per [ADR 0004](../adr/0004-narrow-v2-to-forge-and-tracker.md); version regressed from `rc.1` to the `alpha.4-6` cycle to ship genuine depth before claiming release-candidate readiness; currently `2.0.0-alpha.6`.
> **What's left**: marketing assets + launch execution (depth work below is now done).
> **Open this file when**: returning to launch prep work

---

## 1. Where we are

- Brand + namespace: `mekaknight` (was jameskill) — done
- v2.0 marketing surface: `/forge` + `/link` + `/tag` + `/strike`
- Off-surface alpha utilities: `/lock` + `/launch` (v0.1, kept invocable, not headlined; Next.js framework assumption now disclosed in lock SKILL.md + README)
- Tagline: "A disciplined Claude Code workflow + an issue tracker that reads like a problem statement"
- Version: `2.0.0-alpha.6` (re-entered alpha after `rc.1` — see "Why we regressed" below)
- All decision/strategy docs aligned to the narrowed surface
- GitHub repo: `https://github.com/jameskyeong/mekaknight`

### Why we regressed `rc.1` → `alpha.4-6`

Hit `2.0.0-rc.1` at 09:13 on 2026-05-30 thinking the rebrand + narrow pivot was the last step. Re-examined depth in the same day and judged forge wasn't actually release-candidate-ready. Bumped back down and shipped the missing depth across the next several alphas. Done before re-entering RC:

- **forge depth references** (ADR 0005) — `references/` library across Clarify, Build (TDD), Peer-review, Verify, PLAN, Finish, subagent-patterns. ~2200 lines of in-repo discipline replacing previous external-skill dependencies.
- **4-way route expansion** (ADR 0006) — added DIAGNOSE (bug-first) and PROTOTYPE (throwaway exploration) alongside DIRECT and PLAN, each with its own phase shape and reference module.
- **Retrospective phase** (ADR 0007) — closed the gap between the "compound engineering" positioning and what forge actually executed. Three new auto-prompted deposit channels: ADR / discipline references / CONTEXT.md.
- **Audit-driven supplementary fixes** — `/strike` JSON-payload construction via `jq -n --arg` so user-content special chars don't break the curl, shared auto-grouping algorithm at `skills/issue-references/grouping.md` consumed by both `/tag` and `/strike`, `/lock` framework assumption disclosed.
- **Compound-engineering positioning resolution** (ADR 0008) — EveryInc's plugin holds the term in the Claude Code marketplace; mekaknight keeps the term but as "compound engineering, in one skill" architectural variant. Customer-facing docs (README, CLAUDE.md) speak only about what we do; internal docs (CONTEXT.md glossary, ADR, competitive-landscape, vision, skill-catalog) carry attribution.
- **Forge frontmatter / phase chain** — every doc that lists forge's phase chain now includes route + retrospective (README, CLAUDE.md, CONTEXT.md, v2-skill-catalog, v2-vision, v2-roadmap, v2-marketing).

Next RC bump is a real one — these items were the gap.

---

## 2. Remaining tasks

### A. Demo videos (user-driven, recording required)

| # | Demo | Length | Status |
|---|---|---|---|
| 1 | `/forge` end-to-end on a real feature — author's actual workflow | ~2 min | TODO |
| 2 | `/tag` parses a Slack-style blob → grouped Notion issues; `/strike` resolves one | ~1-2 min | TODO |
| 3 (optional) | `/lock` + `/launch` briefly shown as "available, not the headline" | ~30 sec | TODO |

**Blocker for marketing copy**: screenshots / GIF stills come from these videos. Marketplace copy + Twitter thread embed visuals.

### B. Written marketing assets (Claude can draft when needed)

| Item | Notes | Status |
|---|---|---|
| `docs/marketplace-copy.md` | Tagline + short/long descriptions + categories + install command + screenshot placeholders. Paste-ready for Anthropic + claudemarketplaces.com submission forms. | TODO |
| Twitter / X launch thread | 5-8 tweet thread. Lead with forge demo GIF. | TODO |
| Show HN post | Title + body. Tuesday 09:00 PST. | TODO |
| Korean dev community post | 1 article for Korean readers. Inflearn / Discord channels. | TODO |
| Reddit posts | r/ClaudeAI + r/programming. Variants of HN body. | TODO |

### C. Submission / external actions (user-driven)

| Item | Notes |
|---|---|
| Anthropic official marketplace submission | Find current submission process (PR? form?). Use `docs/marketplace-copy.md`. |
| claudemarketplaces.com submission | Submit form on their site. |
| Domain check + purchase | `mekaknight.dev` / `.com` availability — see if worth $$. |
| Twitter handle `@mekaknight` | Reserve. |
| Tag v2.0.0 on GitHub | After demos + copy ready, before launch day. |

### D. Launch day (Tuesday 09:00 PST — date TBD)

- [ ] Post to HN (Show HN)
- [ ] Post to PH (Product Hunt)
- [ ] Post to Reddit r/ClaudeAI, r/programming
- [ ] Twitter / X thread
- [ ] Korean dev community
- [ ] Pin GitHub README to a friendly "first 5 min" version

### E. Post-launch week 1

- [ ] Daily Twitter follow-up — user feedback → fix → tweet
- [ ] Monitor GitHub issues + respond fast
- [ ] HN comment thread engagement (4-8 hour window post-submit is critical)
- [ ] Track install counts / star rate to inform v2.1 direction

---

## 3. Open decisions (settle before launch day)

- **Launch date target** — pick a Tuesday. Recommend ≥2 weeks out so demos can be recorded comfortably.
- **lock + launch README treatment** — current: small "Alpha utilities" section under "Supplementary skills". Confirm or hide entirely from README.
- **v2.1+ direction trigger** — what user signal flips lock/launch from "alpha" to "real work"? E.g., "≥5 GitHub issues requesting deeper checks within 4 weeks".
- **marketing budget** — domain + handle reservations are paid. Worth doing?
- **Anthropic submission process** — find current docs / PR template before drafting marketplace copy.
- **Retrospective phase dogfooding signal** — ADR 0007 says the per-channel thresholds (ADR-worthy / reference-update-worthy / glossary-worthy) are pre-dogfood. Need 5-10 real forge sessions to validate. If thresholds prove wrong (e.g., performative deposits sneak through, or genuine deposits get filtered out), patch before public RC.
- **DIRECT-route Clarify persistence + Peer-review meta-extraction** — ADR 0007 status note explicitly defers these as v2.0 out-of-scope. Reaffirm or pull into RC scope based on dogfood findings.
- **Compound engineering attribution in marketing copy** — README/CLAUDE.md drop EveryInc name-drops; HN/PH/Reddit launch text should still have the "in one skill" framing prepared but decide whether to lead with it or only deploy it in comments when "is this a knockoff?" surfaces.

---

## 4. Reference

- ADR 0001 — self-contained forge orchestrator
- ADR 0002 — mekaknight rebrand
- ADR 0003 — lite wrap pivot (superseded by 0004)
- ADR 0004 — narrow v2.0 to forge + tracker (current scope)
- ADR 0005 — forge depth via in-repo references library
- ADR 0006 — expand forge to 4 routes (DIRECT/PLAN + DIAGNOSE/PROTOTYPE)
- ADR 0007 — Retrospective phase for compound-engineering deposits
- ADR 0008 — compound-engineering term overlap with EveryInc resolved (term kept; attribution internal-only)
- Plan v2-narrow-pivot.md — same content as this TODO but at decision time; this file is the working list

---

## 5. Resume instructions

When picking this back up, the natural order is:
1. Record demo videos 1 + 2 (B requires this)
2. Draft marketplace copy + Twitter/HN/Korean blog using demo stills
3. Submit marketplace listings
4. Reserve domain/handle if budget allows
5. Pick launch date + tag v2.0.0
6. Launch day execution
7. Week-1 follow-up
