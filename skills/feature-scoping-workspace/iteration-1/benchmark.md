# feature-scoping — 평가 결과 (iteration 1)

- 스킬: `skills/feature-scoping`
- 평가 개수: 3개, 설정당 실행 횟수: 1회
- 실행 모델: claude-sonnet-4-6

## 종합 요약

| 구분 | with_skill | without_skill | 차이 |
|---|---|---|---|
| 통과율 (평균) | 1.00 | 0.29 | +0.71 |
| 소요 시간(초, 평균) | 76.1 | 68.1 | +8.0 |
| 토큰 사용량 (평균) | 61485 | 58277 | +3209 |

## 평가별 결과

| 평가 | with_skill 통과율 | without_skill 통과율 |
|---|---|---|
| single-actor-bookmark | 1.00 | 0.25 |
| two-actor-review | 1.00 | 0.62 |
| skip-to-schema | 1.00 | 0.00 |

## 분석 노트

- eval-2 (skip-to-schema) is the clean discriminator: with_skill scored 5/5 (redirected to scoping, named entities only, explicitly deferred schema to data-model-design stage) while without_skill scored 0/5 (produced two full SQL DDL options immediately, no problem statement, no scope doc at all).
- eval-0 and eval-1 show without_skill produces competent, well-organized technical documents — but they are full implementation designs (SQL schema, REST API tables, optimistic-update UX) rather than scope documents. The skill's value here is keeping the deliverable at the right altitude for stage 1, not improving raw writing quality.
- without_skill's most common failure mode across eval-0 and eval-1 is skipping the explicit Problem statement and Success criteria sections — even when it produces an otherwise well-structured MVP/in-out-of-scope breakdown, those two pieces are consistently missing.
- with_skill is slower on average (76.1s vs 68.1s) and uses slightly more tokens (61485 vs 58277) — the extra step of asking clarifying questions and writing the open-questions section costs some time, but the discriminator result on eval-2 suggests this cost buys real behavioral correction.
- Sample size is 1 run per configuration per eval (3 evals total) — no variance data within configuration, so timing/token deltas should be read as directional, not statistically robust.

## 세부 expectation 결과

### single-actor-bookmark — with_skill
통과율: 1.00 (8/8)

- ✅ Produces a written scope document, not just a conversational answer
  - 근거: Full doc with Problem/Actors/User flow/Touches & dependencies/MVP cut line/Success criteria/Open questions sections, following the skill template exactly.
- ✅ Problem statement frames what the user is trying to do and what currently blocks them, not just a restatement of 'add bookmark feature'
  - 근거: "저장해둘 방법이 없어 ... 결국 다시 찾지 못하고 잊어버린다" — names the blocker (no way to save) and the underlying goal.
- ✅ Identifies a single actor explicitly rather than inventing an unnecessary second role
  - 근거: States plainly: "이 기능은 단일 사용자 유형(독자/로그인 사용자)만 관련된다. 별도의 운영자/관리자 역할은 v1 범위에서 필요하지 않다."
- ✅ User flow is written as an ordered numbered sequence of steps, not a list of capabilities
  - 근거: 8 numbered steps plus lettered unhappy-path branches (2a, 5a, 6a).
- ✅ MVP cut line has at least one item placed in 'out of scope (later)' or 'explicitly not doing' rather than putting everything in v1
  - 근거: Out of scope: folders/tags, sort/filter, notifications, sharing. Explicitly not doing: anonymous local bookmarks, quotas, export/import.
- ✅ Success criteria are checkable/measurable statements, not aspirational ones
  - 근거: 4 statements like "동일한 게시물을 두 번 북마크해도 목록에 중복으로 나타나지 않는다" — each is independently verifiable.
- ✅ Touches & dependencies section names an entry point in the existing product without designing the UI in detail
  - 근거: Names entry points (post list/detail page, new '내 북마크' page) and the `bookmark` entity by name only, no schema or pixel-level UI.
