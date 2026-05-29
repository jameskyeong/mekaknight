# mekaknight v2.0 — Marketing Strategy

> 청중 0에서 시작 + 영어 콘텐츠 직접 작성 부담 + dogfooding 자산은 저자의 실제 작업 세션.
> 핵심 전략: **forge-led messaging + humane tracker secondary + Product-led growth + 익명 기반 채널 + Anthropic 생태계 노출**.
> 피벗: ADR 0004 (narrow). 리드 스킬은 **forge** (저자가 매일 사용). 2차는 **tracker** (link/tag/strike). lock + launch는 alpha utility로 헤드라인 밖. 1-2주 finishing touches 출시.

## 출발 조건의 정직한 인정

| 자원 | 보유 여부 |
|---|---|
| dogfooding (저자의 실제 작업 세션) | ✅ 가능 — forge + tracker 매일 사용 |
| 영어 콘텐츠 직접 작성 | ❌ AI 보조 필요 |
| Twitter/X 청중 1k+ | ❌ 0에서 시작 |
| 블로그/YouTube 청중 | ❌ 없음 |
| 한국 커뮤니티 네트워크 | ❌ 명확하지 않음 (검증 필요) |

→ **결론**: 콘텐츠 푸시형 마케팅은 ROI 낮음. **forge 실제 세션 클립이 그 자체로 콘텐츠** + **익명 기반 채널**(HN, PH, Reddit) 1회 폭발 + **Anthropic 공식 생태계 노출**(showcase, marketplace).

## 슬로건 후보

### 영어 (1차)

- **메인 (히어로)**: *"A disciplined Claude Code workflow + an issue tracker that reads like a problem statement."*
- **forge 리드**: *"`/forge` — strict TDD and no-soft-language verification, in one command."*
- **tracker 리드**: *"Issues that read like problem statements, not commit messages."*
- **명령형**: *"Stop wiring four plugins. `/forge` does it in one."*
- **보조 (humane tracking)**: *"Your prompts become Notion issues. Your sessions resolve them."*

### 한국어 (부캐)

- **메인**: *"엄격한 Claude Code 워크플로 + 문제 진술처럼 읽히는 이슈 트래커."*
- **forge**: *"한 명령으로 TDD를 강제한다 — `/forge`."*
- **tracker**: *"이슈 제목이 commit 메시지가 아니라 문제 진술이 된다."*

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
| **awesome-claude-code** | PR로 등재 | Week 1-2 시점부터 |
| **claudemarketplaces.com / claudepluginhub.com** | 자동 등재 또는 신청 | v2.0 출시 직후 |
| **Anthropic Discord** | mekaknight 채널 만들기 + 사용자 응대 | 출시 후 지속 |
| **Anthropic 공식 블로그/showcase** | "user story" 기고 또는 인용 | 사용자 누적 후 |

**왜 Tier 2**: Claude Code 사용자 100%가 거치는 경로. 등재 자체가 발견성 보장.

### Tier 3 — Twitter/X (AI 보조로 운영)

| 활동 | 빈도 |
|---|---|
| `/forge` 실제 세션 클립 ("내 actual workflow") | 주 2-3회 |
| `/tag` → grouped Notion issues → `/strike` 흐름 클립 | 격주 |
| 경쟁사 비교 데이터 (객관 — superpowers/Pocock 합성 vs forge self-contained) | 출시 시점 |
| 영어 thread (AI 보조 작성, 사용자 점검) | Week 1 / Week 2 / 출시일 각 1회 |

**전략**: 영향력 0에서는 thread보다 **시각 콘텐츠**(스크린샷, 짧은 영상)가 더 효과. forge dogfooding 클립이 매일 자연스럽게 쌓임 — 저자가 매일 쓰므로 콘텐츠 비용 거의 0.

### Tier 4 — 한국 채널 (부캐)

| 활동 | 빈도 |
|---|---|
| 한국어 블로그 1-2편 (회사 기술블로그 또는 개인 블로그) | Week 2 시점, D-Day |
| 한국 디스코드 (e.g. 인프런, 토스, 카카오 개발자 모임) | 출시 후 |
| 한국 트위터 / 페이스북 개발자 그룹 | 출시 시점 |

**왜 부캐**: 글로벌 ceiling 추구 — 한국 시장만으론 Matt Pocock급 명성 불가. 하지만 **한국 개발자가 만든 글로벌 도구** 스토리는 강력. 한국 커뮤니티가 첫 evangelist.

## Product-led growth 메커니즘

청중 0에서 출발하므로 **제품 자체가 공유되는 메커니즘**을 설계.

