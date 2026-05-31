---
type: positive
checks:
  - no-banned-phrases
  - inline-gloss-discipline
---

# DIAGNOSE conclusion

## 재현 (Reproduce)
`test_straight_stroke_no_red_sample`(직선 stroke 에서 빨간 sample 이 나오지 않아야 한다는 회귀 테스트) 가 실패함을 직접 관측 — `combineQuality`(품질 등급 결합 함수) 가 매 sample 마다 1개씩 빨강 등급을 매기는 현상 확인.

## 최소화 (Minimize)
fixture 를 직선 한 줄로 축소. 다른 모양 제거 후에도 같은 실패 재현.

## 조사 (Investigate)
가설: `finite-difference`(인접 점 차분으로 곡률 추정하는 방식) 의 노이즈가 사용자 곡률 추정값을 흔들어 `combineQuality` 가 강제 bad 등급을 매김. 코드 읽기로 확인 — `analyzeStroke`(stroke 분석 함수) 의 곡률 계산 결과가 임계값을 넘는 sample 이 존재함을 직접 확인.

## 수정 (Fix)
`combineQuality` 에서 곡률 분기 제거. 거리와 방향 두 축만으로 판정.

## 회귀 방지 (Regression-prevent)
최소화된 fixture 가 영구 테스트로 편입됨. 커밋에 fix 와 함께 포함.
