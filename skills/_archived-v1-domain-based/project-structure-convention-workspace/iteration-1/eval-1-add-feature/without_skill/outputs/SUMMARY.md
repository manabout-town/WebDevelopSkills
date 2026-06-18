# 작업 요약: 대시보드 게시글 작성 기능 추가

## 요청 사항
`(authenticated)/dashboard` 페이지에 게시글 작성 기능을 추가하고, 폼 제출 시 Server Action을 통해 `posts` 테이블에 저장되도록 구현.

## 변경/추가된 파일

### 1. `app/(authenticated)/dashboard/actions.ts` (수정)
기존에 `createPost(title: string)` 형태의 Server Action이 이미 존재했지만, 실제로 어떤 폼에서도 호출되지 않고 있었고 `useActionState`(React 19 / Next.js App Router의 표준 폼 처리 패턴)와 호환되지 않는 시그니처였습니다. 다음과 같이 개선했습니다.

- `useActionState`가 요구하는 `(prevState, formData) => state` 시그니처로 변경
- 빈 제목, 200자 초과 등 기본적인 유효성 검사 추가
- 로그인되지 않은 경우, DB insert 실패 시 에러를 던지는 대신 `{ error: string }` 형태로 반환하여 클라이언트에서 자연스럽게 에러 메시지를 표시할 수 있도록 함
- 저장 성공 시 `revalidatePath("/dashboard")`를 호출하여 새 글이 즉시 목록에 반영되도록 함 (기존 코드에는 revalidate 로직이 없어서, 저장은 되어도 화면에는 새로고침 전까지 보이지 않는 문제가 있었음)

기존 파일을 새로 만들지 않고 "수정"한 이유는, 이미 같은 위치에 같은 목적의 액션 파일이 있었기 때문입니다 (중복 파일 생성 방지, Next.js App Router의 "라우트와 같은 폴더에 actions.ts를 둔다" 컨벤션 유지).

### 2. `components/dashboard/post-form.tsx` (신규 생성)
폼 자체는 클라이언트 컴포넌트로 분리했습니다.

- Server Action(`createPost`)은 서버 전용 코드이지만, 제출 중 로딩 상태(`isPending`) 표시, 에러 메시지 렌더링, 성공 시 입력 필드 초기화 등 상호작용이 필요하므로 `"use client"` 컴포넌트로 분리
- `useActionState`로 액션 상태(에러/성공)를 관리하고, `isPending`으로 중복 제출을 방지
- 기존 `components/ui/button.tsx`의 공용 `Button` 컴포넌트를 재사용하여 프로젝트의 기존 UI 컨벤션을 따름

**위치 선정 이유**: 프로젝트에 이미 `components/ui/`(범용 UI 컴포넌트)가 있었으므로, 특정 기능(대시보드 게시글 작성)에 종속된 컴포넌트는 `components/<feature>/` 형태로 분리하는 것이 더 적합하다고 판단했습니다. 이 폼은 dashboard 페이지에서만 쓰이는 전용 컴포넌트이므로 `components/dashboard/post-form.tsx`에 배치했습니다.

### 3. `app/(authenticated)/dashboard/page.tsx` (수정)
- 새로 만든 `PostForm` 컴포넌트를 페이지 상단(게시글 목록 위)에 배치
- 페이지 자체는 여전히 Server Component로 유지 (Supabase에서 게시글 목록을 조회하는 부분은 그대로 서버에서 처리)
- 레이아웃을 위해 약간의 Tailwind 클래스(`flex flex-col gap-*`)를 추가했으나, 기존에 사용 중이던 유틸리티 클래스 스타일과 일치시킴

## 설계 판단 / 주의사항

- **`posts` 테이블 스키마를 확인할 수 없었음**: 프로젝트 내에 마이그레이션/스키마 파일(`.sql` 등)이 없어서 `posts` 테이블에 `created_at` 같은 컬럼이 실제로 존재하는지 확인할 수 없었습니다. 따라서 목록 조회 시 `order("created_at", ...)` 같은 추가 정렬은 적용하지 않고, 기존 코드와 동일하게 `select("*")`만 사용했습니다. 실제 테이블에 `created_at` 컬럼이 있다면 최신 글이 위로 오도록 정렬을 추가하는 것을 권장합니다.
- **RLS(Row Level Security)**: `posts` 테이블에 RLS가 걸려 있다면, `insert` 시 `user_id`가 `auth.uid()`와 일치해야 한다는 정책이 있는지 확인이 필요합니다. 이 부분은 Supabase 프로젝트 설정에 따라 다르므로 별도로 점검해주세요.
- **반응형 디자인/접근성**: 기본적인 `label`/`input` 연결, `required`, `maxLength`는 적용했으나 디자인 시스템이 따로 있다면 거기에 맞춰 추가 스타일링이 필요할 수 있습니다.

## 변경/추가 파일 목록
- 수정: `app/(authenticated)/dashboard/actions.ts`
- 수정: `app/(authenticated)/dashboard/page.tsx`
- 신규: `components/dashboard/post-form.tsx`
