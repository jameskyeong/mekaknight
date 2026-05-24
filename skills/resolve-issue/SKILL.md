---
name: jameskill:resolve-issue
description: >-
  Fetch pending issues from Notion, brainstorm solutions, implement fixes,
  and update issue status. Use when: 'resolve-issue', 'resolve issues',
  'work on pending issues'.
---

# Notion Issue Resolve Skill

Queries pending issues from the Notion issue tracker DB, then walks through brainstorming, implementation, and status transitions for the issue(s) the user selects.

**State transitions:** Pending -> In Progress -> Ready to Deploy

---

## Step 0: Read configuration and property maps

Read `.claude/tracking-issue.json` from the project root and extract mapped property names.

```bash
CONFIG=".claude/tracking-issue.json"
if [ ! -f "$CONFIG" ]; then
  echo "Configuration required. Please run /setup-issue first."
  exit 1
fi

NOTION_KEY=$(cat "$CONFIG" | jq -r '.notionApiKey')
DB_ID=$(cat "$CONFIG" | jq -r '.databases.issueTracker.id')

# Property names (mapped from config — never hardcode DB column names)
STATUS_PROP=$(cat "$CONFIG" | jq -r '.databases.issueTracker.propertyMap.status')
SEVERITY_PROP=$(cat "$CONFIG" | jq -r '.databases.issueTracker.propertyMap.severity')
REASON_PROP=$(cat "$CONFIG" | jq -r '.databases.issueTracker.propertyMap.reason // empty')

# Status values (mapped from config)
PENDING_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.pending')
WAITING_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.waiting // empty')
IN_PROGRESS_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.inProgress')
DEPLOY_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.readyToDeploy')
```

If the config file is missing, **stop immediately** and direct the user to run `/setup-issue`.

**Security:** NEVER echo, print, or output the `NOTION_KEY` value. Pass it only as a shell variable in curl calls.

---

## Step 1: Query "In Progress" issues

Check whether any issues were left mid-work in a previous session.

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$IN_PROGRESS_STATUS"'"}},
    "page_size": 100
  }'
```

If `has_more: true`, paginate with `next_cursor`:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$IN_PROGRESS_STATUS"'"}}, "start_cursor": "'$CURSOR'", "page_size": 100}'
```

---

## Step 2: Query "Pending" issues

Query both `pending` and `waiting` statuses from the config. Some DBs use a single pending state, others split into "not started" and "waiting" — query both and merge results.

```bash
PENDING_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.pending')
WAITING_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.waiting // empty')

# Always query the primary pending status
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$PENDING_STATUS"'"}},
    "page_size": 100
  }' > /tmp/notion_pending1.json

# If a separate waiting status exists, query it too and merge
if [ -n "$WAITING_STATUS" ]; then
  curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d '{
      "filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$WAITING_STATUS"'"}},
      "page_size": 100
    }' > /tmp/notion_pending2.json
fi
```

Merge results from both queries before sorting. Pagination: if `has_more: true`, repeat with `next_cursor` until all pages are collected for each query.

---

## Step 3: Client-side sorting by severity

Notion's select sort is alphabetical, so parse the response and **re-sort client-side** by severity.

Sort priority: **P0 > P1 > P2 > P3** (highest severity first)

Fields to extract per issue:
- **page_id**: `.results[].id`
- **title**: the property with `type == "title"` -> `.title[0].plain_text`
- **severity**: `.results[].properties[$SEVERITY_PROP].select.name`

**Important: Use file-based parsing.** Notion responses with Korean/Unicode text can break `jq` when piped through shell variables. Always save API responses to temp files first, then parse with `python3 -c` or `jq < file`.

