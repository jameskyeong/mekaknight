# jameskill v2.0 — Roadmap

> 3-4개월 풀집중 + 본업(i-screammedia) dogfooding 활용.
> 출시 패턴: 매 3주마다 한 스킬 단위 trickle release + 최종 v2.0.0 통합 출시.

## 핵심 원칙

1. **가장 화제성 높은 것부터** — `/ship-ready?` + `/auth-check` + `/polish` 순서. 트위터/HN에서 매 3주마다 새 이슈 만들기.
2. **dogfooding 우선** — 본업 프로젝트에 즉시 적용. 사례·스크린샷 누적이 곧 마케팅 콘텐츠.
3. **lite workflow는 마지막** — 의존성 제거는 시간 부담 큼. 화제성 큰 스킬을 먼저 만들고, workflow 자체는 v2.0 직전에 깎음.
4. **출시는 v2.0.0 통합 1회** — 매 스킬 점진 release(v1.12, v1.13)하면 마케팅 모멘텀 분산. 대신 트위터/디스코드에서 **개발 과정 자체를 콘텐츠화** (build in public).

## 타임라인

```
Week 1-3   ──┬──  🔒 /auth-check + /ship-ready? skeleton
             │     "vibe coded app 보안 사고 자동 점검" 1차 데모
             │
Week 4-6   ──┼──  🎨 /polish (AI Score)
             │     "Your app has AI Score 87/100" 데모 영상
             │
Week 7-9   ──┼──  🧹 /dedupe + /cohesion-check
             │     "내 AI가 같은 함수 5개 만들었다" 사례
             │
Week 10-12 ──┼──  🚦 /ship-check 통합 + 우산 명령 완성
             │     /ship-ready-security 통합
             │
Week 13-14 ──┼──  🛠 lite workflow 자체 구현
             │     superpowers/Matt Pocock 의존 제거
             │
Week 15-16 ──┴──  📦 v2.0.0 통합 출시
                  README/문서/marketplace 등록/콘텐츠 푸시
```

## 마일스톤 상세

### M1 (Week 1-3) — `/auth-check` + `/ship-ready?` skeleton

**목표**: 가장 화제성 높은 스킬 2개의 MVP. 트위터에서 첫 화제 만들기.

**작업 (Week 1)**:
- 자체 워크플로우 lite 진입점 1개만 (`clarify` → `build-with-tests` → `verify`)
- Notion 기존 트래커 스킬은 그대로 유지 (depend 안 끊음)
- `.claude-plugin/manifest`에 v2.0 alpha 등록

**작업 (Week 2)**:
- `/auth-check` v0.1:
  - Supabase RLS 정책 dump 파싱
  - service key 클라이언트 노출 grep
  - Stripe webhook signature 검증 패턴 AST
- `/ship-ready?` v0.1 — `/auth-check` 결과 → GO/NO-GO 1줄 판정

**작업 (Week 3)**:
- `/auth-check` v0.2: Clerk/NextAuth env 강도, frontend-only auth
- `/ship-ready?` v0.2: 막힌 항목 리스트 + auto-fix 제안 흉내
- **본업 dogfooding** — i-screammedia 프로젝트 1개 적용. 발견 항목 스크린샷.

**완료 기준**:
- 본업 프로젝트 1개에서 `/ship-ready?` 호출 → 실제 결함 1개 이상 발견
- 트위터 데모 영상 1개 녹화

**dogfooding 대상**:
- 본업의 가장 최근 vibe coding으로 시작한 작은 프로젝트 1개

**위험**:
- Supabase dump 파싱 복잡도. Fallback: REST API 호출
- AST 파싱 도구 선택 (@babel/parser vs typescript compiler API)

### M2 (Week 4-6) — `/polish` (AI Score)

**목표**: 트위터 폭발성 최강 스킬. 결정론 메트릭 + Vision 판정 하이브리드.

**작업 (Week 4)**:
- 결정론적 스캔만 먼저 구현:
  - Tailwind 클래스 파싱 (postcss / regex)
  - 폰트/컬러/border-radius/shadow 빈도 산출
  - shadcn 디폴트 컴포넌트 검출 (import + className 비교)
- AI Score 산출 공식 v0.1 (각 항목 가중치)

**작업 (Week 5)**:
- 카피 점검 (정규식): AI 상투구 + lorem + 가짜 통계
- a11y 서브체크 — axe-core CLI wrap
- 수정 제안 LLM 호출 (예: "Inter → 폰트 페어링 제안")

