# 컴포넌트 폴더 정리 요약

기존에는 `components/` 폴더 하나에 성격이 전혀 다른 컴포넌트들(공용 UI, 관리자 기능, 게시글 기능)이
구분 없이 한꺼번에 들어 있었습니다. 컴포넌트 수가 늘어날수록 어떤 파일이 어디서 쓰이는지 파악하기
어려워지므로, **역할(공용 UI vs 도메인/기능별)** 기준으로 하위 폴더를 나누어 정리했습니다.

## 이동한 파일

| 기존 경로 | 새 경로 | 이유 |
| --- | --- | --- |
| `components/button.tsx` | `components/ui/button.tsx` | 특정 기능에 종속되지 않는 범용 UI 컴포넌트이므로 `ui/`(디자인 시스템 성격) 폴더로 분리 |
| `components/admin-user-row.tsx` | `components/admin/admin-user-row.tsx` | 관리자(`(admin)`) 라우트 그룹에서만 쓰이는 컴포넌트이므로 `admin/` 기능별 폴더로 분리 |
| `components/post-card.tsx` | `components/posts/post-card.tsx` | 게시글(`(authenticated)/posts`) 기능에서만 쓰이는 컴포넌트이므로 `posts/` 기능별 폴더로 분리 |

## 업데이트한 import 경로

- `app/(admin)/users/page.tsx`
  - `@/components/admin-user-row` → `@/components/admin/admin-user-row`
- `app/(authenticated)/posts/page.tsx`
  - `@/components/post-card` → `@/components/posts/post-card`

`components/button.tsx`(현재는 어디에서도 import되지 않음)는 import하는 곳이 없어 경로 수정이
필요하지 않았지만, 향후 여러 기능에서 재사용될 공용 컴포넌트이므로 미리 `ui/` 폴더로 옮겨 두었습니다.

## 새 폴더 구조

```
components/
├── ui/
│   └── button.tsx          # 범용 UI 컴포넌트 (여러 기능에서 재사용 가능)
├── admin/
│   └── admin-user-row.tsx  # 관리자 기능 전용 컴포넌트
└── posts/
    └── post-card.tsx       # 게시글 기능 전용 컴포넌트
```

이렇게 분리하면 앞으로 컴포넌트가 늘어나도 "이건 공용 UI인지", "어떤 기능에 속하는지"가
폴더 구조만 봐도 바로 드러나서 유지보수가 쉬워집니다.
