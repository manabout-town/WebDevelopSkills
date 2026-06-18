# 폴더 구조 요약

Next.js (App Router) + Supabase 프로젝트를 위해, 접근 권한이 다른 세 종류의 페이지를
**Route Group**(괄호로 감싼 폴더)으로 분리한 기본 구조를 만들었습니다.

## 전체 구조

```
src/
  app/
    layout.tsx                     # 루트 레이아웃 (모든 페이지 공통)
    globals.css

    (public)/                      # 누구나 접근 가능 (로그인 불필요)
      layout.tsx
      page.tsx                     # 홈페이지
      about/page.tsx

    (auth)/                        # 로그인/회원가입 페이지 (공개지만 인증을 "수행"하는 곳)
      layout.tsx
      login/
        page.tsx
        actions.ts                 # 서버 액션으로 로그인 처리
      signup/
        page.tsx
        actions.ts

    (dashboard)/                   # 로그인한 사용자만 접근 가능
      layout.tsx                   # 여기서 세션 체크 + 미로그인 시 /login 리다이렉트
      dashboard/
        page.tsx
        settings/page.tsx

    (admin)/                       # 운영자(admin role)만 접근 가능
      layout.tsx                   # 세션 체크 + role 체크, 권한 없으면 /dashboard로
      admin/
        page.tsx
        users/page.tsx

    api/
      auth/callback/route.ts       # OAuth/이메일 인증 콜백 라우트

  components/
    layout/SiteHeader.tsx
    ui/                            # 공용 UI 컴포넌트 (버튼, 인풋 등) 둘 자리

  lib/
    supabase/
      client.ts                    # 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
      server.ts                    # 서버 컴포넌트/액션용 Supabase 클라이언트
      middleware.ts                # 미들웨어에서 세션 갱신하는 헬퍼
    auth/
      roles.ts                     # isAdmin() 등 권한 체크 로직

  middleware.ts                    # 모든 요청에서 세션 갱신 + 보호 경로 1차 방어
  types/
    database.ts                    # Supabase 타입 생성 결과를 넣을 자리

supabase/
  migrations/
    00000000000000_init.sql        # profiles 테이블 + role 컬럼 예시 마이그레이션

.env.local.example
package.json
tsconfig.json                      # "@/*" 경로 별칭(alias) 설정 포함
```

## 왜 이렇게 나눴나

### 1. Route Group으로 접근 권한별 영역을 명확히 분리
Next.js의 `(폴더명)` 문법은 URL 경로에 영향을 주지 않으면서 페이지를 그룹으로
묶을 수 있게 해줍니다. 이를 이용해 `(public)`, `(auth)`, `(dashboard)`, `(admin)`
네 그룹으로 나눴습니다.

- `(public)` → URL 예: `/`, `/about` — 로그인 여부와 무관하게 누구나 접근
- `(auth)` → URL 예: `/login`, `/signup` — 인증을 수행하는 페이지 자체
- `(dashboard)` → URL 예: `/dashboard`, `/dashboard/settings` — 로그인 필수
- `(admin)` → URL 예: `/admin`, `/admin/users` — 로그인 + 운영자 권한 필수

각 그룹은 자기만의 `layout.tsx`를 가지므로, **그 그룹에 속한 모든 페이지에
공통으로 적용되는 인증/권한 체크를 레이아웃 한 곳에서 처리**할 수 있습니다.
새 페이지를 추가할 때는 해당 그룹 폴더 밑에 `page.tsx`만 추가하면 자동으로
같은 보호 규칙이 적용됩니다.

### 2. 인증 체크를 두 단계(미들웨어 + 레이아웃)로 중복 보호 (defense-in-depth)
- `src/middleware.ts`: 모든 요청에서 Supabase 세션을 갱신하고, `/dashboard`,
  `/admin` 경로에 비로그인 사용자가 접근하면 즉시 `/login`으로 리다이렉트합니다.
  가장 빠르고 가벼운 1차 방어선입니다.
- `(dashboard)/layout.tsx`, `(admin)/layout.tsx`: 서버 컴포넌트에서 다시 한 번
  세션(및 `(admin)`의 경우 role)을 확인합니다. 미들웨어 설정을 깜빡 빠뜨리거나
  matcher 패턴이 잘못되어도 페이지 자체에서 막아주는 안전망 역할을 합니다.

미들웨어만 믿고 레이아웃 체크를 생략하면, 나중에 미들웨어 설정을 수정하다가
보호 경로가 빠지는 실수가 발생했을 때 그대로 노출될 위험이 있어 두 군데 모두에
체크를 두는 패턴을 권장합니다.

### 3. 운영자 권한은 별도 함수(`lib/auth/roles.ts`)로 분리
"로그인했는지"와 "운영자인지"는 서로 다른 질문입니다. `isAdmin()` 함수를
따로 두어, 나중에 권한 모델이 복잡해져도(예: role이 여러 단계로 늘어나거나
팀별 권한이 추가되는 경우) 이 함수 안의 로직만 수정하면 되도록 했습니다.
예시 마이그레이션(`supabase/migrations/00000000000000_init.sql`)에서는
`profiles` 테이블에 `role` 컬럼(`user` | `admin`)을 두는 가장 단순한 방식을
사용했습니다.

### 4. Supabase 클라이언트를 용도별로 3개로 분리
Supabase의 Next.js App Router 연동 권장 패턴을 따라 클라이언트를 용도별로
나눴습니다.
- `lib/supabase/client.ts`: `"use client"` 컴포넌트에서 사용
- `lib/supabase/server.ts`: 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 사용
- `lib/supabase/middleware.ts`: `middleware.ts` 전용 (쿠키 갱신 로직이 다름)

세 클라이언트를 섞어 쓰면 쿠키/세션이 깨지는 문제가 흔히 발생하므로, 처음부터
파일을 분리해두면 실수를 줄일 수 있습니다.

### 5. 서버 액션(`actions.ts`)을 페이지 옆에 배치
`login/actions.ts`, `signup/actions.ts`처럼 폼 제출 로직을 같은 폴더에 두는
"co-location" 패턴을 사용했습니다. 페이지와 그 페이지가 사용하는 액션을
가까이 두면 코드를 찾기 쉽고, 기능 단위로 폴더를 통째로 옮기거나 삭제하기도
쉬워집니다.

### 6. 비어 있는 자리(`components/ui`, `types/database.ts` 등)도 미리 만들어둠
프로젝트가 커지면서 자연스럽게 채워질 자리를 미리 잡아뒀습니다.
- `components/ui/`: 버튼, 인풋 같은 공용 UI 컴포넌트
- `types/database.ts`: `npx supabase gen types typescript` 결과를 넣을 자리
- `supabase/migrations/`: 스키마 변경 이력 관리

## 참고: 실제 사용 시 해야 할 일
- `npm install` 후 `.env.local.example`을 `.env.local`로 복사하고 Supabase
  프로젝트의 URL/anon key를 채워야 합니다.
- `lib/auth/roles.ts`의 `isAdmin()`은 `profiles` 테이블이 존재한다고 가정한
  예시이므로, 실제 스키마에 맞게 조정이 필요합니다.
- 여기 만든 페이지들은 구조를 보여주기 위한 최소 placeholder이며,
  실제 폼 검증, 에러 처리, 스타일링은 추가로 구현해야 합니다.
