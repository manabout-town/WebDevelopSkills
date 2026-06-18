---
name: project-structure-convention
description: Establish or review the folder structure, route group organization, and file-splitting conventions for a Next.js (App Router) project — where Server Actions live, how to group routes by access level, when to colocate vs. centralize components, and naming conventions. Use this skill whenever starting a new Next.js project, restructuring an existing one, deciding where a new file should go, reviewing a PR for structural consistency, or when the user asks about "폴더 구조", "라우트 그룹", "파일을 어디에 둬야 하는지", "프로젝트 구조가 엉망", or similar. Also use when nextjs-supabase-auth or another skill is being applied to a fresh project and the base structure doesn't exist yet.
---

# Next.js 프로젝트 구조 컨벤션

## 이 스킬을 쓰는 이유

폴더 구조는 처음 며칠 동안은 거의 무엇을 골라도 작동한다. 문제는 라우트가 10개, 30개로 늘어났을 때다 — 같은 종류의 파일이 매번 다른 곳에 있으면("이 페이지는 actions.ts가 옆에 있는데 저 페이지는 lib/actions에 있네"), 어느 프로젝트에 들어가도 똑같은 질문을 다시 답해야 한다. 이 스킬은 그 질문에 한 번만 답하고, 이후로는 일관되게 적용하기 위한 것이다.

핵심 원칙은 하나다: **구조는 "이 코드가 누구와 얼마나 공유되는가"를 반영해야 한다.** 한 라우트에서만 쓰는 코드는 그 라우트 폴더 안에, 두 곳 이상에서 쓰는 코드는 공유 위치로 끌어올린다. 미리 모든 걸 공유 폴더에 분산시켜 두면(혹시 나중에 재사용할까봐) 정작 그 라우트가 뭘 하는지 보려고 4개 폴더를 오가야 하는 결과가 된다.

## 1단계: 최상위 구조

```
app/                  # 라우트 (App Router) — 페이지, 레이아웃, 라우트 핸들러
  (public)/
  (authenticated)/
  (admin)/
  auth/callback/route.ts
lib/
  supabase/           # client.ts, server.ts, middleware.ts, service.ts
  utils.ts             # 여러 라우트에서 쓰는 순수 함수
  validations/         # zod 스키마 등, 폼/액션 양쪽에서 공유
components/
  ui/                  # 버튼, 인풋 등 범용 프리미티브 (디자인 시스템 토큰 적용 대상)
  shared/              # 2개 이상 라우트에서 쓰는 기능성 컴포넌트
types/
  database.ts          # Supabase generate-types 결과물 등
hooks/
  use-xxx.ts           # 2개 이상 컴포넌트에서 쓰는 커스텀 훅
```

`lib/supabase/`의 네 파일 구성은 `nextjs-supabase-auth` 스킬과 합을 맞춘 것이다. 두 스킬을 같은 프로젝트에 적용한다면 이 부분은 그대로 가져다 쓴다 — 새로 고민할 필요 없다.

## 2단계: 라우트 그룹은 접근 권한 기준으로 나눈다

Next.js의 라우트 그룹(`(folder)`)은 URL에 안 보이지만 레이아웃을 분리할 수 있다. 이걸 비즈니스 도메인(`(marketing)`, `(checkout)`)으로 나누고 싶은 유혹이 있지만, 그러면 그룹이 늘어날수록 "이 라우트가 어떤 그룹에 속해야 하는가"가 매번 새로운 판단이 된다.

대신 **누가 접근할 수 있는가**로 나누면 기준이 고정된다:

- `(public)` — 비로그인 포함 누구나. 마케팅 페이지, 로그인/회원가입.
- `(authenticated)` — 로그인 필요, 역할 무관. 일반 대시보드, 마이페이지.
- `(admin)` — 운영자/관리자만.

역할이 여러 개인 서비스(`nextjs-supabase-auth`의 역할 2개 이상 케이스)라면 `(authenticated)` 안에서 역할별 하위 라우트로 더 나눈다 (`(authenticated)/seller/...` 같은 식이 아니라, 역할 분기는 페이지 내부 로직이나 별도 라우트 세그먼트로 — 이 스킬에서 구체적인 역할 이름을 미리 예시로 만들지 않는다. 역할 이름은 프로젝트마다 다르고, 여기서 결정할 일이 아니다).

