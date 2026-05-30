# Issue Grouping Algorithm

Canonical auto-grouping algorithm used by `/tag` (during issue parsing) and `/strike` (during multi-issue selection). Both skills MUST follow this algorithm so grouping behavior is consistent.

The goal: cluster issues that genuinely belong together so a single forge session (or a single Notion issue) addresses related problems with shared context. Over-grouping pollutes the result with unrelated work; under-grouping misses obvious affinities.

---

## The three dimensions

For each pair of issues, evaluate three binary signals:

| Dimension | Match when both issues are about... | Example |
|---|---|---|
| **UI area** | the same screen, surface, or feature area | both touch the login screen; both touch the search results page |
| **Tech system** | the same underlying system or subsystem | both involve auth state; both involve canvas rendering; both involve the video pipeline |
| **Fix type** | the same kind of change | both are copy/text edits; both are sizing/layout fixes; both are perf improvements |

Each signal is **binary** (1 or 0) per pair. A pair has a score from 0 to 3.

There is also one **strong signal** that bypasses the dimension count:

- **Code-file overlap** — the two issues touch overlapping files or modules in the codebase. `/tag`'s Codebase verification step surfaces this directly; `/strike` infers it from issue bodies when available.

---

## Linkability rule

A pair of issues is **LINKABLE** if and only if:

- **2 or more of the 3 dimensions match**, OR
- **code-file overlap is present** (single strong signal sufficient)

A score of 1 dimension alone is **not enough** — that's the threshold that prevents over-grouping (e.g., "both touch the login screen" + "both are P1" does not link two unrelated login-screen items).

---

## Group formation

1. Build an undirected graph: nodes = issues, edges = linkable pairs.
2. Compute connected components.
3. Each connected component with 2+ nodes = one group.
4. Singletons (1-node components) = standalone issues.

Transitive closure is intentional: if A↔B and B↔C are both linkable, all three group together even if A and C don't directly link. Practical example: three issues about login flow — button (UI: login + system: auth), redirect (system: auth + system: routing), and session storage (system: auth + fix type: state). They share auth as the spine; they belong together.

---

## User gate (mandatory before commit)

Before either skill *commits* to the grouping (writing Notion pages in `/tag`, invoking `/forge` in `/strike`), the proposed groups MUST be shown to the user with a one-line rationale per pair link. Users override by replying with a correction.

Display format:

```
Proposed grouping (N items → M groups):

Group 1 — "Login flow has end-to-end issues" (3 items)
  • [P0] Login button doesn't respond
  • [P1] Logout doesn't clear session
  • [P1] Session storage drops on refresh
  Why grouped: all touch auth system + code-file overlap (auth/*)

Group 2 — standalone
  • [P2] Search filter dropdown UI

Proceed? (y / regroup / split N / merge N,M)
```

Skills implement the override commands:
- `y` / Enter → commit grouping
- `regroup` → re-run the algorithm with stricter threshold (require all 3 dimensions OR code-file overlap)
- `split N` → break group N into its members as standalone
- `merge N,M` → force-merge groups N and M into one

---

## Anti-patterns

### "At least one dimension" linkability

The fastest way to ruin grouping. Almost any two issues share at least one dimension by chance (both touch a screen, both are bugs, both are P1). The 2-of-3 threshold exists to suppress this noise.

**Cure**: enforce the rule literally. Do not "round up" — 1 of 3 is below threshold.

### Auto-commit without the user gate

Even a correct grouping must be confirmed because the user has context the algorithm lacks (which issues belong to in-flight branches, which were already partially fixed elsewhere).

**Cure**: never proceed past the gate without an explicit `y` or override command.

### Grouping by severity alone

P1 + P1 ≠ group. Severity is not a dimension — two unrelated P1s do not belong together just because they share priority.

**Cure**: severity does not appear anywhere in the three dimensions list. If a code change adds severity as a dimension, reject the change.

### Cross-status grouping in /strike

`/strike` should not propose grouping a "pending" issue with an "in progress" issue. The user picked them from different lists; treating them as a unit collapses meaningful state distinction.

**Cure**: `/strike` partitions selections by status before running the grouping algorithm. Run grouping within each status partition, present them as separate group sets.

### Grouping across branches

Two issues that touch the same file but are scheduled for different branches/sprints should not be force-grouped just because their codebase overlap signal fires.

**Cure**: if `/tag`'s codebase verification reveals "already in progress on branch X" for one item but the other is fresh, downgrade the code-file overlap signal for that pair. Skills should annotate this in the rationale ("would group on auth/* but item A is already shipping on feat/auth-redesign").

---

## Edge cases

### Single issue selected
The algorithm doesn't run. No grouping, no gate — proceed directly.

### All issues link transitively into one group
Show one group containing everything. Common case for tightly-coupled feature work. User can `split` to break it apart.

### No pair is linkable
Every issue stays standalone. Show each as its own line; gate still asks for confirmation (user may want to force-merge).

### Three-issue case with one weak link
A↔B linkable, B↔C linkable but A↔C not directly linkable. Per transitive closure, all three group. Rationale must show both links to explain why C is included via B.

### Ambiguous dimension match
"Both are about the search page" — is that UI area (search results screen) or tech system (search backend)? Pick the more specific one. If still ambiguous, count it as one dimension, not two.

### Code-file overlap with no dimension match
Rare but possible (two unrelated bugs in a utility file used by many features). Code-file overlap alone is enough to link, but the rationale must explain the link explicitly so the user can override. Often this is a case to `split`.
