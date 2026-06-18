---
name: nextjs-supabase-auth
description: Design and implement authentication and authorization for Next.js + Supabase web apps — login/signup flows, middleware-based route protection, session handling, OAuth/magic-link callbacks, logout, and role-based access control. Use this skill whenever building or modifying a web app's login system, user roles, route guards, or onboarding flow, even if the user only mentions "로그인", "회원가입", "권한", "역할별 페이지", or describes a two-sided marketplace (화주/기사, 클라이언트/전문가 등) without explicitly saying "auth". Covers both simple apps with no roles (just logged-in vs logged-out) and apps with multiple user roles that need different dashboards and permissions.
---

# Next.js + Supabase 인증/권한 설계

## 이 스킬을 쓰는 이유

인증은 모든 웹 서비스에서 가장 먼저 막히는 지점이자, 가장 쉽게 구멍이 생기는 지점이다. 미들웨어에서 라우트를 막았다고 끝난 게 아니라 — RLS 정책이 없으면 미들웨어를 우회한 직접 API 호출로 다른 사람 데이터를 볼 수 있고, role 체크를 클라이언트에서만 하면 개발자 도구로 우회된다. 이 스킬의 목적은 단순히 "로그인 코드를 빨리 짜는 것"이 아니라, 매번 빠뜨리기 쉬운 보안 경계(미들웨어 + RLS + 서버 측 재검증)와 세션 생명주기(쿠키 갱신, OAuth 콜백, 로그아웃)를 모두 챙기는 것이다.

이 스킬은 역할이 0개인 단순 서비스부터 역할이 여러 개인 마켓플레이스형 서비스까지 모두 다룬다. 역할 개수에 따라 설계가 달라지므로, 작업을 시작하기 전에 먼저 이 질문에 답해야 한다.

## 0단계: 역할 구조 파악

코드를 쓰기 전에 사용자에게 (또는 기존 기획 문서에서) 확인할 것:

1. **역할이 몇 개인가?**
   - 0개 — 로그인 여부만 구분 (개인 블로그, 단순 SaaS 대시보드 등)
   - 1개 — 모든 가입자가 동일한 권한, 단지 로그인 여부만 페이지별로 다르게 (일반적인 커머스)
   - 2개 이상 — 역할별로 다른 화면/기능이 필요 (마켓플레이스의 공급자/수요자, SaaS의 일반유저/관리자 등)
2. **역할은 가입 시점에 정해지는가, 운영 중에 바뀔 수 있는가?** (예: 일반유저가 나중에 "전문가 등록"을 신청해서 역할이 추가되는 경우 — 단순 분기가 아니라 역할 전환/승급 플로우가 필요해진다)
3. **역할별로 가입 시 추가로 받아야 하는 정보가 있는가?** (사업자등록증, 차량 정보, 포트폴리오 등 — 있다면 6단계의 서류 첨부 패턴도 같이 적용)
4. **로그인 방법은 무엇인가?** (이메일+비밀번호, 매직 링크, Google 등 OAuth — 조합도 가능. 4단계에서 이 선택이 콜백 라우트 필요 여부를 결정한다)

역할이 0개라면 아래 1~3단계만 적용하고 5~6단계(역할 분기, 역할별 프로필)는 건너뛴다. 과하게 설계하지 않는 것도 이 스킬의 일부다 — 역할이 없는 서비스에 role 컬럼과 분기 로직을 미리 깔아두는 건 나중에 걷어내야 할 복잡도를 미리 만드는 것이다.

## 1단계: 네 가지 Supabase 클라이언트 분리

Supabase + Next.js에서 가장 흔한 실수는 클라이언트를 하나만 만들어 모든 곳에 쓰는 것이다. 컨텍스트마다 권한 수준과 쿠키 처리 방식이 다르기 때문에 넷을 분리해야 한다.

