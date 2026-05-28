# jameskill v2.0 — Marketing Strategy

> 청중 0에서 시작 + 영어 콘텐츠 직접 작성 부담 + 본업 dogfooding 자산.
> 핵심 전략: **Product-led growth + 익명 기반 채널 + Anthropic 생태계 노출**.

## 출발 조건의 정직한 인정

| 자원 | 보유 여부 |
|---|---|
| 본업 dogfooding | ✅ 가능 |
| 영어 콘텐츠 직접 작성 | ❌ AI 보조 필요 |
| Twitter/X 청중 1k+ | ❌ 0에서 시작 |
| 블로그/YouTube 청중 | ❌ 없음 |
| 한국 커뮤니티 네트워크 | ❌ 명확하지 않음 (검증 필요) |

→ **결론**: 콘텐츠 푸시형 마케팅은 ROI 낮음. **product 자체가 입소문 메커니즘**이 되도록 설계 + **익명 기반 채널**(HN, PH, Reddit) 1회 폭발 + **Anthropic 공식 생태계 노출**(showcase, marketplace).

## 슬로건 후보

### 영어 (1차)

- **메인**: *"Production-readiness for AI-built apps."*
- **도발적 보조**: *"Stop shipping AI slop."*
- **명령형**: *"Before you ship, ask jameskill."*
- **정량형**: *"Your AI-built app has an AI Score of 87/100. Here's why."*
- **GO/NO-GO**: *"Ship Ready? jameskill answers in one line."*

### 한국어 (부캐)

- **메인**: *"AI가 만든 화면을, 운영 들어가도 안 죽게."*
- **도발**: *"AI티 나는 화면, 그만 출시하자."*
- **공감**: *"내 AI가 같은 함수를 다섯 번 만들었다."*

## 채널 우선순위

### Tier 1 — 익명 기반 1회 폭발 (출시일 집중)

| 채널 | 형태 | 청중 부담 | 골든타임 |
|---|---|---|---|
| **Hacker News** | Show HN | 0 (글 자체로 평가) | 화요일 09:00 PST |
| **Product Hunt** | 등록 | 0 (제품 자체) | 화요일 00:01 PST |
| **Reddit r/ClaudeAI** | 출시 post | 0 | 평일 오전 ET |
| **Reddit r/programming** | 기술적 깊이 있는 post | 0 | 평일 오전 ET |
| **Reddit r/SideProject** | 빌더 스토리 | 0 | 주말 |

**왜 Tier 1**: 청중 0에서 시작해도 콘텐츠/제품 자체로 평가. 트위터처럼 누적 영향력 안 요구.

### Tier 2 — Anthropic 공식 생태계 (장기 누적)

| 채널 | 형태 | 작업 |
|---|---|---|
| **Anthropic 공식 marketplace** | 등재 신청 | v2.0 출시 직후 |
| **awesome-claude-code** | PR로 등재 | M1-M2 시점부터 |
| **claudemarketplaces.com / claudepluginhub.com** | 자동 등재 또는 신청 | v2.0 출시 직후 |
| **Anthropic Discord** | jameskill 채널 만들기 + 사용자 응대 | 출시 후 지속 |
| **Anthropic 공식 블로그/showcase** | "user story" 기고 또는 인용 | 사용자 누적 후 |

**왜 Tier 2**: Claude Code 사용자 100%가 거치는 경로. 등재 자체가 발견성 보장.

### Tier 3 — Twitter/X (AI 보조로 운영)

| 활동 | 빈도 |
|---|---|
| `/ship-ready?` `/polish` 사용 결과 스크린샷 공유 | 주 2-3회 |
| 본업 dogfooding Before/After (익명화) | 격주 |
| 경쟁사 비교 데이터 (객관) | 출시 시점 |
| 영어 thread (AI 보조 작성, 사용자 점검) | 마일스톤마다 1회 |

**전략**: 영향력 0에서는 thread보다 **시각 콘텐츠**(스크린샷, 짧은 영상)가 더 효과. AI 보조로 영문 카피만 다듬기.

### Tier 4 — 한국 채널 (부캐)

