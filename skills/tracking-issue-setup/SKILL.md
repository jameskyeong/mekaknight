---
name: jameskill:tracking-issue-setup
description: >-
  Configure Notion issue tracker integration. Guides you through API key setup,
  database connection, property mapping, template detection, and defaults.
  Use when: 'tracking-issue-setup', 'setup issue tracker', or when
  tracking-issue-report/resolve detects missing configuration.
---

# Notion Issue Tracker Setup

Creates a per-project `.claude/tracking-issue.json` configuration file, step by step.

## Pre-flight: jq dependency check

Every subsequent step relies on `jq`. Check it first:

```bash
which jq
```

- **Found** — proceed to the next check.
- **Not found** — show the install command for the detected OS:

| OS | Install command |
|---|---|
| macOS | `brew install jq` |
| Ubuntu / Debian | `sudo apt install -y jq` |
| Windows (Chocolatey) | `choco install jq` |

> `jq` is required for this setup. Please install it and re-run the setup.

Do not continue until `jq` is available.

---

## Pre-flight: existing config check

```bash
test -f .claude/tracking-issue.json && echo "EXISTS" || echo "NOT_FOUND"
```

- `EXISTS` — ask the user: "An existing configuration was found. Would you like to reconfigure from scratch?" Proceed only if confirmed.
- `NOT_FOUND` — new setup. Continue from Step 1.

---

## Security Rules (apply to ALL steps)

- **Never** echo, print, or display the API key.
- Read the key into a shell variable with `jq -r '.notionApiKey'` and pass it only via `-H "Authorization: Bearer $NOTION_KEY"`.
- Never show the raw contents of `.claude/tracking-issue.json` to the user.
- When displaying verification results, use `jq` to extract only the needed fields — never dump full API responses.

---

## Step 1 — API Key

### 1-1. Integration creation guide

Tell the user:

> You need a Notion Internal Integration.
> 1. Go to https://www.notion.so/my-integrations and create a new Integration.
> 2. Select "Internal Integration" and give it a name (e.g., "Issue Tracker").
> 3. Copy the token shown after creation (starts with `ntn_`).
> 4. In your Notion issue tracker DB page, click "..." > "Connections" > add the Integration.

### 1-2. Create config file

```bash
mkdir -p .claude
cat > .claude/tracking-issue.json << 'EOF'
{
  "notionApiKey": "<paste your ntn_... token here>",
  "databases": {
    "issueTracker": {
      "id": "",
      "templatePageId": ""
    }
  },
  "propertyMap": {
    "title": "",
    "status": "",
    "severity": "",
    "tags": "",
    "assignee": "",
    "notes": ""
  },
  "statusMap": {
    "pending": "",
    "inProgress": "",
    "done": ""
  },
  "severityOptions": [],
  "defaults": {}
}
EOF
```

Tell the user:

> Created `.claude/tracking-issue.json`.
> Open the file and paste your token into the `notionApiKey` field.
> Let me know when you're done.

### 1-3. Validate token

Once the user confirms:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
curl -s "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '{name: .name, type: .type}'
```

**Success** (HTTP 200, `name` and `type` returned):
> API key is valid. Integration name: {name}

**Failure** (error response or empty result):
> The Notion API key is invalid. Please check your token.
> - Make sure you pasted the full token (starts with `ntn_`).
> - Verify the token is active at https://www.notion.so/my-integrations.

Retry until the token is valid.

---

## Step 2 — Database Connection & Property Mapping

### 2-1. Request DB ID

> Open your issue tracker database in Notion.
> URL format: `https://www.notion.so/{workspace}/{DB_ID}?v={view_id}`
>
> The DB ID is the 32-character string after the workspace name.
> Example: `https://www.notion.so/myworkspace/cbe2df21a9a78373a70401fc644a65df?v=...`
> DB ID: `cbe2df21-a9a7-8373-a704-01fc644a65df` (UUID with hyphens)
>
> You can paste it with or without hyphens — the Notion API handles both.

### 2-2. Verify DB access

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID="<user-provided DB ID>"
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '{title: .title[0].plain_text, id: .id}'
```

**Success** (title and ID returned):
> Connected to database: {title}

**Failure**:
> Cannot access the database. Please verify the Integration is connected to this DB.
> - In Notion, open the DB page > "..." > "Connections" > add your Integration.

### 2-3. Property discovery & mapping

Fetch all properties from the database grouped by type:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID="<verified DB ID>"

curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '.properties | to_entries[] | {name: .key, type: .value.type}'
```

#### a) Title property (auto-detect)

Find the property with `type: "title"`:

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r '.properties | to_entries[] | select(.value.type == "title") | .key'
```

There is always exactly one title property. Save it to `propertyMap.title` automatically.

#### b) Status property (select type)

List all `select` type properties:

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '[.properties | to_entries[] | select(.value.type == "select") | .key]'
```

- **Zero found** — report error: "No `select` type properties found. A select property is required for both status and severity tracking. Please add them in Notion and re-run setup."
- **One or more found** — present the list to the user and ask:
  > Which of these select properties represents the **status** of an issue?
  > [list of select property names]

