# 컴포넌트 폴더 정리 요약

`project-structure-convention` 스킬의 4단계("컴포넌트는 공유되는 시점에 끌어올린다") 원칙에 따라
`components/` 폴더에 한꺼번에 모여 있던 컴포넌트 3개를 다음과 같이 재배치했습니다.

## 이동 내역

| 파일 | 이전 위치 | 새 위치 | 이유 |
|---|---|---|---|
| `admin-user-row.tsx` | `components/admin-user-row.tsx` | `app/(admin)/users/_components/admin-user-row.tsx` | `(admin)/users` 라우트에서만 쓰이는 컴포넌트라서 해당 라우트 폴더 안으로 콜로케이션. `_components`는 언더스코어 프리픽스로 Next.js 라우팅에서 제외됨 |
| `post-card.tsx` | `components/post-card.tsx` | `app/(authenticated)/posts/_components/post-card.tsx` | `(authenticated)/posts` 라우트에서만 쓰이는 컴포넌트라서 해당 라우트 폴더 안으로 콜로케이션 |
| `button.tsx` | `components/button.tsx` | `components/ui/button.tsx` | 도메인 로직이 없는 범용 UI 프리미티브(디자인 시스템 토큰 적용 대상)라서, 공유 여부를 판단할 필요 없이 처음부터 `components/ui/`에 두는 것이 스킬 기준 |

## 업데이트한 import

- `app/(admin)/users/page.tsx`
  - `import { AdminUserRow } from "@/components/admin-user-row";`
  - → `import { AdminUserRow } from "./_components/admin-user-row";`
- `app/(authenticated)/posts/page.tsx`
  - `import { PostCard } from "@/components/post-card";`
  - → `import { PostCard } from "./_components/post-card";`

`button.tsx`를 import하는 코드는 프로젝트 내에 없어서 추가로 수정할 import는 없었습니다.

## 정리 후 구조

```
app/
  (admin)/users/
    page.tsx
    _components/
      admin-user-row.tsx
  (authenticated)/posts/
    page.tsx
    _components/
      post-card.tsx
components/
  ui/
    button.tsx
```

각 컴포넌트가 정확히 하나의 라우트에서만 쓰이고 있었기 때문에, 둘 이상의 라우트에서 공유되는 컴포넌트는 없어 `components/shared/`는 이번에는 만들지 않았습니다. 추후 두 번째 라우트에서 동일/유사 컴포넌트가 필요해지면 그때 `components/shared/`로 끌어올리면 됩니다.