| 활동 | 빈도 |
|---|---|
| 한국어 블로그 1-2편 (회사 기술블로그 또는 개인 블로그) | M3, M6 |
| 한국 디스코드 (e.g. 인프런, 토스, 카카오 개발자 모임) | 출시 후 |
| 한국 트위터 / 페이스북 개발자 그룹 | 출시 시점 |

**왜 부캐**: 글로벌 ceiling 추구 — 한국 시장만으론 Matt Pocock급 명성 불가. 하지만 **한국 개발자가 만든 글로벌 도구** 스토리는 강력. 한국 커뮤니티가 첫 evangelist.

## Product-led growth 메커니즘

청중 0에서 출발하므로 **제품 자체가 공유되는 메커니즘**을 설계.

### `/ship-ready?` 출력의 공유 가능성

```
🚦 SHIP READY?  NO-GO

Blocking (3):
  ❌ Supabase RLS off on table `users`
  ❌ Stripe webhook signature missing
  ❌ Stripe SK in client bundle
```

- 단순 yes/no + 막힌 항목 → **스크린샷 공유 매우 적합**
- "내 앱이 NO-GO 받았다 ㅠㅠ" 자조형 트윗 패턴 유도

### AI Score의 SNS 친화성

```
🎨 AI Score: 87/100  ⚠️ HIGH
```

- 점수화 → 비교 → 공유 (게이미피케이션)
- "AI Score 87 → 45로 낮췄다" Before/After 콘텐츠
- 트위터에서 "다들 AI Score 자랑하기" 유행 가능성

### `/dedupe` 출력의 공감 콘텐츠성

```
Cluster 1: User name formatting (3 functions)
  - formatUserName(u)
  - getDisplayName(user)
  - user.firstName + ' ' + user.lastName
```

- "내 AI가 같은 함수 3번 만들었다" → 공감 콘텐츠 1티어

### Built-in 공유 트리거 (옵션)

- `/ship-ready?` 결과 끝에 *"Share your verdict: jameskill.dev/share/<hash>"* 작은 줄
- 익명 hash + 결과 표시 페이지 (선택적)
- **부담스럽지 않게** — 강제 X, 권유 X. 단지 한 줄 노출

## 출시 스크립트 (D-14 ~ D+30)

### D-14 (마일스톤 M5 완료 시점)

- 본업 dogfooding 사례 3-5개 익명화 정리
- 데모 영상 3개 녹화 (`/ship-ready?` 30초, `/polish` Before/After 1분, dogfooding 사례 2분)
- 영어 README v2.0 완성 (AI 보조)
- 한국어 블로그 초고

### D-7

- HN Show HN 초안 작성:
  - 제목: "Show HN: jameskill — Production-readiness layer for AI-built apps"
  - 본문: 문제(vibe coded 380k 앱 노출) → 해결(통합 게이트) → 데모 링크 → 차별점 한 줄
- PH 등록 페이지 준비 (대표 이미지, 30초 영상, tagline)
- Reddit posts 초안 3개 (각 서브레딧 톤에 맞춰)
- 한국 디스코드/커뮤니티 공유 준비

### D-3

- Twitter 카운트다운 (영향력 0이라도 본업 동료 + 한국 개발자 net 활용):
  - "3 days to v2.0"
  - 스크린샷 1장 ("`/ship-ready?` returns NO-GO with 3 specific blockers")

### D-Day (화요일)

| 시간 (PST) | 행동 |
|---|---|
| 00:01 | PH 등록 |
| 06:00 | Reddit posts (r/ClaudeAI, r/programming, r/SideProject) |
| 09:00 | HN Show HN |
| 09:30 | Twitter 출시 thread |
| 10:00 | Anthropic Discord 채널 만들기 + 안내 |
| 12:00 | 한국 디스코드/커뮤니티 공유 |
| 17:00 | 1차 사용자 반응 모니터링 + 즉시 응답 |

### D+1 ~ D+7

- 사용자 반응 → 즉시 수정 → 트윗 (build-in-public)
- 발견된 실제 결함 사례 공유 (사용자 동의 받아 익명화)
- HN/PH/Reddit 댓글 1:1 응대 (제품 신뢰)
- 한국 블로그 1편 발행

