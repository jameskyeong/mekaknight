# mekaknight v2.0 — Roadmap

> ~1-2주 finishing touches 후 출시. 새로운 코드 작업 없음 — 문서·마케팅 정렬 + 데모만.
> 피벗 근거: `docs/adr/0004-narrow-v2-to-forge-and-tracker.md`. 상세 계획: `docs/plans/v2-narrow-pivot.md`.
> ADR 0003 (lite-wrap)은 superseded. v2.0 surface는 forge + tracker로 좁혀졌고, lock + launch는 alpha utilities로 마케팅 surface 밖에 둠.

## 핵심 원칙

1. **forge가 리드** — 저자가 매일 쓰는 development orchestrator. strict TDD + no-soft-language verification이 차별점.
2. **tracker가 2차 리드** — link/tag/strike. 기존 Notion 사용 위에 자연스럽게 얹힘 ("이슈 제목이 문제 진술처럼 읽힌다").
3. **dogfooded only ships** — 저자가 매일 안 쓰는 것은 v2.0 surface에서 빠짐. lock + launch는 repo + plugin에는 남되 README 헤드라인에 없음.
4. **1-2주 출시** — 추가 코드 없음. 문서 정렬 + 영상 2-3개 + 출시 패키지.

## 타임라인

```
Week 1 ──┬──  📝 doc + marketing alignment
         │     README 리드 재구성 (forge + tracker)
         │     CONTEXT.md 에서 lock/launch "v2.0 alpha, off marketing surface" 표시
         │     strategy 4문서 narrow-pivot 정렬
         │     버전 bump: 2.0.0-alpha.3 → 2.0.0-rc.1
         │
Week 2 ──┴──  🎬 demos + launch prep
              영상 1: /forge end-to-end (~2분, 실제 feature 1개)
              영상 2: /tag → grouped Notion issues → /strike (~1-2분)
              영상 3 (옵션): /lock + /launch "available, not the headline" (~30초)
              marketplace 등록 카피
              HN/PH/Reddit/한국 커뮤니티 출시 글 초안

Ship ──── 화요일 09:00 PST
              HN Show HN / PH / Reddit / X / 한국 커뮤니티 동시
              v2.0.0 태그
              출시 후 1주일 daily build-in-public follow-up
```

## 작업 상세

### Week 1 — doc + marketing alignment

**목표**: 새 surface (forge + tracker)에 맞게 진입 경로 전부 정렬. lock + launch는 "alpha utilities" 라벨로 footer 영역에 보존.

**작업**:
- README.md — lock/launch를 리드 pitch에서 제거. forge + tracker 중심 재구성. 맨 아래 "Experimental / available utilities" 작은 섹션에 lock + launch 안내 (v2.0 헤드라인 아님, v2.1+에서 방향 결정).
- CONTEXT.md — lock + launch 항목에 "v2.0 alpha, off marketing surface" 명시.
- strategy 4문서 narrow-pivot 정렬 (본 문서 포함).
- npm version → `2.0.0-rc.1` (코드 변경 없지만 scope 변화가 크기 때문에 RC로 승격).

**완료 기준**:
- README/CONTEXT.md/strategy 4문서에서 "production-readiness gate" / "one command, one decision" 문구 0개.
- lock/launch가 README 헤드라인에 등장하지 않음. footer 영역에만 1회 언급.

### Week 2 — demos + launch prep

**목표**: 저자의 실제 workflow를 보여주는 영상 2-3개 + 출시 채널 패키지 완성.

**작업**:
- 영상 1 — `/forge` end-to-end (~2분). 실제 작은 feature 하나를 clarify → route → build-with-tests → verify → **retrospective** → finish 까지. 마지막 retrospective에서 ADR/reference 한두 개 deposit되는 장면이 compound engineering 입증 클립. 저자의 실제 사용 세션이 그대로 콘텐츠.
- 영상 2 — tracker (~1-2분). Slack 스타일 blob 한 덩어리를 `/tag`에 넘김 → Notion에 grouped issues로 생성 → `/strike`로 한 개 해결.
- (옵션) 영상 3 — `/lock` + `/launch` (~30초). "있긴 한데 헤드라인은 아님" 톤. 호기심 있는 사용자만 보면 됨.
- marketplace 등록 카피 (Anthropic 공식 + claudemarketplaces.com).
- HN Show HN / PH / Reddit r/ClaudeAI + r/programming / X thread / 한국 개발자 커뮤니티 1편 초안.

**완료 기준**:
- 영상 1, 2 녹화 완료. 영상 3은 옵션.
- 모든 출시 글에서 리드 메시지가 "disciplined Claude Code workflow + humane issue tracker"로 일관.

### Ship