- **client** (브라우저용, anon key) — `"use client"` 컴포넌트에서 쓴다. RLS 정책이 적용된 채로 동작하므로, 여기서 호출한 쿼리는 항상 RLS를 통과해야 안전하다.
- **server** (서버 컴포넌트/Server Action용, anon key + 쿠키 기반 세션) — 로그인한 사용자 본인 권한으로 동작. 여기도 RLS가 적용된다. 서버 컴포넌트에서는 쿠키를 새로 쓸 수 없으므로 `setAll`은 비워둔다 (세션 갱신은 미들웨어가 담당).
- **middleware** (미들웨어 전용) — server 클라이언트와 비슷하지만 다르다. 미들웨어는 매 요청마다 만료된 토큰을 갱신할 수 있는 유일한 위치인데, 갱신된 쿠키를 `request`와 `response` 양쪽에 모두 써줘야 브라우저와 다음 단계(서버 컴포넌트) 양쪽에 반영된다. 이걸 server 클라이언트로 대체하면 "로그인했는데 새로고침하면 풀린다" 류의 버그가 생긴다.
- **service** (service_role key, RLS 완전 우회) — 오직 서버 전용 코드(Server Action, API Route)에서만, 그리고 "이 작업은 사용자 권한으로는 할 수 없고 시스템이 대신 해줘야 한다"는 명확한 이유가 있을 때만 쓴다. 예: 온보딩 시 역할별 프로필 테이블에 처음 레코드를 만들 때, 에스크로 자동 정산 같은 배치 작업.

service 클라이언트를 쓸 때마다 "왜 RLS를 우회해야 하는가"를 코드 주석으로 남기는 습관을 들이면, 나중에 봤을 때 이게 의도된 우회인지 실수인지 구분할 수 있다. service_role 키는 절대 클라이언트 컴포넌트나 미들웨어에 노출되면 안 되고, 환경변수로만 다루며 코드/문서/배포 스크립트에 평문으로 적지 않는다 (배포 단계에서 이 사고가 실제로 자주 난다).

```typescript
// lib/supabase/client.ts — 브라우저
import { createBrowserClient } from "@supabase/ssr"
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — 서버 컴포넌트 / Server Action
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// lib/supabase/middleware.ts — 미들웨어 전용, 토큰 갱신 쿠키를 request/response에 동기화
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request }) // 갱신된 request 쿠키를 반영해 response 재생성
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  return { supabase, response } // 미들웨어는 이 response를 그대로(혹은 리다이렉트로 교체해) 반환해야 한다
}

// lib/supabase/service.ts — RLS 우회, 서버 전용
import { createClient as createServiceClient } from "@supabase/supabase-js"
export function createServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 절대 NEXT_PUBLIC_ 접두사 붙이지 않기
  )
}
```

## 2단계: 미들웨어 기반 라우트 보호

미들웨어는 "1차 방어선"이다 — 로그인하지 않은 사용자가 보호된 페이지에 접근하면 즉시 리다이렉트한다. 하지만 미들웨어만 믿으면 안 된다 (3단계에서 이유를 설명한다).

미들웨어는 위에서 만든 `lib/supabase/middleware.ts`의 클라이언트를 쓴다. 핵심은 **갱신된 쿠키가 담긴 `response`를 끝까지 들고 가서 그대로 반환하는 것** — 중간에 `NextResponse.next()`나 `NextResponse.redirect()`를 새로 만들면 갱신된 세션 쿠키가 날아간다 (리다이렉트가 필요하면 `response`의 쿠키를 새 리다이렉트 응답에 복사하거나, `NextResponse.redirect(url, { headers: response.headers })` 식으로 옮긴다).

역할이 없는 경우, 미들웨어는 단순히 로그인 여부만 본다:

```typescript
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const publicPaths = ["/", "/login", "/signup"]
  const isPublic = publicPaths.includes(path) || path.startsWith("/auth/")

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return response // 갱신된 쿠키를 포함한 response를 반드시 반환
}
```

역할이 있는 경우, 미들웨어에서 역할까지 조회해서 분기한다. 이때 주의할 점: 미들웨어는 매 요청마다 실행되므로 여기서 DB 쿼리를 하면 비용이 든다 — 역할 정보를 JWT 커스텀 클레임에 넣어 쿠키에서 바로 읽을 수 있다면 더 효율적이지만, 처음 만들 때는 단순하게 `users` 테이블 조회로 시작해도 괜찮다. 트래픽이 늘면 그때 최적화한다.

