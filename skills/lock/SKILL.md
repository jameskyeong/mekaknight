---
name: mekaknight:lock
description: >-
  Inspect a project for service-configuration security holes that
  code scanners (semgrep, Snyk) miss: Supabase RLS gaps, secret-key client
  exposure, and missing webhook signature verification. Reports PASS/WARN/BLOCK
  with fix suggestions. Use when: 'lock', 'security check', 'check my app',
  'is this safe to ship'.
---

# Lock — Service Configuration Security Inspection

Inspects **the current project** for service-configuration security holes that code-pattern scanners cannot catch.

**What this is NOT:** This does not scan for code-level vulnerabilities like XSS or SQL injection — that's semgrep's job. Lock catches the *configuration* mistakes that pattern scanners cannot see: a database table left world-readable, a secret key bundled into the browser, a payment webhook that trusts forged requests.

**Target:** the project in the current working directory (a user's app), not mekaknight itself.

**Framework assumption (v0.1):** Detection heuristics assume a **Next.js-style client/server boundary** — specifically the `"use client"` paradigm for the secret-key check, and Stripe webhook handlers as Next.js API routes. Projects on SvelteKit, Nuxt, Remix, or other frameworks may receive false PASSes on secret-key exposure (the heuristic won't match their client markers) — manual review is recommended for those stacks until framework-specific detection lands. Supabase RLS and webhook-signature checks are framework-agnostic.

**v0.1 scope:** 3 checks. Five more checks (Clerk/NextAuth env strength, frontend-only auth, raw-body parse order, plan-limit enforcement, webhook idempotency) arrive in v0.2.

---

## How to run

Run the 3 checks below in order. For each check:
- If the relevant stack is **not used** in this project, output `⏭️  SKIP (not applicable)` — this is **not** a failure.
- Otherwise output `✅ PASS`, `⚠️  WARN`, or `❌ BLOCK` with **file:line evidence** and a **one-line fix suggestion**.

Collect all results and print the summary block at the end.

---

## Check 1: Supabase RLS (Row Level Security)

**Why it matters:** Supabase tables are reachable directly from the browser via the anon key. If Row Level Security is off on a table holding user data, *anyone* can read or write *everyone's* rows — no auth needed. This is the single most common vibe-coding data breach.

### Detect whether Supabase is used

```bash
grep -rl "supabase" package.json 2>/dev/null
ls supabase/ 2>/dev/null
```

If neither exists → `⏭️  SKIP (not applicable)`.

### Strategy A — supabase CLI present (most accurate)

If `supabase` CLI is installed and the project is linked:

```bash
supabase db dump --schema public 2>/dev/null > /tmp/lock_schema.sql
```

### Strategy B — migration / schema file fallback

If the CLI is unavailable, scan local SQL:

```bash
find . -path ./node_modules -prune -o \( -name "*.sql" \) -print 2>/dev/null
```

Look in `supabase/migrations/*.sql`, `schema.sql`, or Prisma/Drizzle schema files.

### What to flag

1. Build the set of tables that hold user data (names like `users`, `profiles`, `accounts`, `orders`, `messages`, `posts`, or any table with a `user_id`/`owner_id` column).
2. For each, check whether `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;` appears.

   **The verdict depends on which strategy produced the data:**

   - **Strategy A (CLI `db dump` — authoritative):** the dump reflects the database's real state, including RLS enabled via the dashboard.
     - No RLS on a user-data table → `❌ BLOCK` (confirmed off)
     - RLS on, **zero policies** → `✅ PASS`. RLS with no policies *fails closed* (deny-all) — that is safe, not a hole. (Optionally `⚠️  WARN` only if the table is clearly meant to be readable and now isn't.)
     - RLS on, policy `USING (true)` / `USING (1=1)` on a user-data table → `❌ BLOCK` (effectively public)
     - RLS on, policy scoped by `auth.uid()` → `✅ PASS`

   - **Strategy B (migration-file fallback — NOT authoritative):** RLS is very commonly enabled via the Supabase dashboard, which never appears in migration SQL. Absence of an `ENABLE ROW LEVEL SECURITY` statement does **not** prove RLS is off.
     - No RLS statement found for a user-data table → `⚠️  WARN`: "RLS not found in migrations — confirm it's enabled in the Supabase dashboard." **Never BLOCK from Strategy B** — you cannot distinguish "off" from "set elsewhere".
     - Policy `USING (true)` found in a migration on a user-data table → `❌ BLOCK` (an explicit public policy *is* authoritative even in Strategy B)

3. Tables that are clearly public reference data (e.g. `countries`, `plans`, `categories`) with RLS off → `⚠️  WARN` (intentional is plausible, confirm with user).

**Fix suggestion template:**
> `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` then add a policy: `CREATE POLICY "owner_only" ON <table> USING (auth.uid() = user_id);`

---

## Check 2: Secret-key client exposure

**Why it matters:** Any value reachable from client-side code ships in the JavaScript bundle the browser downloads — meaning anyone can read it with DevTools. A leaked Supabase service-role key or Stripe secret key gives an attacker full backend access: they can bypass all RLS, refund payments, or drain accounts.

### What to scan

```bash
# Secret keys that must NEVER reach the client
grep -rn "SUPABASE_SERVICE_ROLE_KEY\|service_role\|sk_live_\|sk_test_\|STRIPE_SECRET" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  . 2>/dev/null | grep -v node_modules

# The dangerous anti-pattern: secrets behind a PUBLIC env prefix.
# Match SECRET / SERVICE_ROLE / PRIVATE / SERVICE_KEY — NOT bare "SK"
# (SK substring-matches TASK, DISK, RISK, MASK — all valid public names).
grep -rnE "(NEXT_PUBLIC_|VITE_|PUBLIC_)[A-Z_]*(SECRET|SERVICE_ROLE|SERVICE_KEY|PRIVATE_KEY|_SK_|_SK$)" \
  . 2>/dev/null | grep -v node_modules
```

### What to flag

1. **`NEXT_PUBLIC_*` / `VITE_*` / `PUBLIC_*` env var whose name contains `SECRET`, `SERVICE_ROLE`, `SERVICE_KEY`, `PRIVATE_KEY`, or `SK` as a whole token (`_SK_` / `_SK`)** → `❌ BLOCK`. The public prefix forces the value into the client bundle. Do **not** flag names where `SK` is part of a word (`TASK`, `DISK`, `RISK`, `MASK`) — those are ordinary public vars.
2. **A secret key (`sk_live_`, `sk_test_`, `SUPABASE_SERVICE_ROLE_KEY`, `service_role`) referenced in a file that is client-reachable** → `❌ BLOCK`.
   - **Client-reachable** = the file has `"use client"` at the top, OR is imported by such a file. In the Next.js App Router, components are Server Components *by default* — a secret in an ordinary `app/` or `components/` file with **no** `"use client"` directive is server-only and **safe** (`✅ PASS`). The discriminating signal is the *presence* of `"use client"`, not the absence of a server marker.
   - **Server-only (safe → `✅ PASS`):** `app/api/**/route.ts`, files importing `server-only`, `getServerSideProps`, server actions, and any `app/` file without `"use client"`.
   - **If you cannot trace whether a file reaches the client** (mixed import graph, unclear) → downgrade to `⚠️  WARN` with reason "can't confirm whether this file reaches the client bundle". Do not BLOCK on a guess.
3. A hard-coded literal key (starts with `sk_live_`/`sk_test_` as a string literal, not an env reference) **anywhere** → `❌ BLOCK` (should be an env var regardless of context).

**Fix suggestion template:**
> Move the secret to a server-only env var (drop the `NEXT_PUBLIC_` prefix) and read it only inside API routes / server actions. Rotate the key — it has already shipped to clients.

---

## Check 3: Stripe webhook signature verification

**Why it matters:** A webhook endpoint is a public URL. Without signature verification, anyone who finds the URL can POST a fake `checkout.session.completed` event and get free product, credits, or a plan upgrade — the server can't tell a real Stripe call from a forged one.

### Detect whether Stripe webhooks exist

```bash
# Find webhook handler files
find . -path ./node_modules -prune -o \( -name "*.ts" -o -name "*.js" \) -print 2>/dev/null \
  | grep -iE "webhook|stripe" 

# And/or grep for webhook route handlers
grep -rln "stripe\|webhook" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v node_modules
```

If no Stripe usage → `⏭️  SKIP (not applicable)`.

### What to flag

For each file that handles an incoming Stripe webhook (an API route reading a POST body and referencing Stripe events):

1. Check for a signature-verification call:

```bash
grep -n "constructEvent\|stripe.webhooks.constructEvent" <file>
```

- **No `constructEvent` call** in the webhook handler → `❌ BLOCK`. The endpoint trusts unsigned input.
- `constructEvent` present and passed the raw body + signature header + webhook secret → `✅ PASS`.
- `constructEvent` present **but** the body is parsed as JSON before verification (signature needs the *raw* body) → `⚠️  WARN` (verification will fail or be bypassed). Look for `await req.json()` / `express.json()` applied before the verify call.

**Fix suggestion template:**
> Verify the signature before trusting the event:
> `const event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);`
> Ensure the route reads the **raw** body (disable body parsing for this route).

---

## Output summary

After all checks, print:

```
🔒 LOCK — <project name>

Check 1 — Supabase RLS:          <status>
Check 2 — Secret key exposure:   <status>
Check 3 — Stripe webhook:        <status>

❌ Blocking (<n>):
  • [RLS] Table `users` has RLS disabled — supabase/migrations/0003_users.sql:12
    → ALTER TABLE users ENABLE ROW LEVEL SECURITY; + owner policy
  • [Secret] STRIPE_SECRET referenced in client component — components/Checkout.tsx:8
    → Move to API route, rotate the key

⚠️  Warnings (<n>):
  • ...

For a GO/NO-GO verdict, run /mekaknight:launch.
```

If a check found nothing actionable, show it as `✅ PASS` or `⏭️  SKIP`. Never invent findings — only report what the evidence shows.

---

## Notes

- **Be conservative with BLOCK.** A false BLOCK erodes trust faster than a missed WARN. When evidence is ambiguous (e.g. can't tell if a file is client-reachable), downgrade to WARN and say why.
- **Always cite file:line.** A finding without evidence the user can open is not actionable.
- This skill is read-only — it inspects and reports. It does not edit files. (Auto-fix arrives in a later version.)
