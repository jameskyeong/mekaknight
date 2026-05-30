---
name: mekaknight:tag
description: >-
  Report issues to a Notion database from a prompt. Parses multiple issues,
  verifies against the codebase, creates pages with proper template blocks.
  Use when: 'tag', 'report issues', 'log issues'.
---

# Tag — Notion Issue Report

Report issues from a prompt to a Notion DB.
Reference docs are in the `../issue-references/` folder:
- `../issue-references/config-schema.md` — Config file structure
- `../issue-references/required-db-schema.md` — Required DB properties
- `../issue-references/notion-api-patterns.md` — curl patterns

---

## 1. Load Config

Check that `.claude/tracking-issue.json` exists. If missing, stop immediately.

```bash
if [ ! -f .claude/tracking-issue.json ]; then
  echo "Configuration required. Please run /mekaknight:link first."
  exit 1
fi
```

Load values:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
ISSUE_DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')
ISSUE_TEMPLATE=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.templatePageId // empty')
ASSIGNEE_ID=$(cat .claude/tracking-issue.json | jq -r '.defaults.assigneeId // empty')
```

Load property name mappings:

```bash
STATUS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.status')
SEVERITY_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.severity')
TAGS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.tags')
ASSIGNEE_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.assignee')
REASON_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.reason // empty')
SOURCE_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.source // empty')
```

**Security rule**: NEVER echo/print/output `NOTION_KEY`. Pass it only as a shell variable (`$NOTION_KEY`) in curl calls.

---

## 2. Issue Parsing & Auto-Grouping

Parse items from the user prompt and **auto-group related items** before registration. Each group becomes one Notion issue.

### 2-1. Item parsing

Identify candidate items:
- **Numbered list** (`1. 2. 3.`) — each numbered item is a candidate
- **Line-break-separated items** — each line is a candidate
- **Single block of text** without numbering — treated as one item; no grouping needed

### 2-2. Auto-grouping (when 2+ candidates)

Follow the canonical algorithm in [`../issue-references/grouping.md`](../issue-references/grouping.md). Summary:

| Dimension | Examples |
|---|---|
| **UI area** | login screen, search results, settings page |
| **Technical system** | auth module, search API, canvas rendering |
| **Fix type** | text/copy changes, sizing adjustments, missing loading state |

**Linkability rule**: a pair of items is linkable if it shares **2 or more of the 3 dimensions**, OR if it has **code-file overlap** (a single strong signal — see Section 2.5). One dimension alone is NOT enough.

Then compute connected components: each component with 2+ items = one group; singletons = standalone.

**Codebase verification (Section 2.5) feeds into grouping** — code-file overlap alone is sufficient to link a pair.

### 2-3. Group → Issue mapping

Each group becomes **one Notion issue**:

| Field | Rule |
|---|---|
| **Title** | Generate a meta title that captures the group's common theme. Do NOT copy a single item's title. |
| **Body — Problem Description** | List each original item as a bullet. Preserve all originals — no summarization, no merging text. |
| **Severity** | Highest severity within the group. |
| **Tags** | Union of all items' tags. |

### 2-4. Flow

Auto-group → **show grouping summary with one-line rationale per group** → **user confirms or overrides** (`y` / `regroup` / `split N` / `merge N,M`) → registration. See the User-gate section of [`grouping.md`](../issue-references/grouping.md) for override semantics.

Example output before registration:

```
Auto-grouped 5 items into 3 issues:

🔧 Group 1 — "Login flow has end-to-end issues" (P0)
  • Login button doesn't respond to tap
  • After successful login, no redirect to home
  • Session persists after logout

🔧 Group 2 — "Search filter UI improvements" (P1)
  • Filter dropdown text is cut off
  • Apply button hard to find

