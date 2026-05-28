# jameskill v2.0 — Handoff Document

> **From**: 개인 PC (`yjg.local`, 2026-05-28~29 세션)
> **To**: 회사 PC (다음 세션, 동일 사용자)
> **Picked up at**: M1 (Week 1-3) 작업 시작 직전

---

## 한 줄 요약

jameskill v2.0 **전략 산출물 5종 (1,134줄) 작성 완료**. 다음 단계는 **M1 (Week 1-3): `/auth-check` + `/ship-ready?` skeleton 구현** — 코드 작업 시작.

---

## 작업 컨텍스트 — jameskill v2.0

### 한 줄 정체성

> **jameskill — The production-readiness layer for AI-built apps.**

한국어 부캐: *"AI가 만든 화면을, 운영 들어가도 안 죽게."*

### 왜 이 정체성인가 (핵심 결정 요약)

- **빈 시장**: superpowers는 *개발 중* 루프, Matt Pocock은 *엔지니어용 작은 스킬*, Anthropic security-guidance는 *보안 단일축*. **출하 직전 통합 게이트 + vibe coder 페르소나**는 무인 지대.
- **차별화 4축**: 다축 통합 / 플랫폼 무관 / vibe coder UX / Claude Code 네이티브.
- **타겟**: vibe coder (Lovable/v0/Cursor/Replit 사용자) + 시니어 엔지니어 양쪽.
- **시장**: vibe coding $4.7B (2026), 380,000개 vibe-coded 앱이 production 노출 (RedAccess 2026.5).
- **경고**: Anthropic이 2026-05-27 security-guidance 플러그인 직접 출시. 6-12개월 안에 카테고리 인지 굳혀야 함.

---

## 작성된 산출물 (회사 PC에서 우선 읽을 것)

위치: `/Users/yjglab/Home/00_Main-Service/jameskill/jameskill/docs/strategy/`

| 파일 | 줄수 | 다음 세션에서의 용도 |
|---|---|---|
| `v2-vision.md` | 100 | **먼저 읽기**. 정체성/타겟/포지셔닝 합의 확인 |
| `competitive-landscape.md` | 168 | 경쟁 상황 파악 |
| `v2-skill-catalog.md` | 386 | **M1 작업 시 가장 자주 참조**. `/auth-check` `/ship-ready?` 설계 명세 |
| `v2-roadmap.md` | 255 | **M1 시작 시 참조**. 주차별 작업 분해 |
| `v2-marketing.md` | 225 | 출시 D-Day까지는 참조 빈도 낮음 |

⚠️ **5개 문서는 git commit 안 됨** — 개인 PC에서 push 후 회사 PC에서 pull 필요.

---

## 개인 PC에서 종료 전 해야 할 일 (이 세션 마무리)

### 1. Git commit & push (필수)

```bash
cd /Users/yjglab/Home/00_Main-Service/jameskill/jameskill
git status
git add docs/strategy/
git commit -m "docs(strategy): v2.0 전략 산출물 5종 추가

- v2-vision.md: 정체성/타겟/포지셔닝
- competitive-landscape.md: 경쟁 지도
- v2-skill-catalog.md: 9개 스킬 분해
- v2-roadmap.md: 3-4개월 마일스톤
- v2-marketing.md: 채널/슬로건/출시 스크립트"
git push origin main  # 또는 현재 브랜치
```

### 2. 회사 PC에서 본업 dogfooding 대상 미리 선정 (선택)

M1 Week 1-3 동안 본업 프로젝트 중 어떤 것을 `/auth-check` 적용 대상으로 할지 미리 생각:
- 본업 vibe coding 결과물 중 가장 작고 비크리티컬한 것
- Supabase / Clerk / Stripe webhook 중 하나라도 쓰는 것이 이상적

---

## 회사 PC에서 다음 세션 시작 시 체크리스트

### 환경 셋업

- [ ] `git clone https://github.com/jameskyeong/jameskill.git` (또는 기존 clone 위치 확인)
- [ ] `git pull` — 5개 전략 문서 받기
- [ ] Claude Code 설치 확인 (`claude --version`)
- [ ] 필요한 의존 스킬 설치 상태 확인:
  - [ ] superpowers (`/plugin install superpowers@claude-plugins-official`) — v1.x workflow가 의존, v2.0 작업 중에도 일단 유지
  - [ ] Matt Pocock skills (`skills.sh` 인스톨러)
  - [ ] semgrep MCP / 공식 플러그인 (보안 스킬 구현 시 필요, M2 시점)
