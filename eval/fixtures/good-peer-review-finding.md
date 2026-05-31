---
type: positive
checks:
  - no-banned-phrases
  - inline-gloss-discipline
---

# Peer-review findings

## Important — `combineQuality` 의 코너 처리 누락
- **Severity**: Important
- **File:line**: `src/stroke/quality.ts:42`
- **Issue**: `combineQuality`(품질 등급 결합 함수) 의 `guideKAbs`(가이드 곡률 절대값) 기본값이 0 일 때 `corner-leniency`(코너 부근 판정 완화) 분기가 비활성됨. 코너 sample 이 부당하게 강등될 수 있음.
- **Suggestion**: `guideKAbs >= Math.PI/8` 조건 분기를 명시적 default 분기로 끌어올리고, 기본값일 때도 동작하도록 가드 추가.

## Minor — REFACTOR 흔적 미정리
- **Severity**: Minor
- **File:line**: `src/stroke/quality.ts:7`
- **Issue**: 제거된 `curvDiffAbs`(곡률 차이 절대값) 파라미터가 주석에 여전히 남아 있음.
- **Suggestion**: 주석 제거.

추가 발견 없음.
