---
name: jameskill:tracking-issue-report
description: >-
  Report issues to a Notion database from a prompt. Parses multiple issues,
  verifies against the codebase, creates pages with proper template blocks.
  Use when: 'tracking-issue-report', 'report issues', 'log issues'.
---

# Issue Report (tracking-issue-report)

Report issues from a prompt to a Notion DB.
Reference docs are in the `../tracking-issue-references/` folder:
- `../tracking-issue-references/config-schema.md` — Config file structure
- `../tracking-issue-references/required-db-schema.md` — Required DB properties
- `../tracking-issue-references/notion-api-patterns.md` — curl patterns

---

## 1. Load Config

Check that `.claude/tracking-issue.json` exists. If missing, stop immediately.

```bash
if [ ! -f .claude/tracking-issue.json ]; then
  echo "Configuration required. Please run /tracking-issue-setup first."
  exit 1
fi
```

Load values:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
ISSUE_DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')
ISSUE_TEMPLATE=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.templatePageId // empty')
FEEDBACK_DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.fieldFeedback.id // empty')
FEEDBACK_TEMPLATE=$(cat .claude/tracking-issue.json | jq -r '.databases.fieldFeedback.templatePageId // empty')
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

## 2. Issue Splitting Rules

Parse individual issues from the user prompt:

- **Numbered list** (1. 2. 3.) or **line-break-separated items** — each becomes an independent issue
- **Single block of text** without numbering — treated as one issue

Example:

```
# 3 independent issues
1. Undo button does not work on the drawing screen
2. Close button touch target too small in activity review
3. No loading indicator when saving emotion diary

# 1 single issue
The undo button does not work on the drawing screen. After drawing
a line on the canvas, pressing undo has no effect.
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
[P0] Senior touch responsiveness — src/app/hooks/use-press.ts confirmed, 300ms delay present
[P1] Close button hard to tap — src/app/components/review-popup.tsx, currently 24px target
[SKIP] Zodiac difficulty variance — cannot verify via code (content domain)
[DONE] Drawing UI improvement — already in progress on feat/brush-preset branch, skipping
```

After showing verification results, **proceed directly to registration without confirmation**. Only skip already-resolved issues (DONE). Valid and cannot-verify issues are registered immediately.

### Post-implementation Registration

When the user explicitly states work is already completed (e.g., "이미 구현 완료", "배포 예정으로 변경해줘"), this is a **retroactive log** — not a bug report. In this case:

1. **Codebase verification** still runs, but classifies as **Valid** (confirmed by the diff in the working tree)
2. **Title** must still follow Section 5 Title Writing Rules — describe the **original problem/need** that was solved, not the solution itself
3. **Status** can be set directly to the requested value (e.g., "배포 예정") in the same POST that creates the page
4. **Reason (`$REASON_PROP`)** should contain an `[구현 메모]` prefix with a plain-language summary of what changed

---

## 3. DB Selection Rules

Select the target DB based on issue content:

| Keywords | Target DB |
|---|---|
| "field feedback", "observation", "on-site", "senior quote", "elder remark" | `fieldFeedback` |
| Korean equivalents for backward compatibility | `fieldFeedback` |
| Everything else | `issueTracker` |

**If fieldFeedback DB is not configured** (`FEEDBACK_DB_ID` is empty), always use `issueTracker` regardless of keywords.

