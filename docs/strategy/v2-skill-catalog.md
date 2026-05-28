# jameskill v2.0 — Skill Catalog

> v2.0 MVP 스킬 분해. 영역별 추천 스킬 + 우산 명령 + lite 워크플로우.

## 구조 요약

```
jameskill v2.0 (MVP — ~10개 스킬)
├── 우산 명령 (영향력 축)
│   ├── /ship-check        # 종합 점검 (보안+디자인+품질 1분 요약)
│   └── /ship-ready?       # GO / NO-GO 판정 + 사유
│
├── 🔒 보안 (2개)
│   ├── /auth-check        # engine — vibe stack 도메인 구성 점검
│   └── /ship-ready-security  # interface — semgrep + GitGuardian + /auth-check 종합 GO/NO-GO
│
├── 🎨 디자인 (1개)
│   └── /polish            # AI 디자인 클리셰 측정·진단·수정 (AI Score)
│
├── 🧹 코드 품질 (2개)
│   ├── /dedupe            # 의미적 중복 감지 + extraction plan
│   └── /cohesion-check    # 한 파일 다중 책임 감지 + split 제안
│
├── 🔄 이슈 트래커 (기존 유지)
│   ├── /setup-issue, /report-issue, /resolve-issue (Notion + GitHub + Linear 백엔드 확장)
│
└── 🛠 lite workflow (자체)
    └── /workflow          # 자체 구현 (superpowers/Matt Pocock 의존 제거)
```

총 **9개 스킬** (우산 2 + 보안 2 + 디자인 1 + 품질 2 + 워크플로 1 + 이슈 트래커는 기존 3개 유지) — 목표 ~10개 부합.

---

## 🔒 보안 영역

### `/auth-check` — engine (vibe stack 도메인 점검)

**역할**: semgrep이 못 잡는 **vibe stack 구성 이슈**를 점검. Supabase RLS, Clerk env, Stripe webhook 등 도메인 깊이.

**점검 항목**:

| 항목 | 점검 방식 | 차단/경고 |
|---|---|---|
| Supabase RLS on/off + policy WHERE 절 분석 | `supabase db dump` 파싱 | RLS off + 사용자 데이터 테이블 → **차단** |
| anon vs service key 사용처 추적 | grep + import 분석 | service key 클라이언트 번들 노출 → **차단** |
| NextAuth/Clerk 환경변수 강도·환경분리 | env 변수 길이/엔트로피, dev key prod 누출 | dev key prod에서 사용 → **차단** |
| Stripe/Clerk/Svix webhook signature 검증 | AST: `constructEvent` / `verifyHeader` 호출 여부 | 검증 누락 → **차단** |
| Raw body 파싱 순서 (Express middleware) | AST | webhook 위조 가능 → **차단** |
| Frontend-only auth/validation | API route에서 검증 호출 없이 client validation만 cross-file | 무방비 → **차단** |
| Plan-limit/quota frontend 검증만 | 같은 패턴 cross-file | 우회 가능 → **경고** |
| Webhook idempotency | DB unique key 또는 redis 체크 패턴 | 없음 → **경고** |

**입력**: 프로젝트 루트
**출력**: 각 항목 PASS/WARN/BLOCK + 수정 코드 patch 제안

**차별점**: semgrep은 SQL/XSS 같은 코드 패턴만, jameskill은 **Supabase RLS 정책 의미론, Clerk env 강도, webhook 파싱 순서** 같은 도메인 깊이.

### `/ship-ready-security` — interface (GO/NO-GO 판정)

**역할**: `/auth-check` + semgrep MCP wrap + GitGuardian wrap을 **하나의 GO/NO-GO 판정**으로 묶음.

**판정 흐름**:

```
1. semgrep MCP wrap (SAST: XSS, SQL injection, header, SSRF) → critical 수 카운트
2. GitGuardian (또는 fallback regex) — 시크릿 스캔 → 노출 시크릿 수
3. /auth-check → 도메인 항목 BLOCK 수
4. 종합 점수 → GO / NO-GO + 막힌 항목 리스트
```

**출력 예시**:

```
🚦 SHIP READY?  NO-GO

Blocking (3):
  ❌ Supabase RLS off on table `users`
  ❌ Stripe webhook signature verification missing in api/webhooks/stripe.ts:24
  ❌ Stripe secret key found in client bundle (NEXT_PUBLIC_STRIPE_SK)

Warning (2):
  ⚠️  No webhook idempotency check (api/webhooks/stripe.ts)
  ⚠️  Frontend-only plan-limit enforcement in components/UpgradeModal.tsx

Run `/harden` to apply auto-fixes for 2 of 3 blocking items.
```

