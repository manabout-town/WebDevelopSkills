# 매직 링크 로그인 추가 + 로그아웃/비밀번호 재설정 점검

기존에 이메일/비밀번호 로그인만 있던 서비스에 매직 링크 로그인을 추가하고,
로그아웃과 비밀번호 재설정 플로우를 함께 점검/보강한 결과입니다.
(`skills/nextjs-supabase-auth/SKILL.md`의 4단계 가이드를 따랐습니다.)

## 만든/수정한 파일

- `lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `service.ts` — 4종 클라이언트 분리 (기존 프로젝트에 이미 있었을 수 있지만, 콜백/미들웨어가 의존하므로 스킬 기준대로 다시 정리해 포함)
- `middleware.ts` — public 경로에 `/auth/`, `/reset-password`, `/update-password` 추가, 토큰 갱신 쿠키를 끝까지 들고 가서 반환
- `app/auth/callback/route.ts` — 매직 링크 **와** 비밀번호 재설정 메일이 공유하는 code-exchange 콜백
- `app/login/actions.ts`, `app/login/page.tsx` — 기존 `signInWithPassword` 액션 유지 + `signInWithOtp` 기반 매직 링크 액션 추가, 같은 페이지에 탭으로 노출
- `app/logout/actions.ts` (Server Action), `app/logout/route.ts` (POST Route Handler), `components/auth/LogoutButton.tsx` — 서버에서 직접 `signOut()`을 호출하는 로그아웃
- `app/reset-password/actions.ts`, `app/reset-password/page.tsx` — 재설정 메일 요청
- `app/update-password/actions.ts`, `app/update-password/page.tsx`, `app/update-password/UpdatePasswordForm.tsx` — 메일 링크 클릭 후 새 비밀번호 입력

## 세션 생명주기 — 왜 이렇게 나눴는가

### 1. 로그인 방법별로 세션이 생기는 시점이 다르다

| 방법 | 세션 생성 시점 | 콜백 라우트 필요 여부 |
|---|---|---|
| 이메일+비밀번호 (`signInWithPassword`) | 호출 즉시 | 불필요 |
| 매직 링크 (`signInWithOtp`) | 사용자가 메일 링크를 클릭한 뒤 | **필요** (`/auth/callback`) |
| 비밀번호 재설정 (`resetPasswordForEmail`) | 사용자가 메일 링크를 클릭한 뒤 | **필요** (같은 `/auth/callback` 재사용) |

매직 링크와 비밀번호 재설정은 둘 다 "메일 → code 포함 리다이렉트 → code exchange"
패턴이 동일하기 때문에 `/auth/callback` 라우트 하나를 공유하도록 했습니다.
분기는 콜백 라우트 안의 로직이 아니라 **호출 시점에 지정하는 `next`/`redirectTo`
쿼리 파라미터**로 처리합니다.

- 매직 링크 로그인: `emailRedirectTo: /auth/callback?next=<원래 가려던 경로>`
- 비밀번호 재설정: `redirectTo: /auth/callback?next=/update-password`

이렇게 하면 콜백 라우트 자체는 "code를 세션으로 바꾸고 next로 보낸다"는 단일 책임만
가지면서도, 두 플로우가 자연스럽게 다른 곳으로 갈라집니다.

### 2. "recovery 세션"을 일반 로그인으로 오해하지 않도록 분리

`resetPasswordForEmail` 흐름에서 code exchange가 끝나면 Supabase Auth는 일반
로그인과 똑같이 보이는 세션 쿠키를 만들지만, 의미상으로는 "이 사람이 비밀번호를
새로 정하기 위해 들어온 것"이라는 recovery 컨텍스트입니다. 이걸 구분하지 않고
바로 대시보드로 보내면:

- 비밀번호를 바꾸지 않아도 로그인이 끝난 것처럼 보여서 사용자가 혼란스러워하고,
- 공유 PC 등에서 메일 링크만으로 계정에 들어가 버리는 것처럼 느껴질 수 있습니다.

그래서 비밀번호 재설정의 `redirectTo`는 무조건 `/update-password`로 고정해 새
비밀번호 입력 폼을 먼저 보여주도록 했습니다. `/update-password` 페이지 자체에서도
`getUser()`로 세션 존재 여부를 한 번 더 확인하고, 세션이 없으면(직접 URL 접근 등)
`/reset-password`로 돌려보냅니다.

미들웨어의 `PUBLIC_PATHS`에 `/update-password`를 넣어둔 이유도 같은 맥락입니다 —
이 경로는 "로그인 여부로 막을 경로"가 아니라 "recovery 세션이든 비로그인이든 일단
도달시키고, 페이지 내부에서 세션 유효성을 판단할 경로"이기 때문입니다.

### 3. 로그아웃은 서버에서 끝낸다

클라이언트 컴포넌트에서 `supabase.auth.signOut()`만 호출하고 끝내면, 그 탭의
브라우저 클라이언트는 정리되지만 서버 컴포넌트가 들고 있는 쿠키 기준 세션은
다음 요청까지 살아있을 수 있고, 다른 탭은 그대로 로그인 상태로 남을 수 있습니다.
그래서 `app/logout/actions.ts`의 Server Action에서 `createClient()`(서버용) →
`auth.signOut()` → `redirect("/login")` 순서로 서버 쪽에서 직접 쿠키를 지우도록
했습니다. `LogoutButton`은 이 액션을 `<form action={logout}>`으로 연결해 JS 없이도
동작하는 progressive enhancement 형태로 만들었습니다.

추가로 `app/logout/route.ts`에 POST 전용 Route Handler도 만들어 뒀습니다 — 폼이
아닌 단순 버튼/네비게이션에서 로그아웃을 트리거해야 하는 경우를 위한 보조
수단이며, 일부러 GET이 아니라 POST로 받아 prefetch나 크롤러가 의도치 않게
로그아웃을 유발하지 않도록 했습니다.

### 4. 미들웨어 쿠키 처리 확인 결과

기존 미들웨어 로직을 스킬의 체크리스트 기준으로 다시 점검했고, 아래 두 가지를
`lib/supabase/middleware.ts`와 `middleware.ts`에 명시적으로 반영했습니다.

- `setAll`에서 토큰 갱신 쿠키를 `request`와 `response` 양쪽에 모두 쓴다 (request만
  갱신하면 같은 요청의 서버 컴포넌트가 새 쿠키를 못 보고, response만 갱신하면 다음
  요청에서야 반영돼 그 사이 깜빡임이 생긴다).
- 미들웨어 마지막에 항상 그 `response`를 반환한다. 리다이렉트가 필요한 경우(`!user
  && !isPublic`, 로그인된 사용자가 `/login`에 재진입하는 경우)에도 `response.headers`를
  새 리다이렉트 응답에 그대로 옮겨서 갱신된 쿠키가 사라지지 않게 했다.
- public 경로 목록에 `/auth/`, `/reset-password`, `/update-password`를 추가했다 —
  빠지면 "메일 링크를 눌렀는데 로그인 페이지로 튕긴다" 버그가 그대로 재현된다.

## 적용 전 확인이 필요한 부분 (이 작업 범위 밖)

- Supabase 대시보드(Auth → URL Configuration)에 `/auth/callback`을 Redirect URLs
  허용 목록에 등록해야 실제로 동작합니다.
- `signInWithOtp`는 기본적으로 신규 사용자도 자동 가입시킵니다
  (`shouldCreateUser` 기본값 `true`). 매직 링크를 "이미 가입한 사용자의 로그인
  수단"으로만 쓰고 싶다면 `shouldCreateUser: false`로 명시하는 정책 결정이 필요합니다.
- 비밀번호 재설정 메일 발송 결과는 이메일 존재 여부를 노출하지 않기 위해 항상 동일한
  성공 메시지를 보여주도록 했습니다 — Supabase 프로젝트의 레이트리밋 정책과 함께
  운영 중 모니터링이 필요합니다.
