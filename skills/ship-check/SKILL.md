---
name: mekaknight:ship-check
description: >-
  One-line security GO / NO-GO verdict on whether a project is safe to deploy.
  Runs mekaknight:security-check and translates its findings into a single binary answer:
  can I ship this right now? Use when: 'ship-check', 'can I ship',
  'is this safe to deploy', 'ready to ship', 'cleared for launch'.
---

# Ship-check — Security GO / NO-GO Verdict

Answers one question: **"Is there a known security configuration issue blocking deploy?"** — Yes or No, plus exactly what's blocking.

`mekaknight:security-check` reports findings; ship-check turns those findings into a single binary decision. That decision is the entire value — no other inspection axis ships in v0.1.

**v0.1 scope: security only.** Ship-check runs `mekaknight:security-check` and nothing else. There is no design check, no quality check, no performance check. Multi-axis aggregation (design / quality / performance / dependencies) is post-v0.1 work and not promised — see [ADR 0010](../../docs/adr/0010-launch-v0.1-security-only.md) for the rationale.

---

## How to run

### Step 1: Run `mekaknight:security-check`

Invoke `mekaknight:security-check` against the project and collect its BLOCK and WARN items.

If `lock` is unavailable, tell the user it must be installed and stop — there is nothing to base a verdict on.

### Step 2: Apply the verdict rule

- **BLOCK ≥ 1** → **NO-GO**.
- **BLOCK = 0** → **GO**. WARN items surface as advisory and do not change the verdict.

The rule is intentionally simple: security configuration issues that `lock` rates as BLOCK are deploy-blockers; everything else is information.

### Step 3: Emit the verdict

**NO-GO example:**

```
🚦 LAUNCH READY?   NO-GO

Blocking (2):
  ❌ [Security] Supabase RLS off on table `users`
       supabase/migrations/0003_users.sql:12
  ❌ [Security] STRIPE_SECRET reachable from client bundle
       components/Checkout.tsx:8

Fix the blockers above, then run /mekaknight:ship-check again.

Advisory (not blocking):
  ⚠️  [Security] Stripe webhook parses JSON before signature verification — api/webhooks/stripe.ts:14
```

**GO example:**

```
🚦 LAUNCH READY?   GO  ✅

No blocking issues found.

Advisory (not blocking):
  ⚠️  [Security] Public reference table `plans` has RLS off — confirm intentional

Security configuration checks passed.
```

If **every** check returned SKIP (the project uses neither Supabase nor Stripe, so nothing applicable ran), do not imply a clean bill of health:

```
🚦 LAUNCH READY?   GO  ✅

No applicable security checks ran (no Supabase or Stripe usage detected).
Nothing is blocking, but lock had nothing to inspect in this project.
```

---

## Rules

- The verdict is **GO or NO-GO** — never "mostly ready" or "probably fine". Binary, by design.
- A NO-GO must list **every** blocking item with file:line. The user needs to know exactly what to fix.
- WARN-level items are shown as advisory and never change a GO to NO-GO.
- Do not re-derive findings independently — ship-check is a **decision layer** on top of `security-check`. `security-check` owns the detection; ship-check owns the verdict.
- Never fabricate a GO. If `security-check` errored or could not run, report that the verdict is **incomplete**, not GO.
- Do not market ship-check as a multi-axis aggregator. v0.1 is "security GO/NO-GO" — staying honest about scope is itself a feature.

## Output style — inline-gloss discipline

When the verdict or advisory mentions a service-specific term, environment variable, or abbreviation (`RLS`, `anon-key`, `STRIPE_SECRET`, `webhook-sig`, etc.), append a short parenthetical gloss (5–15 chars in the response language) on first mention so the user can act without grepping.

```
✗ Supabase RLS off on table `users`
✓ Supabase RLS(행 단위 권한) off on table `users`

✗ STRIPE_SECRET reachable from client bundle
✓ STRIPE_SECRET(서버 전용 결제 시크릿) reachable from client bundle
```

Skip glossing terms the user already used in the prompt, terms inside code blocks, and standard programming words. Powertasking's [`communication-style.md`](../powertasking/references/communication-style.md) holds the full discipline.