**차별점**: 다른 도구는 "issue 목록 출력". 우리는 **"지금 배포해도 되나? Yes/No"** 단순 판정 + 무엇이 막는지 명시. vibe coder의 결정 부담 제거.

### 보안 영역 - 도구 통합 정책

> "Semgrep이 잡는 건 Semgrep에게. 도메인 의미론은 jameskill이."

| 레이어 | 누가 |
|---|---|
| SAST (XSS, SQLi, header) | Semgrep MCP wrap |
| Secret 탐지 | GitGuardian wrap, fallback regex |
| RLS 정책 분석 | jameskill 자체 |
| Auth provider 구성 | jameskill 자체 |
| Webhook signature 패턴 | jameskill 자체 (AST) |
| Frontend-only auth 탐지 | jameskill 자체 + Semgrep custom rule |
| 의존성 CVE | `npm audit` wrap |

---

## 🎨 디자인 영역

### `/polish` — AI 디자인 클리셰 측정·진단·수정

**역할**: 결정론적 메트릭 + Vision LLM 판정의 하이브리드. "AI Score" 점수화로 트위터 화제성.

**워크플로**:

1. **결정론적 스캔** — Tailwind/CSS 파싱:
   - 폰트 다양도 (`font-family` 추출 → Inter/Roboto/Arial 단일 사용 감지)
   - 컬러 클리셰 (`indigo-*`/`purple-*` + gradient 빈도, `#6366f1` 계열)
   - border-radius 분산 (0이면 경고)
   - shadow 남발 (`shadow-*` 클래스 / 전체 요소 비율)
   - spacing 분산 (`p-4`, `gap-4` 단일성)
   - shadcn 디폴트 사용률 (import 후 className 미변경 비율)

2. **카피 점검** (정규식):
   - "Lorem ipsum", "10K+ users", "Trusted by"
   - AI 상투구: "Empower your...", "Unleash...", "Revolutionize..."

3. **a11y 서브체크** — axe-core 호출 (래핑)

4. **스크린샷 + Vision 판정** — Playwright 캡처 → Claude Vision이 frontend-design의 4-질문 역으로 적용:
   - Tone 식별 가능한가?
   - 시각 위계가 명확한가?
   - hero section 패턴(`<h1>` + `<p>` + 버튼 2개) 일치도

5. **AI Score 산출 + 수정 제안**:
   - 예: "Inter → Instrument Serif + Geist Mono"
   - "indigo-500 → 브랜드 컬러 토큰"
   - "shadow-lg 빈도 78% → 의도된 곳만 (~20%)"

**출력 예시**:

```
🎨 AI Score: 87/100  ⚠️ HIGH

Visual cliché breakdown:
  - Font: Inter only (100% usage)           +25
  - Color: indigo-500 in 14 components      +20
  - Border-radius: rounded-lg uniformly     +15
  - Shadows: shadow-lg on 78% of cards      +12
  - shadcn defaults: 23/30 components       +10
  - Hero pattern match: 95%                  +5

Copy issues:
  - "Empower your workflow" (Hero.tsx:8)
  - "10K+ users" (no source) (Stats.tsx:4)

Apply auto-fix? Y/n
```

**차별점**:
- **Anthropic frontend-design**: 생성 *전* prescriptive 가이드 ("Don't use Inter")
- **jameskill `/polish`**: 생성 *후* diagnostic 측정·점수화·수정. 결정론 + Vision 하이브리드 (frontend-design은 순수 LLM 가이드라인)
- **자동화 한계**: ~70% 결정론, 30% Vision 판정. Score는 점수화 가능

**TBD**: Vision 모델 호출 비용·속도. Claude 4.7 Vision API 비용 산정 필요. 옵션:
- 매 호출 Vision (정확하지만 비용)
- 임계점 도달 시만 Vision (효율적)
- 로컬 OCR로 폰트/컬러만 → Vision은 hero/위계만

---

## 🧹 코드 품질 영역

### `/dedupe` — 의미적 중복 감지 + extraction plan (간판 스킬)

**역할**: jscpd가 못 잡는 **의미적 중복** (같은 의도, 다른 구현) 감지. AI의 본질적 강점.

**워크플로**:

1. **결정론적 레이어** — jscpd MCP 또는 CLI 실행:
   - 토큰 단위 copy/paste 탐지
   - Rabin-Karp 알고리즘
   - 클러스터별 위치 출력

2. **AI 레이어** — LLM이 토큰 동일하지 않지만 **의도가 같은** 함수 클러스터링:
   - 예: `formatUserName` / `getDisplayName` / `renderName` — jscpd 못 잡지만 LLM이 잡음
   - 예: 3개 파일에 비슷한 fetch 로직 (다른 변수명, 같은 구조)

