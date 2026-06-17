# Skill naming: powertasking flagship + descriptive supplementary names

The v2.0 meka-callsign names (`forge / lock / launch / link / tag / strike`) were short and themed, but in the slash-command list they did not read as one set, and the supplementary names did not say what each skill does. We first tried a shared `power` prefix on all six (`powertasking / powerlock / powerlaunch / powerlink / powertag / powerstrike`) so the family would be obvious at a glance — but the prefix obscured each supplementary skill's function (`powerlock` does not say "security", `powerlaunch` does not say "deploy"). Within the same alpha session, before publishing, we kept the prefix only for the flagship orchestrator and renamed the five supplementary skills to descriptive verb-object names. Family identity is carried by the `mekaknight:` namespace, not by a shared prefix.

## Decision

- **Flagship orchestrator**: `powertasking` — a branded, memorable name; it is the package's signature skill and is worth a distinctive name over a purely descriptive one.
- **Supplementary skills**: names that state their function directly.

| domain | v2.0 name | transient (alpha.11, unpublished) | final |
|---|---|---|---|
| orchestrator | `forge` | `powertasking` | `powertasking` |
| security inspection | `lock` | `powerlock` | `security-check` |
| deploy verdict | `launch` | `powerlaunch` | `ship-check` |
| tracker config | `link` | `powerlink` | `tracker-setup` |
| issue report | `tag` | `powertag` | `report-issue` |
| issue resolve | `strike` | `powerstrike` | `resolve-issue` |

The plugin namespace (`mekaknight`), the npm package name, and the GitHub repo all stay `mekaknight`. `workflow-external` (legacy v1.x) keeps its name.

## Considered Options

1. **Power prefix on all six** — Tried and reverted in the same session. It signals the family but hides function: a reader scanning `/mekaknight:powerlock` cannot tell it is a security check. The namespace already signals the family, so the prefix bought little and cost clarity.

2. **Rename the plugin to `power`, keep short skill names** (`/power:tasking`, `/power:lock`, …) — Rejected earlier: the cleaner model for a family signal, but it abandons the `mekaknight` brand.

3. **Descriptive names for all six, including the orchestrator** — Rejected: the orchestrator is the product's signature and earns a branded name (`powertasking`) rather than a generic descriptive one.

4. **Descriptive supplementary + branded flagship** (chosen) — Each supplementary command self-documents (`security-check`, `ship-check`, `tracker-setup`, `report-issue`, `resolve-issue`); the flagship keeps a memorable name; the namespace ties them together.

## Consequences

- `report-issue` and `resolve-issue` coincide with the original v1 skill names — they were good descriptive names then and are revived now; the `CONTEXT.md` `_Avoid_` lists no longer mark them as retired.
- The family signal lives entirely in the `mekaknight:` namespace. If the plugin is ever renamed, that signal moves with it.
- A blind find-replace is safe when renaming *from* the power names (distinctive tokens) but was not safe when renaming *to* them from common words (`lock`/`link`/`tag`); future renames should weigh how distinctive the source token is.
- The eval harness hardcodes skill identity in two places that must move with any rename: `eval/checks/cross-cutting-gates-present.mjs` (the `SUPPLEMENTARY` list, which must match the supplementary directory names) and `eval/checks/inline-gloss-discipline.mjs` (the `ALLOWLIST`).
- The `power`-prefixed names existed only as a local, unpushed commit and were never published; this ADR records the final scheme rather than the transient one.
- Executed in alpha (`2.0.0-alpha.11` → `2.0.0-alpha.12`).