```bash
# Preferred: Python for reliable Unicode handling
python3 -c "
import json, sys
severity_order = {'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3}
all_results = []
for path in sys.argv[1:]:
    with open(path) as f:
        data = json.load(f)
    for r in data.get('results', []):
        props = r['properties']
        title = next((v['title'][0]['plain_text'] for v in props.values() if v.get('type') == 'title' and v.get('title')), '(no title)')
        sev = props.get('$SEVERITY_PROP', {}).get('select', {}).get('name', '')
        all_results.append({'id': r['id'], 'title': title, 'severity': sev})
all_results.sort(key=lambda x: severity_order.get(x['severity'], 4))
print(json.dumps(all_results, ensure_ascii=False, indent=2))
" /tmp/notion_pending1.json /tmp/notion_pending2.json
```

---

## Step 4: Display the list

Present query results in this format. Merge "pending" and "waiting" issues into one numbered list, sorted by severity. If needed, show the source status in parentheses.

```
⏳ In Progress (1):
• [P1] Search filter UX improvement

📋 Pending (7):
1. [P0] Login button touch responsiveness (Not started)
2. [P1] Close button touch area (Not started)
3. [P1] Search response delay (Waiting)
4. [P2] Settings UI improvement (Waiting)

Which issue to work on? (number, comma-separated, range, or "all")
```

Rules:
- If there are "In Progress" issues, show them at the **top in a ⏳ section** so the user can resume
- Pending list includes both "pending" and "waiting" status issues, merged and sorted by severity
- If there are no "Pending" issues: display "📋 Pending (0) — All issues have been resolved."
- If there are no issues at all (neither In Progress nor Pending): display "No pending issues found." and stop

---

## Step 5: User selection → Grouping → Status change

### 5a. Parse selection

Accept these selection formats:
- **Single**: `3`
- **Comma-separated**: `1,3,5`
- **Range**: `5-7`
- **Mixed**: `1,3,5-7`
- **"all"**: all pending issues
- **Status filter**: phrases like `waiting issues`, `not started issues` — select all issues with that status

### 5b. Propose groups (multi-issue only)

When 2+ issues are selected, **propose groupings** based on title/body similarity before starting work.

Analyze the selected issues and cluster by domain affinity:
- Same UI area (e.g. drawing tools, puzzle, activity review)
- Same technical system (e.g. video recording, canvas rendering)
- Same type of fix (e.g. copy/text changes, sizing adjustments)

Present proposed groups sorted by max severity within each group:

```
The selected N issues will be grouped as follows:

🔧 Group 1 — Authentication (P1)
  • [P1] Login button doesn't respond
  • [P1] Logout doesn't clear session
  • [P2] Password reset email not sent

🔧 Group 2 — Search (P1)
  • [P1] Search results load slowly
  • [P1] Filter dropdown text cut off

🔧 Group 3 — Video player (P1)
  • [P1] Video doesn't save after editing
  • [P1] Video preview frame freezes

🔧 Group 4 — Standalone
  • [P1] Update the closing message text

Proceed with this grouping? (Reply with adjustments if needed)
```

Wait for user confirmation or adjustment. If only 1 issue is selected, skip grouping and proceed directly.

### 5c. Change status

For each issue in the current group (or single issue), change status to **In Progress** before starting work.

**Important: Change status before brainstorming begins.** This way, if the session is interrupted, issues naturally stay "In Progress" and will appear in the ⏳ section on the next resolve call.

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$STATUS_PROP"'": {"select": {"name": "'"$IN_PROGRESS_STATUS"'"}}}}'
```

---

## Step 6: Fetch issue bodies + Workflow

### 6a. Fetch all issue bodies in the group

For each issue in the current group, retrieve block children:

```bash
curl -s "https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28"
```

Extract `rich_text[].plain_text` from each block in `.results[]` to compose the issue body text.

### 6b. Invoke workflow

**Single issue** — invoke `jameskill:workflow` with:
```
[Issue title]

[Issue body — text from block children]
```

**Grouped issues (2+)** — invoke `jameskill:workflow` once for the entire group with a structured multi-issue prompt:
```
Below are N related issues to handle together.