```bash
# DB selection logic ($ISSUE_TEXT contains the issue text)
if echo "$ISSUE_TEXT" | grep -qiE 'field feedback|observation|on-site|senior quote|elder remark|현장 피드백|참관|관찰|어르신 발언'; then
  if [ -n "$FEEDBACK_DB_ID" ]; then
    TARGET_DB_ID="$FEEDBACK_DB_ID"
    TARGET_TEMPLATE="$FEEDBACK_TEMPLATE"
  else
    TARGET_DB_ID="$ISSUE_DB_ID"
    TARGET_TEMPLATE="$ISSUE_TEMPLATE"
  fi
else
  TARGET_DB_ID="$ISSUE_DB_ID"
  TARGET_TEMPLATE="$ISSUE_TEMPLATE"
fi
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
| App/Screen | Extract "user app", "manager", screen names | Record in body |
| Assignee (`$ASSIGNEE_PROP`) | Use `defaults.assigneeId` from config | Omit if empty |
| Status (`$STATUS_PROP`) | **Do NOT set** (use Notion DB default) | — |

### Title Writing Rules

**MANDATORY.** Every title MUST follow these rules. Violations are treated as errors.

1. **Write as a user-visible problem or improvement** — not a commit message, not a technical changelog. The title should read like something a non-developer stakeholder would write.
2. **Max 30 characters (Korean) / 50 characters (English).** If longer, rewrite.
3. **No technical jargon** — no file names, component names, CSS values, function names, or framework terms.
4. **No prefixes** — no `feat:`, `fix:`, `refactor:`, severity tags, or category markers.
5. **No compound titles** — if the title has `+`, `및`, `—`, or `·` joining two unrelated topics, split into separate issues instead.

| Bad (reject) | Good |
|---|---|
| `feat(user): 드로잉 도구 그룹 1 — 팔레트 통합, 캔버스 갭, 지우개 프리뷰` | `색상 팔레트가 너무 많아 전환이 어려움` |
| `활동 화면 UI 개선 — 버튼 통일 + 완료 애니메이션 + 팔레트 기본 열림` | `활동 화면 버튼 크기와 스타일이 제각각` |
| `스티커 캔버스 비율 수정 + 영상 미리보기 레터박스 해결` | `어항 꾸미기에서 도안이 가로로 늘어남` |
| `활동 결과 화면 UX 개선 및 캔버스 비율 수정` | `결과 화면에서 다음 행동을 찾기 어려움` |

**Self-check before POST:** Re-read the title. If it sounds like a git commit, a PR title, or a release note — rewrite it as a problem statement that a field instructor would say.

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

**fieldFeedback DB** only requires the title property. Other properties (type, category, lesson format) are optional — warn but continue if absent.

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

**Important: Check property existence** — Compare against the DB schema properties from Section 7. Exclude any property from the POST body that does not exist in the target DB. For example, the `fieldFeedback` DB may lack reason, severity, or assignee properties — sending nonexistent properties causes Notion API errors.

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

PAGE_ID=$(echo "$PAGE_RESULT" | jq -r '.id')
PAGE_URL=$(echo "$PAGE_RESULT" | jq -r '.url')
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
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "App: user"}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Screen: drawing"}}]}},
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
# Error check pattern
ERROR=$(echo "$PAGE_RESULT" | jq -r '.object // empty')
if [ "$ERROR" = "error" ]; then
  ERROR_MSG=$(echo "$PAGE_RESULT" | jq -r '.message')
  # Record after retry still fails
fi
```

---

## 11. Result Summary

After processing all issues, output results in this format:

```
Issue registration complete: 3 succeeded / 1 failed

Succeeded:
- "Drawing undo button not working" -> https://notion.so/xxx
- "Activity review close button touch target too small" -> https://notion.so/xxx
- "No loading indicator on emotion diary save" -> https://notion.so/xxx

Failed:
- "Sticker screen crash" — DB access denied: verify the Integration is connected to the target DB.
```

Omit the failed section if all succeed. Omit the succeeded section if all fail.

### Link to Resolve Skill

After outputting the result summary, ask about implementation:

```
Would you like to proceed with implementation? (/tracking-issue-resolve)
```

If the user agrees, invoke the `/tracking-issue-resolve` skill.
If declined, end here.

---

## 12. Security Rules

- NEVER include `NOTION_KEY` in echo, print, logs, or output
- Pass it only as a shell variable (`$NOTION_KEY`) in curl calls
- Do not expose the API key even when debugging errors
- Do not output the raw contents of `tracking-issue.json`

---

## 13. Error Messages

Specific error messages by situation:

| Situation | Message |
|---|---|
| Config file missing | "Configuration required. Please run `/tracking-issue-setup` first." |
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
12. Ask about /tracking-issue-resolve
```