- ✅ Does not add unnecessary complexity (e.g. multi-role permissions) for what the prompt described as a single-user feature
  - 근거: Explicitly scopes out admin/operator role; keeps to a single actor throughout.

### single-actor-bookmark — without_skill
통과율: 0.25 (2/8)

- ❌ Produces a written scope document, not just a conversational answer
  - 근거: Output is a technical design doc (requirements bullets → SQL schema → REST API table → frontend UX → edge cases → build order), not a scope document — no problem statement, actor list, or MVP cut-line structure.
- ❌ Problem statement frames what the user is trying to do and what currently blocks them, not just a restatement of 'add bookmark feature'
  - 근거: Opens with "블로그에 '북마크' 기능을 추가하는 거군요" and goes straight to requirements questions — no blocker/goal framing.
- ❌ Identifies a single actor explicitly rather than inventing an unnecessary second role
  - 근거: Never explicitly names an actor/role at all; user is only referenced implicitly through API/DB design, not because it avoided inventing a role.
- ❌ User flow is written as an ordered numbered sequence of steps, not a list of capabilities
  - 근거: Section 6 '구현 순서' is a numbered implementation/build sequence (migrate → API → frontend), not a user-facing flow of actor actions.
- ✅ MVP cut line has at least one item placed in 'out of scope (later)' or 'explicitly not doing' rather than putting everything in v1
  - 근거: Recommends starting with the simplest version and defers '(선택) 북마크 수 표시, 인기순 정렬, 폴더/태그 분류' to later.
- ❌ Success criteria are checkable/measurable statements, not aspirational ones
  - 근거: No success-criteria section exists anywhere in the response.
- ❌ Touches & dependencies section names an entry point in the existing product without designing the UI in detail
  - 근거: Goes well past naming an entry point — full SQL DDL, REST endpoint table, and optimistic-update frontend implementation detail are given.
- ✅ Does not add unnecessary complexity (e.g. multi-role permissions) for what the prompt described as a single-user feature
  - 근거: Stays single-actor (logged-in user), no extra roles invented.

### two-actor-review — with_skill
통과율: 1.00 (8/8)

- ✅ Produces a written scope document
  - 근거: Full document with all template sections (Problem, Actors, User flow (v1), Touches & dependencies, MVP cut line, Success criteria, Open questions).
- ✅ Uses the generic role names given in the prompt (provider/requester) consistently rather than inventing domain-specific names
  - 근거: Uses 'Provider'/'Requester' throughout, never substitutes domain-specific names like shipper/driver.
- ✅ Problem statement frames the actors' goals/blockers, not just 'add a review feature'
  - 근거: Frames the lack of trust signal for both sides: requester has no basis to judge a provider, provider has no way to flag unreliable requesters.
- ✅ User flow includes at least one unhappy path (e.g. no-show, one-sided review, no response within a window)
  - 근거: Branches 5a (one-sided submission past deadline), 6a (cancelled/no-show bookings excluded), 6b (deadline passed).
- ✅ Touches & dependencies section names the new data entity (review/rating) and any dependent existing system (e.g. notifications) without producing full column-level schema
  - 근거: Names `review` entity only, lists booking system + notification system as dependencies, no columns/types given.
- ✅ MVP cut line defers at least one plausible feature (e.g. photo attachments, replies to reviews, edit window) to 'later' or 'explicitly not doing'
  - 근거: Defers replies, report/dispute flow, rating-based sort/filter, edit/delete, and photo attachments to 'later'.
- ✅ Success criteria are checkable/measurable statements
  - 근거: 4 checkable statements, e.g. "취소/노쇼로 끝난 예약에는 리뷰 작성 진입점이 생성되지 않는다."
- ✅ Does not leak domain-specific terms from unrelated reference projects (e.g. shipper/driver, bidding, dispatch)
  - 근거: No such terms appear anywhere in the document.

### two-actor-review — without_skill
통과율: 0.62 (5/8)

- ✅ Produces a written scope document
  - 근거: Produces a structured, headed document (questions to resolve, MVP scope with In/Out, data model, edge cases, work order) — not a bare conversational reply.