🔧 Standalone — "Settings page crash on iOS 17"
```

### Example inputs

```
# 5 items → 3 issues (2 groups + 1 standalone)
1. Login button doesn't work
2. Login redirect fails
3. Session persists after logout
4. Search filter dropdown text cut off
5. Settings page crash on iOS 17
```

```
# 1 single block → 1 issue (no grouping)
The undo button on the canvas doesn't respond when tapped
after multiple strokes have been drawn.
```

---

## 2.5. Codebase Verification

**Before** registering issues in Notion, verify each issue against the current codebase.

### Verification Steps

For each issue:

1. **Search related code**: Find the screen/feature/component mentioned in the issue (grep, find, file reads)
2. **Check current state**: Verify the actual implementation status
   - Already fixed? (recent commit already addresses it)
   - Does the issue description match the code? (e.g., "button is small" — check actual touch target size)
   - Identify related module/file paths
3. **Classify result**:
   - **Valid**: Code confirms improvement is needed — proceed with registration. Add related file paths and current implementation state to the body
   - **Already resolved**: Recent commit already fixed it — notify user, skip this issue
   - **Cannot verify**: Code alone cannot confirm (UX feel, content difficulty, etc.) — register as-is with "(cannot verify via code — based on field observation)" note

### Report to User

Show verification summary before registration:

```
Codebase verification results:
[P0] Login button touch responsiveness — src/hooks/use-press.ts confirmed, 300ms delay present
[P1] Close button hard to tap — src/components/popup.tsx, currently 24px target
[SKIP] Content difficulty balance — cannot verify via code (content domain)
[DONE] Search UI improvement — already in progress on feat/search-redesign branch, skipping
```

After showing verification results, **proceed directly to registration without confirmation**. Only skip already-resolved issues (DONE). Valid and cannot-verify issues are registered immediately.

### Post-implementation Registration

When the user explicitly states work is already completed (e.g., "already implemented", "set status to ready to deploy"), this is a **retroactive log** — not a bug report. In this case:

1. **Codebase verification** still runs, but classifies as **Valid** (confirmed by the diff in the working tree)
2. **Title** must still follow Section 5 Title Writing Rules — describe the **original problem/need** that was solved, not the solution itself
3. **Status** can be set directly to the requested value (e.g., the configured "Ready to Deploy" status) in the same POST that creates the page
4. **Reason (`$REASON_PROP`)** should contain an `[Outcome]` prefix with a plain-language description of what the user can now do or how the experience changed — not the technical work performed

---

## 3. Target DB

All issues are registered to the `issueTracker` DB configured in `.claude/tracking-issue.json`.

```bash
TARGET_DB_ID="$ISSUE_DB_ID"
TARGET_TEMPLATE="$ISSUE_TEMPLATE"
```

---

## 4. Source Attribution

If the prompt includes a person's name, record it in the **dedicated source property** (`$SOURCE_PROP`), separate from the reason/notes field which is reserved for developer notes.

- **Format**: `{name} ({date})`
- **Use system date**: `$(date +%Y-%m-%d)`
- **If no name is present**, omit the source property
- **If `$SOURCE_PROP` is empty** (not configured), record in the first paragraph of the body instead

Example: `Jane Kim (2026-05-15)`

Source property JSON (using `$SOURCE_PROP`):

```json
{
  "$SOURCE_PROP": {
    "rich_text": [
      {"type": "text", "text": {"content": "Jane Kim (2026-05-15)"}}
    ]
  }
}
```

---

## 5. Property Extraction

Extract the following properties from the prompt:

| Property | Extraction Rule | When Not Specified |
|---|---|---|
| Title | See **Title Writing Rules** below | Required — must be derived from prompt |
| Severity (`$SEVERITY_PROP`) | Search for P0, P1, P2, P3 keywords | Empty (unset in Notion) |
| Tags (`$TAGS_PROP`) | Search for `#tagname` or `[tag]` format | Empty |
| Related module | Extract technical module names from text | Record in body |
| App/Screen | Extract application or area name plus screen name | Record in body |
| Assignee (`$ASSIGNEE_PROP`) | Use `defaults.assigneeId` from config | Omit if empty |
| Status (`$STATUS_PROP`) | **Do NOT set** (use Notion DB default) | — |

### Title Writing Rules

**MANDATORY.** Every title MUST follow these rules. Violations are treated as errors.

