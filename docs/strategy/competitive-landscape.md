# Competitive Landscape — Claude Code Skills & Production-readiness 도구

> 작성일: 2026-05-28
> 데이터: GitHub API 라이브 조회 + 공식 마켓플레이스 (2026-05-28)

## TL;DR

- **방법론 스택**(superpowers) + **엔지니어용 작은 스킬**(Matt Pocock) 자리는 굳어졌다. 직접 도전 X.
- **출하 직전 통합 게이트** + **vibe coder 페르소나 명시 타깃** + **closed-loop issue tracker**가 무인 지대 — jameskill의 자리.
- ⚠️ Anthropic이 **security-guidance** (2026-05-27) + **frontend-design** 플러그인 직접 출시 — 인접 진입. 단일 축 경쟁은 불리, **통합 워크플로**로 차별화.

## 1. 직접 비교 — 방법론/스킬 진영

| 항목 | obra/superpowers | mattpocock/skills | jameskill (현재) | jameskill v2.0 (목표) |
|---|---|---|---|---|
| Stars | 210,695 | 109,742 | (미공개/소수) | — |
| 슬로건 | "agentic skills framework & SW dev methodology" | "Skills for Real Engineers — not vibe coding" | "Issue tracking + workflow orchestrator" | "Production-readiness layer for AI-built apps" |
| 타겟 페르소나 | 엔지니어 | **엔지니어 (명시적으로 vibe X)** | (애매) | **vibe coder + 시니어 양쪽** |
| 진입점 | brainstorm/spec → plan → execute | grill-me / grill-with-docs / tdd | resolve-issue / workflow | ship-check / ship-ready? |
| 영역 | 개발 *중* 루프 | 개발 *중* 루프 + 글쓰기 | 워크플로 + 이슈 | **출하 직전 게이트** |
| 의존성 | 자립 | 자립 | superpowers + Matt Pocock 의존 | **자립 (v2.0 목표)** |
| 공식 마켓 | ✓ 등재 | ✗ (자체 skills.sh) | ✗ | 등재 추진 |
| 노출 채널 | GitHub 자체 + 마켓 | X 60k + AI Hero 뉴스레터 | (없음) | 한국 디스코드 + 영어 README + Anthropic showcase |

### 핵심 인용

> obra/superpowers README: *"An agentic skills framework & software development methodology that works."*

> Matt Pocock README: *"Skills for Real Engineers. Straight from my .claude directory."* + 부제 *"not vibe coding"*

→ **두 진영 모두 "엔지니어 페르소나" 명시**. vibe coder는 명시적 비대상. **이 자리가 비어 있음.**

## 2. Anthropic 직접 출시 플러그인 — 인접 경쟁자

| 플러그인 | 출시 | 영역 | jameskill에 미치는 영향 |
|---|---|---|---|
| **security-guidance** | 2026-05-27 | 패턴 경고 + Stop 시 LLM 리뷰 + 커밋 리뷰 (injection/XSS/SSRF/시크릿 25+ 클래스) | ⚠️ **단일 축(보안) 경쟁자.** PR 코멘트 30-40% 감소 효과 입증. jameskill은 보안 단일이 아닌 **통합 게이트**로 차별 |
| **frontend-design** | 2026.초 | 디자인 *생성 전* 가이드 (Purpose/Tone/Constraints/Differentiation 4-질문) | ✋ **생성 전 예방**. jameskill `/polish`는 **생성 후 측정·진단·수정** — 보완 관계 |
| **semgrep** | (큐레이션) | Semgrep SAST 실시간 | 우리는 wrap해서 사용 |
| **sonarqube** | (큐레이션) | 7,000+ 룰 PostToolUse | 우리는 vibe coder에 sonarqube가 너무 무거움 — wrap 또는 패스 |
| **code-review / pr-review-toolkit** | (큐레이션) | PR 멀티에이전트 리뷰 | 우리는 PR 시점이 아닌 **출하 직전** 게이트 |
| **skill-creator** | (큐레이션) | 스킬 작성 메타 | 우리 영역 아님 |

**결론**: Anthropic이 인접 영역을 빠르게 점유 중. **6-12개월 안에 카테고리 인지 굳히기**가 핵심.

## 3. awesome-claude-code 등재 (227개 리소스, 45k★)

### Agent Skills 카테고리 Top

| 이름 | Stars | 메모 |
|---|---|---|
| obra/superpowers | 210,695 | 위 참조 |
| affaan-m/ECC (Everything Claude Code) | 196,875 | 거대 메타-팩 |
| K-Dense-AI/scientific-agent-skills | 26,381 | 과학 도메인 |
| EveryInc/compound-engineering-plugin | 17,656 | "Compound engineering" |
| Jeffallan/claude-skills | 9,445 | 일반 팩 |
| **trailofbits/skills** | 5,449 | **보안 표준 (CodeQL + Semgrep + variant analysis)** |
| zarazhangrui/codebase-to-course | 4,489 | 비-개발자용 (역방향) |
| NeoLabHQ/context-engineering-kit | 1,048 | 컨텍스트 엔지니어링 |