## Issue 1: [P1] Login button doesn't respond (page_id: xxx)
[body]

## Issue 2: [P1] Logout doesn't clear session (page_id: yyy)
[body]

Derive the group's common context in Phase 0/1 (grill-me + grill-with-docs),
but address every individual issue in Phase 3 (build) without omission.
```

The workflow skill handles the full cycle: clarify (grill-me) → validate (grill-with-docs) → route (diagnose/prototype/PRD+Notion-issues/direct) → build (tdd) → architecture review → code review → verify.

**If `jameskill:workflow` is not available:** Inform the user that the workflow skill is unavailable, then proceed with a standard brainstorming approach — present the issue context directly in the conversation and work through the solution interactively with the user.

Once the workflow completes and the user confirms "done", proceed to Step 7.

---

## Step 7: Group completion

When brainstorming and implementation for a group are done and the user confirms "done":

### 7a. Write outcome note (per issue)

For **each issue in the group**, write an outcome note in the reason (rich_text) field. Focus on **the change as seen by a user, not the implementation**. The issue page is reviewed by non-developers (PMs, support, customers) — write so they can grasp what improved without any engineering context. 2–3 lines max.

| Focus | ✅ Good | ❌ Avoid |
|---|---|---|
| User-visible result | "Button is now easier to tap on smaller screens" | "Refactored useButtonPress hook" |
| Plain language | "Loading no longer freezes when opening" | "Replaced sync API with async stream" |
| Outcome-oriented | "Search returns results within 2 seconds" | "Added debouncing to query handler" |

Prefix the memo with `[Outcome]`. Skip the memo entirely if there is nothing notable for a particular issue.

**If `REASON_PROP` is empty or the property does not exist in the DB, skip the memo entirely.**

```bash
# Append to existing reason if present
EXISTING_REASON=$(curl -s "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r --arg reason "$REASON_PROP" '.properties[$reason].rich_text[0].plain_text // ""')

NEW_REASON="${EXISTING_REASON:+$EXISTING_REASON\n}[Outcome] content..."

curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$REASON_PROP"'": {"rich_text": [{"text": {"content": "'"$NEW_REASON"'"}}]}}}'
```

### 7b. Status change (all issues in the group)

Change the status to **Ready to Deploy** for every issue in the group.

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$STATUS_PROP"'": {"select": {"name": "'"$DEPLOY_STATUS"'"}}}}'
```

Notify the user upon completion with a per-issue summary:
```
✅ Group 1 — Authentication complete
  [P1] Login button doesn't respond -> Ready to Deploy
    📝 [Outcome] Login button now responds reliably on every tap, even on smaller screens
  [P1] Logout doesn't clear session -> Ready to Deploy
    📝 [Outcome] Logout fully clears the session — no need to re-login after switching accounts
```

### 7c. Next group

If there are remaining groups, proceed to the next group (back to Step 5c → Step 6 → Step 7). Process groups **sequentially in severity order** (by max severity within each group).

**Each group's workflow must be fully complete before moving to the next.** Do not process groups in parallel.

---

## Abort handling

If the user interrupts mid-work:
- The current issue's status **remains "In Progress"** (already changed in Step 5 before brainstorming)
- On the next `/resolve-issue` call, the issue will appear in the **⏳ In Progress section** so work can resume
- No special abort handler is needed

---

## Error handling

| Situation | Message |
|---|---|
| `.claude/tracking-issue.json` missing | "Configuration required. Please run `/setup-issue` first." |
| Invalid API key (401 response) | "Notion API key is invalid. Please verify your token." |
| DB inaccessible (403/404 response) | "Cannot access the database. Please verify the integration is connected to this DB." |
| 0 issues found | "No pending issues found." |

---

## Security rules

- NEVER echo, print, or output the `NOTION_KEY` value
- Pass it only as a shell variable (`$NOTION_KEY`) in curl calls
- Ensure error logs do not contain the token
