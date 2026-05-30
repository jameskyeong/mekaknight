# v2.0 launch TODO

> **Created**: 2026-05-30 (집)
> **Status**: scope finalized per [ADR 0004](../adr/0004-narrow-v2-to-forge-and-tracker.md), version `2.0.0-rc.1` pushed
> **What's left**: marketing assets + launch execution
> **Open this file when**: returning to launch prep work

---

## 1. Where we are

- Brand + namespace: `mekaknight` (was jameskill) — done
- v2.0 marketing surface: `/forge` + `/link` + `/tag` + `/strike`
- Off-surface alpha utilities: `/lock` + `/launch` (v0.1, kept invocable, not headlined)
- Tagline: "A disciplined Claude Code workflow + an issue tracker that reads like a problem statement"
- Version: `2.0.0-rc.1` (release candidate; rebrand + narrow pivot complete)
- All decision/strategy docs aligned to the narrowed surface
- GitHub repo: `https://github.com/jameskyeong/mekaknight`

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
- **lock + launch README treatment** — current: small "Alpha utilities" section. Confirm or hide entirely from README.
- **v2.1+ direction trigger** — what user signal flips lock/launch from "alpha" to "real work"? E.g., "≥5 GitHub issues requesting deeper checks within 4 weeks".
- **marketing budget** — domain + handle reservations are paid. Worth doing?
- **Anthropic submission process** — find current docs / PR template before drafting marketplace copy.

---

## 4. Reference

- ADR 0001 — self-contained forge orchestrator
- ADR 0002 — mekaknight rebrand
- ADR 0003 — lite wrap pivot (superseded by 0004)
- ADR 0004 — narrow v2.0 to forge + tracker (current scope)
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