**작업 (Week 6)**:
- Playwright 스크린샷 → Claude Vision 통합 (옵션)
- **TBD 결정**: Vision 비용 산정 후 default on/off
- **본업 dogfooding** — 본업 프로젝트 화면 2-3개에 적용. Before/After 스크린샷.

**완료 기준**:
- 본업 프로젝트 화면 1개의 AI Score를 87 → 45로 낮추는 시연
- 트위터 영상 1개 ("AI Score 87 → 45" 비교)

**dogfooding 대상**:
- 본업의 최근 출시 / 출시 예정 화면 2-3개

**위험**:
- Vision API 비용. 옵션: 옵트인, 결정론 70% 먼저
- 디자인 평가의 주관성. 객관 메트릭에 머무는 게 안전

### M3 (Week 7-9) — `/dedupe` + `/cohesion-check`

**목표**: AI 코드의 가장 큰 결함(중복) 대응. "내 AI가 같은 함수 5개 만들었다" 공감 만점.

**작업 (Week 7)**:
- jscpd CLI wrap → 토큰 단위 중복 클러스터 출력
- LLM 의도 클러스터링 — "이름 다르지만 같은 의도" 그룹화 prompt 설계

**작업 (Week 8)**:
- Extraction plan 생성 — 위치 추천 + 호출처 마이그레이션 plan
- Diff 미리보기 + 적용 흐름
- `/cohesion-check` v0.1: 파일별 책임 분류 (UI/data/state/business)

**작업 (Week 9)**:
- `/cohesion-check` v0.2: Split 제안 (어디로 무엇을 옮길지)
- **본업 dogfooding** — 본업 프로젝트의 큰 컴포넌트 (500+ 줄) 1-2개에 적용

**완료 기준**:
- 본업 프로젝트에서 의미적 중복 5개 이상 발견 + 1개 이상 자동 추출 성공
- 트위터 영상 1개 ("내 AI가 만든 7개의 같은 fetch 함수")

**dogfooding 대상**:
- 본업의 vibe coding 결과물 중 가장 큰 파일

**위험**:
- LLM 의도 클러스터링의 false positive. 사용자 확인 UI 강제
- Extraction plan의 호출처 변경 안전성 — Auto-apply 보수적으로 (옵트인)

### M4 (Week 10-12) — `/ship-check` 통합 + `/ship-ready-security`

**목표**: 우산 명령 완성. 보안 + 디자인 + 품질을 하나의 흐름으로.

**작업 (Week 10)**:
- `/ship-check` v0.1: 보안/디자인/품질 3개 영역 한 번에 호출 + 1분 요약
- 출력 형식 디자인 — 트위터에 공유하고 싶은 모양

**작업 (Week 11)**:
- `/ship-ready-security` 완성:
  - semgrep MCP wrap (Claude Code plugin 호출)
  - GitGuardian wrap (또는 fallback regex)
  - `/auth-check` 호출 + 종합 GO/NO-GO
- 우선순위 정책 (Critical만 차단 default, --strict 옵션)

**작업 (Week 12)**:
- 이슈 트래커 통합: `/ship-check` 발견 항목 자동 Notion 등록
- `/resolve-issue` 완료 시 `/ship-ready?` 자동 호출
- **본업 dogfooding** — 본업 프로젝트 1개의 출하 전 점검 전체 사이클

**완료 기준**:
- 본업 프로젝트 1개에서 `/ship-check` → 발견 → Notion 등록 → `/resolve-issue` → `/ship-ready?` PASS 한 사이클 완주
- 트위터 영상 1개 ("from /ship-check to /ship-ready PASS")

**dogfooding 대상**:
- 본업의 출시 직전 프로젝트

### M5 (Week 13-14) — lite workflow 자체 구현

**목표**: superpowers / Matt Pocock 의존 제거. 자체 워크플로우 완성.

**작업 (Week 13)**:
- `clarify` 자체 구현 (interactive 질문, AskUserQuestion 패턴)
- `build-with-tests` 자체 구현 (TDD 강제 약화, "tests required" 정책만)
- `verify` 자체 구현 (lint + typecheck + test 실행)

**작업 (Week 14)**:
- `peer-review` 자체 구현 (간단 subagent 리뷰)
- `/workflow`가 `/ship-check`를 마무리 직전에 자동 호출하도록 통합
- 기존 workflow phase -1 (superpowers 의존 체크) 제거

**완료 기준**:
- `/workflow` 호출 시 superpowers/Matt Pocock 미설치 환경에서도 정상 동작
- 본업 프로젝트 1개에서 처음부터 끝까지 v2.0 워크플로만 사용

