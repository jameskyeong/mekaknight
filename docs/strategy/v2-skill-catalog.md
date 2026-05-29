# mekaknight v2.0 — Skill Catalog

> v2.0 surface 분해. narrow pivot 후 (ADR 0004) **forge가 리드**, tracker (link/tag/strike)가 2차 리드. lock + launch는 invocable한 채로 남되 **marketing surface 밖 alpha utilities**로 분류.
> 피벗 근거: `docs/adr/0004-narrow-v2-to-forge-and-tracker.md`. 상세: `docs/plans/v2-narrow-pivot.md`.

## 구조 요약 (v2.0)

```
mekaknight v2.0 (narrow, dogfooded only on marketing surface)
├── 🛠 forge        # 개발 orchestrator — 리드 스킬 (저자가 매일 사용)
│                     strict TDD + no-soft-language verification
│
├── 🔄 이슈 트래커 (2차 리드, Notion 백엔드)
│   ├── /link        # API 키 + DB 연결 + 템플릿 설정
│   ├── /tag         # 프롬프트/blob → grouped Notion issues
│   └── /strike      # pending issue → brainstorm → 구현 → 상태 갱신
│
└── ── (off marketing surface, v2.0 alpha utilities) ──
    ├── 🔒 lock      # v0.1 inspection (Supabase RLS + secret + Stripe webhook)
    └── 🚦 launch    # v0.1 GO/NO-GO verdict
        ↑ 둘 다 invocable. README/마케팅 헤드라인에는 없음.
          v2.1+에서 사용자 demand 보고 방향 결정 (wrap / deepen / sunset).
```

v2.0 marketing surface는 **forge + link + tag + strike** 4개. polish / dedupe / cohesion-check / ship-check / launch-check / launch-security 는 **v2.1+ post-launch evaluation** 섹션 참조.

---

## v2.0 vs v2.1+ 분할

| 스킬 | v2.0 marketing surface | v2.0 alpha utility (off surface) | v2.1+ (deferred / post-launch) |
|---|---|---|---|
| `/forge` | ✅ 리드 | — | — |
| `/link` `/tag` `/strike` | ✅ 2차 리드 | — | — |
| `/lock` (v0.1) | — | ✅ invocable, off headline | 방향 결정 (wrap / deepen / sunset) |
| `/launch` (v0.1) | — | ✅ invocable, off headline | 방향 결정 |
| `/polish` (AI Score) | — | — | ✅ candidate |
| `/dedupe` | — | — | ✅ candidate |
| `/cohesion-check` | — | — | ✅ candidate |
| `/ship-check` / `/launch-check` 우산 | — | — | lock/launch 방향 결정 후 재평가 |
| `/launch-security` | — | — | lock 방향 결정에 종속 |

---

## 🛠 forge — 개발 orchestrator (리드 스킬)

**역할**: **mekaknight v2.0의 리드 surface.** clarify → build-with-tests → verify → finish 의 4단계 self-contained orchestrator. superpowers / Matt Pocock 같은 외부 스킬에 의존하지 않음 (ADR 0001).

**워크플로**:

```
1. clarify   — relentless question-asking until requirements are crisp
2. build-with-tests — strict TDD (red → green → refactor), no implementation without failing test
3. verify    — no-soft-language verification at every phase boundary
                ("works on my machine"/"should be fine" 금지)
4. finish    — branch hygiene, commit message, optional merge/PR routing
```

**차별점**:
- **superpowers (210k★)**: 작은 합성 가능한 스킬 스택. forge는 self-contained 한 명령으로 같은 discipline 제공 — 외부 plugin install 없이 바로 사용.
- **Matt Pocock**: 엔지니어용 작고 조합 가능한 스킬. forge는 한 명령으로 4단계 묶음 — 결정 비용 낮춤.
- **strict TDD + no-soft-language verification**: 다른 orchestrator가 가지지 않은 두 가지 엄격함. 이게 리드 메시지.

**dogfooding**: 저자가 mekaknight 자체와 사이드 프로젝트에서 매일 사용. 마케팅 영상은 합성 시나리오가 아닌 실제 세션 클립.

---

## 🔄 이슈 트래커 — link / tag / strike (2차 리드)

**역할**: Notion을 백엔드로 하는 humane issue tracker. **이슈 제목이 commit 메시지가 아니라 "문제 진술"처럼 읽힌다**는 점이 차별점.

| 스킬 | 역할 |
|---|---|
| `/link` | Notion API 키 + DB 연결 + 템플릿 감지 + 기본값 설정 |
| `/tag` | 프롬프트/Slack blob/대화 컨텍스트 → 코드베이스 대조 → grouped Notion issues 생성 |
| `/strike` | pending issue 가져오기 → brainstorm → 구현 → 상태 갱신 |

**차별점**:
- 다른 Notion 통합: 단순 CRUD 또는 commit-message 기반 자동 생성.
- mekaknight tracker: 프롬프트를 **문제 진술 단위로 파싱**해서 코드베이스에 대조 후 verify. 이슈 제목이 "fix bug in X"가 아닌 "사용자가 Y를 시도했을 때 Z 상태가 됨" 같은 문제 진술.
- `/strike`는 pending → 구현 → 상태 갱신을 하나의 루프로. tracker 외 brainstorm 단계가 의도적으로 포함됨.

**dogfooding**: 저자가 기존 Notion 이슈 트래커에서 이미 사용 중. 추가 워크플로 강제 없음.

---

## 🔒 lock — v2.0 alpha utility (off marketing surface)

**상태**: v0.1 기능 그대로 유지. README 헤드라인에 등장하지 않음. 플러그인 매니페스트에는 그대로 노출되어 명시적으로 찾는 사용자는 발견 가능.