The issue page is reviewed by **non-developers** (PMs, support, designers, field staff, customers). Write so a non-technical reader can grasp the problem immediately — no context, no engineering background.

1. **Write as a user-visible problem or improvement** — not a commit message, not a technical changelog. Describe the experience, not the cause.
2. **Max 30 characters (Korean) / 50 characters (English).** If longer, rewrite.
3. **No technical jargon** — no file names, component names, CSS values, function names, framework terms, or implementation hints.
4. **No prefixes** — no `feat:`, `fix:`, `refactor:`, severity tags, or category markers.
5. **No compound titles** — if the title has `+`, `&`, `and`, `—`, or `·` joining two unrelated topics, split into separate issues instead. (For grouped issues, write a meta title that describes the shared theme — see Section 2-3.)

| Bad (reject) | Good |
|---|---|
| `feat(auth): login group 1 — button, redirect, session persistence` | `Login button doesn't respond when tapped` |
| `Search UI improvement — filter unify + result animation + dropdown open` | `Search filter dropdown text is cut off` |
| `Sticker canvas aspect fix + video preview letterbox resolution` | `Sticker image stretches horizontally` |
| `Result screen UX improvement and canvas aspect fix` | `Hard to find next action on result screen` |

**Self-check before POST:** Re-read the title. If it sounds like a git commit, a PR title, or a release note — rewrite it as a problem statement that a non-technical stakeholder would say at a support desk.

---

## 6. Dynamic Title Property Lookup

The title property name can vary per Notion DB ("Issue Title", "Name", etc.). **Never hardcode the property name.** Dynamically extract the property with `type: "title"` from the DB schema:

```bash
TITLE_PROP=$(curl -s "https://api.notion.com/v1/databases/${TARGET_DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r '.properties | to_entries[] | select(.value.type=="title") | .key')
```

Use `$TITLE_PROP` as the property name when creating pages:

```json
{
  "$TITLE_PROP": {
    "title": [{"text": {"content": "Issue title text"}}]
  }
}
```

---

## 7. DB Schema Validation

Before creating pages, validate the `GET /databases/{id}` response.

```bash
DB_SCHEMA=$(curl -s "https://api.notion.com/v1/databases/${TARGET_DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28")
```

**issueTracker DB required checks:**

```bash
# Verify title property exists
echo "$DB_SCHEMA" | jq -e '.properties | to_entries[] | select(.value.type=="title")' > /dev/null

# Verify severity select property exists
echo "$DB_SCHEMA" | jq -e '.properties["'"$SEVERITY_PROP"'"].type == "select"' > /dev/null

# Verify severity has required options
echo "$DB_SCHEMA" | jq -e '.properties["'"$SEVERITY_PROP"'"].select.options | map(.name) | contains(["P0","P1","P2","P3"])' > /dev/null

# Verify tags multi_select exists
echo "$DB_SCHEMA" | jq -e '.properties["'"$TAGS_PROP"'"].type == "multi_select"' > /dev/null

# Verify assignee people exists
echo "$DB_SCHEMA" | jq -e '.properties["'"$ASSIGNEE_PROP"'"].type == "people"' > /dev/null
```

On validation failure, report specifically which properties are missing:

```
DB schema validation failed:
- Required property missing: "$SEVERITY_PROP" (select) — required options: P0, P1, P2, P3
- Required property missing: "$TAGS_PROP" (multi_select)
```

---

## 8. Template Structure Lookup

**MANDATORY when `templatePageId` is configured.** Skipping template replication is an error, not an optimization.

If `templatePageId` is set in config, fetch the page's block structure and replicate it in the same order.

```bash
if [ -n "$TARGET_TEMPLATE" ]; then
  TEMPLATE_BLOCKS=$(curl -s "https://api.notion.com/v1/blocks/${TARGET_TEMPLATE}/children?page_size=100" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2022-06-28")
fi
```

Replicate **every** block's `type` and structure (rich_text, icon, color, etc.) exactly as fetched. Fill text content with issue-specific information. Sections that don't apply should have their content left empty — **never omit the section itself**.