Save the user's choice to `propertyMap.status`.

#### c) Status option mapping

After identifying the status property, list its options:

```bash
STATUS_PROP="<chosen status property name>"
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq --arg prop "$STATUS_PROP" '[.properties[$prop].select.options[].name]'
```

Present the options and ask the user to map each semantic status:

> Here are the options for "{STATUS_PROP}":
> [list of option names]
>
> Please tell me which option corresponds to each status:
> 1. **Pending / To-do** — which option?
> 2. **In progress** — which option?
> 3. **Ready to deploy / Done** — which option?

Save to `statusMap`:
```json
{
  "pending": "<user's answer for 1>",
  "inProgress": "<user's answer for 2>",
  "done": "<user's answer for 3>"
}
```

#### d) Severity property (select type)

From the remaining `select` properties (excluding the one chosen for status), ask the user:

> Which of these select properties represents **severity / priority**?
> [list of remaining select property names]

- If no remaining select properties exist, report: "No additional select property available for severity. Please add a severity select property in Notion and re-run setup."

Save the user's choice to `propertyMap.severity`.

Then save its options:

```bash
SEVERITY_PROP="<chosen severity property name>"
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq --arg prop "$SEVERITY_PROP" '[.properties[$prop].select.options[].name]'
```

Save the resulting array to `severityOptions`.

#### e) Tags property (multi_select type)

List all `multi_select` type properties:

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '[.properties | to_entries[] | select(.value.type == "multi_select") | .key]'
```

- **Zero found** — report error: "No `multi_select` type properties found. A multi_select property is required for tags. Please add one in Notion and re-run setup."
- **One or more found** — ask: "Which multi_select property represents **tags / labels**?"

Save to `propertyMap.tags`.

#### f) Assignee property (people type)

List all `people` type properties:

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '[.properties | to_entries[] | select(.value.type == "people") | .key]'
```

- **Zero found** — report error: "No `people` type properties found. A people property is required for assignee tracking. Please add one in Notion and re-run setup."
- **One or more found** — ask: "Which people property represents the **assignee**?"

Save to `propertyMap.assignee`.

#### g) Notes property (rich_text type — optional)

List all `rich_text` type properties:

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '[.properties | to_entries[] | select(.value.type == "rich_text") | .key]'
```

- **Zero found** — skip silently. Leave `propertyMap.notes` as empty string.
- **One or more found** — ask: "Which rich_text property should be used for **notes / reason**? (optional — press Enter to skip)"

Save to `propertyMap.notes` if chosen, otherwise leave empty.

### 2-4. Save DB ID and property map

Write all gathered values to the config file:

```bash
jq \
  --arg db_id "<verified DB ID>" \
  --arg title_prop "<auto-detected title>" \
  --arg status_prop "<chosen status>" \
  --arg severity_prop "<chosen severity>" \
  --arg tags_prop "<chosen tags>" \
  --arg assignee_prop "<chosen assignee>" \
  --arg notes_prop "<chosen notes or empty>" \
  --arg status_pending "<mapped pending>" \
  --arg status_progress "<mapped in progress>" \
  --arg status_done "<mapped done>" \
  --argjson severity_opts '["opt1","opt2"]' \
  '
    .databases.issueTracker.id = $db_id |
    .propertyMap.title = $title_prop |
    .propertyMap.status = $status_prop |
    .propertyMap.severity = $severity_prop |
    .propertyMap.tags = $tags_prop |
    .propertyMap.assignee = $assignee_prop |
    .propertyMap.notes = $notes_prop |
    .statusMap.pending = $status_pending |
    .statusMap.inProgress = $status_progress |
    .statusMap.done = $status_done |
    .severityOptions = $severity_opts
  ' .claude/tracking-issue.json > .claude/tracking-issue.json.tmp \
  && mv .claude/tracking-issue.json.tmp .claude/tracking-issue.json
```

### 2-5. (Optional) Field feedback DB

Ask the user:

> Would you also like to connect a field feedback database? (optional)
> This lets you log field observations and feedback to a separate DB.

If yes, repeat steps 2-1 through 2-2 for the field feedback DB. Only the title property needs to be verified (the rest is optional). Save to `databases.fieldFeedback.id`.

---

## Step 3 — Template Detection

### 3-1. Query the most recent page

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')

curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "sorts": [{"timestamp": "created_time", "direction": "descending"}],
    "page_size": 1
  }' \
  | jq '{total: .results | length, page_id: .results[0].id, title: .results[0].properties[(.results[0].properties | to_entries[] | select(.value.type=="title") | .key)].title[0].plain_text}'
```

**If a page exists:**

Fetch its block children to inspect the body structure:

```bash
TEMPLATE_PAGE="<retrieved page_id>"
curl -s "https://api.notion.com/v1/blocks/${TEMPLATE_PAGE}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '[.results[] | {type: .type}]'
```

Show the block structure and ask:

> The most recent page "{title}" has this body structure:
> [list of block types]
>
> Would you like to use this page as the body template for new issues?

