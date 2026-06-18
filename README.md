# web-dev-skills

Next.js + Supabase 스택으로 웹 서비스를 만들 때, 기능 도메인(인증/결제/DB 등)이 아니라 **개발 단계**별로 반복되는 작업을 다루는 개인용 Claude Code 스킬 모음집이다. 어떤 기능을 만들든 (로그인이든 결제든 채팅이든) 기획 → 디자인 → 데이터 모델링 → 기능 구현 → 페이지 구현 → 렌더링 → 배포 → 마케팅/계측이라는 같은 단계를 거치는데, 각 단계에서 일반화 가능한 패턴만 스킬로 만든다. 자세한 배경과 설계 원칙은 [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md), Claude가 항상 지켜야 할 규칙은 [`CLAUDE.md`](./CLAUDE.md)에 있다.

## 설치

Claude Code에서 이 폴더를 플러그인으로 설치한다.

```
/plugin install <이 폴더 경로>
```

또는 `~/.claude/skills/`에 `skills/` 하위 폴더들을 직접 복사해서 개별 스킬로 써도 된다.

## 스킬 로드맵 (개발 단계 기준, 8단계 + 0단계)

| # | 단계 | 스킬 | 상태 | 설명 |
|---|---|---|---|---|
| 0 | 아이디어→필수기능 | `essential-feature-discovery` | 완료 (평가 보류) | 아이디어 하나를 Essential(v1 필수) / Important(v1 직후) / Nice-to-have(보류) 3개 티어로 분류한다. "이 기능 없이도 핵심 동작이 끝까지 되는가"라는 removal test로 판정하며, 개별 기능을 받아서 스코핑하는 `feature-scoping`보다 한 단계 앞서 "이 서비스에 어떤 기능이 필요한가"를 정한다. 중간에 새 기능 요청이 들어왔을 때 "이게 정말 필요한 기능인가"를 점검하는 용도로도 재사용한다. |
| 1 | 기획 | `feature-scoping` | 완료 (평가 1회) | `essential-feature-discovery`가 분류한 기능 하나를 범위가 명확한 스펙으로: 문제 정의, 유저 플로우, MVP 컷라인, 성공 기준. with-skill vs without-skill 평가 결과는 `CHANGELOG.md` 참고. |
| 2 | 디자인 | `ux-flow-design` | 초안 작성 (평가 보류) | 화면 목록, 화면 간 네비게이션 흐름, 화면별 구조(zone)와 로딩/빈/에러/권한없음 4가지 상태, 화면 간 일관성 규칙(주요 액션 위치, 피드백 패턴, 리스트/디테일 패턴 재사용)을 코드 작성 전에 정한다. `web-essentials-checklist`의 기본 화면(로그인/로그아웃/404)도 빠뜨리지 않았는지 확인한다. |
| 3 | 데이터 모델링 | `data-model-design` | 초안 작성 (평가 보류) | 테이블/관계 설계 전에 접근 모델(누가 읽고 쓰는가)을 먼저 정하고, 거기서 RLS 정책(select/insert/update/delete)을 도출한다. N:N은 조인 테이블로, 인덱스는 추적된 쿼리 패턴에만, 마이그레이션은 작고 이름 붙은 되돌릴 수 있는 단계로 쪼갠다. `service_role`을 RLS 회피 수단으로 쓰지 않도록, 마이그레이션/시드 스크립트에 시크릿 값을 평문으로 남기지 않도록 명시한다. |
| 4 | 기능 구현 | `feature-logic-implementation` | 초안 작성 (평가 보류) | Server Action vs Route Handler 선택 기준, entry point는 얇게 유지하고 실제 로직은 plain function으로 분리, 클라이언트 검증은 UX용일 뿐 서버 검증이 실제 경계, 앱 전체에서 통일된 성공/에러 반환 형식, data-model-design의 상태 컬럼을 활용한 race condition 처리, 쓰기 후 revalidation 트리거 명시 |
| 5 | 페이지 구현 | `page-implementation` | 초안 작성 (평가 보류) | 라우트 그룹은 도메인이 아니라 접근권한 기준(public/authenticated/admin)으로, 서버 컴포넌트가 기본이고 클라이언트 경계는 최대한 leaf까지 내림, 컴포넌트는 라우트에 colocate 후 2번째 재사용 시에만 공유 폴더로 승격, ux-flow-design이 정한 4가지 상태(로딩/빈/에러/권한없음)를 Next.js 컨벤션으로 구현, 폼은 feature-logic-implementation의 통일된 반환 형식으로 연동 |
| 6 | 렌더링 | `rendering-performance-strategy` | 초안 작성 (평가 보류) | 라우트별 렌더링 모드를 데이터 신선도 요구와 data-model-design의 접근 모델로 결정(공유/공개 데이터만 캐싱 후보, 개인화 데이터는 캐시 우회 또는 유저별 키), 느린 부분만 Suspense로 스트리밍, 독립적인 데이터는 병렬로 fetch해 워터폴 방지, feature-logic-implementation이 표시한 revalidation 트리거 실제 연결 |
| 7 | 배포 | `deployment-release-readiness` | 초안 작성 (평가 보류) | 환경변수를 public/secret으로 분류하고 환경별로 실제 설정됐는지 확인, preview/production 환경(Supabase 프로젝트) 분리 확인, 마이그레이션 순서·RLS·빌드·feature-scoping 성공 기준 기반 스모크 테스트를 배포 전 체크, 마이그레이션이 이전 코드와 하위 호환되는지 확인해 롤백이 실제로 안전한지 판단, 위험도에 따른 전체배포/단계적배포 결정 |
| 8 | 마케팅/계측 | `launch-growth-instrumentation` | 초안 작성 (평가 보류) | feature-scoping의 성공 기준과 essential-feature-discovery의 핵심 동작에 직접 연결된 이벤트만 추적(무분별한 클릭 추적 지양), 공개 라우트에만 SEO 메타데이터(인증 화면은 noindex), 기능 플래그는 제거 조건까지 함께 정의, 바이럴/공유 루프가 있다면 단계별로 계측 |

