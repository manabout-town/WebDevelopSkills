# Summary

사용자가 평점/리뷰 기능의 스키마(테이블 컬럼)부터 바로 설계해달라고 요청했으나, feature-scoping 스킬의 가이드에 따라 스키마 설계 전에 문제 정의, 행위자, 사용자 플로우, MVP 경계, 성공 기준을 먼저 정리하도록 대화를 되돌렸습니다. 컬럼 정의나 테이블 설계는 전혀 제공하지 않았고, 대신 5가지 핵심 질문을 던진 뒤 답변이 없는 상태에서도 진행할 수 있도록 가정을 명시한 스코프 문서 초안(Problem/Actors/User flow/Touches & dependencies/MVP cut line/Success criteria/Open questions)을 스킬 템플릿 형식으로 작성했습니다. "Touches & dependencies" 섹션에는 `rating`, `review` 같은 엔티티 이름만 언급하고 실제 컬럼 설계는 다음 단계(data-model-design)의 몫으로 명확히 남겨두었습니다.