- [ ] Notion 트래커 설정 — `.claude/tracking-issue.json`은 gitignored. 회사 PC에서 별도 설정:
  - 본업 회사용 organization을 한 번 더 만들지, 개인용을 그대로 쓸지 결정 (Semgrep organization 분리 논의와 동일 패턴)
  - 또는 v2.0 M1 작업 중에는 트래커 사용 안 해도 됨 — 본업 dogfooding 결과만 별도 메모

### 첫 세션 진입 명령

```
/jameskill:workflow docs/strategy/v2-roadmap.md
```

또는 자유 형식으로:
> "jameskill v2.0 M1 작업 시작. docs/strategy/ 5개 문서 컨텍스트로, Week 1 작업부터 진행하자."

워크플로우가 PRD/PLAN 단계에서 v2-roadmap.md를 인식하고 M1 Week 1부터 진입할 것.

---

## M1 (Week 1-3) 작업 분해 — 다음 세션의 첫 목표

### Week 1: 자체 워크플로우 lite 진입점 1개만

- [ ] `skills/workflow/` 검토 — superpowers/Matt Pocock 의존 부분 식별
- [ ] 가장 작은 진입점만 자체 구현: `clarify` → `build-with-tests` → `verify`
- [ ] 기존 Notion 트래커 스킬은 그대로 유지
- [ ] `.claude-plugin/manifest`에 v2.0-alpha 등록 검토 (또는 v1.x 유지하다 마지막에 bump)

### Week 2: `/auth-check` v0.1

- [ ] Supabase RLS 정책 dump 파싱 — `supabase db dump --schema public` → 정책 추출
- [ ] service key 클라이언트 노출 grep — `NEXT_PUBLIC_*_SECRET_*` 패턴
- [ ] Stripe webhook signature 검증 패턴 AST — `@babel/parser` 또는 `ts-morph`
- [ ] `/ship-ready?` v0.1 — 위 결과 → GO/NO-GO 1줄 판정

### Week 3: `/auth-check` v0.2 + 본업 dogfooding

- [ ] Clerk/NextAuth env 강도 — 길이 + 엔트로피 + dev key prod 누출 탐지
- [ ] Frontend-only auth 탐지 — API route에서 client 검증만 있는 경우 cross-file
- [ ] `/ship-ready?` v0.2 — 막힌 항목 리스트 + auto-fix 제안 흉내
- [ ] **본업 dogfooding**: 회사 프로젝트 1개에 적용 → 실제 결함 발견
- [ ] **데모 영상 1개 녹화** (트위터용)

### Week 3 완료 기준

- 본업 프로젝트 1개에서 `/ship-ready?` 호출 → 실제 결함 1개 이상 발견
- 트위터 데모 영상 1개 녹화

---

## 결정된 핵심 사항 (개인 PC 세션에서 합의)

| 차원 | 결정 |
|---|---|
| 정체성 | "Production-readiness layer for AI-built apps" |
| 1차 영역 | 🔒 보안 + 🎨 디자인 + 🧹 코드 품질 |
| 워크플로우 모델 | Ship Check 우산 (`/ship-check`, `/ship-ready?`) |
| 트래커 | 깊은 통합 + 백엔드 확장 (Notion + GitHub + Linear) |
| 의존성 | superpowers / Matt Pocock 제거 (자체 lite workflow) |
| 이름 | jameskill 유지 + 강한 서브타이틀 |
| 페이스 | 3-4개월 풀집중 |
| MVP | 9개 스킬 (영역당 1-2개 + 우산 + lite workflow) |
| 언어 | 글로벌 우선 (영어 README/이슈) + 한국어 부캐 |
| 출시 | v2.0.0 통합 1회 (화요일 HN/PH 동시) |
| 마케팅 | Product-led growth + 익명 채널 + Anthropic 생태계 |

### 가용 자원 (자기 인식)

| 자원 | 보유 |
|---|---|
| 본업(i-screammedia) dogfooding | ✅ |
| 영어 콘텐츠 직접 작성 | ❌ AI 보조 필요 |
| Twitter 청중 1k+ | ❌ |
| 블로그/유튜브 청중 | ❌ |

→ 마케팅은 product-led + 익명 채널(HN/PH/Reddit) + Anthropic 생태계 등재로.

---

## 미결정 TBD (회사 PC에서 결정해야 할 항목)

