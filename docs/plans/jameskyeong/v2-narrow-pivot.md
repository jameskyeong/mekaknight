# Plan — v2.0 narrow pivot (forge + tracker only, ~1-2 weeks)

> **Decision**: ADR 0004 — narrow v2.0 to forge + tracker; defer lock + launch
> **Supersedes**: `docs/plans/jameskyeong/v2-lite-pivot.md` (B / wrap pivot — retired as historical record)
> **Basis**: wrap layer still requires external tools the author doesn't use; v2.0 ships only what's dogfooded daily
> **Target ship**: ~1-2 weeks from today

---

## 1. Scope

### In v2.0 surface (marketing + README lead)
- `/forge` — self-contained development orchestrator
- `/link`, `/tag`, `/strike` — Notion issue tracker
- `/workflow-external` — legacy preserved, mentioned in migration notes only

### In repo, off the marketing surface (alpha utilities)
- `/lock` — v0.1 inspection (Supabase RLS + secret + Stripe webhook). Stays invocable. Not featured in README hero or demo videos. Reachable via plugin command list for users who explicitly search for it.
- `/launch` — v0.1 GO/NO-GO verdict. Same treatment.

### Deferred to v2.1+
- lock v0.2 (wrap or otherwise)
- polish (AI Score)
- dedupe + cohesion-check
- launch-check umbrella

## 2. Work to ship v2.0 (~1-2 weeks)

### Week 1 — doc + marketing alignment
- [ ] README.md — remove lock/launch from the lead pitch; restructure around forge + tracker. Add a small "Experimental" subsection at the bottom mentioning lock/launch are reachable but not the v2.0 story.
- [ ] CONTEXT.md — adjust lock + launch entries to flag "v2.0 alpha, off marketing surface".
- [ ] Strategy docs (`v2-roadmap.md`, `v2-skill-catalog.md`, `v2-vision.md`, `v2-marketing.md`) — rewrite to reflect the narrowed surface.
- [ ] Bump version: `2.0.0-alpha.3` → `2.0.0-rc.1` (release candidate; no new code, but doc/scope change is significant).

### Week 2 — demos + launch prep
- [ ] **Demo video 1**: forge end-to-end on a small real feature (~2 min). The author's actual workflow.
- [ ] **Demo video 2**: tracker — `/tag` parsing a Slack-style blob into grouped Notion issues, then `/strike` resolving one (~1-2 min).
- [ ] (Optional) Demo video 3: lock + launch shown briefly as "available if you want, but not the headline" (~30s).
- [ ] marketplace listing copy (Anthropic official + claudemarketplaces.com).
- [ ] Korean dev community post (1 article).
- [ ] X / Twitter thread draft.

### Ship
- [ ] Tuesday 09:00 PST (HN golden time)
- [ ] HN Show HN / PH / Reddit r/ClaudeAI + r/programming / X thread / Korean dev community simultaneous
- [ ] Tag v2.0.0 on GitHub
- [ ] Post-launch week-1 daily follow-up on Twitter (user feedback → fix → tweet)

## 3. Marketing pitch (new)

| | Old (ADR 0003) | New (this ADR) |
|---|---|---|
| Tagline | "One command, one decision — production-readiness gate" | "A disciplined Claude Code workflow + an issue tracker that reads like a problem statement" |
| Lead skill | launch (verdict) | forge (orchestrator) |
| Hero demo | `/launch` says NO-GO | `/forge` builds a real feature with strict TDD |
| Audience | vibe coders shipping fast | developers wanting Claude Code discipline + sane issue tracking |

## 4. Dogfooding strategy

The dogfooding question that destabilized B (lock had 0 BLOCK across 3 codebases) does not apply here — the author uses forge to build features and the tracker to manage them every day. Twitter / blog content is the author's real session log, not synthetic checks.

| Skill | Dogfooding source |
|---|---|
| forge | The author's own feature work in mekaknight itself + side projects |
| link/tag/strike | The author's existing Notion issue tracker (already in production use) |

## 5. lock + launch — graceful state

- SKILL.md files unchanged from v0.1
- Plugin manifest still lists them
- README has a small "Available but not the v2.0 headline" subsection at the bottom
- If post-launch users ask for them, v2.1 revisits — wrap, deep, or sunset
- If users don't ask, they age out gracefully without removal

## 6. Open questions

- **Version label** — `2.0.0-rc.1` or stay on `alpha.3` until launch? Recommend rc.1 since scope is now stable.
- **Plugin manifest treatment of lock/launch** — leave fully listed or mark "experimental" in description? Recommend leave fully listed; the description neutral.
- **README footer about lock/launch** — explicit "deferred to v2.1" vs. vague? Recommend explicit: honest is the brand.

## 7. Docs that need rewrites after this plan lands

- README.md (lead pitch + sections)
- CONTEXT.md (lock + launch entries)
- docs/strategy/v2-roadmap.md (replace L1-L3 with this narrow scope)
- docs/strategy/v2-skill-catalog.md (lock + launch → "alpha utilities" / "deferred")
- docs/strategy/v2-vision.md (tagline shift)
- docs/strategy/v2-marketing.md (pitch shift)
- docs/plans/jameskyeong/v2-lite-pivot.md — leave intact as historical record; add a top-of-file note pointing to this plan as the successor

## 8. Next action

After this plan + ADR 0004 land, the doc-rewrite commit follows (one commit covering all six target docs). Then Week 1 work begins.
