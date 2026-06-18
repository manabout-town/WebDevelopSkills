좋습니다. provider 평점/리뷰 기능의 스키마를 설계해볼게요. 먼저 몇 가지 가정을 깔고 시작하고, 그 가정이 안 맞으면 알려주세요 — 스키마가 꽤 달라질 수 있는 부분들이라 미리 짚고 갈게요.

## 가정 사항

1. **평점을 남기는 주체**: provider에게 평점을 주는 쪽은 `requester`(또는 일반 사용자) 1명이고, 특정 거래/예약(`booking` 또는 `order` 같은 단위)을 완료한 후에만 남길 수 있다고 가정했습니다.
2. **rating과 review의 관계**: 별점(숫자)과 텍스트 후기를 분리하지 않고 한 테이블에 같이 둘지, 분리할지 고민되는 지점인데 — 아래에서는 **하나의 테이블(`reviews`)에 평점+후기 텍스트를 함께** 두는 구조로 제안합니다. 실무에서 "평점만 남기고 후기는 없음"이 흔하기 때문에, `rating`은 필수, `comment`는 nullable로 처리하면 별도 테이블로 쪼갤 필요가 없는 경우가 많습니다.
3. 다만 질문에서 "ratings 테이블"과 "reviews 테이블"을 따로 말씀하셨으니, **두 테이블을 분리하는 안**도 함께 드립니다. 어느 쪽이 맞는지는 아래 "분리할지 말지" 섹션에서 같이 결정하시면 됩니다.

---

## 안 A — 단일 테이블 (`reviews`에 평점 포함) — 추천

대부분의 서비스에서는 평점과 후기가 1:1로 묶여서 생성되고, 별도로 평점만 수정/삭제하는 일이 없기 때문에 테이블을 합치는 게 더 단순합니다.

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),

  -- 누가 누구에게 남기는 평가인지
  provider_id uuid not null references providers(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete set null,

  -- 어떤 거래에 대한 평가인지 (중복 작성 방지의 핵심)
  booking_id uuid references bookings(id) on delete set null,

  -- 평가 내용
  rating smallint not null check (rating between 1 and 5),
  comment text,

  -- 운영/신고 대응
  status text not null default 'published'
    check (status in ('published', 'hidden', 'reported', 'deleted')),

  -- provider의 답변 (선택 기능이지만 자주 쓰임)
  provider_reply text,
  provider_replied_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 같은 거래에 대해 중복 리뷰 방지
  unique (booking_id, reviewer_id)
);

