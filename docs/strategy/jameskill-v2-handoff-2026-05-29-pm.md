# jameskill v2.0 — Handoff (Week 1-2 완료 시점)

> ⚠️ Historical document — written under v1 names. See [ADR 0002](../adr/0002-mekaknight-rebrand.md) for the v2 rebrand. Command mapping: `temper`→`forge`, `harden`→`lock`, `ship-ready`→`launch`, `setup-issue`→`link`, `report-issue`→`tag`, `resolve-issue`→`strike`.

> **작성**: 2026-05-29 오후 세션 (회사 PC, Opus 4.8)
> **이전 핸드오프**: `jameskill-v2-handoff-2026-05-29.md` (전략 산출물 완료 시점)
> **현재 위치**: M1 Week 2 완료 → **Week 3 시작 직전**

---

## 한 줄 요약

M1 **Week 1 (temper) + Week 2 (harden + ship-ready) 코드 작업 완료**, `2.0.0-alpha.2`로 push 완료. 다음은 **Week 3: harden v0.2 (+2 checks) + 본업 dogfooding으로 실제 결함 1개 발견**.

---

## 지금까지 한 일 (Week 1-2)

### Week 1 — temper (자체 워크플로우)

기존 `workflow` 스킬(superpowers + Matt Pocock 의존)을 자체 완결 오케스트레이터로 교체.

- **`/temper`** 신규 (`skills/temper/SKILL.md`) — 외부 스킬 의존 0.
  - Phase: Preflight → Clarify → Route(DIRECT/PLAN) → Build(엄격 TDD) → Peer-review(Agent) → [Ship-check 빈 슬롯] → Verify → Finish
  - 핵심 철학 내재화: 5카테고리 모호성 체크리스트, RED→GREEN→REFACTOR, 금지 표현 7개 목록, 두 축 리뷰
- 기존 workflow는 **`/workflow-external`** 로 보존 (`skills/workflow-external/`)
- `resolve-issue`가 `jameskill:temper` 호출하도록 변경
- **이름 결정**: workflow → `temper` (담금질). 야금 테마: temper → harden → ship-ready

### Week 2 — harden + ship-ready (보안 스킬)

vibe-coded 앱의 **서비스 구성 보안 구멍**을 점검. semgrep이 못 잡는 영역.

- **`/harden`** (`skills/harden/SKILL.md`) — v0.1, 3개 체크:
  1. Supabase RLS 비활성 (CLI dump / 마이그레이션 fallback)
  2. 시크릿 키 클라이언트 노출 (`NEXT_PUBLIC_*SECRET`, `sk_live_` in client)
  3. Stripe webhook signature 검증 누락 (`constructEvent`)
  - 출력: PASS/WARN/BLOCK + file:line + 수정 제안. read-only. BLOCK 보수적.
- **`/ship-ready`** (`skills/ship-ready/SKILL.md`) — v0.1:
  - harden 호출 → BLOCK ≥1 이면 NO-GO, 0이면 GO. 확장 슬롯(polish/dedupe) 준비됨.
  - **이름 결정**: `ship-ready?`의 `?`는 파일시스템 안전 위해 제거. 출력엔 "SHIP READY?" 유지.

**독립 리뷰가 잡은 핵심 (이미 수정 완료)**: harden 초안에 false-BLOCK 3건 (App Router 기본값 반전, `SK`가 TASK/DISK 오매칭, 대시보드 RLS 오탐). 모두 "정상 코드 오차단" — vibe coder 신뢰 깨는 최악 유형이라 수정. 패턴은 실제 실행으로 검증함.

### 이름/구조 결정 (확정)

| 구 | 신 | 이유 |
|---|---|---|
| `workflow` | `temper` | 야금 테마, 차별화 |
| `auth-check` | `harden` | "auth"는 범위 절반만 커버 — 구성 보안 전반 |
| `ship-ready?` | `ship-ready` | 파일시스템 안전 |

전체 스킬 생태계 스토리: **temper(단련) → harden(경화) → ship-ready(출항 판정)**

---

## 산출물 위치