**If templatePageId is not set**: Do not create body blocks (set page properties only). This is normal behavior, not an error.

**Important: Check property existence** — Compare against the DB schema properties from Section 7. Exclude any property from the POST body that does not exist in the target DB. Sending nonexistent properties causes Notion API errors.

```bash
# Extract property list from DB schema (reuse $DB_SCHEMA from Section 7)
DB_PROPS=$(echo "$DB_SCHEMA" | jq -r '.properties | keys[]')

# Conditionally include properties based on existence
HAS_SEVERITY=$(echo "$DB_PROPS" | grep -c "^${SEVERITY_PROP}$")
HAS_ASSIGNEE=$(echo "$DB_PROPS" | grep -c "^${ASSIGNEE_PROP}$")
HAS_REASON=$(echo "$DB_PROPS" | grep -c "^${REASON_PROP}$")
HAS_TAGS=$(echo "$DB_PROPS" | grep -c "^${TAGS_PROP}$")
HAS_SOURCE=$([ -n "$SOURCE_PROP" ] && echo "$DB_PROPS" | grep -c "^${SOURCE_PROP}$" || echo 0)
```

If the source property does not exist in the DB but source information is available, record source in the first paragraph of the body instead.

---

## 9. Parallel Creation

> **Use the bundled helper.** `../issue-references/issue-builder.sh` exposes a validated `create_issue <input.json>` function that does POST + PATCH with proper shell-escape handling. Prefer the helper over hand-writing curl calls per session.
>
> ```bash
> # Required env vars (export before sourcing):
> #   NOTION_KEY, ISSUE_DB_ID, ASSIGNEE_ID,
> #   TITLE_PROP, SEVERITY_PROP, TAGS_PROP, ASSIGNEE_PROP, SOURCE_PROP, NOTION_SOURCE
>
> source ../issue-references/issue-builder.sh
> create_issue /tmp/issue1.json   # see helper file for input JSON schema
> ```
>
> The Step A / Step B blocks below describe what the helper does internally — use them only when you need to deviate from the standard flow.

When registering multiple issues:

- **If Agent tool is available**: Process each issue as an independent Agent in parallel. The parallel unit is "one complete issue" (POST /pages + PATCH /blocks/children). Do NOT batch all POSTs first then PATCHes later.
- **If Agent tool is unavailable**: Process sequentially

Processing flow per issue:

### Step A: Create Page

```bash
PAGE_RESULT=$(curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "'$TARGET_DB_ID'"},
    "properties": {
      "'$TITLE_PROP'": {"title": [{"text": {"content": "Issue title"}}]},
      "'$SEVERITY_PROP'": {"select": {"name": "P1"}},
      "'$ASSIGNEE_PROP'": {"people": [{"object": "user", "id": "'$ASSIGNEE_ID'"}]},
      "'$SOURCE_PROP'": {"rich_text": [{"text": {"content": "Jane Kim (2026-05-15)"}}]}
    }
  }')

PAGE_ID=$(jq -r '.id' <<< "$PAGE_RESULT")
PAGE_URL=$(jq -r '.url' <<< "$PAGE_RESULT")
```

If no assignee, remove `$ASSIGNEE_PROP`. If no source, remove `$SOURCE_PROP`. If severity is unspecified, remove `$SEVERITY_PROP`. The `$REASON_PROP` is **not set** by this skill — it is reserved for developer notes written during issue resolution.

### Step B: Add Body Blocks (only when templatePageId exists)

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/${PAGE_ID}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Guidance message"}}], "icon": {"type": "emoji", "emoji": "📝"}, "color": "blue_background"}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Problem Description"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Issue details"}}]}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Location"}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "App: <application or area>"}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Screen: <screen name>"}}]}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. Reproduction Steps"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": ""}}]}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "4. Screenshots"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": ""}}]}},
      {"type": "divider", "divider": {}},
      {"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": "(Developer) Probable Cause"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": ""}}]}}
    ]
  }'