각 그룹은 자기 `layout.tsx`를 가질 수 있다 — `(public)`은 마케팅용 헤더/푸터, `(authenticated)`는 사이드바가 있는 대시보드 셸. 미들웨어의 라우트 보호 로직(`nextjs-supabase-auth` 참고)과 이 그룹 경계가 일치하면, "어떤 미들웨어 매처가 이 라우트를 보호하는가"를 그룹만 보고 바로 알 수 있다.

## 3단계: Server Action은 라우트 옆에 둔다

```
app/(authenticated)/posts/new/
  page.tsx
  actions.ts        # createPost — 이 페이지에서만 쓰는 액션
```

기본은 **라우트별 `actions.ts`**다. Server Action을 만들 때 가장 먼저 떠오르는 질문이 "이 액션을 호출하는 페이지가 어디 있더라"인데, 같은 폴더에 두면 그 질문 자체가 사라진다. 액션이 거기 있는 채로 시작하고, 정말로 두 번째 라우트에서 똑같은 액션이 필요해지는 순간에만 `lib/actions/`로 끌어올린다 — 미리 옮겨두지 않는다. 실제로 재사용되기 전까지는 "재사용될 것 같다"는 예측이 자주 틀린다.

액션 파일에는 항상 `"use server"`를 최상단에 쓰고, 호출하는 페이지의 미들웨어 보호와 무관하게 액션 자체에서도 인증을 재확인한다 (왜인지는 `nextjs-supabase-auth`의 서버 측 재검증 섹션 참고 — 미들웨어를 우회해서 액션을 직접 호출하는 경로가 항상 존재한다).

## 4단계: 컴포넌트는 "공유되는 시점"에 끌어올린다

1. 처음 만들 때는 그 라우트 폴더 안에 둔다 (`app/(authenticated)/posts/post-card.tsx`).
2. 두 번째 라우트에서 똑같거나 거의 같은 컴포넌트가 필요해지면, 그때 `components/shared/`로 옮기고 import를 정리한다.
3. 디자인 시스템 토큰(버튼, 인풋, 카드 등 프리미티브)은 처음부터 `components/ui/`에 둔다 — 이건 도메인 로직이 없는 순수 UI라서 "공유될지 안 될지" 판단할 필요가 없다.

이 순서를 거꾸로 하면(처음부터 모든 걸 `components/`에 만들면) 폴더 하나에 서로 관련 없는 컴포넌트 수십 개가 쌓이고, 각 컴포넌트가 어느 라우트에서 쓰이는지 추적하려면 전역 검색을 해야 한다.

## 5단계: 네이밍

- 폴더/파일: kebab-case (`post-card.tsx`, `update-password/`).
- 라우트 그룹: 위 2단계 기준 그대로 `(public)`, `(authenticated)`, `(admin)`.
- `app/` 안에서 라우팅되지 않게 하려는 폴더(컴포넌트, 헬퍼 등을 라우트 옆에 두되 자체 라우트로 인식되지 않게 할 때)는 언더스코어 프리픽스(`_components/`)를 쓴다. Next.js가 `_`로 시작하는 폴더를 라우팅에서 제외해주기 때문에, 라우트 그룹 폴더(`(name)`)와 혼동하지 않는다 — 괄호는 "그룹화하되 URL에는 안 보임", 언더스코어는 "라우트가 아님"으로 의미가 다르다.

## 체크리스트

- [ ] 새 라우트를 만들 때 어느 접근권한 그룹(`(public)`/`(authenticated)`/`(admin)`)에 속하는지 먼저 정했는가
- [ ] 이 라우트에서만 쓰는 Server Action을 같은 폴더의 `actions.ts`에 뒀는가 (재사용이 실제로 필요해지기 전에 미리 중앙화하지 않았는가)
- [ ] 새 컴포넌트가 이 라우트 전용인지, 이미 다른 곳에서도 쓰이는지 확인하고 위치를 정했는가
- [ ] `lib/supabase/` 네 파일 구성이 `nextjs-supabase-auth` 스킬과 일치하는가
- [ ] 폴더/파일 네이밍이 kebab-case이고, 라우트 아닌 폴더는 `_` 프리픽스를 썼는가