| 파일 | 내용 |
|---|---|
| `skills/temper/SKILL.md` | 자체 워크플로우 (Week 1) |
| `skills/harden/SKILL.md` | 보안 점검 v0.1 (Week 2) |
| `skills/ship-ready/SKILL.md` | GO/NO-GO 판정 v0.1 (Week 2) |
| `skills/workflow-external/SKILL.md` | 구 workflow 보존 |
| `CONTEXT.md` | 도메인 용어집 (temper/harden/ship-ready/production-readiness gate) |
| `docs/adr/0001-self-contained-orchestrator.md` | 외부 의존 제거 결정 기록 |
| `docs/plans/jameskyeong/temper-lite-orchestrator.md` | Week 1 plan |
| `docs/plans/jameskyeong/harden-ship-ready-v0.1.md` | Week 2 plan |

**버전**: `2.0.0-alpha.2`, main에 push 완료 (commit `43766f4`).

---

## ⚠️ 알아둘 환경 이슈

**플러그인 캐시가 아직 v1.11.1.** `/jameskill:temper`로 호출하면 "Unknown skill" 에러 남 (캐시에 옛 버전만 있음). Week 2 작업 때 temper 스킬을 직접 호출 못 하고 SKILL.md 절차를 수동으로 따라감.

→ 새 스킬을 실제로 호출해서 쓰려면 플러그인 재설치/업데이트 필요:
- `/plugin` 메뉴에서 jameskill 업데이트, 또는 marketplace 재설치
- 아니면 로컬 `skills/` 를 `~/.claude/plugins/` 에 심볼릭 링크

**dogfooding 전에 이걸 먼저 해결해야 `/harden`을 실제 프로젝트에서 호출 가능.**

---

## 다음 할 일 — Week 3

### 1. harden v0.2 — 점검 2개 추가 (`skills/harden/SKILL.md` 확장)

- [ ] **Clerk/NextAuth env 강도** — 키 길이 + 엔트로피 + dev key가 prod에 누출됐는지
- [ ] **Frontend-only auth 탐지** — API route에 서버 검증 없이 client validation만 있는 경우 (cross-file 분석)
- v2-skill-catalog.md의 8개 체크 중 3,6번. 나머지(raw body order, plan-limit, idempotency)는 더 뒤로.

### 2. ship-ready v0.2

- [ ] 막힌 항목 리스트 + auto-fix 제안 "흉내" (실제 수정은 아직 X)

### 3. 본업 dogfooding (Week 3 핵심 — 모든 동력의 시작)

- [ ] **플러그인 캐시 업데이트 먼저** (위 환경 이슈)
- [ ] 본업 i-screammedia 프로젝트 중 Supabase/Stripe/Clerk 쓰는 가장 작은 것 1개 선정
- [ ] `/harden` → `/ship-ready` 호출 → **실제 결함 1개 이상 발견**
- [ ] 발견 항목 익명화 스크린샷 (회사 코드/URL 노출 금지)

### 4. 트위터 데모 영상 1개 녹화

- [ ] "vibe-coded 앱 보안 자동 점검" 30초~1분
- 익명화된 화면만. v2-roadmap.md 본업 dogfooding 주의사항 참조.

### Week 3 완료 기준 (로드맵)

- 본업 프로젝트 1개에서 `/ship-ready` → 실제 결함 1개 이상 발견
- 트위터 데모 영상 1개 녹화

---

## 작업 방식 메모

- **temper 절차로 작업** — clarify(끈질긴 질문) → plan → build → 독립 peer-review → verify → finish. 매 작업 commit 분리.
- **독립 리뷰 꼭 거칠 것** — Week 2에서 false-BLOCK 3건을 리뷰가 잡았음. harden은 "정상 코드 오차단"이 제일 위험하므로 패턴은 **실제 실행해서** 검증.
- **BLOCK은 보수적으로** — 애매하면 WARN. false BLOCK이 missed WARN보다 신뢰를 더 빨리 깎음.
- 진입 명령: `docs/strategy/v2-roadmap.md` Week 3 + 이 핸드오프 문서를 컨텍스트로.

---

## 미결정 TBD (이전 핸드오프에서 이어짐)

| 항목 | 결정 시점 |
|---|---|
| `/polish` Vision 모델 비용/속도 | M2 (Week 4) |
| `/ship-ready` 정량 임계값 (현재 Security만 차단) | M4 (Week 10) |
| GitHub Issues 백엔드 v2.0 vs v2.1 | M4 |
| Semgrep organization (회사 vs 개인) | 보안 스킬 wrap 시점 (M4) |
| 본업 dogfooding 대상 프로젝트 | **Week 3 시작 시 (지금)** |
