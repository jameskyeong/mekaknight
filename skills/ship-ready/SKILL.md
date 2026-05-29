---
name: jameskill:ship-ready
description: >-
  One-line GO / NO-GO verdict on whether a project is safe to deploy. Runs the
  available jameskill inspection skills, aggregates blocking findings, and
  answers the only question that matters: can I ship this right now? Use when:
  'ship-ready', 'can I ship', 'is this safe to deploy', 'ready to ship'.
---

# Ship Ready — GO / NO-GO Verdict

Answers one question: **"Can I deploy this right now?"** — Yes or No, plus exactly what's blocking.

Other tools hand a vibe coder a list of 40 issues and leave them to decide. Ship-ready makes the decision: it runs the inspection skills, counts what actually blocks a safe deploy, and gives a single verdict.

**v0.1 scope:** aggregates `/jameskill:harden` only (security). As `/polish` (design) and `/dedupe` (quality) ship, they plug into the same aggregation — the verdict structure does not change.

---

## How to run

### Step 1: Run available inspections

Invoke each available jameskill inspection skill and collect its findings.

- **Security** — invoke `jameskill:harden`. Collect its BLOCK and WARN items.
- **Design** — `jameskill:polish` (not yet available; skip in v0.1).
- **Quality** — `jameskill:dedupe` (not yet available; skip in v0.1).

If `harden` is unavailable, tell the user it must be installed and stop — there is nothing to base a verdict on.

### Step 2: Apply the verdict rule

- **Security BLOCK ≥ 1** → **NO-GO**.
- **Security BLOCK = 0** → **GO**. (Design and quality findings are advisory in v0.1 — they do not block. They surface as recommendations, not blockers.)

This matches the catalog default: **security blocks, other dimensions warn.** A `--strict` mode that blocks on design/quality too is a later addition.

### Step 3: Emit the verdict

**NO-GO example:**

```
🚦 SHIP READY?   NO-GO

Blocking (2):
  ❌ [Security] Supabase RLS off on table `users`
       supabase/migrations/0003_users.sql:12
  ❌ [Security] STRIPE_SECRET reachable from client bundle
       components/Checkout.tsx:8

Fix the blockers above, then run /jameskill:ship-ready again.

Advisory (not blocking):
  ⚠️  [Security] Stripe webhook parses JSON before signature verification — api/webhooks/stripe.ts:14
```

**GO example:**

```
🚦 SHIP READY?   GO  ✅

No blocking issues found.

Advisory (not blocking):
  ⚠️  [Security] Public reference table `plans` has RLS off — confirm intentional

Security configuration checks passed.
```

If **every** check returned SKIP (the project uses neither Supabase nor Stripe, so nothing applicable ran), do not imply a clean bill of health:

```
🚦 SHIP READY?   GO  ✅

No applicable security checks ran (no Supabase or Stripe usage detected).
Nothing is blocking, but harden v0.1 had nothing to inspect in this project.
```

---

## Rules

- The verdict is **GO or NO-GO** — never "mostly ready" or "probably fine". Binary, by design.
- A NO-GO must list **every** blocking item with file:line. The user needs to know exactly what to fix.
- Advisory items are shown but never change a GO to NO-GO in v0.1.
- Do not re-derive findings independently — ship-ready is an **aggregator**. The inspection skills own the detection logic; ship-ready owns the decision.
- Never fabricate a GO. If an inspection skill errored or could not run, report that the verdict is **incomplete**, not GO.