```typescript
if (user && (path === "/login" || path === "/signup")) {
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  const role = profile?.role
  if (!role) return NextResponse.redirect(new URL("/onboarding", request.url))
  // role별 대시보드로 분기 — role 종류와 경로는 프로젝트마다 다르게 채운다
  return NextResponse.redirect(new URL(roleToDashboard[role], request.url))
}
```

역할별 보호 영역은 Next.js route groups로 물리적으로 분리해두면 미들웨어 로직과 폴더 구조가 1:1로 대응돼서 "이 페이지가 어떤 역할 전용인지"가 코드만 봐도 보인다 (`(provider)/`, `(requester)/`, `admin/` 식). 이 부분은 폴더 구조 스킬과 맞물리는 지점이다.

## 3단계: 미들웨어만으로는 부족한 이유 — 서버 측 재검증

미들웨어는 Next.js의 matcher 설정 실수, 캐싱, edge runtime의 제약 등으로 우회될 수 있는 경우가 실제로 존재한다. 그래서 진짜 보안 경계는 **DB의 RLS 정책**이어야 한다 — 미들웨어가 뚫려도 RLS가 막아주면 데이터는 안전하다.

역할 기반 RLS 정책의 기본 형태:

```sql
-- 본인 데이터만 조회 가능
create policy "users_select_own" on orders
  for select using (auth.uid() = requester_id);

-- 특정 역할만 특정 행을 볼 수 있게 (역할은 users 테이블 등에서 조회)
create policy "providers_select_open_orders" on orders
  for select using (
    status = 'open' and
    exists (select 1 from users where id = auth.uid() and role = 'provider')
  );
```

그리고 Server Action 안에서도 "이 사용자가 이 작업을 할 권한이 있는가"를 한 번 더 확인하는 습관을 들인다. RLS가 데이터 접근을 막아주지만, "관리자만 승인 가능한 작업을 일반 유저가 호출하면 어떻게 되는가" 같은 비즈니스 로직 단위의 권한 체크는 RLS만으로 표현하기 어려운 경우가 많다.

```typescript
"use server"
export async function approveSomething(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "권한이 없습니다" }
  // ...실제 로직
}
```

## 4단계: 로그인 진입점과 세션 생명주기

Supabase Auth는 로그인 진입점이 크게 세 가지다 — 이메일+비밀번호, 매직 링크, OAuth(Google 등). 어떤 걸 쓰는지에 따라 세션이 만들어지는 방식이 다르다.

- **이메일+비밀번호** (`signInWithPassword`): 호출 즉시 세션이 생긴다. 별도 콜백 라우트가 필요 없다.
- **매직 링크 / OAuth**: 사용자가 이메일 링크를 클릭하거나 OAuth 동의 화면에서 승인하면, Supabase가 임시 `code`를 붙여 우리 앱으로 리다이렉트시킨다. 이 코드를 실제 세션으로 교환하는 라우트 핸들러가 **반드시** 있어야 한다 — 빠뜨리면 "로그인 버튼은 동작하는데 막상 로그인이 안 되어 있다"는 현상이 생긴다.

```typescript
// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
```

**로그아웃**은 단순해 보이지만 클라이언트에서 `signOut()`만 호출하고 끝내는 경우가 많다 — 이러면 다른 탭이나 서버 컴포넌트 쪽 쿠키가 즉시 정리되지 않을 수 있다. Server Action으로 서버에서 직접 세션을 지우는 게 가장 안전하다:

```typescript
"use server"
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
```

**비밀번호 재설정**도 코드 교환이 필요한 흐름이라 콜백 라우트와 패턴이 겹친다 — `resetPasswordForEmail`로 메일을 보내고, 사용자가 링크를 클릭하면 위 콜백과 비슷한 흐름으로 돌아온다. 다만 이때 세션은 "recovery" 타입으로 표시되므로, 콜백 이후 페이지에서 이걸 일반 로그인 상태로 오해해 바로 대시보드로 보내지 않도록 구분해서 처리한다 (새 비밀번호 입력 폼을 먼저 보여준다).