**위험**:
- 5년 누적 디시플린(TDD, debugging, planning)을 복제하는 깊이
- 완벽한 대체는 불가능 — README에 "v2.0 workflow is for production gating, not for daily TDD" 명시

### M6 (Week 15-16) — v2.0.0 출시

**목표**: 통합 출시 + HN/PH/Reddit 동시 푸시.

**작업 (Week 15)**:
- README 전면 재작성 (영어 우선, AI 보조 편집)
- 핵심 데모 영상 3개:
  - `/ship-ready?` 30초 데모
  - `/polish` Before/After
  - 본업 dogfooding 사례 1개 (1-2분)
- marketplace 등록 신청 (Anthropic 공식 + claudemarketplaces.com)
- 한국어 블로그 1편 (한국 개발자 커뮤니티용)

**작업 (Week 16)**:
- v2.0.0 태그 + npm release
- **출시일**: 화요일 09:00 PST (HN 골든타임)
  - HN Show HN 게시
  - PH 등록
  - Reddit r/ClaudeAI, r/programming
  - X (트위터) 출시 thread
  - Korean Dev community: 인프런/디스코드/디스코드 jameskill 채널
- 출시 후 1주일 트위터 일일 후속 (사용자 반응 → 즉시 수정 → 트윗)

**완료 기준**:
- HN 1st page 진입 시도 (3-6시간 안에 50+ upvote 필요)
- PH "Tools of the Day" 진입 시도
- 1주일 안에 GitHub star 500+ 목표 (보수적)

## 본업 dogfooding 전략

**전제**: 본업(i-screammedia)에서 jameskill 적용 가능 = 페이스 ×2 효과.

**적용 패턴**:

| 마일스톤 | 본업 적용 대상 |
|---|---|
| M1 (`/auth-check`) | 본업의 최근 vibe coding 프로젝트 1개 |
| M2 (`/polish`) | 본업의 최근 출시한 화면 2-3개 |
| M3 (`/dedupe`) | 본업의 가장 큰 컴포넌트 / 가장 오래된 모듈 |
| M4 (`/ship-check`) | 본업의 출시 직전 프로젝트 |
| M5 (lite workflow) | 본업의 신규 기능 개발 |

**dogfooding이 만드는 콘텐츠**:
- Before/After 스크린샷
- "본업에서 이걸 발견했다" 익명화된 사례
- 발견 → 수정 → 출시 전 과정 영상

**주의**:
- 회사 코드/데이터 노출 금지 — 데모는 익명화된 스크린샷만
- 사내 정책상 외부 발표 가능 여부 사전 확인
- 회사 contributor 수 / Semgrep organization 분리 정책 (보안 별도 문서)

## 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| Anthropic이 통합 production-readiness 플러그인 직접 출시 | 핵심 카테고리 잠식 | 6-12개월 안에 인지 굳히기. v2.0 출시 시점 단축 검토 (3개월 → 2.5개월 가능?) |
| Vision API 비용 폭증 | `/polish` 가격 부담 → 사용 저조 | 결정론 70%만으로 v2.0 출시, Vision은 v2.1 옵트인 |
| lite workflow 깊이 부족 | "왜 superpowers 안 써?" 반론 | README에 "production gating" 명시, daily TDD는 superpowers 권장 |
| 본업 적용 거부 (회사 정책) | dogfooding 콘텐츠 부족 | 사이드 프로젝트 1개 따로 만들어 dogfooding 보조 (예: 가상 SaaS 데모) |
| 트위터 청중 0에서 시작 | 출시일 무반응 | HN/PH/Reddit 익명 채널 + Anthropic showcase 채널 활용 (마케팅 문서 참조) |
| 3-4개월 풀집중 동안 본업 영향 | 본업 신뢰 손상 | 본업 dogfooding 자체가 본업 가치 — 트레이드오프 최소화 |

## 출시 후 (v2.1 ~)

### v2.1 (출시 후 4-6주)
- GitHub Issues 백엔드 추가 (v2.0에 미포함 결정 시)
- Vision 모델 통합 (`/polish` 정밀도 향상)
- 사용자 피드백 기반 우선순위 1-2개 추가

### v2.2 (출시 후 10-12주)
- 🗄️ DB 영역 추가 (스키마 검토, N+1 감지, 인덱스 추천)
- ⚡ 성능 영역 일부 (Lighthouse wrap)

### v2.3 (출시 후 6개월)
- 🔥 스트레스 테스트 (k6/Artillery 통합)
- Linear 백엔드
- 엔터프라이즈 기능 검토 (조직 단위 정책 등)