create index idx_reviews_provider_id on reviews(provider_id);
create index idx_reviews_reviewer_id on reviews(reviewer_id);
create index idx_reviews_created_at on reviews(created_at desc);
```

**컬럼 설명**

| 컬럼 | 설명 |
|---|---|
| `provider_id` | 평점을 받는 provider. 삭제 시 리뷰도 같이 삭제(`cascade`) — provider 탈퇴 시 리뷰를 남길지는 정책에 따라 `set null`로 바꿀 수도 있음 |
| `reviewer_id` | 평가를 작성한 사용자. 사용자가 탈퇴해도 리뷰 자체는 남기는 경우가 많아 `set null` 권장 (단, 그러면 `reviewer_id`가 nullable이어야 함) |
| `booking_id` | 실제 거래/예약 단위. 이게 있어야 "거래 완료한 사람만 리뷰 가능" 검증과 "중복 리뷰 방지"가 깔끔해짐 |
| `rating` | 1~5 정수. `smallint`로 충분 |
| `comment` | 텍스트 후기, nullable (평점만 남기는 경우 허용) |
| `status` | 신고/숨김 처리용. 운영 단계에서 거의 항상 필요해짐 |
| `provider_reply` | provider가 리뷰에 답변하는 기능 — 당장 안 쓰더라도 컬럼만 미리 두면 마이그레이션 비용이 적음 |

**provider의 평균 평점은 어떻게?**
매번 `avg(rating)`을 계산하면 provider 목록 화면처럼 자주 조회하는 곳에서 비용이 커집니다. 보통 다음 중 하나를 씁니다.

- `providers` 테이블에 `rating_avg numeric(3,2)`, `rating_count int` 컬럼을 두고, 리뷰 생성/수정/삭제 시 트리거나 애플리케이션 로직으로 갱신
- 또는 Postgres라면 `reviews` 기준 머티리얼라이즈드 뷰

지금 단계에서는 `providers` 테이블에 캐시 컬럼 두 개 추가하는 정도로 충분할 것 같습니다.

---

## 안 B — `ratings`와 `reviews`를 분리하는 경우

다음 중 하나라도 해당되면 분리하는 게 맞습니다.

- 평점은 거래 완료 시 **자동/필수**로 남기고, 텍스트 후기는 **완전히 별개의 시점**에 선택적으로 작성 가능 (예: "평점은 결제 직후 앱이 자동으로 묻고, 후기는 나중에 마이페이지에서 작성")
- 평점에 여러 항목(친절도, 정확도, 응답속도 등 세부 항목별 점수)이 있고, 후기는 그와 무관하게 자유 텍스트인 경우
- 평점은 리뷰 없이도 여러 번/다른 맥락에서 누적되고, 리뷰는 그 중 일부에만 달리는 구조

```sql
create table ratings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,

  score smallint not null check (score between 1 and 5),

  -- 세부 항목 평가가 필요하다면 (선택)
  -- punctuality_score smallint check (punctuality_score between 1 and 5),
  -- communication_score smallint check (communication_score between 1 and 5),

  created_at timestamptz not null default now(),

  unique (booking_id, reviewer_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  rating_id uuid references ratings(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete set null,

  comment text not null,
  status text not null default 'published'
    check (status in ('published', 'hidden', 'reported', 'deleted')),

  provider_reply text,
  provider_replied_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ratings_provider_id on ratings(provider_id);
create index idx_reviews_provider_id on reviews(provider_id);
create index idx_reviews_rating_id on reviews(rating_id);
```

이 구조는 유연하지만 "평점 평균 낼 때 ratings 기준인지 reviews 기준인지", "리뷰 없는 평점도 통계에 넣을지" 같은 결정이 하나 더 늘어납니다. 당장 필요하지 않다면 안 A로 시작하고 나중에 분리하는 것을 권장합니다 (분리는 마이그레이션으로 비교적 수월하지만, 합치는 건 데이터 정합성 이슈가 더 까다롭습니다).

---

## 결정하시면 좋을 것들

스키마를 확정하기 전에 아래 질문에 대한 답이 있으면 더 정확하게 맞출 수 있습니다.

1. **거래 단위가 있나요?** (`bookings`, `orders` 같은 테이블) 없다면 "아무나 아무 provider에게 리뷰"가 가능해져서 스팸/조작 방지가 어려워집니다. 거래 단위가 있다면 `booking_id`로 거래당 1리뷰를 강제하는 게 좋습니다.
2. **평점이 단일 항목인가요, 다항목인가요?** (전체 평점 1개 vs 친절도/전문성/속도 등 세부 항목)
3. **리뷰 수정/삭제를 허용하나요?** 허용한다면 `updated_at`과 수정 이력(`edited_at` 등)이 필요할 수 있고, provider의 평균 평점 재계산 로직도 같이 고려해야 합니다.
4. **신고/모더레이션 기능이 초기 버전에 필요한가요?** 필요 없다면 `status`, 신고 관련 컬럼은 다음 단계로 미뤄도 됩니다 (다만 컬럼 자체는 미리 추가해두는 비용이 작아서 지금 넣는 걸 권장).
5. **provider의 답변(reply) 기능이 1차 스코프에 포함되나요?** 빼면 `provider_reply`, `provider_replied_at` 두 컬럼은 제거 가능합니다.

이 답변들 주시면 컬럼을 더 좁히거나, RLS(Row Level Security) 정책 초안까지 같이 잡아드릴 수 있습니다. 일단은 안 A로 시작해서 마이그레이션 SQL 파일로 만들어드릴까요?
