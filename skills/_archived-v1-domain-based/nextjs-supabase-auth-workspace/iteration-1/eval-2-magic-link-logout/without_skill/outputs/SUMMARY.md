# Magic Link 로그인 추가 + 로그아웃/비밀번호 재설정 점검

## 무엇을 했는가

기존 이메일/비밀번호 로그인은 그대로 유지하면서, 매직 링크(passwordless) 로그인을
추가했습니다. 두 플로우(매직 링크, 비밀번호 재설정)는 같은 "code 교환" 메커니즘을
쓰기 때문에, 콜백 라우트 하나를 공유하도록 설계했습니다. 또한 로그아웃을
GET 링크가 아닌 POST(서버 액션 + 라우트 핸들러)로 처리하도록 점검/정리했습니다.

`@supabase/ssr`의 `createServerClient` / `createBrowserClient` 패턴을 사용했고,
미들웨어에서 매 요청마다 세션을 갱신하도록 했습니다(Server Component는 쿠키를 쓸 수
없으므로 이 부분이 빠지면 세션이 간헐적으로 풀리는 문제가 생깁니다).

## 파일 구성

```
lib/supabase/client.ts        브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
lib/supabase/server.ts        서버 컴포넌트/서버 액션/라우트 핸들러용 클라이언트
lib/supabase/middleware.ts    미들웨어에서 세션 갱신 + 쿠키 동기화 + 보호 라우트 가드
middleware.ts                 위 헬퍼를 호출하는 루트 미들웨어 (matcher 설정 포함)

app/login/page.tsx            로그인 페이지 - 비밀번호 / 매직링크 탭 전환 UI
app/login/actions.ts          signInWithPassword (기존), signInWithMagicLink (신규)

app/auth/callback/route.ts    매직링크 + 비밀번호재설정 + 회원가입 확인 공용 콜백
                               (?code= 를 세션으로 교환 후 ?next= 로 리다이렉트)
app/auth/auth-code-error/page.tsx  콜백 실패(만료/잘못된 링크) 시 보여줄 안내 페이지

app/reset-password/page.tsx        "재설정 메일 보내기" 1단계 화면
app/reset-password/actions.ts      resetPasswordForEmail() 호출, next=/update-password
app/update-password/page.tsx       메일 링크 클릭 후 새 비밀번호 입력 2단계 화면
app/update-password/actions.ts     updateUser({ password }) - 복구 세션 필요

app/logout/actions.ts              signOut() 서버 액션 (redirect /login)
app/logout/LogoutButton.tsx        <form action={signOut}> 버튼 (헤더/네비에 배치)
app/api/auth/logout/route.ts       POST 전용 로그아웃 API (fetch 기반 UI용 대안)

.env.local.example             필요한 환경 변수 안내
```

## 주요 설계 결정 및 이유

1. **콜백 라우트 공유 (`/auth/callback`)**
   매직 링크, 비밀번호 재설정, 회원가입 확인 메일은 모두 Supabase에서
   `?code=...` 형태의 PKCE 코드를 붙여 우리 앱으로 리다이렉트합니다. 플로우별로
   라우트를 따로 만들지 않고, `next` 쿼리 파라미터로 "코드 교환 후 어디로
   보낼지"만 분기했습니다. 코드 중복을 줄이고, 콜백 처리 로직(에러 핸들링 포함)을
   한 곳에서만 관리하면 됩니다.

2. **`next` 파라미터 오픈 리다이렉트 방지**
   `next`가 `/`로 시작하지 않으면 무조건 `/`로 fallback 처리했습니다. 외부
   도메인으로 리다이렉트시키는 공격을 막기 위함입니다.

3. **로그아웃을 GET이 아닌 POST로 강제**
   기존에 만약 `<Link href="/logout">` 같은 GET 방식이 있었다면, 링크
   prefetch(Next.js의 자동 prefetch, 브라우저 prefetch, 크롤러 등)에 의해
   의도치 않게 로그아웃될 수 있습니다. 그래서 서버 액션(`<form action={signOut}>`)과
   POST 전용 라우트 핸들러 두 가지 방식만 제공하고, GET 핸들러는 일부러 만들지
   않았습니다.

4. **미들웨어의 세션 갱신 + 보호 라우트 가드 분리**
   `updateSession()`은 (a) Supabase 토큰을 매 요청마다 새로고침해서 쿠키에
   다시 쓰고, (b) 비로그인 사용자가 인증이 필요한 페이지에 접근하면 `/login`으로
   리다이렉트시킵니다. `/login`, `/auth/*`, `/reset-password`, `/update-password`는
   인증 없이도 접근 가능한 화이트리스트로 뒀습니다. 실제 앱의 public 라우트
   목록(랜딩 페이지, 약관 등)에 맞게 이 목록은 조정이 필요합니다.

5. **비밀번호 재설정의 2단계 분리**
   - 1단계(`/reset-password`): 이메일만 입력받아 재설정 메일 발송. 가입 여부와
     무관하게 항상 같은 성공 메시지를 보여줘서 계정 존재 여부가 노출되지 않도록
     했습니다.
   - 2단계(`/update-password`): 이메일 링크 클릭 → 콜백에서 임시 "recovery"
     세션 발급 → 이 페이지에서 새 비밀번호 설정. `updateUser()` 호출 전에
     `getUser()`로 세션이 실제로 있는지 확인해서, 링크 없이 직접 URL로 들어온
     경우를 방어했습니다.

6. **매직 링크의 `shouldCreateUser`**
   기본값을 `true`로 둬서 매직 링크가 가입 겸 로그인 역할도 하도록 했습니다.
   기존 회원만 매직 링크를 쓰게 하려면 `false`로 바꾸면 됩니다 (제품 정책에 따라
   결정 필요 - 코드에 주석으로 남겨뒀습니다).

7. **에러 메시지 일반화**
   비밀번호 로그인 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다"처럼
   계정 존재 여부를 구분하지 않는 문구를 사용했습니다 (계정 열거/이메일 스니핑
   방지).

## Supabase 대시보드에서 추가로 확인해야 할 설정 (코드 외부)

이 코드는 클라이언트/서버 측 구현이며, 아래는 Supabase 프로젝트 설정에서
별도로 확인이 필요합니다:

- **Authentication > URL Configuration**: `Site URL`과 `Redirect URLs`에
  `https://yourapp.com/auth/callback` (및 로컬 개발용 `http://localhost:3000/auth/callback`)을
  등록해야 `emailRedirectTo` / `redirectTo`가 거부되지 않습니다.
- **Authentication > Email Templates**: 매직 링크와 비밀번호 재설정 메일
  템플릿에 `{{ .ConfirmationURL }}`이 코드 플로우(PKCE)를 가리키는지 확인.
- **Rate limiting**: `signInWithOtp` / `resetPasswordForEmail`는 기본적으로
  Supabase 쪽에서 이메일당 요청 빈도를 제한하지만, 프로덕션에서는 추가로
  앱 레벨 rate limit(예: IP/이메일 기준)을 고려하는 것을 권장합니다.
- **OTP 만료 시간**: Authentication > Providers > Email에서 매직링크/OTP
  만료 시간(기본 1시간 등)을 정책에 맞게 조정.

## 필요 의존성

```
npm install @supabase/ssr @supabase/supabase-js
```

`package.json`과 기존 `next`/`react` 버전은 프로젝트에 이미 있다고 가정하고
별도로 작성하지 않았습니다.
