#!/bin/bash
# report-issue 빌더 헬퍼
#
# 검증된 페이지 생성 + 본문 PATCH 로직.
# zsh/bash 셸 호환을 위해 응답 파싱 시 `jq <<< "$var"` here-string 사용.
# (zsh의 builtin echo가 변수 내부 `\n` escape를 raw newline으로 변환하는 문제 회피)
#
# 사용 예:
#   source ../issue-references/issue-builder.sh
#   create_issue /tmp/issue1.json
#
# 입력 JSON 스키마:
#   {
#     "title":    "이슈 제목",
#     "severity": "P0|P1|P2|P3",
#     "tags":     ["태그1", "태그2"],
#     "problem":  "1. 무엇이 문제인가요? 본문",
#     "screen":   "화면: ...",
#     "steps":    ["재현 1단계", "재현 2단계", "재현 3단계"],
#     "devNotes": "(개발자용) 추정 원인 · 관련 PR 본문",
#     "source":   "이름 (YYYY-MM-DD)"   # optional. 없으면 NOTION_SOURCE 환경변수 사용
#   }
#
# 환경 변수 (호출 전 export 필요):
#   NOTION_KEY      — Notion API 키
#   ISSUE_DB_ID     — 대상 DB ID
#   ASSIGNEE_ID     — 기본 담당자 ID (선택)
#   TITLE_PROP      — 제목 컬럼 이름 (Section 6에서 동적 추출한 값)
#   SEVERITY_PROP   — 심각도 컬럼 이름
#   TAGS_PROP       — 태그 컬럼 이름
#   ASSIGNEE_PROP   — 담당자 컬럼 이름
#   SOURCE_PROP     — 출처 컬럼 이름 (없으면 빈 문자열)
#   NOTION_SOURCE   — 기본 출처 텍스트 (선택)
#
# 반환:
#   stdout에 "OK|FAIL|PARTIAL: <title>" + "URL: <page_url>" 출력
#   exit code 0=성공, 1=POST 실패, 2=PATCH 실패(페이지만 생성됨)

