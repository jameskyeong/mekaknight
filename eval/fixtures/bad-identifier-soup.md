---
type: negative
expectFail: inline-gloss-discipline
---

# Bad fixture — identifier soup

## 변경 요약
`combineQuality` 에서 `curvDiffAbs` 의 `dirCos` 를 모두 제거하고 `analyzeStroke` 에서 `guideKAbs` 만 유지.

이 줄은 연결사(`에서`, `의`, `를`)만으로 5개 식별자를 나열한 전형적 soup 입니다 — `inline-gloss-discipline` 검사가 잡아야 합니다. negative fixture 이므로 runner 가 FAIL 을 받아야 SUCCESS 로 카운트합니다.
