# jameskill v2.0 — Vision

> 작성일: 2026-05-28
> 상태: Draft (사용자 결정 기반, 모호 항목은 TBD로 표시)

## 한 줄 정체성

> **jameskill — The production-readiness layer for AI-built apps.**

한국어 부캐: *"AI가 만든 화면을, 운영 들어가도 안 죽게 만든다."*

## 왜 이 정체성인가

### 빈 시장 (리서치로 검증됨)

- **vibe coding 시장**: 2026년 $4.7B, CAGR 38%. Lovable $100M ARR, Replit Agent $100M ARR. 90%가 production 미진입.
- **Production 진입 실패 원인**: AI 코드 40-62%에 보안 결함, 380,000개 vibe-coded 앱이 실제로 노출 (RedAccess 조사).
- **현존 도구의 한계**:
  - 보안 SAST (Semgrep, Snyk) — 보안만, 엔터프라이즈 페르소나
  - 디자인 (Stark, axe) — 디자인만, vibe coder 표적 X
  - 사람 컨설팅 (VIBECODE AUDIT $199-599) — 자동화 X
  - 플랫폼 내장 (Replit Security Agent, Vercel Deepsec) — 자기 플랫폼만
- **빈 자리**: 보안 + 디자인 + 품질을 **하나의 출하 직전 게이트**로 묶은 cross-platform 자동화 도구.

### 경쟁 지형의 자리

| 진영 | 자리 | jameskill과의 관계 |
|---|---|---|
| obra/superpowers (210k★) | 방법론 스택 (brainstorm → plan → tdd → review) | 그들은 *개발 중* 루프. 우리는 *출하 직전* 게이트 |
| Matt Pocock (110k★) | 엔지니어용 작고 조합 가능한 스킬 | 그들은 엔지니어 페르소나. 우리는 **vibe coder + 시니어 양쪽** |
| Anthropic security-guidance | 보안 단일축 (2026.5 출시) | **인접 경쟁자.** 우리는 보안 + 디자인 + 품질 **통합** |
| Anthropic frontend-design | 디자인 생성 *전* 가이드 | 우리는 디자인 생성 *후* 측정·진단·수정 |
| VIBECODE AUDIT | 사람 컨설팅 $199-599 | 우리는 자동화 + Claude Code 네이티브 |

### 차별화의 네 축

1. **다축 통합** — 보안 + 디자인 + 품질을 하나의 워크플로로. 현존 어떤 도구도 통합 표지 안 함.
2. **플랫폼 무관** — Lovable export, v0 export, Bolt zip, Replit clone 모두 처리.
3. **vibe coder 페르소나 UX** — "Supabase RLS가 뭔지 모름" 전제, 자동 수정 PR 생성.
4. **Claude Code 워크플로 네이티브** — Anthropic security-guidance가 작은 축(PR 코멘트)만 다루므로, "전체 라이프사이클" 자리 선점 가능.

## 타겟 페르소나

### 1차: Vibe Coder (Lovable / v0 / Bolt / Replit / Cursor Agent 사용자)
- 화면은 만들 수 있지만 "이걸 진짜 서비스로?"가 막힘
- "Supabase RLS"가 뭔지 모름, "OWASP Top 10"이 뭔지 모름
- 가장 두려운 일: 출시 직후 데이터 노출 / 디자인이 "AI같음"이라고 비웃음
- 가격 민감 (Lovable $20/월 쓰는 사람) — Claude Code 플러그인 자체가 적합한 가격대

### 2차: 시니어 엔지니어 (vibe 코더의 결과물을 production에 올리는 역할)
- AI 생성 코드의 PR 리뷰에 시간 낭비
- 같은 패턴의 실수를 매번 잡아야 함
- 표준화된 audit 체크리스트가 필요

### 페르소나가 동시에 만족되는 이유
- vibe coder가 `/ship-ready?` 한 번 누르면 → 시니어가 PR에서 다시 점검할 필요 없음
- "AI Score 87/100" 같은 정량화는 둘 다에게 유효

## 게임 모드: 영향력 + 카탈로그 하이브리드

- **영향력 축 (의견 있는 핵심 스킬)**: `/ship-ready?`, `/polish`, `/auth-check` — 매일 외우는 슬로건이 됨
- **카탈로그 축 (보조 스킬)**: 영역별 깊은 스킬 — v2.1, v2.2에서 누적

## 시장 규모 (추정)

- vibe coder 모집단: Lovable/v0/Bolt/Replit/Taskade 합산 **백만+ 빌더**
- Production 의향: 10-15% = **10-15만 명 TAM**
- Claude Code 플러그인 가격대 가정 시 잠재 매출 범위: **연 $10M-$50M** (5-10% 전환)

## 결정된 제약

| 차원 | 결정 |
|---|---|
| 언어 | 글로벌 우선 (영어 README/이슈) + 한국어 부캐 (블로그/디스코드) |
| 페이스 | 3-4개월 풀집중 |
| 의존성 | superpowers / Matt Pocock 의존 제거 (자체 스킬셋) |
| 이름 | jameskill 유지 + 강한 서브타이틀 |
| MVP | ~10개 스킬 (영역당 1-2개 + 우산 + lite 워크플로우) |
| 트래커 | Notion + GitHub Issues + Linear 백엔드 확장, 깊은 통합 |

## TBD (산출물 작성 중 결정 필요)

| 항목 | 결정 시점 |
|---|---|
| 영어 콘텐츠 작성 방식 (AI 보조 vs 직접) | v2-marketing.md |
| 본업(i-screammedia) dogfooding 범위/사례 | v2-roadmap.md |
| `/polish`의 Vision 모델 호출 비용/속도 | v2-skill-catalog.md |
| `/ship-ready?` 판정 기준의 정량적 임계값 | v2-skill-catalog.md |
| 트래커 백엔드 확장 시점 (v2.0 vs v2.1) | v2-roadmap.md |
| 마케팅 채널 우선순위 (HN/PH/Reddit/Twitter) | v2-marketing.md |

## 위험과 완화

| 위험 | 완화 |
|---|---|
| Anthropic이 통합 production-readiness 플러그인을 직접 출시 | 6-12개월 안에 카테고리 인지 굳히기. Anthropic의 인접 출시는 오히려 카테고리 검증 신호로 활용 |
| 청중 0에서 시작 — 콘텐츠 마케팅 부담 | product-led growth, `/ship-ready?` 결과 자체가 공유되는 메커니즘 설계 |
| 영어 콘텐츠 작성 자신감 부족 | README/이슈는 AI 보조, 트위터는 product 결과물 스크린샷 위주 |
| superpowers / Matt Pocock 사용자의 "왜 또 다른 스킬?" 회의 | "그들이 안 하는 것" 명확화 — *그들은 개발 중, 우리는 출하 직전 게이트* |
| jameskill의 기존 4개 스킬 사용자에게 v2.0 전환 부담 | 트래커 스킬은 유지, workflow만 점진적 재설계, Major bump (2.0.0) 명시 |
