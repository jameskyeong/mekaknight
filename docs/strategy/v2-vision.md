# mekaknight v2.0 — Vision

> 작성일: 2026-05-28 (피벗 반영 2026-05-30)
> 상태: Draft. ADR 0004 narrow pivot 반영. ADR 0003 (lite-wrap)은 superseded.

## 한 줄 정체성

> **mekaknight — A disciplined Claude Code workflow + an issue tracker that reads like a problem statement.**

한국어 부캐: *"엄격한 Claude Code 워크플로 + 문제 진술처럼 읽히는 이슈 트래커."*

## Why narrow, not wrap

ADR 0003은 v2.0을 16주 deep build에서 6-8주 lite wrap (lock이 semgrep/gitleaks/supabase CLI를 wrap, launch가 verdict surface)으로 좁혔다. 더 들여다보니: wrap layer도 여전히 사용자에게 외부 inspector 설치를 강제하고, 저자가 매일 쓰지 않는 도구 위에 마케팅을 얹는 구조였다. ADR 0004는 한 단계 더 좁힌다 — **저자가 매일 dogfood하는 surface만 marketing surface로**: forge (development orchestrator) + tracker (link/tag/strike). lock + launch는 v0.1 그대로 repo + 플러그인에 남되 README/영상 헤드라인 밖. 방향은 출시 후 사용자 demand로 결정. 상세: `docs/adr/0004-narrow-v2-to-forge-and-tracker.md`.

## 왜 이 정체성인가

### 빈 시장 (관점 재정렬)

- **Claude Code 워크플로 시장**: superpowers (210k★), Matt Pocock (110k★) — 둘 다 합성 가능한 작은 스킬 스택. 외부 plugin install이 전제.
- **이슈 트래커 시장**: Linear / Notion / GitHub Issues — 모두 generic CRUD. AI 코드 컨텍스트에서 "프롬프트가 문제 진술이 된다"는 humane tracking 자리는 비어 있음.
- **빈 자리**: **self-contained 한 명령으로 strict TDD + no-soft-language verification을 강제하는 development orchestrator** + **프롬프트/blob을 문제 진술 단위의 이슈로 변환하는 Notion-네이티브 트래커**. v2.0은 이 두 축에 집중.

### 경쟁 지형의 자리

| 진영 | 자리 | mekaknight과의 관계 |
|---|---|---|
| obra/superpowers (210k★) | 합성 가능한 작은 스킬 스택 (brainstorm → plan → tdd → review) | 그들은 *여러 plugin 조합 + invocation-local*. 우리는 *한 명령 self-contained orchestrator (forge) + 5채널 compound engineering* (repo에 영구 아티팩트 누적). 외부 install 없음 |
| Matt Pocock (110k★) | 엔지니어용 작고 조합 가능한 스킬 | 그들은 엔지니어 합성. forge는 한 명령으로 라우터 기반 묶음 (DIRECT/PLAN/DIAGNOSE/PROTOTYPE) — 결정 비용 ↓ |
| Linear / Notion / GitHub Issues | generic CRUD 트래커 | tracker는 프롬프트 → 문제 진술 변환. 이슈 제목이 commit 메시지가 아닌 문제 진술처럼 읽힘 |
| Anthropic security-guidance | 보안 단일축 (2026.5 출시) | v2.0 marketing surface 와 거의 겹치지 않음. lock/launch가 alpha utility로 인접하나 헤드라인 아님 |
| VIBECODE AUDIT | 사람 컨설팅 $199-599 | 본 v2.0 surface와 무관 |

### 차별화의 세 축

1. **discipline-first** — forge의 strict TDD + no-soft-language verification + 4-way auto-routing (DIRECT/PLAN/DIAGNOSE/PROTOTYPE). "works on my machine" / "should be fine" 같은 soft language를 verification 경계에서 거부. 한 명령 self-contained — superpowers / Matt Pocock 같은 외부 plugin 조합 불필요.
2. **compound-engineering-first** — 매 forge 세션이 repo의 5개 채널(plan files, regression tests, ADR, discipline references, CONTEXT.md domain glossary)에 영구 아티팩트를 deposit. plan + regression test는 자동, ADR/reference/glossary는 Retrospective phase에서 auto-prompt. superpowers처럼 invocation-local로 휘발하지 않음 — codebase가 시간이 갈수록 *easier to work in*.
3. **humane-tracking-first** — tracker의 이슈가 commit 메시지("fix: X")가 아닌 **문제 진술**("사용자가 X를 시도했을 때 Y 상태가 됨")로 읽히도록 프롬프트/blob을 파싱. 코드베이스에 대조 후 검증.

## 타겟 페르소나

