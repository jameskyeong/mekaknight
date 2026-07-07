# Plan — v2.0 lite pivot (6-8 week shape)

> **Decision**: ADR 0003 — pivot to lite, wrap-based architecture
> **Basis**: dogfooding lock v0.1 against 3 live company codebases returned 0 BLOCK findings; lock depth duplicates what semgrep/gitleaks/supabase CLI already do
> **Target ship**: 6-8 weeks from today (vs. original 16 weeks)

---

## 1. New milestone shape

| Milestone | Duration | Content |
|---|---|---|
| **L1 — lock wrap + launch v0.2** | Week 1-2 | lock calls semgrep + gitleaks + (optional) supabase CLI. launch aggregates results into a single GO/NO-GO line. |
| **L2 — dogfooding round 2** | Week 3 | Re-run lock v0.2 + launch v0.2 against norito, supergrim, grim-2025-frontend. Verify wrap surfaces real findings the v0.1 pattern matching missed. Collect anonymized screenshots. |
| **L3 — README + marketing + ship** | Week 4-6 | English README rewrite, 3 demo videos, HN/PH/Reddit launch, 1 Korean dev community post. |

Optional Week 7-8 buffer for post-launch hotfixes and HN follow-up.

## 2. lock v0.2 — wrap design

### Inspectors to wrap
- **semgrep** — code-pattern security (XSS, SQLi, deserialization, sensitive data flow). Use `semgrep --config auto` or curated ruleset.
- **gitleaks** — credential leak detection (history + working tree). Wraps `gitleaks detect`.
- **supabase CLI** (optional, when available) — `supabase db dump` for authoritative RLS state. Falls back to migration grep when CLI absent.

### Replaces (dropped from original plan)
- ❌ Custom Clerk/NextAuth env strength checks (no dogfooding target uses either)
- ❌ Custom frontend-only auth detection (deferred — semgrep can cover via custom rule)
- ❌ Custom Supabase RLS pattern matching (replaced by `supabase db dump` when available)
- ❌ Custom Stripe webhook signature check (semgrep rule covers this)

### Keeps (from v0.1, refined)
- ✅ Supabase RLS — Strategy A (CLI dump) primary, Strategy B (migration grep) fallback
- ✅ Secret-key client exposure — gitleaks for credentials, semgrep for client-bundle leaks

### New
- 🆕 **tracked env file detection** — discovered during grim-2025-frontend dogfooding. `.env.development` tracked in git is a common vibe-coded misstep.

### Output unchanged
PASS / WARN / BLOCK + file:line + fix suggestion. Aggregated by category.

## 3. launch v0.2 — verdict surface

- Reads lock's aggregated output
- One-line verdict: `GO ✅` or `NO-GO ❌`
- Blocking items listed below verdict
- Advisory items shown but never gate
- Strict mode flag (`--strict`) escalates Warnings to Blockers (optional)

This is the **differentiated marketing surface**. Demo videos, Twitter, HN — all lead with launch's verdict, not lock's findings.

## 4. Out of scope (v2.1+)

- `/polish` (AI Score) — design quality inspection
- `/dedupe` + `/cohesion-check` — semantic duplication detection
- `/ship-check` umbrella — launch absorbs this role
- Vision API integration (was M2 risk)
- Linear / GitHub Issues backends (v2.1)

## 5. Forge + tracker — unchanged

- `/forge`, `/link`, `/tag`, `/strike`, `/workflow-external` ship as-is in v2.0
- No new work in v2.0 for these (already complete in alpha.3)

## 6. Marketing pivot

| | Old angle | New angle |
|---|---|---|
| **Tagline** | "Deep inspection for vibe-coded apps" | "One command, one decision — production-readiness gate" |
| **Lead skill** | lock (detect) | launch (decide) |
| **Hero demo** | `/lock` finds 12 issues | `/launch` says NO-GO with reason |
| **Audience** | vibe coders only | anyone running semgrep + gitleaks already |

## 7. Open questions

- **Inspector installation policy** — Does lock auto-install semgrep/gitleaks if missing, or fail with install instructions? Default: fail + instruct (no auto-install of third-party tools).
- **Empty-result handling** — If semgrep/gitleaks return clean and supabase CLI absent, launch outputs `GO` with note "limited applicability". Don't fabricate confidence.
- **Marketing risk** — Anthropic could ship a competing wrap. Mitigation: ship faster (6-8 weeks vs 16), capture the brand name first.
- **L2 dogfooding** — Need at least 1 real BLOCK across the 3 codebases for credible demo content. If still 0, recruit a 4th vibe-coded project externally (open-source candidate).

## 8. Doc updates required after this plan lands

Strategy docs need coordinated rewrites:
- `docs/strategy/v2-roadmap.md` — replace M1-M6 with L1-L3
- `docs/strategy/v2-skill-catalog.md` — move polish/dedupe to v2.1+ section
- `docs/strategy/v2-vision.md` — sharpen "one decision" tagline
- `docs/strategy/v2-marketing.md` — pivot tagline + lead-skill messaging
- `CONTEXT.md` — relabel lock from "inspection engine" to "inspection wrapper + aggregator"
- `README.md` — update lead pitch

These rewrites are deferred to a follow-up commit after this plan is reviewed.

---

## 9. Next action

After this plan + ADR 0003 land, the doc-rewrite commit follows. Then L1 work starts.
