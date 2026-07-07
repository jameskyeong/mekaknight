# Plan — mekaknight 리브랜드 + 명령어 메카 톤 통일

> **결정 일자**: 2026-05-29 저녁 세션 (집)
> **상태**: 작성 완료, 실행 대기
> **선행 결정**: 핸드오프 `jameskill-v2-handoff-2026-05-29-pm.md` Week 1-2 완료

---

## 1. 결정 요약

### 브랜드
- **패키지명**: `jameskill` → `mekaknight`
- **플러그인 namespace**: `/jameskill:*` → `/mekaknight:*`
- **컨셉**: 메카 + 나이트. D.Va MEKA 톤 (한국 출신 메카 정체성)
- **이유**: jameskill은 의미 모호, 차별화 약함. mekaknight는 컨셉이 패키지명에서 즉시 드러남. npm/GitHub user/IP 충돌 0.

### 명령어 매핑 (옵션 B — 메카 콜사인 톤)

| 구 | 신 | 의미 |
|---|---|---|
| `temper` | **`forge`** | 코드 단련/제작 (build with discipline) |
| `harden` | **`lock`** | 출항 전 lockdown 점검 (security inspection) |
| `ship-ready` | **`launch`** | cleared for launch — GO/NO-GO |
| `setup-issue` | **`link`** | HQ 통신 채널 연결 (Notion API) |
| `report-issue` | **`tag`** | 목표 식별/표시 (이슈 등록) |
| `resolve-issue` | **`strike`** | 격파/해결 (이슈 처리) |

> `workflow-external`은 v1.x legacy 보존이라 그대로 유지. 단, 문서엔 deprecated 명시.

### vibe coding 단어 처리 (확정)
- SKILL description은 **중립화** (예: "vibe-coded project" → "service-configuration security holes that scanners miss")
- README / 마케팅 / 데모 콘텐츠에는 **유지**

---

## 2. 영향 영역 5개

### A. 브랜드/패키지/marketplace
- `package.json` — `name: jameskill` → `mekaknight`
- `.claude-plugin/marketplace.json` — plugin name + url + marketplace name 변경
- GitHub repo 이름 변경 (사용자 액션 필요, 마지막 phase)

### B. 디렉토리명
- `skills/temper/` → `skills/forge/`
- `skills/harden/` → `skills/lock/`
- `skills/ship-ready/` → `skills/launch/`
- `skills/setup-issue/` → `skills/link/`
- `skills/report-issue/` → `skills/tag/`
- `skills/resolve-issue/` → `skills/strike/`
- `skills/workflow-external/` — 유지 (deprecated)
- `skills/issue-references/` — 내부 참조만 업데이트 (디렉토리명 유지)

### C. SKILL.md 내부 (각 파일 name/description/cross-ref)
- 6개 SKILL.md: name 필드 + description (vibe 단어 중립화 포함) + 내부 cross-ref
  - 예: `strike/SKILL.md` 안에 "invoke `jameskill:temper`" → "invoke `mekaknight:forge`"
- `issue-references/issue-builder.sh` 내부 참조 grep + 업데이트

### D. 문서 (vibe 중립화 + 신규 명령어 + 브랜드 모두 일괄)
- `README.md`, `CLAUDE.md`, `CONTEXT.md`
- `docs/strategy/competitive-landscape.md`
- `docs/strategy/v2-marketing.md`
- `docs/strategy/v2-roadmap.md`
- `docs/strategy/v2-skill-catalog.md`
- `docs/strategy/v2-vision.md`
- `docs/strategy/jameskill-v2-handoff-*.md` — history 파일이라 본문은 그대로 두되 상단에 "[history — v1 명칭으로 작성됨]" 노트 추가
- `docs/adr/0001-self-contained-orchestrator.md` — 본문 그대로, 상단에 "v1 명칭 사용" 노트
- `docs/plans/jameskyeong/temper-lite-orchestrator.md`, `docs/plans/jameskyeong/harden-ship-ready-v0.1.md` — history 동일 처리
- **신규**: `docs/adr/0002-mekaknight-rebrand.md` (이 결정 기록)

### E. v1.x 마이그레이션 안내
- `README.md` 상단에 breaking change 섹션 추가
- 명령어 매핑 표 README에 첨부
- CHANGELOG 또는 README 안에 v1→v2 마이그레이션 1단락

---

## 3. 마이그레이션 phase (commit 분할)

### Phase 0 — Plan + ADR (코드 변경 0)
- 이 plan 문서 commit
- `docs/adr/0002-mekaknight-rebrand.md` 신규 작성
- commit: `docs: plan mekaknight rebrand + command rename`