## 5단계: 회원가입 → 온보딩 → 역할 분기

역할이 2개 이상인 서비스에서는 보통 가입과 "역할 확정"을 분리하는 게 깔끔하다. Supabase Auth로 계정만 먼저 만들고, role이 비어있는 상태로 `/onboarding`에 보내서 거기서 역할을 고르고 역할별 필수 정보를 입력받는다.

이 구조의 장점은, 가입 폼 자체를 단순하게 유지하면서 역할별로 다른 추가 입력 필드(차량 정보, 사업자등록증, 포트폴리오 등)를 온보딩 단계에서만 분기해서 보여줄 수 있다는 것이다. Server Action 하나에서 역할에 따라 다른 프로필 테이블에 upsert하는 패턴이 자연스럽다:

```typescript
"use server"
export async function completeProfile(formData: FormData) {
  const supabase = await createClient()
  const service = createServiceClient() // 최초 프로필 생성은 RLS보다 먼저 일어나야 하므로 service 클라이언트가 필요할 수 있다
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다" }

  const role = formData.get("role") as string
  await service.from("users").upsert({ id: user.id, email: user.email!, role })

  if (role === "provider") {
    await service.from("provider_profiles").upsert({ user_id: user.id, /* 역할별 필드 */ })
  } else {
    await service.from("requester_profiles").upsert({ user_id: user.id })
  }

  redirect(roleToDashboard[role])
}
```

역할이 운영 중에 바뀔 수 있는 서비스(일반 유저가 나중에 "전문가 등록" 신청)라면, role을 단순 덮어쓰기보다는 `pending_role` 같은 승인 대기 상태를 따로 두고 관리자 승인 후 전환하는 패턴을 고려한다. 이건 6단계 서류 검증과 자연스럽게 이어진다.

## 6단계: 역할별 자격 검증이 필요한 경우

마켓플레이스형 서비스에서 한쪽 역할(공급자)은 보통 신원/자격 확인이 더 엄격하다. 이 부분은 파일 업로드 스킬과 겹치는 영역이지만, 인증 관점에서 챙겨야 할 것은:

- `is_verified` 같은 플래그를 프로필 테이블에 두고, 검증 전/후로 할 수 있는 행동을 RLS와 Server Action 양쪽에서 제한한다 (예: 미검증 공급자는 입찰 불가).
- 검증 대기 상태도 명시적인 상태값으로 관리한다 (`pending` → `verified` / `rejected`), 단순 boolean보다 운영 중 추적이 쉽다.
- 서류 자체의 업로드/저장은 이 스킬의 범위가 아니다 — 별도의 파일 업로드 스킬을 참고한다.

## 체크리스트

작업이 끝나기 전에 다음을 확인한다:
- [ ] 미들웨어가 보호 경로를 막고 있는가, 그리고 public 경로 목록이 실제 라우트와 맞는가
- [ ] 미들웨어가 토큰 갱신 시 갱신된 쿠키를 담은 response를 그대로 반환하는가 (새 NextResponse로 덮어쓰지 않았는가)
- [ ] 보호되는 모든 테이블에 RLS가 켜져 있는가 (미들웨어만 믿지 않았는가)
- [ ] service_role 클라이언트를 쓰는 곳마다 "왜"가 명확한가, 그리고 그 키가 코드/문서에 평문으로 남지 않았는가
- [ ] 매직 링크/OAuth를 쓴다면 `/auth/callback` 라우트가 있고, code exchange 실패 시 처리가 있는가
- [ ] 로그아웃이 서버에서 세션을 지우는가 (클라이언트 단에서만 처리하고 끝나지 않는가)
- [ ] 역할이 있다면, 온보딩에서 역할 미설정 사용자를 빠짐없이 잡아내는가
- [ ] 역할 전환/승급이 있는 서비스라면, 무권한 상태에서 할 수 있는 행동이 의도대로 제한되는가
