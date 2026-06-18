# 프로젝트 폴더 구조 요약

## 왜 이렇게 나눴나

"비로그인도 보는 페이지 / 로그인한 사람만 보는 대시보드 / 운영자만 들어가는 관리자 페이지"라는
요구사항은 결국 **접근 권한이 다른 세 종류의 라우트**가 있다는 뜻입니다. Next.js App Router의
라우트 그룹(`(폴더명)`)은 URL에는 드러나지 않으면서 레이아웃과 보호 로직을 분리할 수 있어서,
이 권한 경계를 그대로 폴더 경계로 옮겼습니다.

라우트 그룹을 비즈니스 도메인(예: `(marketing)`, `(checkout)`)으로 나누는 방법도 있지만, 그렇게
하면 그룹이 늘어날수록 "이 페이지가 어느 그룹에 속해야 하나"를 매번 새로 판단해야 합니다.
대신 **"누가 접근할 수 있는가"** 하나의 기준으로만 나누면, 새 페이지를 만들 때 고민할 게
"비로그인도 보나? 로그인만 필요한가? 운영자만인가?" 세 가지로 고정됩니다.

## 만든 구조

```
app/
  (public)/              # 비로그인 포함 누구나 접근
    layout.tsx            # 공개 페이지 공통 셸 (헤더/푸터 등 자리)
    page.tsx               # 랜딩(메인) 페이지
    login/
      page.tsx              # 로그인 페이지
      actions.ts             # 로그인 Server Action (이 페이지 전용)
  (authenticated)/        # 로그인 필요, 역할 무관
    layout.tsx             # 대시보드 공통 셸 (사이드바 등 자리)
    dashboard/
      page.tsx               # 일반 사용자 대시보드
      actions.ts              # 대시보드 전용 Server Action
  (admin)/                # 운영자/관리자만 접근
    layout.tsx              # 관리자 전용 셸 (관리자 네비게이션 등 자리)
    dashboard/
      page.tsx                # 관리자 대시보드
      actions.ts               # 관리자 전용 Server Action
  auth/callback/route.ts   # OAuth/매직링크 콜백 — 권한 그룹과 무관한 인프라 엔드포인트
  layout.tsx                # 루트 레이아웃 (html/body, 전역 provider)
  globals.css               # 전역 스타일 / 디자인 토큰

lib/
  supabase/
    client.ts                # 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
    server.ts                 # 서버 컴포넌트/Server Action/라우트 핸들러용 클라이언트
    middleware.ts              # 세션 갱신 + 라우트 보호 로직 (미들웨어에서 호출)
    service.ts                  # RLS 우회용 service_role 클라이언트 (서버 전용)
  utils.ts                    # 여러 라우트가 공유하는 순수 함수
  validations/index.ts          # zod 등 공유 스키마 (폼 + Server Action 양쪽에서 사용)

components/
  ui/button.tsx               # 디자인 시스템 프리미티브 (도메인 로직 없음, 처음부터 공용)
  shared/page-header.tsx        # 2개 이상 라우트에서 쓰는 기능성 컴포넌트 예시

hooks/
  use-current-user.ts           # 2개 이상 컴포넌트에서 쓰는 커스텀 훅 예시

types/
  database.ts                   # Supabase 타입 생성 결과가 들어갈 자리

middleware.ts                   # 프로젝트 루트 미들웨어 진입점 (lib/supabase/middleware.ts 호출)
```

## 핵심 규칙

1. **라우트 그룹은 접근 권한 기준으로만 나눈다.** `(public)` / `(authenticated)` / `(admin)`
   세 가지 외에 도메인 기준 그룹(`(marketing)` 등)은 만들지 않았습니다.
2. **Server Action은 기본적으로 라우트 옆 `actions.ts`에 둔다.** 로그인, 대시보드, 관리자
   작업 각각의 액션이 모두 해당 페이지와 같은 폴더에 있습니다. 실제로 두 번째 라우트에서
   똑같은 액션이 필요해지기 전까지는 `lib/actions/`처럼 중앙화된 위치로 옮기지 않습니다.
3. **컴포넌트는 공유되는 시점에 끌어올린다.** `components/ui/`는 도메인 로직이 없는 순수
   프리미티브라서 처음부터 공용 폴더에 두었고, `components/shared/`는 "2곳 이상에서 쓰일 때"
   옮기는 자리라는 것을 보여주는 예시만 넣었습니다. 라우트 전용 컴포넌트는 아직 만들지
   않았으므로(아직 페이지 내부 로직이 거의 없는 단계) 별도로 추가하지 않았습니다.
4. **`lib/supabase/`는 client / server / middleware / service 4개 파일 구성**으로
   고정했습니다. 이후 인증 관련 스킬(예: Supabase 인증 스킬)을 적용할 때 이 구성을
   그대로 재사용할 수 있습니다.
5. **네이밍은 kebab-case**(`page-header.tsx`, `use-current-user.ts`), **라우트 그룹은
   괄호**(`(public)`), **라우트가 아닌 폴더는 언더스코어 프리픽스**(`_components/` 등,
   필요해지면 추가) 규칙을 따랐습니다.

## 역할 이름에 대한 참고

이번 요구사항은 "비로그인 / 로그인 사용자 / 운영자(관리자)" 세 단계였고, 이는 라우트 그룹
`(public)` / `(authenticated)` / `(admin)`에 그대로 대응됩니다. 만약 나중에 `(authenticated)`
내부에서 역할이 더 세분화된다면(예: 일반 사용자 vs 특정 직무), 그 역할 이름은 프로젝트의
실제 도메인에 따라 결정할 사항이며 미리 폴더 구조로 못박아두지 않았습니다 — 페이지 내부
로직이나 별도 라우트 세그먼트로 역할 분기를 처리하는 것을 권장합니다.

## 다음 단계 제안

- Supabase 프로젝트를 연결하고 `lib/supabase/*`의 TODO(환경변수, 실제 인증 호출)를 채우기
- `middleware.ts`에서 `(authenticated)`, `(admin)` 경로에 대한 실제 인증/역할 검사 로직 추가
- `types/database.ts`를 `supabase gen types typescript` 결과로 교체
- 페이지가 늘어나면서 실제로 2곳 이상에서 재사용되는 컴포넌트/액션이 생길 때만
  `components/shared/`, `lib/actions/`로 끌어올리기 (미리 옮기지 않기)