```

The above is a default structure example. In practice, replicate the block type order **exactly** as fetched from the template page.

---

## 10. Partial Failure Policy

When registering multiple issues, some may fail:

1. **Keep successful issues** (do not roll back)
2. **Retry failed issues once**. The retry unit is the failed step for that issue (POST or PATCH)
3. If still failing after retry, **include the failed title + error reason in the final summary**

```bash
# Error check pattern — use `<<<` here-string, not `echo "$var" | jq` (see Section 12)
ERROR=$(jq -r '.object // empty' <<< "$PAGE_RESULT")
if [ "$ERROR" = "error" ]; then
  ERROR_MSG=$(jq -r '.message' <<< "$PAGE_RESULT")
  # Record after retry still fails
fi
```

---

## 11. Result Summary

After processing all issues, output results in this format:

```
Issue registration complete: 3 succeeded / 1 failed

Succeeded:
- "Login flow has end-to-end issues" -> https://notion.so/xxx
- "Search filter UI improvements" -> https://notion.so/xxx
- "Settings page crash on iOS 17" -> https://notion.so/xxx

Failed:
- "Notification permission UX" — DB access denied: verify the Integration is connected to the target DB.
```

Omit the failed section if all succeed. Omit the succeeded section if all fail.

### Link to Strike Skill

After outputting the result summary, ask about implementation:

```
Would you like to proceed with implementation? (/mekaknight:strike)
```

If the user agrees, invoke the `/mekaknight:strike` skill.
If declined, end here.

---

## 12. Security & Shell-Compat Rules

**Security:**
- NEVER include `NOTION_KEY` in echo, print, logs, or output
- Pass it only as a shell variable (`$NOTION_KEY`) in curl calls
- Do not expose the API key even when debugging errors
- Do not output the raw contents of `tracking-issue.json`

**Shell compatibility — parsing API responses:**
- Always parse Notion API responses with `jq <<< "$var"` (here-string) — **never** `echo "$var" | jq`.
- Reason: when the user shell is zsh (default on macOS), bash builtin `echo` inside a `.sh` script may interpret `\n` escape sequences in JSON strings as raw newlines. The downstream `jq` then errors with `Invalid string: control characters from U+0000 through U+001F must be escaped`. The page may still be created — but the script's error branch is skipped, so real failures get masked as success.
- Verified safe alternatives: `jq '.x' <<< "$var"` (preferred, terse) or `printf '%s' "$var" | jq '.x'`.
- This rule applies to ALL response parsing — not just error checks. Same hazard for `PAGE_ID`, `PAGE_URL`, `.message`, `.results[]`, etc.

---

## 13. Error Messages

Specific error messages by situation:

| Situation | Message |
|---|---|
| Config file missing | "Configuration required. Please run `/mekaknight:link` first." |
| Invalid API key (401) | "Notion API key is invalid. Please verify your token." |
| DB access denied (403/404) | "Cannot access DB. Verify the Integration is connected to the target DB." |
| Required property missing | "DB schema validation failed: required property missing: [{property}] ([{type}]) — required options: [{options}]" |
| Page creation failed | "Issue creation failed: [{title}] — {Notion API error message}" |
| Block addition failed | "Body block addition failed: [{title}] — {Notion API error message}. Page was created (properties only)." |

---

## Execution Flow Summary

```
1. Read .claude/tracking-issue.json              -> stop if missing
2. Load propertyMap for dynamic property names    -> $STATUS_PROP, $SEVERITY_PROP, etc.
3. Split issues from prompt                       -> build issue list
4. Codebase verification                          -> classify valid/resolved/unverifiable
5. For each valid issue:
   a. Select DB (keyword-based)
   b. Extract properties (title, severity, tags, etc.)
   c. Process source attribution (name -> source property)
6. Fetch DB schema + validate                     -> stop on failure
7. Dynamic title property extraction
8. Fetch template block structure (if configured)
9. Create issues (parallel or sequential)
   a. POST /pages (set properties)
   b. PATCH /blocks/children (add body)
10. Retry failed issues once
11. Output result summary
12. Ask about /mekaknight:strike
```