### `/forge` 세션의 공유 가능성 (리드 콘텐츠)

forge end-to-end 실제 세션은 짧은 영상 / GIF로 공유 가능:

```
1. /forge → clarify 단계: "spec이 모호한 곳을 콕 짚는다"
2. build-with-tests: red → green → refactor 루프
3. verify: "should be fine" 같은 soft language 거부 시연
4. finish: clean commit + branch hygiene
```

- 저자가 매일 쓰는 도구이므로 콘텐츠가 자연스럽게 쌓임 (합성 시나리오 불필요)
- "내 actual workflow" 톤이 마케팅 톤보다 신뢰 ↑
- **이게 마케팅 리드 콘텐츠.** demo 영상, HN thread, PH 페이지 모두 forge 세션이 첫 frame.

### `/tag` + `/strike` 흐름의 공유 가능성 (2차 콘텐츠)

```
1. Slack-style blob 한 덩어리 → /tag
2. Notion에 grouped issues 생성 (이슈 제목이 문제 진술처럼)
3. /strike로 한 개 골라서 해결 → 상태 갱신
```

- "프롬프트가 문제 진술 단위 이슈로 변환" 시각화에 적합
- generic Notion 통합과 차별이 한눈에 드러남

### v2.1+ 콘텐츠 (deferred)

`/polish` AI Score 게이미피케이션, `/dedupe` 의미적 중복 공감 콘텐츠는 v2.1 후보. v2.0 출시일은 **forge + tracker 두 가지로 집중**. lock + launch는 출시 영상에 짧게 (~30초, 옵션) 보일 수 있으나 헤드라인 아님.

### Built-in 공유 트리거 (옵션, v2.1+)

- forge 세션 끝에 *"Share your session: mekaknight.dev/share/<hash>"* 작은 줄 (선택적)
- 부담스럽지 않게 — 강제 X. 단지 한 줄 노출

## 출시 스크립트 (D-14 ~ D+30) — 1-2주 출시 기준

### D-14 (Week 1 시작 시점)

- 문서 정렬: README / CONTEXT.md / strategy 4문서 narrow-pivot 반영
- 영어 README v2.0 완성 (AI 보조, forge + tracker 리드)
- 한국어 블로그 초고

### D-7 (Week 2 시작 시점)

- 데모 영상 녹화:
  - **리드 (~2분)**: `/forge` end-to-end 실제 feature 하나 — clarify → build-with-tests → verify → finish
  - **2차 (~1-2분)**: `/tag` blob → Notion grouped issues → `/strike` 한 개 해결
  - **옵션 (~30초)**: `/lock` + `/launch` "available, not the headline" 짧은 시연
- HN Show HN 초안:
  - 제목: *"Show HN: mekaknight — a disciplined Claude Code workflow + a humane Notion issue tracker"*
  - 본문: 문제(Claude Code workflow가 흐려지는 verify 단계 + generic 이슈 트래커) → 해결(forge의 strict TDD + tracker의 문제 진술) → 데모 링크 → 차별점("not another plugin stack — one self-contained command")
- PH 등록 페이지 준비 (대표 이미지: forge 세션 한 컷, 2분 영상, tagline: "disciplined Claude Code workflow + humane tracker")
- Reddit posts 초안 3개 (각 서브레딧 톤에 맞춰)
- 한국 디스코드/커뮤니티 공유 준비

### D-3

- Twitter 카운트다운 (영향력 0이라도 본업 동료 + 한국 개발자 net 활용):
  - "3 days to v2.0 — disciplined workflow + humane tracker"
  - 스크린샷 1장 (`/forge` clarify 단계 또는 verify 단계 한 컷)

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
- 저자의 매일 forge 세션 클립 공유 (자연스러운 dogfooding 콘텐츠)
- HN/PH/Reddit 댓글 1:1 응대 (제품 신뢰)
- 한국 블로그 1편 발행

### D+8 ~ D+30

- 사용자 사례 누적 → "user stories" 페이지
- 매주 트위터 thread 1회 ("week 1 of mekaknight v2.0 — forge sessions I shipped")
- lock + launch 관련 사용자 요청 모니터링 → v2.1 방향 결정 input

## 측정 지표