### D+8 ~ D+30

- 사용자 사례 누적 → "user stories" 페이지
- 매주 트위터 thread 1회 ("week 1 of jameskill v2.0")
- 모자란 영역(GitHub Issues 백엔드, Linear) v2.1 로드맵 공개

## 측정 지표

| 시점 | 지표 | 목표 (보수) | 목표 (적극) |
|---|---|---|---|
| D-Day | HN upvote (24시간) | 50+ | 200+ (1st page) |
| D-Day | PH 순위 | top 10 | Tools of the Day |
| D-Day | Reddit upvote 총합 | 100+ | 500+ |
| D+7 | GitHub stars | 200+ | 1,000+ |
| D+7 | NPM 다운로드 (jameskill plugin) | 100+ | 500+ |
| D+30 | GitHub stars | 500+ | 3,000+ |
| D+30 | 사용 보고 (`/ship-ready?` 실행 횟수, opt-in 텔레메트리) | 1,000+ | 10,000+ |
| D+90 | GitHub stars | 2,000+ | 10,000+ |
| D+90 | Anthropic 공식 marketplace 등재 | 등재 | 추천 카테고리 |

## 콘텐츠 백로그 (출시 후 1년)

- "How I built jameskill in 4 months" 영어 블로그 (Hacker News 골든타임 화제)
- "Korean dev's $0 marketing playbook for shipping a Claude Code plugin" 한국어 블로그
- jameskill 사용 사례 모음 (분기별 1회)
- vibe coding 결함 트렌드 리포트 (분기별, 트래커 데이터 기반)
- 외부 컨퍼런스 발표 (한국 개발자 콘퍼런스 1-2개 시도)

## 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| HN/PH 출시일 무반응 | 1차 모멘텀 실패 | Reddit + Anthropic Discord + 한국 커뮤니티가 백업. PH는 1주 후 재시도 가능 |
| Anthropic이 인접 플러그인 출시로 노이즈 | 발견성 저하 | jameskill의 통합 게이트 차별점 강조. Anthropic showcase 채널 적극 활용 |
| 영어 콘텐츠 quality 낮음 → 신뢰 손상 | conversion 저하 | AI 보조 + 영어 native 본업 동료 1-2명 사전 검수 |
| 본업 dogfooding 사례 비공개 처리 | 콘텐츠 부족 | 가상 SaaS 데모 1개 따로 만들기 (예: `jameskill-demo-app` 오픈소스 레포) |
| 청중 누적 안 됨 → 매 마일스톤마다 0부터 시작 | 장기 모멘텀 부재 | Anthropic Discord 채널 + 한국 디스코드 등 **거점 커뮤니티** 1-2개 유지 |
| 한국어 부캐 만들 시간 부족 | 한국 노출 X | 한국 커뮤니티는 출시일 1회 공유로 시작, 이후 누적 |

## TBD

| 항목 | 결정 시점 |
|---|---|
| Built-in 공유 트리거 (jameskill.dev/share/<hash>) 도입 | M4 완성 후 |
| 도메인 등록 (`jameskill.dev` vs jameskyeong.dev vs 다른) | D-30 |
| 영어 native 검수자 섭외 | D-21 |
| Anthropic showcase 채널 노출 시도 (PR or 이슈) | M3 완성 후 |
| 한국 컨퍼런스 발표 신청 (인프콘 등) | D+30 |
| 회사 기술블로그 vs 개인 블로그 | M3 완성 시점 |

## 핵심 결정

- **마케팅 ROI 최우선 = product 자체의 공유 가능성** (`/ship-ready?`, AI Score, `/dedupe` 출력)
- **콘텐츠 마케팅은 보조**, 영향력 누적은 출시 후 1년 단위
- **익명 채널(HN/PH/Reddit) 1회 폭발**이 청중 0에서 시작하는 사람의 유일한 단기 채널
- **Anthropic 생태계 등재**가 장기 발견성의 기반
- **한국어 부캐**는 부담스럽지 않게 — 출시일 1회 + 분기별 1편