- **출시일**: 화요일 09:00 PST (HN 골든타임)
- HN Show HN + PH + Reddit r/ClaudeAI + r/programming + X thread + 한국 커뮤니티 동시
- v2.0.0 태그 + npm publish
- 출시 후 1주일 daily build-in-public follow-up (사용자 피드백 → 즉시 응답 → 트윗)

**완료 기준**:
- HN 1st page 진입 시도 (3-6시간 안에 50+ upvote)
- 1주일 안에 GitHub star 200+ (보수)
- forge 또는 tracker에 대한 실제 사용 보고 ≥ 3건

## 본업 dogfooding 전략

**전제**: 저자가 매일 쓰는 것만 ship하므로 dogfooding은 합성 시나리오가 아닌 실제 작업 세션.

| Surface | dogfooding 출처 |
|---|---|
| `/forge` | 저자 본인의 feature 작업 (mekaknight 자체 + 사이드 프로젝트) |
| `/link` `/tag` `/strike` | 저자가 이미 사용 중인 Notion 이슈 트래커 |

**dogfooding이 만드는 콘텐츠**:
- `/forge` 실제 세션 클립 ("내가 매일 이걸로 작업한다")
- 트래커 사용 흐름 ("내 Slack blob이 Notion 이슈가 된다")
- 합성 보안 데모 불필요 — lock + launch는 헤드라인 밖에 있음

**주의**:
- 본업 회사 코드/데이터 노출 금지 — 영상은 mekaknight 자체나 익명화된 사이드 프로젝트로
- 사내 정책 사전 확인

## 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| Anthropic이 인접 Claude Code workflow 플러그인 직접 출시 | 카테고리 노이즈 | 1-2주 출시로 시간 단축. 이름 + 톤(strict TDD + humane tracker) 차별화로 방어. Anthropic 출시는 카테고리 검증 신호로 활용 |
| 청중 0에서 시작 — 출시일 무반응 | 1차 모멘텀 실패 | Reddit + Anthropic Discord + 한국 커뮤니티 백업. PH는 1주 후 재시도 가능 |
| lock/launch가 "alpha label인데도 왜 있나" 질문 받음 | 메시지 혼란 | README footer에 1줄로 명시: "v0.1 utilities, direction deferred to v2.1+ based on user demand" |
| forge가 superpowers/Matt Pocock과 비교당함 | 차별화 의문 | "self-contained, no external skill deps" + "strict TDD + no-soft-language verification" 두 가지를 마케팅 리드로 |
| 출시 후 사용자가 lock + launch만 요청 | v2.1 방향 재조정 부담 | 그게 발견되면 그것이 v2.1 시그널. 미리 결정하지 않음이 ADR 0004의 의도 |
| 본업 적용 거부 (회사 정책) | 영상 콘텐츠 부족 | mekaknight 자체 또는 사이드 프로젝트로 forge 영상 녹화 — 저자가 매일 쓰므로 항상 가능 |

## lock + launch — graceful state

- SKILL.md 파일은 v0.1에서 변경 없음
- 플러그인 매니페스트에 그대로 노출 (사용자 검색 시 발견 가능)
- README footer에 작은 "Available utilities" 섹션으로만 언급
- 출시 후 사용자 요청에 따라 v2.1에서 방향 결정 — wrap / deepen / sunset 중 선택
- 요청 없으면 자연스럽게 footer에 남아 graceful aging

## 출시 후 (v2.1+) — post-launch evaluation

**원칙**: ADR 0004는 lock/launch의 미래를 출시 후 사용자 demand로 결정한다고 명시함. 아래는 후보일 뿐 commit이 아님.

### lock + launch 방향 결정 (출시 후 4-6주)

- 사용자가 명시적으로 요청 → 방향 결정 (wrap layer / 자체 deepen / 통합 surface)
- 요청 없음 → 현 v0.1 상태 유지, 다른 v2.1 항목에 집중

### 후보 항목 (사용자 demand 기반 우선순위)

- 🎨 `/polish` (AI Score) — 결정론적 디자인 클리셰 + 카피 점검 + a11y. Vision API 옵션.
- 🧹 `/dedupe` — jscpd wrap + LLM 의미적 클러스터링.
- 🧹 `/cohesion-check` — 한 파일 다중 책임 감지 + split 제안.
- `/ship-check` 또는 `/launch-check` 우산 — lock/launch 방향 결정 후 재평가.
- tracker 백엔드 확장 — GitHub Issues, Linear.

### v2.2+ (참고)

- 🗄️ DB 영역 (스키마 검토, N+1, 인덱스)
- ⚡ 성능 영역 (Lighthouse wrap)
- 🔥 스트레스 테스트 (k6/Artillery)
- 엔터프라이즈 기능 (조직 정책 등)
