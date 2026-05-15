# Notion API Curl Patterns

API version: `2022-06-28`

## Loading Config

All examples below depend on variables loaded from the project config. Run this block first:

```bash
# Core config
NOTION_KEY=$(cat .claude/tracking-issue.json | jq -r '.notionApiKey')
DB_ID=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.id')
TEMPLATE_PAGE=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.templatePageId // empty')
ASSIGNEE_ID=$(cat .claude/tracking-issue.json | jq -r '.defaults.assigneeId // empty')

# Property names from propertyMap
STATUS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.status')
SEVERITY_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.severity')
TAGS_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.tags')
ASSIGNEE_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.assignee')
REASON_PROP=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.propertyMap.reason // empty')

# Status option values from statusMap
PENDING_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.pending')
IN_PROGRESS_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.inProgress')
READY_TO_DEPLOY_STATUS=$(cat .claude/tracking-issue.json | jq -r '.databases.issueTracker.statusMap.readyToDeploy')

# Title property (detected by type, not by name)
TITLE_PROP=$(curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq -r '.properties | to_entries[] | select(.value.type == "title") | .key')
```

## Common Headers

```bash
HEADERS=(-H "Authorization: Bearer $NOTION_KEY" -H "Notion-Version: 2022-06-28" -H "Content-Type: application/json")
```

## Token Validation

```bash
curl -s "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  | jq '{name: .name, type: .type}'
```

## Retrieve DB

```bash
curl -s "https://api.notion.com/v1/databases/${DB_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28"
```

## Query DB (filter + sort)

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "'"$STATUS_PROP"'", "select": {"equals": "'"$PENDING_STATUS"'"}},
    "sorts": [{"property": "'"$SEVERITY_PROP"'", "direction": "ascending"}],
    "page_size": 100
  }'
```

## Create Page

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "'"$DB_ID"'"},
    "properties": {
      "'"$TITLE_PROP"'": {"title": [{"text": {"content": "Issue title here"}}]},
      "'"$STATUS_PROP"'": {"select": {"name": "'"$PENDING_STATUS"'"}},
      "'"$SEVERITY_PROP"'": {"select": {"name": "P1"}},
      "'"$ASSIGNEE_PROP"'": {"people": [{"object": "user", "id": "'"$ASSIGNEE_ID"'"}]}
    }
  }'
```

## Update Page Properties

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"'"$STATUS_PROP"'": {"select": {"name": "'"$IN_PROGRESS_STATUS"'"}}}}'
```

## Get Block Children

```bash
curl -s "https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28"
```

## Append Block Children

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/${PAGE_ID}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Notice message"}}], "icon": {"type": "emoji", "emoji": "📝"}, "color": "blue_background"}},
      {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Section heading"}}]}},
      {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Body text"}}]}},
      {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "List item"}}]}},
      {"type": "divider", "divider": {}},
      {"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": "Sub-heading"}}]}}
    ]
  }'
```

## Delete Block

```bash
curl -s -X DELETE "https://api.notion.com/v1/blocks/${BLOCK_ID}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28"
```

## Pagination

When the response contains `has_more: true`, pass `next_cursor` as `start_cursor` in the next request:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"start_cursor": "'"$CURSOR"'", "page_size": 100}'
```
