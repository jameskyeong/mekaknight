# Required DB Schema

Properties are identified by **role** and **type**, not by name. Actual property names are read from `propertyMap` in the config file.

## Issue Tracker DB

| Role | Notion Type | Required | Required Options |
|---|---|---|---|
| (title) | title | required | -- (detected automatically: the single property with `type: "title"`) |
| status | select | required | Must contain options matching all values in `statusMap` |
| severity | select | required | Must contain options matching all values in `severityOptions` |
| tags | multi_select | required | -- (user-defined, any options accepted) |
| assignee | people | required | -- |
| reason | rich_text | optional | -- |
| (created_by) | created_by | automatic | -- |
| (created_time) | created_time | automatic | -- |

## Validation

Validation is **type-based**: read the property name from `propertyMap`, look it up in the DB schema, and verify its Notion type matches the expected type.

### Step 1: Fetch DB schema

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '.properties | to_entries[] | {name: .key, type: .value.type}'
```

### Step 2: Verify property types

For each role in `propertyMap`, confirm the named property exists and has the correct type:

```bash
# Example: verify that the status property is a select
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq --arg prop "$STATUS_PROP" '.properties[$prop].type'
# Expected output: "select"
```

### Step 3: Verify select options

For `status` and `severity` properties, confirm the required option values exist:

```bash
# Verify status options contain all statusMap values
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq --arg prop "$STATUS_PROP" '[.properties[$prop].select.options[].name]'

# Verify severity options contain all severityOptions values
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq --arg prop "$SEVERITY_PROP" '[.properties[$prop].select.options[].name]'
```

### Step 4: Detect title property

The title property is the one with `type: "title"`. Its name varies per DB:

```bash
TITLE_PROP=$(curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r '.properties | to_entries[] | select(.value.type == "title") | .key')
```