### 인접 카테고리 (Slash-Commands / Tooling)

| 이름 | 영역 | 비고 |
|---|---|---|
| blader/humanizer | AI 흔적 제거 (writing) | 21,349★. "디자인" 버전이 없음 — **jameskill `/polish` 기회** |
| dominikmartn/nothing-design-skill | 단일 디자인 시스템 (Nothing) | 2,392★ |
| FlineDev/ContextKit | "production-ready code on first try" | 0.2.0 단계, 인지 낮음 |
| maxritter/ClaudeCodePro | TDD 강제 + quality hooks | v7.5.7 |
| avifenesh/AgentSys | task-to-production multi-agent | v5.4.1 |
| OneRedOak/Design Review Workflow | UI/UX 리뷰 | "stale" 플래그 |

**관찰**: "production-ready" 키워드를 표방하는 플러그인이 등장 시작 (ContextKit, ClaudeCodePro, AgentSys). 하지만 **인지도 낮음**, **vibe coder 명시 타깃은 0개**.

## 4. 경쟁 강도 매트릭스

| jameskill 영역 | superpowers 중복 | Matt Pocock 중복 | Anthropic 마켓 중복 | 빈 영역 |
|---|---|---|---|---|
| brainstorm / spec → plan | 풀 중복 | grill-me/grill-with-docs 중복 | feature-dev | — |
| TDD red-green | 중복 | tdd | playground | — |
| 체계적 디버깅 | 중복 | diagnose | — | — |
| 코드 리뷰 | 중복 | review (in-progress) | code-review, pr-review-toolkit, coderabbit | — |
| 아키텍처 진단 | 없음 | improve-codebase-architecture | — | 보안+품질+디자인 결합 진단 |
| Issue tracking | 없음 | to-issues, to-prd, triage (GitHub/Linear 중심) | — | **Notion + 출하 후 closed-loop ← jameskill 영역** |
| **Production-readiness 통합 게이트** | 없음 | 없음 | 단일 축만 (security-guidance / semgrep / frontend-design 따로) | **무인 지대 ← jameskill 핵심 자리** |
| **vibe coder 페르소나 명시 타깃** | 안 함 | 안 함 (명시적 비대상) | 안 함 | **무인 지대** |
| 한국어/현지 컨텍스트 | 없음 | 없음 | 없음 | **무인 지대** |
| 토큰 절감 모드 | 없음 | caveman 65k★ | — | 이미 jameskill에 caveman 존재 |

## 5. Vibe coding / production-readiness 시장 측면

### Vibe coding 도구의 production 한계 (인용)

| 도구 | 사용자 규모 | 알려진 production 사고 |
|---|---|---|
| Lovable | $100M ARR 8개월, 사용자 60% 비개발자 | CVE-2025-48757: 1,645개 앱 중 170개(10.3%) PII 유출. BOLA 결함 48일간 미해결 |
| Replit Agent | $10M→$100M ARR 9개월 | 2025 production DB 삭제 사건 — vibe coder 워크플로 "신뢰 폭발" 사례 |
| v0.dev | SOC 2 Type II | 2026.4 Vercel 자체 보안 사고 (서드파티 AI 도구 경유 env vars 유출) |
| Bolt.new | RedAccess 380,000 노출 자산에 포함 | — |
| Cursor Agent | 92% 미국 개발자 매일 AI 코딩 도구 사용 (포함) | AI 코드 디버깅 63% 시간 추가 소요 |

### 자체 production 도구 보유 여부

| 도구 | 자체 production 기능 | jameskill과의 관계 |
|---|---|---|
| Replit | **Security Agent** (2026-05, Semgrep+HoundDog.ai, 15분 스캔) | 플랫폼 lock-in. Lovable/v0 사용자 못 씀 |
| Vercel | **Deepsec** (오픈소스, 2026-05) | 마찬가지 lock-in |
| Lovable | 2026.5 보안 가이드라인 (BOLA/RLS 사고 후 대응) | 사후 대응 수준 |
| Bolt | 명시적 production 보안 없음 | — |
| Cursor | Marketplace (skills/MCP/hooks/rules) | 자체 콘텐츠 부족, jameskill이 들어갈 자리 |

**결론**: 플랫폼 내장 도구는 자기 플랫폼만 지원. **cross-platform 자동화 도구 자리는 비어 있음** (사람 컨설팅 VIBECODE AUDIT $199-599만 진입).

### Production-readiness 진영 도구