> 이전에는 인증/DB설계/결제 같은 **기능 도메인** 단위로 스킬을 나눴으나(`skills/_archived-v1-domain-based/`에 보관), 사용자 의도와 맞지 않아 **개발 단계** 단위로 전면 재설계했다. 각 단계 스킬은 인증이든 결제든 채팅이든 어떤 기능에도 적용 가능해야 한다.

> **0단계가 생긴 이유**: `feature-scoping`은 "이 기능을 만들기로 했다"는 전제에서 시작해 그 기능 하나를 스코핑한다. 하지만 "이 기능을 정말 만들어야 하는가"는 그 전제 자체에 대한 질문이라 `feature-scoping`이 답할 수 없었다. `essential-feature-discovery`가 그 질문을 맡는다 — 프로젝트 시작 시 한 번 전체 기능 지도를 만들고, 이후 새 기능 요청이 들어올 때마다 그 지도에 비춰 필요성을 재판정한다. 이 0단계 → 1단계(기획) → 2단계(디자인) 흐름이 합쳐지면, 아이디어만 던져도 필수 기능 목록 → 페이지 목록과 일관된 UI/UX → (이후 단계에서) 실제 구현까지 이어지는 파이프라인이 되고, 유저는 그렇게 나온 페이지를 하나씩 확인하며 Claude Code/Cowork로 수정·추가하면 된다. 이게 이 스킬 모음집 전체의 목표다.

## 단계별 로드맵과 별개인 추가 스킬

| 스킬 | 상태 | 설명 |
|---|---|---|
| `web-essentials-checklist` | 완료 (평가 1회) | 8단계 라이프사이클과 무관하게, 언제든 "이 프로젝트에 웹앱 필수 기능이 빠진 게 없는지" 점검·보완하는 체크리스트형 스킬. 파비콘/PWA, 반응형, 접근성 기초, 보안 헤더, 환경변수 검증, 레이트리밋, SEO/메타데이터/robots/sitemap, 에러·404 페이지, 로딩 상태, 기본 로그인/로그아웃을 다룬다. (역할 기반 인증처럼 복잡한 인증 플로우는 8단계 로드맵 쪽에서 다룬다 — 여기서는 최소 동작하는 로그인/로그아웃까지만.) with-skill vs without-skill 평가 결과는 `CHANGELOG.md` 참고. |
| `visual-design-foundations` | 신규 작성 (평가 보류) | 프로젝트당 한 번, UI 라이브러리(shadcn/ui·Radix·순수 Tailwind 등)와 디자인 토큰(색상/시맨틱 컬러·타이포 스케일·spacing/radius/shadow 규칙)을 결정해 `tailwind.config.*`/`globals.css`에 실제로 써둔다. `ux-flow-design`이 "시각 디자인은 다루지 않는다"고 명시적으로 미뤄둔 부분을 메우며, `page-implementation`이 페이지마다 색상/버튼 스타일을 즉석으로 재결정하지 않도록 한 번 정해둔 기준을 인계한다.

## 핵심 원칙

1. **범용 레이어** — 특정 서비스(예: 화물 마켓플레이스)의 클론이 되어서는 안 된다. 참고는 하되 일반화한다.
2. **단계 기준 모듈화** — 기능 도메인이 아니라 개발 단계별로 나눈다. 각 스킬은 어떤 기능에든 적용 가능해야 한다.
3. **코드는 예시일 뿐** — SKILL.md에 작동하는 템플릿 파일을 두지 않는다. 실제 코드는 매 프로젝트마다 Claude가 새로 생성한다.
4. **보안 우선** — 민감한 키를 코드/문서/배포 스크립트에 평문으로 남기지 않는다.
5. **언어 규칙** — SKILL.md 본문은 영문, 그 외 문서와 리뷰/채팅은 한글.

변경 이력은 [`CHANGELOG.md`](./CHANGELOG.md) 참고.
# WebDevelopSkills