| 항목 | 결정 시점 |
|---|---|
| `/polish` Vision 모델 비용/속도 정책 | M2 시작 전 (Week 4) |
| `/ship-ready?` 정량 임계값 (Critical=NO-GO?) | M4 시작 전 (Week 10) |
| GitHub Issues 트래커 백엔드 v2.0 포함 vs v2.1 | M4 시작 전 |
| lite workflow 의존성 제거 깊이 | M5 시작 전 (Week 13) |
| `/polish` vs `/de-ai-ify` 이름 confirmation | 출시 D-21 |
| 도메인 등록 (`jameskill.dev` 등) | D-30 |
| 영어 native 검수자 섭외 | D-21 |
| 회사 기술블로그 vs 개인 블로그 | M3 완성 시점 |
| Semgrep organization (회사 vs 개인 분리) | 보안 스킬 구현 시점 (M1 또는 M2) |

---

## 회사 PC 환경 주의사항

### 1. Semgrep / SAST hook
- 개인 PC에서 `SEMGREP_APP_TOKEN`이 빈 값이라 PostToolUse hook이 차단되는 문제가 있었음.
- 회사 PC에 동일 hook이 설정돼 있다면, 산출물 작성 시 동일 차단 가능.
- 회사 organization으로 semgrep 로그인 시 본업 코드 SAST 데이터가 회사 계정에 쌓이므로 의도된 행동인지 확인.
- 산출물 작성 시 차단되면 hook 비활성 옵션.

### 2. Notion 트래커
- `.claude/tracking-issue.json`은 gitignored — 회사 PC에서 별도 설정 필요.
- `/jameskill:setup-issue` 호출하면 재설정.
- 회사 코드와 개인 jameskill을 같은 Notion DB에 섞을지 분리할지 결정 필요.

### 3. 본업 코드 보안
- 본업 dogfooding 시 발견되는 결함을 외부에 공유할 때 회사 정책 확인 (보안 사고 정보, 코드 스니펫 등).
- 트위터/HN/PH 데모 영상은 **익명화된 스크린샷**만 — 회사 코드/URL 노출 금지.

### 4. Claude Code 설정
- 개인 PC `~/.claude/CLAUDE.md`에 한국어 응답 정책 등 글로벌 설정 있음.
- 회사 PC에 동일 CLAUDE.md 복사할지, 회사 PC는 영어로 둘지 결정.

---

## 다음 세션에서 invoke할 스킬 추천

| 시점 | 스킬 | 이유 |
|---|---|---|
| 세션 시작 | `/jameskill:workflow docs/strategy/v2-roadmap.md` | M1 Week 1부터 진입 |
| Week 1 작업 | `superpowers:tdd` 또는 자체 lite workflow | 자체 워크플로 구현 자체가 작업 대상 |
| Week 2-3 `/auth-check` 구현 | `superpowers:test-driven-development` + `superpowers:systematic-debugging` | TDD로 패턴 매처 구현 |
| Week 3 완료 시 | `verification-before-completion` | 본업 dogfooding 결과 검증 |
| Week 3 종료 | `superpowers:finishing-a-development-branch` | 첫 마일스톤 commit/PR |
| 다음 세션이 길어질 경우 | `handoff` | 다시 다음 환경으로 넘기기 |

---

## 추가 컨텍스트 (필요 시 참조)

- 작업 중 사용된 background agent 결과들 (스킬 생태계 지도, 보안 영역, 디자인 영역, 코드 품질 영역, vibe coding 시장)은 산출물에 모두 흡수됨. 별도 보존 불필요.
- semgrep CLI 설치 확인됨 (`/opt/homebrew/bin/semgrep`, v1.157.0), Free Edition 무료 (contributor 10명 / repo 10개 한도).
- 사용자 본업 회사: i-screammedia (이메일 도메인으로 식별), 한국 콘텐츠/방송 회사로 추정.
- 작업 시작일: 2026-05-28, 종료일: 2026-05-29.

---

## 마지막 한 마디 (다음 세션에게)

전략은 충분히 두꺼움. 이제 **코드 1줄이 산출물 100줄보다 더 가치 있는 단계**. Week 1을 너무 완벽하게 깎으려 하지 말고, Week 2의 `/auth-check` MVP를 본업 코드에 빠르게 적용해서 **실제 결함 1개 발견하는 순간**을 우선 만들 것. 그게 트위터 콘텐츠 1번이고 모든 동력의 시작.