| 카테고리 | 도구 | AI 통합 | vibe coder 표적 |
|---|---|---|---|
| 보안 SAST | Semgrep | Multimodal AppSec engine (2026, LLM reasoning) | 기업 보안팀 (X) |
| 보안 SAST | Snyk | "semantic AI engine" | 기업 (X) |
| 보안 SAST | Corgea, Aikido | AI 코드 SAST 신규 진입 | SMB/dev (부분) |
| 시크릿 | GitGuardian, Trivy | 일반 시크릿 스캔 | DevSecOps (X) |
| 성능 | Sentry, Datadog, Vercel Analytics | AI 트레이싱 (관측 측) | 운영팀 (X) |
| 품질 | SonarQube, Codacy | 일반 룰셋 | 엔터프라이즈 (X) |
| 디자인/A11y | Stark, axe-core, Figma Dev Mode | 디자인 시스템 검증 | 디자이너/프론트 (X) |

**결론**: 보안 SAST 진영(Semgrep, Snyk, Corgea)이 "AI-generated code" 키워드로 빠르게 이동 중. 하지만 **단일 카테고리**일 뿐 통합 게이트는 아님.

## 6. "AI 결과물 → production 다리" 카테고리 — 이미 진입한 플레이어

| 플레이어 | 형태 | 가격 | jameskill 차별 |
|---|---|---|---|
| **VIBECODE AUDIT** | 사람 컨설팅 (엔지니어 20명) | Security $199, Quality $249, Production Readiness $349, Bundle $599 | 자동화 + Claude Code 네이티브 |
| Beesoul/ALEA/Geminate | 사람 컨설팅 | $500-3,000/회 | 같음 |
| **VibeEval** | SaaS 런타임 스캔 | 비공개 | 코드 레벨 + 디자인 + 성능 통합 |
| Replit Security Agent / Vercel Deepsec | 플랫폼 내장 | 플랫폼 가격 | cross-platform |
| **Anthropic security-guidance** | Claude Code 플러그인 (무료) | $0 | **통합 게이트** vs 단일 보안축 |

## 7. 무인 지대 (jameskill v2.0의 자리)

1. **출하 직전 통합 게이트** — 보안(semgrep wrap + RLS/auth 도메인) + 품질(jscpd wrap + 의미 중복) + 디자인(결정론 + Vision 판정)을 **하나의 GO/NO-GO 판정**으로
2. **vibe coder 페르소나 명시 타깃** — "Supabase RLS가 뭔지 모름" 전제 UX
3. **Cross-platform** — Lovable/v0/Bolt/Replit/Cursor 어디서 빌드했든 동일 점검
4. **Notion + 출하 후 closed-loop issue tracker** — 발견→추적→해결→검증 한 사이클
5. **한국 시장 + 한국어 부캐 콘텐츠** — 한국 vibe coder/스타트업 발견성

## 8. 위협 시그널 (모니터링 필요)

| 시그널 | 의미 | 대응 |
|---|---|---|
| Anthropic이 통합 production-readiness 플러그인 출시 | 핵심 카테고리 직접 점유 | 6-12개월 안에 인지 굳히기. 이미 잡힌 사용자 베이스가 보호막 |
| Semgrep / Snyk가 "AI code → production" 슬로건 채택 | 보안 단일축 경쟁 격화 | 보안 외 디자인+품질 통합으로 차별 |
| Lovable/Replit 자체 production 도구가 cross-platform화 | 플랫폼 종속 격차 해소 | 트래커 백엔드 확장 + Claude Code 네이티브 강조 |
| VIBECODE AUDIT 자동화 도구 출시 | 같은 카테고리 직접 경쟁 | Open source + Claude Code 통합으로 차별 |

## 9. 출처

- [obra/superpowers](https://github.com/obra/superpowers/)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (203 plugins)
- [trailofbits/skills](https://github.com/trailofbits/skills)
- [Anthropic security-guidance 출시](https://www.explainx.ai/blog/claude-code-security-guidance-plugin-2026)
- [Anthropic frontend-design 블로그](https://claude.com/blog/improving-frontend-design-through-skills)
- [Lovable CVE-2025-48757 분석 (Superblocks)](https://www.superblocks.com/blog/lovable-vulnerabilities)
- [Wiz Research: 20% of Vibe-Coded Apps](https://www.wiz.io/blog/common-security-risks-in-vibe-coded-apps)
- [VIBECODE AUDIT](https://vibecode-audit.com/)
- [VibeEval (May 2026 Defender Stack)](https://vibe-eval.com/updates/lovable-security-report-may-2026/)
- [Sacra: Semgrep multimodal engine](https://sacra.com/research/semgrep/)
- [Charterglobal: 90% vibe-coded 미진입](https://www.charterglobal.com/can-vibe-coding-produce-production-grade-software/)