3. **Extraction plan 생성**:
   - 발견 → 가장 적절한 위치 추천 (`lib/format/user.ts`)
   - 호출처 전체 마이그레이션 plan
   - diff 미리보기

4. **적용**:
   - 확인 후 적용 또는 사용자 수정 후 적용

**출력 예시**:

```
🧹 Found 7 semantic duplicates

Cluster 1: User name formatting (3 functions)
  - lib/users.ts:42       formatUserName(u)
  - components/Avatar.tsx:18  getDisplayName(user)
  - components/Header.tsx:31  user.firstName + ' ' + user.lastName

  Recommendation: extract to lib/format/user.ts
  Callers to migrate: 7 files
  
  Preview diff?  Y/n

Cluster 2: Fetch with auth (2 functions)
  ...
```

**차별점**:
- **obra/simplify**: 변경된 파일만, 3 agent 병렬
- **jameskill `/dedupe`**: codebase-wide × 의미론적 ("같은 의도 다른 구현"). simplify는 토큰 일치만, 우리는 의도 일치
- **jscpd 단순 wrap이 아님**: jscpd 결과를 받아 LLM이 의도 클러스터링 + extraction plan까지

### `/cohesion-check` — 한 파일 다중 책임 감지 + split 제안

**역할**: 결정론 도구가 없는 영역. 순수 AI 가치. "500줄 컴포넌트 안에 fetch + 가공 + 차트 + 모달 다 있음" 패턴 감지.

**워크플로**:

1. 파일별 책임 분류:
   - UI / data fetching / state / types / business logic / styling
   - 한 파일 2개 이상이면 검토 대상

2. ADR / CONTEXT.md 참고:
   - "이 프로젝트는 컴포넌트 + hook 분리 정책" 같은 명시된 규칙
   - 정책 없으면 일반 휴리스틱 (responsibility-based split)

3. Split 제안:
   - 어떤 파일로 무엇을 옮길지
   - import 변경 plan

**출력 예시**:

```
🧹 Cohesion check — 3 files at risk

components/Dashboard.tsx (487 lines)
  Responsibilities found:
    - UI rendering (chart + cards + modal)
    - Data fetching (3 useEffect → fetch)
    - Data transformation (groupByCategory, sortByDate)
    - Business logic (filterByPlan)
  
  Split suggestion:
    - components/Dashboard.tsx       — UI only (~150 lines)
    - hooks/useDashboardData.ts      — fetching + transform (~120 lines)
    - lib/dashboard/filters.ts       — business logic (~80 lines)
  
  Preview plan?  Y/n
```

**차별점**: 결정론 도구가 없는 영역. SonarQube는 cyclomatic만, ESLint는 max-lines만 — 둘 다 *"왜 책임이 섞였는가"*는 못 잡음.

---

## 🚦 우산 명령

### `/ship-check` — 종합 점검 (1분 요약)

**역할**: 보안 + 디자인 + 품질 한 번에 점검 + 1분 요약 출력.

```
🚦 SHIP CHECK SUMMARY

🔒 Security:   ❌ 3 blocking, 2 warning
🎨 Design:     ⚠️  AI Score 87/100
🧹 Quality:    ⚠️  7 semantic duplicates, 3 cohesion issues

Run individual deep audits:
  /auth-check    /ship-ready-security
  /polish
  /dedupe        /cohesion-check

Or get verdict: /ship-ready?
```

### `/ship-ready?` — GO / NO-GO 판정

**역할**: 종합 점수 + 단순 yes/no + 막는 항목 리스트. 트위터 화제성 1순위 명령.

```
🚦 SHIP READY?  NO-GO

Blocking (3):
  ❌ [Security] Supabase RLS off on table `users`
  ❌ [Security] Stripe webhook signature missing
  ❌ [Security] Stripe SK in client bundle

After fixing blockers:
  Design AI Score 87/100 → consider /polish
  Quality 7 dupes → consider /dedupe

Run /harden to auto-fix 2 of 3 blockers.
```

**판정 기준 (TBD — 구현 단계 결정):**

| 차원 | NO-GO 기준 (안) |
|---|---|
| Security | Critical 1개 이상 또는 Blocking 1개 이상 |
| Design | AI Score ≥ 90 (선택적, default warning만) |
| Quality | Semantic duplicate ≥ 10 클러스터 (선택적) |

기본은 **Security만 차단**, 다른 둘은 경고. `--strict` 옵션으로 모두 차단.

---

## 🛠 lite workflow (자체 구현)

**역할**: superpowers / Matt Pocock 의존 제거. jameskill 자체 워크플로우.

