# project-structure-convention — Benchmark (iteration 1)

## Summary

| Config | Pass rate (mean) | Time (s, mean) | Tokens (mean) |
|---|---|---|---|
| with_skill | 1.0 | 105.1533 | 64501.3333 |
| without_skill | 0.5389 | 119.6733 | 64881 |

**Delta (with - without):** pass_rate +0.4611, time_seconds -14.52, tokens -379.6667

## Per-eval results

### eval-0 eval-0-greenfield-setup — with_skill
- pass_rate: 1.0 (5/5)
- time: 169.19s, tokens: 70273
  - [PASS] 라우트 그룹이 접근권한((public)/(authenticated)/(admin)) 기준으로만 존재하고, 별도 도메인 그룹(예: (auth))을 만들지 않았는가
  - [PASS] lib/supabase에 서비스 롤(service_role) 클라이언트 파일이 포함되어 있는가
  - [PASS] 컴포넌트 파일명이 kebab-case로 일관되는가 (PascalCase 파일명 없음)
  - [PASS] Server Action을 lib/actions 같은 중앙 폴더로 미리 모아두지 않고 라우트별로 분리했는가
  - [PASS] app/, lib/, components/, types/, hooks/ 최상위 구조가 모두 존재하는가

### eval-0 eval-0-greenfield-setup — without_skill
- pass_rate: 0.2 (1/5)
- time: 160.64s, tokens: 72599
  - [FAIL] 라우트 그룹이 접근권한((public)/(authenticated)/(admin)) 기준으로만 존재하고, 별도 도메인 그룹(예: (auth))을 만들지 않았는가
  - [FAIL] lib/supabase에 서비스 롤(service_role) 클라이언트 파일이 포함되어 있는가
  - [FAIL] 컴포넌트 파일명이 kebab-case로 일관되는가 (PascalCase 파일명 없음)
  - [PASS] Server Action을 lib/actions 같은 중앙 폴더로 미리 모아두지 않고 라우트별로 분리했는가
  - [FAIL] app/, lib/, components/, types/, hooks/ 최상위 구조가 모두 존재하는가

### eval-1 eval-1-add-feature — with_skill
- pass_rate: 1.0 (4/4)
- time: 83.33s, tokens: 62018
  - [PASS] 새 폼 컴포넌트를 dashboard 라우트 폴더에 colocate했는가 (조기에 components/ 하위 전용 폴더로 옮기지 않았는가)
  - [PASS] Server Action 내부에서 인증을 재확인하는가 (auth.getUser() 호출)
  - [PASS] 기존 lib/supabase 클라이언트 구성을 그대로 재사용했는가 (새 클라이언트 파일을 따로 만들지 않았는가)
  - [PASS] 새로 추가한 파일명이 kebab-case인가

### eval-1 eval-1-add-feature — without_skill
- pass_rate: 0.75 (3/4)
- time: 125.79s, tokens: 63402
  - [FAIL] 새 폼 컴포넌트를 dashboard 라우트 폴더에 colocate했는가 (조기에 components/ 하위 전용 폴더로 옮기지 않았는가)
  - [PASS] Server Action 내부에서 인증을 재확인하는가 (auth.getUser() 호출)
  - [PASS] 기존 lib/supabase 클라이언트 구성을 그대로 재사용했는가 (새 클라이언트 파일을 따로 만들지 않았는가)
  - [PASS] 새로 추가한 파일명이 kebab-case인가

### eval-2 eval-2-refactor-messy — with_skill
- pass_rate: 1.0 (3/3)
- time: 62.94s, tokens: 61213
  - [PASS] 라우트 전용 컴포넌트(admin-user-row, post-card)가 각자 쓰이는 라우트 폴더 안으로 옮겨졌는가 (중앙 components/ 하위의 도메인 폴더가 아니라)
  - [PASS] 범용 UI 프리미티브(button)가 components/ui/로 이동했는가
  - [PASS] 이동한 컴포넌트를 가리키는 import 경로가 모두 갱신되어 깨진 import가 없는가

### eval-2 eval-2-refactor-messy — without_skill
- pass_rate: 0.6667 (2/3)
- time: 72.59s, tokens: 58642
  - [FAIL] 라우트 전용 컴포넌트(admin-user-row, post-card)가 각자 쓰이는 라우트 폴더 안으로 옮겨졌는가 (중앙 components/ 하위의 도메인 폴더가 아니라)
  - [PASS] 범용 UI 프리미티브(button)가 components/ui/로 이동했는가
  - [PASS] 이동한 컴포넌트를 가리키는 import 경로가 모두 갱신되어 깨진 import가 없는가

## Analyst notes

- eval-0(그린필드): without_skill은 (auth), (dashboard) 같은 도메인/페이지 이름 라우트 그룹을 만들어 스킬이 가르치는 '접근권한 기준 분리' 원칙을 따르지 않음. with_skill은 (public)/(authenticated)/(admin) 세 그룹만 사용.
- eval-0: without_skill은 service_role 클라이언트(service.ts)를 빠뜻려 nextjs-supabase-auth 스킬과의 합이 깨짐 — 두 스킬을 같은 프로젝트에 적용할 때 불일치 발생 가능.
- eval-0: without_skill에 SiteHeader.tsx(PascalCase) 파일명이 등장 — 스킬이 명시한 kebab-case 네이밍 규칙 위반.
- eval-1(기능 추가): 핵심 차이는 새 폼 컴포넌트의 위치. with_skill은 dashboard 라우트 폴더에 colocate, without_skill은 components/dashboard/라는 새 중앙 폴더를 미리 만듦 — 스킬이 경고하는 '재사용되기 전에 미리 옮기기' 패턴.
- eval-1: 인증 재검증(getUser)과 기존 supabase 클라이언트 재사용은 둘 다 잘함 — 이 두 체크는 변별력이 낮음(이미 존재하던 코드라 자연스럽게 유지됨).
- eval-2(리팩터링): with_skill은 라우트 폴더 안 _components/로 colocate, without_skill은 components/admin/, components/posts/ 라는 중앙 폴더의 하위 도메인 폴더로 이동 — 둘 다 '정리'는 했지만 스킬이 가르치는 구체적 컨벤션(라우트 옆 colocate)을 따른 건 with_skill뿐.
- eval-2: import 경로 갱신과 button.tsx → components/ui/ 이동은 둘 다 성공 — 이 두 체크도 변별력이 낮음(비교적 기계적인 작업이라 스킬 유무와 무관하게 잘 수행됨).
- 전체적으로 스킬은 '구조가 있는가'보다 '어떤 구체적 컨벤션을 따르는가'에서 차이를 만든다 — without_skill도 합리적인 구조를 만들지만, 매번 다른 네이밍/그룹핑 선택을 해 프로젝트 간 일관성이 떨어진다.