create_issue() {
  local input="$1"

  # 입력 파싱
  local title=$(jq -r '.title' "$input")
  local severity=$(jq -r '.severity // empty' "$input")
  local tags_json=$(jq -c '.tags // []' "$input")
  local problem=$(jq -r '.problem // ""' "$input")
  local screen=$(jq -r '.screen // ""' "$input")
  local steps_json=$(jq -c '.steps // []' "$input")
  local dev_notes=$(jq -r '.devNotes // ""' "$input")
  local source_text=$(jq -r '.source // empty' "$input")
  [ -z "$source_text" ] && source_text="$NOTION_SOURCE"

  # 컬럼 이름 기본값 (환경변수 미설정 시)
  local title_prop="${TITLE_PROP:-이슈 제목}"
  local severity_prop="${SEVERITY_PROP:-심각도}"
  local tags_prop="${TAGS_PROP:-태그}"
  local assignee_prop="${ASSIGNEE_PROP:-담당자}"
  local source_prop="${SOURCE_PROP:-출처}"

  # 보조 배열 빌드
  local tags_multi=$(jq -c '[.[] | {name: .}]' <<< "$tags_json")
  local step_blocks=$(jq -c '[.[] | {type: "numbered_list_item", numbered_list_item: {rich_text: [{type: "text", text: {content: .}}]}}]' <<< "$steps_json")

  # properties 빌드 — 값이 있는 컬럼만 포함
  local props=$(jq -n \
    --arg title "$title" \
    --arg title_prop "$title_prop" \
    --arg severity "$severity" \
    --arg severity_prop "$severity_prop" \
    --argjson tags "$tags_multi" \
    --arg tags_prop "$tags_prop" \
    --arg assignee "${ASSIGNEE_ID:-}" \
    --arg assignee_prop "$assignee_prop" \
    --arg source "$source_text" \
    --arg source_prop "$source_prop" \
    '
    {} as $base
    | $base + { ($title_prop): {title: [{text: {content: $title}}]} }
    | if $severity != "" then . + { ($severity_prop): {select: {name: $severity}} } else . end
    | if ($tags | length) > 0 then . + { ($tags_prop): {multi_select: $tags} } else . end
    | if $assignee != "" then . + { ($assignee_prop): {people: [{object: "user", id: $assignee}]} } else . end
    | if $source != "" and $source_prop != "" then . + { ($source_prop): {rich_text: [{text: {content: $source}}]} } else . end
    ')

  # POST /pages
  local page_body=$(jq -n --arg db "$ISSUE_DB_ID" --argjson props "$props" \
    '{parent: {database_id: $db}, properties: $props}')

  local result=$(curl -s -X POST "https://api.notion.com/v1/pages" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d "$page_body")

  # 응답 파싱은 반드시 <<< here-string으로 (echo "$var" | jq 금지 — zsh escape 문제)
  local page_id=$(jq -r '.id // empty' <<< "$result")
  local page_url=$(jq -r '.url // empty' <<< "$result")

  if [ -z "$page_id" ]; then
    local err=$(jq -r '.message // .' <<< "$result")
    echo "FAIL: $title"
    echo "ERROR: $err"
    return 1
  fi

  # PATCH /blocks/{id}/children — 템플릿 구조 복제
  local children=$(jq -n \
    --arg problem "$problem" \
    --arg screen "$screen" \
    --argjson step_blocks "$step_blocks" \
    --arg dev_notes "$dev_notes" \
    '
    [
      {type: "callout", callout: {rich_text: [{type: "text", text: {content: "아래 4개 섹션을 채워주세요. 너무 잘 채우려고 애쓰지 마세요 — 아는 만큼만 적으셔도 됩니다. 태그·심각도는 직접 골라주세요(잘 모르겠으면 비워두셔도 됩니다). 담당자는 담당 팀이 배정합니다."}}], icon: {type: "emoji", emoji: "📝"}, color: "blue_background"}},
      {type: "callout", callout: {rich_text: [{type: "text", text: {content: "(처리자) 상태 변경 시 사유가 필요한 경우 사유 컬럼에 메모를 남기겠습니다. 재작성 요청 → 템플릿 형식 준수할 것 / 불가능 → 기술·정책 사유 / 보류 → 멈춘 이유·재검토 시점."}}], icon: {type: "emoji", emoji: "🛠"}, color: "yellow_background"}},
      {type: "heading_2", heading_2: {rich_text: [{type: "text", text: {content: "1. 무엇이 문제인가요?"}}]}},
      {type: "paragraph", paragraph: {rich_text: [{type: "text", text: {content: $problem}}]}},
      {type: "heading_2", heading_2: {rich_text: [{type: "text", text: {content: "2. 어디서 일어났나요?"}}]}},
      {type: "paragraph", paragraph: {rich_text: []}},
      {type: "bulleted_list_item", bulleted_list_item: {rich_text: [{type: "text", text: {content: "앱: 유저앱"}}]}},
      {type: "bulleted_list_item", bulleted_list_item: {rich_text: [{type: "text", text: {content: $screen}}]}},
      {type: "bulleted_list_item", bulleted_list_item: {rich_text: [{type: "text", text: {content: "URL: "}}]}},
      {type: "bulleted_list_item", bulleted_list_item: {rich_text: [{type: "text", text: {content: "기기: "}}]}},
      {type: "heading_2", heading_2: {rich_text: [{type: "text", text: {content: "3. 어떻게 다시 일어나게 하나요?"}}]}},
      {type: "paragraph", paragraph: {rich_text: []}}
    ]
    + $step_blocks
    + [
      {type: "heading_2", heading_2: {rich_text: [{type: "text", text: {content: "4. 무엇을 보셨나요?"}}]}},
      {type: "paragraph", paragraph: {rich_text: [{type: "text", text: {content: "스크린샷이나 화면 녹화 영상을 이 페이지에 직접 끌어다 놓아주세요. 외부 링크는 시간이 지나면 사라져서 안 됩니다."}}]}},
      {type: "divider", divider: {}},
      {type: "heading_3", heading_3: {rich_text: [{type: "text", text: {content: "(개발자용) 추정 원인 · 관련 PR"}}]}},
      {type: "paragraph", paragraph: {rich_text: [{type: "text", text: {content: $dev_notes}}]}}
    ]
    | {children: .}
    ')

  local patch_result=$(curl -s -X PATCH "https://api.notion.com/v1/blocks/${page_id}/children" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d "$children")

  local patch_object=$(jq -r '.object // empty' <<< "$patch_result")
  if [ "$patch_object" = "error" ]; then
    local err=$(jq -r '.message // .' <<< "$patch_result")
    echo "PARTIAL: $title (properties OK, body failed)"
    echo "URL: $page_url"
    echo "ERROR: $err"
    return 2
  fi

  echo "OK: $title"
  echo "URL: $page_url"
  return 0
}

# 페이지 archive (실패 시 정리용)
archive_page() {
  local page_id="$1"
  curl -s -X PATCH "https://api.notion.com/v1/pages/${page_id}" \
    -H "Authorization: Bearer $NOTION_KEY" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d '{"archived": true}' > /dev/null
}