If confirmed, save `databases.issueTracker.templatePageId`:

```bash
jq --arg tid "<TEMPLATE_PAGE>" '.databases.issueTracker.templatePageId = $tid' .claude/tracking-issue.json > .claude/tracking-issue.json.tmp && mv .claude/tracking-issue.json.tmp .claude/tracking-issue.json
```

**If the DB is empty (no pages):**

Offer to create a default template:

> The database has no existing pages. Would you like to create a default issue template?
>
> Default template structure:
> - callout: "Issue body template. Edit as needed."
> - heading_2: "1. Problem Description" + paragraph
> - heading_2: "2. Location" + bulleted_list_item (App / Screen)
> - heading_2: "3. Reproduction Steps" + paragraph
> - heading_2: "4. Screenshots" + paragraph
> - divider
> - heading_3: "(Developer) Probable Cause" + paragraph

If the user agrees, create the template page:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')

# Get the title property name
TITLE_PROP=$(curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r '.properties | to_entries[] | select(.value.type == "title") | .key')

# Create template page
TEMPLATE_PAGE=$(curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "'"$DB_ID"'"},
    "properties": {
      "'"$TITLE_PROP"'": {"title": [{"text": {"content": "[Template] Issue Body Structure"}}]}
    }
  }' | jq -r '.id')

# Add block children
curl -s -X PATCH "https://api.notion.com/v1/blocks/${TEMPLATE_PAGE}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Issue body template. Edit as needed."}}], "icon": {"type": "emoji", "emoji": "📝"}, "color": "blue_background"}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "1. Problem Description"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": []}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "2. Location"}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "App: "}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Screen: "}}]}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "3. Reproduction Steps"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": []}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "4. Screenshots"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": []}},
      {"type": "divider", "divider": {}},
      {"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": "(Developer) Probable Cause"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": []}}
    ]
  }'
```

Save the template page ID:

```bash
jq --arg tid "$TEMPLATE_PAGE" '.databases.issueTracker.templatePageId = $tid' .claude/tracking-issue.json > .claude/tracking-issue.json.tmp && mv .claude/tracking-issue.json.tmp .claude/tracking-issue.json
```

---

## Step 4 — Defaults & Gitignore

### 4-1. (Optional) Default assignee

> Would you like to set a default assignee for new issues? (optional)
> If set, issues without an explicit assignee will be assigned to this person.

If yes, list workspace users:

```bash
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
curl -s "https://api.notion.com/v1/users" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '.results[] | select(.type == "person") | {id: .id, name: .name}'
```

After the user selects a person:

```bash
jq --arg aid "<selected user ID>" --arg aname "<selected name>" \
  '.defaults.assigneeId = $aid | .defaults.assigneeName = $aname' \
  .claude/tracking-issue.json > .claude/tracking-issue.json.tmp && mv .claude/tracking-issue.json.tmp .claude/tracking-issue.json
```

### 4-2. .gitignore check

The config file contains the API key, so it **must** be gitignored:

```bash
git check-ignore .claude/tracking-issue.json 2>/dev/null
```

- **Output present** (already gitignored) — pass.
- **No output** (not gitignored) — add it:

```bash
echo "" >> .gitignore
echo "# Notion issue tracker config (contains API key)" >> .gitignore
echo ".claude/tracking-issue.json" >> .gitignore
```

> Added `.claude/tracking-issue.json` to `.gitignore`.

---

## Done — Configuration Summary

Once all steps are complete, display a summary:

```
Notion Issue Tracker Setup Complete

  API connection:       {Integration name}
  Issue tracker DB:     {DB title} ({first 8 chars of DB ID}...)
  Property mapping:
    Title:              {propertyMap.title}
    Status:             {propertyMap.status}
    Severity:           {propertyMap.severity}
    Tags:               {propertyMap.tags}
    Assignee:           {propertyMap.assignee}
    Notes:              {propertyMap.notes or "not set"}
  Status mapping:
    Pending:            {statusMap.pending}
    In progress:        {statusMap.inProgress}
    Done:               {statusMap.done}
  Severity options:     {severityOptions joined by ", "}
  Template page:        {present / none}
  Field feedback DB:    {DB title or "not set"}
  Default assignee:     {name or "not set"}
  .gitignore:           {included}

You can now use /tracking-issue-report to file issues,
and /tracking-issue-resolve to process them.
```

**WARNING: Never include the API key value in the summary.**

---

## Error Message Reference

| Situation | Message |
|---|---|
| jq not installed | "`jq` is required. Install it with `brew install jq` (macOS), `sudo apt install jq` (Ubuntu), or `choco install jq` (Windows)." |
| API key invalid | "The Notion API key is invalid. Please check your token." |
| DB inaccessible | "Cannot access the database. Please verify the Integration is connected to this DB." |
| No select properties | "No `select` type properties found. Status and severity require select properties. Please add them in Notion." |
| No multi_select properties | "No `multi_select` type properties found. Tags require a multi_select property. Please add one in Notion." |
| No people properties | "No `people` type properties found. Assignee tracking requires a people property. Please add one in Notion." |
