# Plan: harden + ship-ready v0.1 (v2.0 M1 Week 2)

> ⚠️ Historical document — written under v1 names. See [ADR 0002](../adr/0002-mekaknight-rebrand.md) for the v2 rebrand. Command mapping: `temper`→`forge`, `harden`→`lock`, `ship-ready`→`launch`, `setup-issue`→`link`, `report-issue`→`tag`, `resolve-issue`→`strike`.

## Goal
Build two security skills: `harden` (vibe-stack config inspection engine) and `ship-ready` (GO/NO-GO verdict interface).

## Tasks

### Task 1: Create harden SKILL.md (v0.1 — 3 checks)
- **What**: New `skills/harden/SKILL.md` that inspects a target project (not jameskill itself) for vibe-stack security misconfigurations. SKILL.md-only (no shell script).
- **3 checks for v0.1**:
  1. **Supabase RLS**: detect tables with RLS disabled. Strategy: `supabase db dump` if CLI present, else grep `supabase/migrations/*.sql` and schema files for `ENABLE ROW LEVEL SECURITY` / `CREATE POLICY`. Flag tables holding user data with RLS off → BLOCK.
  2. **Service key client exposure**: grep for service-role keys / secret keys reachable from client bundle. Patterns: `SUPABASE_SERVICE_ROLE_KEY` used outside server context, `NEXT_PUBLIC_*_SECRET*`, `STRIPE_SECRET`/`sk_live`/`sk_test` in client-imported files → BLOCK.
  3. **Stripe webhook signature**: detect webhook handlers missing `constructEvent` signature verification. Find files matching webhook route patterns, check for `stripe.webhooks.constructEvent` call → missing = BLOCK.
- **Output format**: per-check PASS / WARN / BLOCK with file:line evidence + a fix suggestion.
- **Skip behavior**: if project doesn't use Supabase/Stripe, skip that check with a note (not a failure).
- **Test**: SKILL.md is valid markdown with correct frontmatter; manually trace each check's logic against a sample structure.
- **Commit**: `feat: add harden — vibe-stack security inspection (v0.1)`

### Task 2: Create ship-ready SKILL.md (v0.1)
- **What**: New `skills/ship-ready/SKILL.md` that invokes harden, aggregates BLOCK findings, and emits a one-line GO/NO-GO verdict.
- **Logic**: call harden → count BLOCK items → if ≥1 BLOCK then NO-GO, else GO. List blocking items.
- **Extensibility note**: v0.1 only reads harden. Future versions add polish/dedupe results to the same aggregation.
- **Output**: the `🚦 SHIP READY? GO/NO-GO` block with blocking list (per v2-skill-catalog.md example).
- **Test**: SKILL.md valid; trace verdict logic for 0-block (GO) and 1+-block (NO-GO) cases.
- **Commit**: `feat: add ship-ready — GO/NO-GO verdict interface (v0.1)`

### Task 3: Update CONTEXT.md
- **What**: Add `harden` term (rename from auth-check concept), confirm `ship-ready` (drop the `?`), add to glossary.
- **Test**: `grep "harden" CONTEXT.md` and `grep "ship-ready" CONTEXT.md` succeed.
- **Commit**: `docs: add harden and ship-ready to CONTEXT.md`

### Task 4: Update CLAUDE.md
- **What**: Add `/harden` and `/ship-ready` to Available Skills.
- **Test**: `grep "harden" CLAUDE.md` and `grep "ship-ready" CLAUDE.md` succeed.
- **Commit**: `docs: add harden and ship-ready to CLAUDE.md`

## Dependencies
- Task 2 depends on Task 1 (ship-ready references harden by name)
- Task 3, 4 are docs, run after 1 & 2

## Out of scope
- The other 5 harden checks (Clerk/NextAuth env, frontend-only auth, raw body order, plan-limit, webhook idempotency) → Week 3 v0.2
- semgrep / GitGuardian wrapping → Week 11 (ship-ready-security)
- temper's ship-check slot activation → later (ship-check umbrella doesn't exist yet)
- Shell script implementation
- Real dogfooding against an i-screammedia project → Week 3