### Phase 1 — 명령어 디렉토리 리네임 + SKILL.md 내부 업데이트
- 6개 디렉토리 mv
- 6개 SKILL.md name/description 변경 (vibe 중립화 동시)
- cross-ref 일괄 변경 (`jameskill:temper` → `mekaknight:forge` 등)
- issue-builder.sh 참조 업데이트
- commit: `refactor: rename skills to meka callsign tone (forge/lock/launch + link/tag/strike)`

### Phase 2 — 패키지/namespace/플러그인 리브랜드
- package.json name 변경
- marketplace.json plugin name + url 변경 (url은 GitHub repo 변경 후 최종, 우선 새 이름으로)
- commit: `feat!: rebrand to mekaknight`

### Phase 3 — 문서 일괄 + history 노트
- README/CLAUDE/CONTEXT/strategy/* 일괄
- history 파일들(handoff/old plans/ADR) 상단 노트 추가만
- 신규 ADR 0002 본문 작성
- commit: `docs: update for mekaknight brand + meka callsign commands`

### Phase 4 — 마이그레이션 안내 추가
- README breaking change 섹션 + 명령어 매핑 표
- v1→v2 마이그레이션 한 단락
- 버전 bump: `2.0.0-alpha.2` → `2.0.0-alpha.3` (alpha 내 변경)
- commit: `docs: v1→v2 migration guide`

### Phase 5 — 검증
- `rg "jameskill"` 결과 확인 (history 노트 + 마이그레이션 안내 외 0이어야 함)
- 6개 신규 명령어 SKILL.md description grep으로 명확히 식별되는지
- npm pack dry-run으로 mekaknight 이름 확인
- main에 push
- commit 없음 (검증 단계)

### Phase 6 — 사용자 액션 (GitHub repo 이름 변경)
- GitHub 콘솔에서 `jameskill` → `mekaknight` 변경
- marketplace.json url 최종 업데이트 + commit
- 이 phase는 사용자가 직접 수행

---

## 4. v1.x 사용자 마이그레이션 (README 안내)

### 명령어 매핑 (위 표 재게재)
사용자 입장 변경:
```
/jameskill:temper       → /mekaknight:forge
/jameskill:harden       → /mekaknight:lock
/jameskill:ship-ready   → /mekaknight:launch
/jameskill:setup-issue  → /mekaknight:link
/jameskill:report-issue → /mekaknight:tag
/jameskill:resolve-issue → /mekaknight:strike
```

### 설치 변경
```
# 구
npm install jameskill
/plugin install jameskill

# 신
npm install mekaknight
/plugin install mekaknight
```

> v2.0.0-alpha.3 시점에 적용. 정식 출시(v2.0.0) 시 README 상단 hero에 변경 강조.

---

## 5. 검증 기준

| 항목 | 기준 |
|---|---|
| jameskill 잔여 키워드 | `rg "jameskill" --type-not md` = 0. 문서에선 마이그레이션 안내 + history 외 0 |
| 신규 명령어 매핑 | 6개 SKILL.md `name:` 필드와 디렉토리명 일치 |
| 패키지 빌드 | `npm pack` 결과물 mekaknight-*.tgz |
| Marketplace lint | manifest.json parse 통과 |
| Cross-ref 무결성 | `strike/SKILL.md`에서 `mekaknight:forge` 호출 명시 확인 |
| 캐시 로드 (Phase 6 후) | `/mekaknight:forge` Claude Code 캐시에서 호출 가능 |

---

## 6. 미결정 / 위험

### 미결정
- **Twitter handle / 도메인** — 이번 plan 스코프 밖. 별도로 `@mekaknight`, `mekaknight.dev`/`.com` 점유 확인 후 결정
- **v1 npm 패키지 처리** — deprecate notice 박을지, 그대로 둘지. v2.0 출시 시점에 판단
- **GitHub repo redirect** — GitHub이 자동 처리하지만 marketplace.json url 변경 타이밍 주의

### 위험
- **플러그인 캐시 v1.11.1 문제 잔존** — Week 1-2 핸드오프에 언급된 캐시 이슈. 리브랜드 후에도 별도 해결 필요
- **history 문서 일관성 손상** — 옛 핸드오프/plan 안에 jameskill/temper/harden 박혀 있어 검색 시 혼동. 상단 노트로 보완
- **마케팅 모멘텀 분산 가능성** — alpha 단계라 영향 적지만, v2 정식 출시 직전이면 신중. 지금이 alpha라 적절한 타이밍

---

## 7. 다음 작업

이 plan commit 후 Phase 1부터 순차 진입. 작업 절차는 **temper(=forge) 자체 워크플로우**로 — 명령어가 리네임된 후엔 forge로 부르기.