**기존 workflow 차이점**:

| 영역 | 기존 (Phase 0-5) | v2.0 lite |
|---|---|---|
| 진입 명확화 | superpowers `brainstorming` + Matt `grill-me` | 자체 `clarify` (간소화) |
| 도메인 검증 | Matt `grill-with-docs` + CONTEXT.md 강제 | 선택적 — `CONTEXT.md` 있으면 참고 |
| 라우팅 | DIAGNOSE/PROTOTYPE/PRD/PLAN/DIRECT 5분기 | DIRECT/PLAN/PRD 3분기 (단순화) |
| 빌드 | Matt `tdd` | 자체 `build-with-tests` (TDD 강제 약화) |
| 리뷰 | superpowers `requesting-code-review` | 자체 `peer-review` (간단 subagent 리뷰) |
| 검증 | superpowers `verification-before-completion` | 자체 `verify` |
| 출하 전 | (없음) | **`/ship-check` 자동 호출** |
| 마무리 | superpowers `finishing-a-development-branch` | 자체 `finish` 또는 사용자 직접 |

**핵심 차별점**: v2.0 워크플로우는 **마무리 직전 `/ship-check`를 자동 호출**해서 production-readiness 게이트를 강제. 다른 워크플로우는 없는 단계.

**구현 우선순위**:
- Phase 1: `clarify` → `build-with-tests` → `verify` → `/ship-check` → `finish` (최소)
- Phase 2: 라우팅, peer-review 추가
- Phase 3: 도메인 검증, CONTEXT.md

**의존성 제거의 정직한 비용**:
- superpowers/Matt Pocock의 5년 누적 디시플린(TDD, debugging, planning)을 복제하는 데 시간 듦
- 처음에는 그들 버전보다 얕음 — 이걸 정직하게 안내해야 (v2.0 README에 "for production gating, not for daily TDD workflow")

---

## 🔄 이슈 트래커 — 기존 3개 유지 + 백엔드 확장

기존 스킬은 v2.0에서도 유지. 변경 사항만:

| 변경 | 시점 |
|---|---|
| Notion 백엔드 → adapter pattern으로 추상화 | v2.0 |
| GitHub Issues 백엔드 추가 | v2.0 또는 v2.1 (TBD) |
| Linear 백엔드 추가 | v2.1 |
| `/ship-check` 발견 항목 자동 이슈 등록 (deep 통합) | v2.0 |
| `/resolve-issue` 완료 시 `/ship-ready?` 자동 호출 | v2.0 |

**TBD**: GitHub Issues 백엔드가 v2.0 MVP 안인지 v2.1로 미루는지 — 시간 부담 vs 글로벌 진입.

---

## 우선순위 매트릭스

| 스킬 | 가치 | 난이도 | 차별화 | 화제성 | 우선순위 |
|---|---|---|---|---|---|
| `/ship-ready?` | ★★★★★ | ★★ | ★★★★★ | ★★★★★ | **1순위** (한 줄 슬로건) |
| `/auth-check` | ★★★★★ | ★★★ | ★★★★★ | ★★★★ | **1순위** (vibe coder 사고 1위) |
| `/polish` | ★★★★ | ★★★★ | ★★★★ | ★★★★★ | **1순위** (트위터 폭발) |
| `/ship-check` | ★★★★ | ★★ | ★★★★ | ★★★★ | **2순위** (우산) |
| `/dedupe` | ★★★★ | ★★★ | ★★★★ | ★★★ | **2순위** |
| `/ship-ready-security` | ★★★★ | ★★ | ★★★ | ★★★ | **2순위** (`/auth-check` + wrap) |
| `/cohesion-check` | ★★★ | ★★★ | ★★★★ | ★★ | **3순위** |
| lite workflow | ★★★ | ★★★★★ | ★★ | ★★ | **3순위** (의존성 제거 비용 큼) |

v2.0 MVP에 모두 포함. lite workflow는 가장 마지막에 작업.

---

## 결정해야 할 TBD

| 항목 | 영향 |
|---|---|
| `/polish` Vision 모델 호출 비용·속도 | 사용자 경험 (1초 vs 30초) |
| `/ship-ready?` 정량 임계값 (Critical=NO-GO?) | 판정 명확성 |
| GitHub Issues 백엔드 v2.0 포함 여부 | 글로벌 진입 시점 |
| lite workflow의 의존성 제거 깊이 | 작업 시간 (1주 vs 4주) |
| 이름 confirmation: `/polish` vs `/de-ai-ify` | 마케팅 메시지 강도 |
| Vision 판정 fail-open vs fail-closed | offline 사용성 |
