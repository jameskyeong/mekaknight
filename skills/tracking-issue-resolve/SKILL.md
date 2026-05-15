---
name: jameskill:tracking-issue-resolve
description: >-
  Fetch pending issues from Notion, brainstorm solutions, implement fixes,
  and update issue status. Use when: 'tracking-issue-resolve', 'resolve issues',
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
  echo "Configuration required. Please run /tracking-issue-setup first."
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
IN_PROGRESS_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.inProgress')
DEPLOY_STATUS=$(cat "$CONFIG" | jq -r '.databases.issueTracker.statusMap.readyToDeploy')
```

If the config file is missing, **stop immediately** and direct the user to run `/tracking-issue-setup`.

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

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$PENDING_STATUS"'"}},
    "page_size": 100
  }'
```

Pagination: if `has_more: true`, repeat with `next_cursor` until all pages are collected.

---

## Step 3: Client-side sorting by severity

Notion's select sort is alphabetical, so parse the response and **re-sort client-side** by severity.

Sort priority: **P0 > P1 > P2 > P3** (highest severity first)

Fields to extract per issue:
- **page_id**: `.results[].id`
- **title**: the property with `type == "title"` -> `.title[0].plain_text`
- **severity**: `.results[].properties[$SEVERITY_PROP].select.name`

```bash
echo "$RESPONSE" | jq --arg sev "$SEVERITY_PROP" '[.results[] | {
  id: .id,
  title: (.properties | to_entries[] | select(.value.type == "title") | .value.title[0].plain_text),
  severity: .properties[$sev].select.name
}] | sort_by(
  if .severity == "P0" then 0
  elif .severity == "P1" then 1
  elif .severity == "P2" then 2
  elif .severity == "P3" then 3
  else 4 end
)'
```

---

## Step 4: Display the list

Present query results in this format:

```
⏳ In Progress (1):
• [P1] Guide UX improvement

📋 Pending (4):
1. [P0] Senior touch responsiveness
2. [P1] Close button touch area
3. [P2] Drawing UI improvement
4. [P2] Emotion quilt brush change

Which issue to work on? (number or "all")
```

Rules:
- If there are "In Progress" issues, show them at the **top in a ⏳ section** so the user can resume
- If there are no "Pending" issues: display "📋 Pending (0) — All issues have been resolved."
- If there are no issues at all (neither In Progress nor Pending): display "No pending issues found." and stop

---

## Step 5: User selection -> Status change

When the user picks a number, change that issue's status to **In Progress**.

**Important: Change status before brainstorming begins.** This way, if the session is interrupted, the issue naturally stays "In Progress" and will appear in the ⏳ section on the next resolve call.

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$STATUS_PROP"'": {"select": {"name": "'"$IN_PROGRESS_STATUS"'"}}}}'
```

---

## Step 6: Fetch issue body + Brainstorming

Retrieve the selected issue's body (block children) and include it in the brainstorming prompt.

```bash
curl -s "https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28"
```

Extract `rich_text[].plain_text` from each block in `.results[]` to compose the issue body text.

Then invoke the `superpowers:brainstorming` skill:
- **First line of the prompt**: Issue title
- **Subsequent lines**: Issue body (text extracted from block children)

```
[Issue title]

[Issue body — text from block children]
```

**If `superpowers:brainstorming` is not available:** Inform the user that the brainstorming skill is unavailable, then proceed with a standard brainstorming approach — present the issue context directly in the conversation and work through the solution interactively with the user.

Once brainstorming is complete, get the user's confirmation and proceed to implementation (executing).

---

## Step 7: Completion

When brainstorming and implementation are both done and the user confirms "done":

### 7a. Write implementation memo

If there is anything worth noting from the implementation, write a brief memo in the reason (rich_text) field. Use **plain language accessible to non-developers**, covering only the relevant items below in 2-3 lines:

- **What changed** (what part was modified and how)
- **Any difficulties encountered** (unexpected constraints or surprises)
- **Why this approach was chosen** (if alternatives existed)
- **Follow-up work needed** (anything left unfinished)

Avoid code names, function names, and technical jargon. Use expressions like "Made the button bigger", "Improved response speed when pressed".

Skip if there is nothing worth noting.

**If `REASON_PROP` is empty or the property does not exist in the DB, skip the memo entirely.**

```bash
# Append to existing reason if present
EXISTING_REASON=$(curl -s "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r --arg reason "$REASON_PROP" '.properties[$reason].rich_text[0].plain_text // ""')

NEW_REASON="${EXISTING_REASON:+$EXISTING_REASON\n}[Implementation memo] content..."

curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$REASON_PROP"'": {"rich_text": [{"text": {"content": "'"$NEW_REASON"'"}}]}}}'
```

### 7b. Status change

Change the status to **Ready to Deploy**.

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$STATUS_PROP"'": {"select": {"name": "'"$DEPLOY_STATUS"'"}}}}'
```

Notify the user upon completion:
```
[P1] Guide UX improvement -> Ready to Deploy
  📝 Implementation memo: Made the close button bigger and added tap-outside-to-dismiss. Adjusted the dismiss animation to avoid overlap with the existing close effect.
```

---

## "All" selection handling

When the user selects "all", process issues **sequentially in severity order (P0 -> P1 -> P2 -> P3)**, one at a time.

Processing order:
1. Change issue N's status to "In Progress"
2. Fetch issue N's body
3. Invoke the brainstorming skill (or standard brainstorming if unavailable)
4. After implementation, get user's "done" confirmation
5. Change issue N's status to "Ready to Deploy"
6. **Only after issue N is fully complete**, move to issue N+1

**Each issue's brainstorming and implementation must be fully complete before moving to the next.** Do not process in parallel.

---

## Abort handling

If the user interrupts mid-work:
- The current issue's status **remains "In Progress"** (already changed in Step 5 before brainstorming)
- On the next `/tracking-issue-resolve` call, the issue will appear in the **⏳ In Progress section** so work can resume
- No special abort handler is needed

---

## Error handling

| Situation | Message |
|---|---|
| `.claude/tracking-issue.json` missing | "Configuration required. Please run `/tracking-issue-setup` first." |
| Invalid API key (401 response) | "Notion API key is invalid. Please verify your token." |
| DB inaccessible (403/404 response) | "Cannot access the database. Please verify the integration is connected to this DB." |
| 0 issues found | "No pending issues found." |

---

## Security rules

- NEVER echo, print, or output the `NOTION_KEY` value
- Pass it only as a shell variable (`$NOTION_KEY`) in curl calls
- Ensure error logs do not contain the token