| 시점 | 지표 | 목표 (보수) | 목표 (적극) |
|---|---|---|---|
| D-Day | HN upvote (24시간) | 50+ | 200+ (1st page) |
| D-Day | PH 순위 | top 10 | Tools of the Day |
| D-Day | Reddit upvote 총합 | 100+ | 500+ |
| D+7 | GitHub stars | 200+ | 1,000+ |
| D+7 | NPM 다운로드 (mekaknight plugin) | 100+ | 500+ |
| D+30 | GitHub stars | 500+ | 3,000+ |
| D+30 | 사용 보고 (forge / tracker 실행 횟수, opt-in 텔레메트리) | 1,000+ | 10,000+ |
| D+30 | lock/launch 사용 요청 수 | — | v2.1 방향 결정 input |
| D+90 | GitHub stars | 2,000+ | 10,000+ |
| D+90 | Anthropic 공식 marketplace 등재 | 등재 | 추천 카테고리 |

## 콘텐츠 백로그 (출시 후 1년)

- "How I shipped mekaknight v2.0 in 2 weeks (after a narrow pivot)" 영어 블로그 (Hacker News 골든타임 화제)
- "My actual Claude Code workflow — what `/forge` looks like every day" 영어 블로그 (dogfooding 자산)
- "Korean dev's $0 marketing playbook for shipping a Claude Code plugin" 한국어 블로그
- mekaknight 사용 사례 모음 (분기별 1회)
- forge 세션 트렌드 ("what real strict-TDD looks like") 분기별 리포트
- 외부 컨퍼런스 발표 (한국 개발자 콘퍼런스 1-2개 시도)

## 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| HN/PH 출시일 무반응 | 1차 모멘텀 실패 | Reddit + Anthropic Discord + 한국 커뮤니티 백업. PH는 1주 후 재시도 가능 |
| Anthropic이 인접 Claude Code workflow 플러그인 출시로 노이즈 | 발견성 저하 | mekaknight의 self-contained + strict TDD 차별점 강조. Anthropic showcase 채널 적극 활용 |
| 영어 콘텐츠 quality 낮음 → 신뢰 손상 | conversion 저하 | AI 보조 + 영어 native 본업 동료 1-2명 사전 검수 |
| forge 데모 영상이 superpowers / Matt Pocock과 비교 받음 | 차별화 의문 | "self-contained, no external skill install" + "no-soft-language verification" 두 가지를 영상 초반에 명시 |
| 사용자가 lock/launch만 요청 | v2.0 메시지 흔들림 | "v2.1 방향 결정 input" 으로 처리 — ADR 0004의 의도. 메시지는 유지, v2.1 시점에 별도 결정 |
| 청중 누적 안 됨 → 매 마일스톤마다 0부터 시작 | 장기 모멘텀 부재 | Anthropic Discord 채널 + 한국 디스코드 등 **거점 커뮤니티** 1-2개 유지 |
| 한국어 부캐 만들 시간 부족 | 한국 노출 X | 한국 커뮤니티는 출시일 1회 공유로 시작, 이후 누적 |

## TBD

| 항목 | 결정 시점 |
|---|---|
| Built-in 공유 트리거 (mekaknight.dev/share/<hash>) 도입 | v2.1 이후 (v2.0 스코프 아님) |
| 도메인 등록 (`mekaknight.dev` vs jameskyeong.dev vs 다른) | D-14 |
| 영어 native 검수자 섭외 | D-10 |
| Anthropic showcase 채널 노출 시도 (PR or 이슈) | Week 2 완료 후 |
| 한국 컨퍼런스 발표 신청 (인프콘 등) | D+30 |
| 회사 기술블로그 vs 개인 블로그 | Week 1 완료 시점 |
| forge 데모 영상에 쓸 실제 feature 선택 | Week 2 시작 |

## 핵심 결정

- **forge가 리드 스킬** — `/forge` 세션이 모든 마케팅 메시지의 중심. tracker는 2차 리드.
- **마케팅 ROI 최우선 = forge dogfooding 클립** ("my actual workflow") — 저자가 매일 쓰는 도구이므로 콘텐츠 비용 거의 0.
- **lock + launch는 alpha utility, off marketing surface** — 영상 3 (~30초)에 옵션으로 나올 수 있으나 헤드라인 아님. v2.1+에서 demand 보고 방향 결정.
- **콘텐츠 마케팅은 보조**, 영향력 누적은 출시 후 1년 단위
- **익명 채널(HN/PH/Reddit) 1회 폭발**이 청중 0에서 시작하는 사람의 유일한 단기 채널
- **Anthropic 생태계 등재**가 장기 발견성의 기반
- **한국어 부캐**는 부담스럽지 않게 — 출시일 1회 + 분기별 1편
- **"vibe coder / vibe coding" 키워드**는 의도된 discovery search term으로 보존 (저자의 사전 결정). 다만 v2.0의 **중심 audience cue는 아님** — 중심은 "disciplined Claude Code workflow + humane tracker를 원하는 개발자".