### 1차: Claude Code 사용 개발자 (discipline 원함)
- 매일 Claude Code를 사용. superpowers / Matt Pocock 알지만 plugin 조합 부담 또는 self-contained 선호
- "AI가 만든 코드가 작동하긴 하는데 verify 단계가 흐려진다" 문제 의식
- strict TDD를 강제하는 single-command orchestrator 원함

### 2차: Notion 이슈 트래커 사용자
- 이미 Notion에서 이슈 관리 중. generic CRUD 또는 수동 입력에 피로
- AI 코드 컨텍스트에서 "프롬프트 한 덩어리 → grouped issues"가 필요
- 이슈 제목이 의미 있는 문제 진술이길 원함

### 페르소나가 동시에 만족되는 이유
- forge로 작업 → 발견된 추가 이슈를 tag로 트래커에 → 다음 세션에서 strike로 해결
- 두 surface가 한 사람의 일상 작업 루프에 자연스럽게 결합

## 게임 모드: 리드 + 보조 + alpha utilities

- **리드 surface**: `/forge` — 저자가 매일 쓰는 development orchestrator. 모든 마케팅 메시지의 중심.
- **2차 리드**: `/link` `/tag` `/strike` — Notion 트래커. forge와 함께 일상 루프 형성.
- **Alpha utilities (off marketing surface)**: `/lock` `/launch` — v0.1 그대로 repo + 플러그인에 남되 README 헤드라인 밖. v2.1+에서 사용자 demand 보고 방향 결정.

## 시장 규모 (재추정)

- Claude Code 사용 개발자 모집단: 수십만+ (Anthropic 공식 통계 추정)
- discipline-first orchestrator 의향: 10-20% = **수만 명 TAM**
- Notion 사용 개발자: 수십만+
- 두 surface가 겹치는 사용자: forge 사용자의 30-40%가 트래커도 사용 추정
- Claude Code 플러그인 가격대 가정 시 잠재 매출 범위: **연 $5M-$30M** (5-10% 전환)

## 결정된 제약

| 차원 | 결정 |
|---|---|
| 언어 | 글로벌 우선 (영어 README/이슈) + 한국어 부캐 (블로그/디스코드) |
| 페이스 | **1-2주 출시** (ADR 0004 narrow pivot — 새 코드 없음, 문서 + 영상만) |
| 의존성 | superpowers / Matt Pocock 의존 제거 (ADR 0001 — self-contained orchestrator) |
| 이름 | mekaknight 유지 |
| **MVP** | **v2.0 marketing surface = forge + link + tag + strike**. lock + launch는 v0.1 alpha utilities (off marketing surface). polish / dedupe / cohesion-check는 v2.1+ candidates |
| 트래커 백엔드 | Notion 단일 (v2.0). GitHub Issues / Linear 확장은 v2.1+ |

## TBD (산출물 작성 중 결정 필요)

| 항목 | 결정 시점 |
|---|---|
| 영어 콘텐츠 작성 방식 (AI 보조 vs 직접) | v2-marketing.md |
| forge 데모 영상의 실제 feature 선택 | Week 2 시작 |
| tracker 데모 영상의 blob 샘플 (사내 정보 제거) | Week 2 시작 |
| README footer에서 lock/launch 안내 톤 | Week 1 |
| 한국어 부캐 채널 우선순위 (한국 디스코드 / 트위터 / 블로그) | v2-marketing.md |

## 위험과 완화

| 위험 | 완화 |
|---|---|
| superpowers / Matt Pocock 사용자의 "왜 또 다른 orchestrator?" 회의 | "self-contained, no plugin install" + "strict TDD + no-soft-language verification" — 그들이 명시적으로 가지지 않은 두 가지 |
| Anthropic이 인접 Claude Code workflow 플러그인 직접 출시 | 1-2주 출시로 시간 단축. 이름 + 톤 차별화로 방어. Anthropic 출시는 카테고리 검증 신호로 활용 |
| 청중 0에서 시작 — 콘텐츠 마케팅 부담 | product-led growth — forge 실제 세션 클립 + tracker 사용 흐름이 그 자체로 콘텐츠 |
| lock/launch alpha utility 라벨이 "이거 왜 있냐" 질문 받음 | README footer 1 섹션 + ADR 0004 링크 — "출시 후 demand 보고 방향 결정" 투명 표기 |
| 영어 콘텐츠 quality 낮음 → 신뢰 손상 | AI 보조 + 영어 native 본업 동료 1-2명 사전 검수 |
| v0.1 → v2.0 marketing 전환 부담 | 트래커 스킬은 유지, lock + launch는 invocable 유지. Major bump (2.0.0) 명시 |
