# 게시글 작성 기능 추가 — 작업 요약

## 요청 내용
`(authenticated)/dashboard` 페이지에 게시글 작성 폼을 추가하고, 폼 제출 시 Server Action으로 `posts` 테이블에 저장되도록 구현.

## 추가/수정한 파일

### 1. `app/(authenticated)/dashboard/post-form.tsx` (신규)
게시글 제목을 입력받는 클라이언트 컴포넌트(`"use client"`)다. `useTransition`으로 제출 중 상태를 관리하고, 기존 `actions.ts`의 `createPost`를 호출한다. 성공 시 폼을 리셋하고, 실패 시 에러 메시지를 화면에 표시한다.

**왜 이 위치인가**: 스킬의 4단계("컴포넌트는 공유되는 시점에 끌어올린다") 원칙에 따라, 이 폼은 현재 `dashboard` 라우트에서만 쓰이므로 `components/`로 미리 옮기지 않고 라우트 폴더 안에 그대로 두었다. 다른 라우트에서 똑같은 폼이 필요해지는 시점이 오면 그때 `components/shared/`로 끌어올리면 된다. 버튼은 이미 `components/ui/button.tsx`에 디자인 시스템 프리미티브로 존재하므로 그것을 그대로 재사용했다(원칙 4의 3번: UI 프리미티브는 처음부터 공유 위치).

### 2. `app/(authenticated)/dashboard/actions.ts` (수정)
기존에 이미 `createPost` Server Action이 이 파일에 존재했다(스킬의 3단계 "Server Action은 라우트 옆에 둔다" 원칙이 이미 적용되어 있었음). 다음을 보강했다:
- 빈 제목 방어 처리(`title.trim()` 검증)
- Supabase insert 에러 처리(`error` 체크 후 throw)
- `revalidatePath("/dashboard")` 추가 — 게시글 작성 후 대시보드 페이지의 서버 컴포넌트 캐시를 무효화해 새 글이 목록에 즉시 반영되도록 함

**왜 새 파일을 만들지 않았는가**: 이 액션은 `dashboard` 라우트에서만 호출되고, 다른 라우트와 공유되지 않는다. 스킬 3단계 원칙("실제로 재사용되기 전까지는 lib/actions/로 옮기지 않는다")에 따라 기존 위치(`app/(authenticated)/dashboard/actions.ts`)를 그대로 유지하고 내용만 보강했다. 또한 액션 내부에서 `supabase.auth.getUser()`로 인증을 재확인하는 기존 패턴을 유지했다 — 미들웨어를 우회해 액션이 직접 호출될 수 있기 때문이다(스킬 3단계, `nextjs-supabase-auth` 스킬과의 합).

### 3. `app/(authenticated)/dashboard/page.tsx` (수정)
서버 컴포넌트인 `DashboardPage`에 `<PostForm />`을 게시글 목록(`<ul>`) 위에 렌더링하도록 한 줄 추가했다. 데이터 패칭 로직(`supabase.from("posts").select("*")`)은 그대로 유지했다.

## 구조 결정 요약
- 새 폴더나 새 라우트는 만들지 않았다 — 이미 존재하는 `(authenticated)/dashboard` 라우트 안에서 기능을 완결시켰다.
- `lib/actions/`, `components/shared/` 등 공유 위치로 끌어올리지 않았다 — 아직 이 액션/컴포넌트를 쓰는 두 번째 라우트가 없기 때문이다(스킬의 핵심 원칙: "공유되는 시점에 끌어올린다").
- 파일명은 kebab-case(`post-form.tsx`)로 스킬의 5단계 네이밍 규칙을 따랐다.
- `components/ui/button.tsx`는 이미 존재하는 디자인 시스템 프리미티브라서 새로 만들지 않고 그대로 재사용했다.
