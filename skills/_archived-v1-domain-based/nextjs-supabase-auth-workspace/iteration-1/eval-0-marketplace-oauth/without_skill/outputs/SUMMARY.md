# 중고 거래 플랫폼 인증 시스템 — 설계 요약

Next.js (App Router) + Supabase로 구현한 buyer/seller 역할 기반 인증 시스템입니다.
Google OAuth와 이메일/비밀번호 로그인을 모두 지원합니다.

## 핵심 설계 결정

### 1. `@supabase/ssr` 기반 3-클라이언트 패턴
- `lib/supabase/client.ts`: Client Component용 (`createBrowserClient`)
- `lib/supabase/server.ts`: Server Component / Server Action / Route Handler용 (`createServerClient`, 요청마다 새로 생성)
- `lib/supabase/middleware.ts`: 미들웨어 전용 세션 갱신 + 라우트 가드 로직

`getUser()`를 항상 사용하고 `getSession()`은 쓰지 않습니다. `getSession()`은 쿠키를 그대로 신뢰하므로 위조 가능하지만, `getUser()`는 매번 Supabase Auth 서버에 JWT를 검증합니다.

### 2. 역할(role)은 별도 `profiles` 테이블에 저장, 한 번만 설정 가능
`auth.users`에는 역할 정보가 없으므로 `public.profiles` 테이블을 두고 `role` 컬럼(`buyer` | `seller`, nullable enum)을 추가했습니다.
- `handle_new_user()` 트리거가 `auth.users` insert 시 자동으로 profile row를 생성 (이메일 가입과 Google OAuth 가입 모두 동일 경로)
- 가입 직후 `role`은 NULL → `/onboarding/role`에서 한 번 선택
- `lock_role_after_set` 트리거 + 서버 액션의 이중 체크로 역할을 한 번 정하면 변경 불가하게 막음 (구매자/판매자 권한을 오가며 악용하는 것을 방지)

### 3. Google OAuth는 PKCE + `/auth/callback` Route Handler로 처리
`signInWithOAuth()`는 브라우저 리다이렉트가 필요해 클라이언트 컴포넌트(`GoogleSignInButton.tsx`)에서만 호출 가능합니다. Google에서 돌아오면 `app/auth/callback/route.ts`가 `exchangeCodeForSession()`으로 코드를 교환하고, profile의 role 존재 여부에 따라 `/onboarding/role` 또는 `/dashboard/<role>`로 분기합니다. 실패 시 `/auth/auth-code-error`로 보냅니다.

Supabase 대시보드(Authentication → Providers → Google)에 Google Cloud Console에서 발급한 Client ID/Secret을 등록하고, 승인된 리디렉션 URI에 `https://<project-ref>.supabase.co/auth/v1/callback`을 추가해야 합니다 (Supabase가 중간에서 한 번 더 받아서 우리 앱의 `/auth/callback`으로 다시 보내는 구조).

### 4. 라우트 보호는 미들웨어에서 중앙 집중 처리, 페이지에서도 재검증 (defense in depth)
`middleware.ts` → `updateSession()`이 모든 요청에서:
- 세션 갱신
- 비로그인 사용자가 보호된 라우트 접근 시 `/login`으로
- 로그인했지만 role 미설정 시 `/onboarding/role`로 강제
- `/dashboard/seller`를 buyer가, `/dashboard/buyer`를 seller가 접근하면 자기 역할 대시보드로 리다이렉트
- 이미 로그인/온보딩 완료한 사용자가 `/login`, `/signup`, `/onboarding`에 다시 들어오면 대시보드로 보냄

다만 미들웨어만 믿지 않고 각 대시보드 페이지(`app/dashboard/seller/page.tsx`, `buyer/page.tsx`)에서도 서버 컴포넌트 단에서 role을 재확인합니다. RLS 정책이 최종 방어선입니다.

### 5. RLS 정책 (`supabase/migrations/`)
- `0001_profiles_and_roles.sql`: enum, profiles 테이블, updated_at 트리거, 신규 유저 자동 프로비저닝
- `0002_profiles_rls_policies.sql`: 본인 행만 insert/update 가능, 인증된 사용자는 모든 프로필 read 가능(마켓플레이스 특성상 판매자 이름 노출 필요), role 변경 잠금
- `0003_listings_example.sql`: 인증/역할 시스템이 실제 도메인 테이블과 어떻게 연결되는지 보여주는 예시. `seller_id = auth.uid()`이고 `profiles.role = 'seller'`인 사용자만 listing 생성 가능, 활성 상품은 비로그인 사용자도 조회 가능

### 6. 폼 처리: Server Actions + `useActionState`
`lib/actions/auth.ts`의 `signUpWithEmail`, `signInWithEmail`, `signOut`, `setUserRole`을 Server Action으로 작성하고, `components/auth/AuthForm.tsx`와 `app/onboarding/role/RoleSelectForm.tsx`에서 React 19의 `useActionState`로 연결했습니다. 클라이언트 fetch 보일러플레이트 없이 에러 메시지를 인라인으로 표시합니다.

## 알려진 한계 / 실제 적용 전 확인할 점
- 이메일 확인(email confirmation) 활성화 여부에 따라 `signUpWithEmail`의 분기(`!data.session`)가 달라짐 — Supabase 대시보드 설정과 맞춰야 함
- `profiles` 테이블의 read 정책을 `using (true)`로 열어뒀음 — 더 엄격한 프라이버시가 필요하면 공개용 view로 분리 권장
- Rate limiting, CAPTCHA 등 어뷰징 방지는 포함하지 않음 (Supabase Auth 자체 rate limit에 의존)
- 이미지/Tailwind 설정 파일(`tailwind.config.ts`, `package.json` 등)은 범위 밖이라 포함하지 않음 — 기존 Next.js 프로젝트에 그대로 붙여넣는 것을 전제로 함