- ✅ Uses the generic role names given in the prompt (provider/requester) consistently rather than inventing domain-specific names
  - 근거: Uses provider/requester consistently throughout.
- ❌ Problem statement frames the actors' goals/blockers, not just 'add a review feature'
  - 근거: No explicit problem statement; opens directly with '먼저 확정해야 할 핵심 질문들' (design questions to resolve) rather than naming what's broken/missing for either actor.
- ✅ User flow includes at least one unhappy path (e.g. no-show, one-sided review, no response within a window)
  - 근거: Edge-case checklist covers no-show/cancelled bookings, expired review windows, and deleted users.
- ❌ Touches & dependencies section names the new data entity (review/rating) and any dependent existing system (e.g. notifications) without producing full column-level schema
  - 근거: Produces a full column-level `Review` table definition (id, booking_id, author_id, author_role, target_id, rating, comment, status, created_at, published_at, edited_at) — well past entity-name-only.
- ✅ MVP cut line defers at least one plausible feature (e.g. photo attachments, replies to reviews, edit window) to 'later' or 'explicitly not doing'
  - 근거: Explicit '제외 (Out of Scope, 2차 이후로 명시적으로 미룸)' list: replies, upvotes, photo/video attachments, multi-axis ratings, AI abuse filtering, incentives.
- ❌ Success criteria are checkable/measurable statements
  - 근거: No dedicated success-criteria section; the document ends with a suggested build order instead.
- ✅ Does not leak domain-specific terms from unrelated reference projects (e.g. shipper/driver, bidding, dispatch)
  - 근거: No such terms appear; stays within provider/requester/booking vocabulary.

### skip-to-schema — with_skill
통과율: 1.00 (5/5)

- ✅ Does not immediately produce a final column-level ratings/reviews table schema without first addressing scope
  - 근거: Opens with '스키마부터 가시죠 — 그런데 그 전에 잠깐만요' and gives no column definitions anywhere in the response.
- ✅ Surfaces or drafts the problem statement and user flow before or instead of jumping straight to schema
  - 근거: Asks for the problem first ('평점/리뷰가 해결하려는 진짜 문제가 뭔가요?'), then drafts a full Problem/User flow section in the scope doc.
- ✅ If data entities are mentioned, they are named at the 'Touches & dependencies' level (entity names only) rather than full schema with columns and types
  - 근거: 'New data implied (names only, no schema): rating, review 엔티티' — no columns or types given.
- ✅ Explicitly notes that detailed schema design belongs to a later stage (data-model-design) rather than silently doing it anyway
  - 근거: Closing line: '그 다음에 ratings/reviews 테이블 컬럼 정의(data-model-design 단계)로 자연스럽게 넘어가겠습니다.'
- ✅ Produces or proposes a scope document following the skill's template structure
  - 근거: Full draft scope doc with all template sections, explicitly labeled '(초안, 확인 필요)' with assumptions flagged in each section.

### skip-to-schema — without_skill
통과율: 0.00 (0/5)

- ❌ Does not immediately produce a final column-level ratings/reviews table schema without first addressing scope
  - 근거: Immediately produces two full SQL DDL options (Plan A single table, Plan B split tables) with complete column lists, constraints, and indexes.
- ❌ Surfaces or drafts the problem statement and user flow before or instead of jumping straight to schema
  - 근거: No problem statement or user flow anywhere; opens directly with schema assumptions ('가정 사항') and goes straight into DDL.
- ❌ If data entities are mentioned, they are named at the 'Touches & dependencies' level (entity names only) rather than full schema with columns and types
  - 근거: Full column-level schema given for both ratings and reviews tables, including types, constraints, and indexes.
- ❌ Explicitly notes that detailed schema design belongs to a later stage (data-model-design) rather than silently doing it anyway
  - 근거: No mention of any staged process — treats schema design as the entire task to be done now.
- ❌ Produces or proposes a scope document following the skill's template structure
  - 근거: No scope document at all; output is purely a schema design memo with assumptions and clarifying questions about schema details (not feature scope).