**현재 동작 (v0.1, 변경 없음)**:

| 항목 | 점검 방식 | 결과 |
|---|---|---|
| Supabase RLS off + 사용자 데이터 테이블 | migration 파일 pattern matching | PASS / WARN / BLOCK |
| service key / secret key 클라이언트 노출 | client bundle pattern matching | PASS / WARN / BLOCK |
| Stripe webhook signature 누락 | webhook 핸들러 pattern matching | PASS / WARN / BLOCK |

**입력**: 프로젝트 루트
**출력**: 각 항목 PASS/WARN/BLOCK + 위치 + 수정 제안

**왜 v2.0 marketing surface 밖인가** (ADR 0004):
- v0.1 dogfooding에서 본업 3개 vibe-coded 코드베이스 모두 0 BLOCK
- 저자가 매일 사용하지 않음 → 진정성 있는 마케팅 콘텐츠 만들기 어려움
- wrap layer 대안(ADR 0003)은 semgrep + gitleaks 설치 강제 → 같은 문제

**v2.1+ 방향**: 출시 후 사용자가 명시적으로 요청하면 방향 결정 — wrap layer / 자체 deepen / sunset 중 선택. 요청 없으면 v0.1 상태 graceful aging.

---

## 🚦 launch — v2.0 alpha utility (off marketing surface)

**상태**: v0.1 기능 그대로 유지. README 헤드라인에 등장하지 않음. lock과 함께 alpha utility로 분류.

**현재 동작 (v0.1, 변경 없음)**:
- lock 결과를 받아 한 줄 GO / NO-GO verdict 출력
- blocking 항목을 verdict 아래 표시
- advisory 항목은 표시하되 gate 안 함

**왜 v2.0 marketing surface 밖인가**: lock에 종속. lock이 alpha utility면 launch도 동일.

**v2.1+ 방향**: lock 방향 결정에 종속. lock이 deepen / wrap 되면 launch도 함께 재정의. 둘 다 sunset 되면 launch도 함께 sunset.

---

## v2.1+ — post-launch evaluation (deferred candidates)

ADR 0004의 원칙: **lock/launch 및 추가 스킬 방향은 출시 후 사용자 demand 기반으로 결정**. 아래는 후보일 뿐 commit이 아님.

### `/polish` — AI 디자인 클리셰 측정 (candidate)

결정론적 메트릭 (폰트 다양도, indigo/purple gradient 빈도, shadow 남발, shadcn 디폴트 사용률) + Vision LLM 판정 하이브리드. "AI Score" 점수화.

- 결정론 스캔: Tailwind/CSS 파싱
- 카피 점검: "Empower your...", "Unleash...", "Lorem ipsum" 정규식
- a11y: axe-core wrap
- 옵션: Playwright + Claude Vision 스크린샷 판정

차별점 (만약 진행 시): Anthropic frontend-design이 생성 *전* prescriptive 가이드라면, polish는 생성 *후* diagnostic 측정.

### `/dedupe` — 의미적 중복 감지 (candidate)

jscpd가 못 잡는 **의도 단위 중복** 감지 — 토큰은 다르지만 같은 일을 하는 함수 클러스터링. LLM이 의도 분류 후 extraction plan 생성.

차별점 (만약 진행 시): obra/simplify는 변경 파일만 + 토큰 일치만. dedupe는 codebase-wide + 의미 일치.

### `/cohesion-check` — 한 파일 다중 책임 감지 (candidate)

UI / data fetching / state / types / business logic 책임이 한 파일에 섞인 패턴 감지 + split 제안. ADR / CONTEXT.md의 분리 정책 참고.

차별점 (만약 진행 시): 결정론 도구 부재 영역. SonarQube(cyclomatic) / ESLint(max-lines)는 *왜 책임이 섞였는가*를 못 잡음.

### `/ship-check` / `/launch-check` 우산 (재평가)

lock + launch 방향 결정 후 별도 우산 명령이 필요한지 재평가. polish / dedupe가 합류하면 어떻게 묶을지도 그때 결정.

---

## 우선순위 매트릭스 (v2.0 marketing surface)

| 스킬 | 가치 | 난이도 | 차별화 | 화제성 | 우선순위 |
|---|---|---|---|---|---|
| `/forge` | ★★★★★ | — (existing) | ★★★★ | ★★★★ | **리드** (저자가 매일 사용) |
| `/link` `/tag` `/strike` | ★★★★ | — (existing) | ★★★★ | ★★★ | **2차 리드** (이슈가 문제 진술처럼 읽힘) |
| `/lock` (v0.1) | ★★ | — | ★★ | ★ | alpha utility (off surface) |
| `/launch` (v0.1) | ★★ | — | ★★ | ★★ | alpha utility (off surface, lock 종속) |

v2.0 새 코드 작업 없음. 모든 surface 스킬은 alpha.3 시점에 이미 완성됨. v2.0 작업은 **문서 정렬 + 영상 2-3개 + 출시 패키지**.

---

## 결정해야 할 TBD (v2.0)

| 항목 | 영향 |
|---|---|
| 플러그인 매니페스트에서 lock/launch description 톤 — neutral vs "experimental" 라벨 | 발견성 vs 기대치 관리 (default: neutral, README footer에 "alpha utility, deferred to v2.1+" 명시) |
| README footer에서 lock/launch 안내 줄 수 | 1줄(단순) vs 작은 섹션(투명). default: 작은 섹션, ADR 0004 링크 포함 |
| 영상 3 (lock/launch ~30초)을 실제 녹화할지 | 시간 vs 호기심 충족. default: 옵션, Week 2 여유 있으면 |
| 버전 라벨 `2.0.0-rc.1` vs `alpha.3` 유지 | 출시 신호. default: rc.1 (scope 변화 명시) |
