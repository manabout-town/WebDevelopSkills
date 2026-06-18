# Changelog

이 스킬 모음집의 추가/변경 이력.

## 2026-06-17

- 프로젝트 구조 정리: `skills/` 디렉토리로 스킬 통합, `.claude-plugin/plugin.json` 추가 (Claude Code 플러그인 형식), `CLAUDE.md`·`README.md` 추가. ([thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) 구조 참고)
- `nextjs-supabase-auth` 보강: 미들웨어 전용 Supabase 클라이언트(`lib/supabase/middleware.ts`) 추가, OAuth/매직링크용 `/auth/callback` 라우트 추가, 서버 사이드 로그아웃·비밀번호 재설정 가이드 추가.
- `nextjs-supabase-auth` with-skill vs baseline 비교 평가 1회 실행 완료 (시나리오 3개, 각 1회씩): with_skill 100% (6/6, 5/5, 5/5), without_skill 87.8%. 확인된 실제 차이: without_skill은 service-role Supabase 클라이언트를 생성하지 않았고, 로그아웃 기능을 전혀 구현하지 않음. 결과는 `skills/nextjs-supabase-auth-workspace/iteration-1/benchmark.json` 및 `eval-review/review.html`에 기록.
- 로드맵을 9단계로 확정: 기존 핵심 7개 + 확장 후보 중 `form-validation`, `error-handling-logging` 2개를 정식 로드맵에 편입. 나머지 확장 후보(realtime-features, search-filter-patterns, seo-metadata, notification-system)는 9단계 이후 낮은 우선순위로 유지.

## 초기

- `nextjs-supabase-auth` 초안 작성 (4단계 클라이언트 분리, 미들웨어 라우트 보호, RLS, 회원가입→온보딩→역할분기, 역할별 자격 검증).

- `project-structure-convention` 스킬(2/9) 초안 작성 및 평가 1회 완료. 그린필드 구조 설계, 기존 프로젝트에 기능 추가, 어수선한 컴포넌트 폴더 리팩터링 3개 시나리오로 with-skill vs baseline 비교 — pass rate 100% vs 53.9%. 확인된 실제 차이: (1) without_skill은 라우트 그룹을 접근권한이 아니라 (auth)/(dashboard) 같은 도메인/페이지 이름으로 나눠 스킬의 핵심 원칙을 어김, (2) lib/supabase에 service_role 클라이언트(service.ts)를 빠뜨려 nextjs-supabase-auth 스킬과 합이 깨짐, (3) PascalCase 파일명(SiteHeader.tsx) 사용으로 kebab-case 컨벤션 위반, (4) 새 컴포넌트를 라우트에 colocate하지 않고 미리 components/ 하위 전용 폴더로 옮김. 결과는 `skills/project-structure-convention-workspace/iteration-1/benchmark.json`과 `eval-review-2/review.html`에 정리.

## 2026-06-17 (2) — 로드맵 전면 재구성

- 사용자 피드백: "기능 도메인(인증/DB설계/결제 등) 단위 로드맵"은 의도와 다르다는 점을 확인. 실제로 원했던 건 어떤 기능을 만들든 거쳐가는 **개발 단계**(기획 → 디자인 → 데이터 모델링 → 기능 구현 → 페이지 구현 → 렌더링 → 배포 → 마케팅/계측) 기준 스킬이었음.
- 기존 도메인 기준 스킬 2개(`nextjs-supabase-auth`, `project-structure-convention`)와 평가 워크스페이스를 `skills/_archived-v1-domain-based/`로 이동 — 폐기, 새 구조로 처음부터 재설계.
- 로드맵을 8단계 개발 단계 기준으로 재정의: `feature-scoping` → `ux-flow-design` → `data-model-design` → `feature-logic-implementation` → `page-implementation` → `rendering-performance-strategy` → `deployment-release-readiness` → `launch-growth-instrumentation`.
- 새 언어 규칙 확정: SKILL.md 본문은 영문, 그 외 문서(README/CHANGELOG/PROJECT_BRIEF)와 채팅 리뷰는 한글.
- `CLAUDE.md`, `README.md`에 위 변경 반영.

## 2026-06-17 (3) — 독립 스킬 `web-essentials-checklist` 추가 결정

- 사용자 요청: "웹이라면 필수적으로 있어야하는 기능들을 만들어놓은 세팅"도 필요함. 8단계 라이프사이클과는 별개로, 언제든 프로젝트에 웹앱 필수 기능이 빠진 게 없는지 점검·보완하는 체크리스트형 스킬로 결정.
- 범위: 파비콘/PWA, 반응형, 접근성 기초 / 보안 헤더, 환경변수 검증, 레이트리밋 / SEO·메타데이터·robots·sitemap / 에러·404 페이지, 로딩 상태 / 기본 로그인·로그아웃(최소 동작 수준, 역할 기반 인증 같은 복잡한 플로우는 8단계 로드맵 쪽 담당).
- `README.md`에 "단계별 로드맵과 별개인 추가 스킬" 섹션으로 추가.

## 2026-06-18 — `web-essentials-checklist` 평가 완료

- 시나리오 3개(그린필드 빈 프로젝트 / 일부만 갖춰진 기존 프로젝트 / 유출된 시크릿 키 + 보안 점검 누락)로 with-skill vs without-skill 비교 평가 1회씩 실행. 결과: eval-0 9/9 vs 9/9, eval-1 8/8 vs 8/8, eval-2 5/5 vs 4/5.
- eval-0·eval-1은 두 구성 모두 거의 동등하게 잘 수행 — 베이스라인 모델도 이미 알고 있는 항목들이라 스킬의 차별점이 크게 드러나지 않음. 다만 eval-0에서 without_skill이 시간을 더 오래 씀(915.8s vs 750.5s).
- eval-2가 핵심 차별점: without_skill은 평문으로 커밋된 `SUPABASE_SERVICE_ROLE_KEY`/`TOSS_SECRET_KEY`를 코드에서는 제거했지만, "이미 노출된 키는 탈취된 것으로 간주하고 즉시 로테이션하라"는 명시적 경고 없이 일반적인 보안 권고만 남겼고, 보안 수정 이후 나머지 체크리스트(robots/sitemap/에러·404 페이지/로그인-로그아웃/환경변수 검증/레이트리밋)는 손대지 않았다. with_skill은 SETUP.md에 키 로테이션 필요성을 명시하고 체크리스트 전체를 완료함 — 스킬의 `references/security-env-ratelimit.md`에 명시된 "유출 키는 조용히 고치지 말고 사용자에게 명시적으로 경고" 원칙이 실제로 작동함을 확인.
- 결과는 `skills/web-essentials-checklist-workspace/iteration-1/benchmark.json`, `benchmark.md`에 기록. 사용자가 정적 뷰어로 결과를 확인하고 추가 피드백 없이 결과에 만족 — 별도 반복 없이 1회차로 확정.

## 2026-06-18 (2) — `essential-feature-discovery` 스킬(0단계) 추가

- 사용자 피드백: feature-scoping 평가 결과를 보고 "북마크 기능 하나를 스킬로 만들어두는 게 맞나"라는 질문을 했는데, 이를 "템플릿 비중을 기능 크기에 맞춰 조정해야 한다"는 의미로 잘못 해석해 제안했다가 사용자가 "다른 의도였음"으로 정정. 실제 의도는 (1) 북마크 같은 기능이 정말 필수인지 판단하는 절차가 없다는 것, (2) 이 스킬 모음집 전체의 목표가 "아이디어만 던지면 필수 기능 판단 → 페이지 생성과 일관된 UI/UX → 유저가 결과물을 보며 Claude Code/Cowork로 수정·추가"까지 가는 파이프라인이라는 점을 재확인하는 것이었음.
- `feature-scoping`은 "이 기능을 만들기로 했다"는 전제에서 시작해 개별 기능 하나를 스코핑하므로, "이 기능을 만들어야 하는가" 자체를 판단하는 더 앞 단계가 빠져 있었음을 확인. 이를 보완하기 위해 `essential-feature-discovery` 스킬을 0단계로 신설.
- 핵심 메커니즘: removal test("이 기능이 없어도 핵심 동작이 끝까지 되는가") 하나로 모든 기능 후보를 Essential(v1 필수) / Important(v1 직후, 신뢰·금전·악용 등 리스크 대응) / Nice-to-have(보류, 유저가 요청할 때까지) 3개 티어로 분류. 경쟁사 기능 따라하기, 구현이 쉬우니까 넣자는 식의 판단을 흔한 실패 패턴으로 명시.
- `README.md` 로드맵 표에 0단계로 추가, "0단계가 생긴 이유" 문단으로 전체 파이프라인 비전(아이디어 → 필수기능 → 페이지/일관된 UI·UX → 유저 검토·반복) 명문화.
- 다음 단계: 테스트 프롬프트 2~3개를 사용자와 확인 후 with-skill/baseline 평가 진행.

## 2026-06-18 (3) — 평가 보류, 2단계 `ux-flow-design` 착수

- 사용자 피드백: 테스트 프롬프트 3개는 부족하다는 지적("프롬프트를 더 추가해야지, 너는 그럼 저거 3개의 기능으로 웹을 만들 수 있어?")에 따라 시나리오를 2개 더 추가(단일 판매자 이커머스, 게시글+댓글형 커뮤니티) — 총 5개로 도메인 편향(2-actor 매칭/예약형에 쏠려 있던 문제)을 줄임.
- 사용자의 더 근본적인 질문: "저 5개의 프롬프트가 있으면 웹 사이트를 하나 뚝딱 만들 수 있나? 에러 하나 없이? 로그인 로그아웃 등의 기본적인 페이지 구현 및 기능구현이 되는지도 궁금하고." 솔직하게 "아닙니다"로 답함 — `essential-feature-discovery`의 평가는 텍스트 출력(기능 지도)만 검증하고, 로드맵 2~7단계(`ux-flow-design`, `data-model-design`, `feature-logic-implementation`, `page-implementation`, `rendering-performance-strategy`, `deployment-release-readiness`)가 아직 전부 미작성 상태라 "아이디어 → 동작하는 웹사이트" 파이프라인이 구조적으로 미완성임을 표로 제시.
- 사용자 후속 질문 "지금 2~7번까지를 만들면 가능해지는건가?"에 대한 답: 2~7단계가 다 생기면 구조적 공백은 거의 채워지지만, 이 스킬들은 코드를 자동 생성하는 템플릿이 아니라 Claude가 매 프로젝트에서 코드를 쓸 때 따르는 의사결정 가이드이므로 "에러 0개"는 어떤 스킬로도 보장할 수 없고, 유저가 페이지를 하나씩 확인하며 Claude Code/Cowork로 고치는 리뷰 루프는 원래 비전에 포함된 의도된 마지막 단계임을 명확히 함.
- 사용자 결정: "에러 0개를 기대하는 게 아니다 — 지금 만든 스킬(0단계)을 저장하고 2단계부터 스킬 작업을 시작하자." `essential-feature-discovery`의 with-skill/baseline 평가 실행은 보류(추후 다른 단계들과 함께 일괄 진행 가능), evals.json은 그대로 보존.
- 2단계 `ux-flow-design` SKILL.md 초안 작성 완료. 입력은 `feature-scoping`의 유저 플로우 또는 `essential-feature-discovery`의 Tier 1 페이지 목록. 출력: 화면 목록(이름/목적/진입점), 화면 간 네비게이션 흐름(분기·뒤로가기·완료 후 이동 경로 포함), 화면별 구조(zone 단위, 시각 디자인 제외)와 로딩/빈/에러/권한없음 4가지 상태, 화면 간 일관성 규칙(주요 액션 위치/피드백 패턴/리스트·디테일 패턴 재사용), 화면별 필요 데이터(이름만, 스키마 설계는 제외 — `data-model-design`에 인계). `web-essentials-checklist`의 기본 화면(로그인/로그아웃/404/에러 바운더리)을 누락하지 않도록 명시적으로 확인하는 단계를 포함시켜, 사용자가 우려했던 "기본적인 로그인/로그아웃 페이지가 빠지는 문제"에 직접 대응.
- 다음 단계: 사용자 검토 후 3단계 `data-model-design` 착수.

## 2026-06-18 (4) — 3단계 `data-model-design` 착수

- 사용자가 `ux-flow-design` 초안을 검토하고 "진행하자"로 승인. 이어서 3단계 `data-model-design` SKILL.md 초안 작성.
- 핵심 순서: 컬럼을 먼저 설계하지 않고, 각 엔티티의 접근 모델(owner-only / shared-by-relationship / public-read·owner-write / admin-only)을 먼저 정한 뒤 거기서 RLS 정책(select/insert/update/delete, 평문 설명 → SQL 스케치)을 도출하도록 순서를 강제. 이 순서를 어기는 게 "RLS가 어렵게 느껴지는" 가장 흔한 원인이라고 명시.
- `service_role`을 정책 작성을 피하기 위한 수단으로 쓰지 않도록 — 진짜 백엔드 전용 작업(크론/관리자 도구/웹훅)에만 한정하고, 나머지는 전부 정책을 쓰게 함. 보안 우선 원칙(CLAUDE.md #4)과 연결해, 마이그레이션/시드 스크립트에 시크릿 값이 평문으로 남아있으면 조용히 지우지 말고 유출 의심으로 즉시 사용자에게 경고하도록 명시.
- N:N 관계는 조인 테이블로(2개의 nullable FK로 흉내내지 않기), 인덱스는 `ux-flow-design`에서 추적된 실제 쿼리 패턴에만, 마이그레이션은 한 번에 다 만드는 큰 스크립트 대신 작고 이름 붙은 되돌릴 수 있는 단계로 쪼개도록 함.
- `README.md` 로드맵 표에 반영.
- 다음 단계: 사용자 검토 후 4단계 `feature-logic-implementation` 착수.

## 2026-06-18 (5) — 4~8단계 일괄 작성, 0~8단계 로드맵 전체 초안 완성

- 사용자 지시: "4단계부터 남은 최종단계까지 쭉 진행해" — 검토 없이 연속으로 나머지 5개 스킬을 작성.
- `feature-logic-implementation` (4단계): Server Action vs Route Handler 선택 기준, entry point는 얇게 두고 실제 로직은 plain function으로 분리(테스트·재사용 가능하게), 클라이언트 검증은 UX 피드백일 뿐 서버 검증이 실제 보안 경계임을 명시, 앱 전체에서 통일된 `{success, data} | {success: false, error}` 형식의 반환값 하나로 고정, data-model-design에서 이미 설계한 상태/버전 컬럼을 이용한 race condition 처리(임시 락 발명 금지), 쓰기 후 `revalidatePath`/`revalidateTag` 트리거를 다음 단계에 명시적으로 인계.
- `page-implementation` (5단계): 라우트 그룹을 `(public)`/`(authenticated)`/`(admin)` 같은 접근권한 기준으로 나누고 `(dashboard)`/`(settings)` 같은 도메인 기준 명명을 금지(archived 스킬에서 확인된 실제 실패 패턴 재반영) — 서버 컴포넌트 기본, 클라이언트 경계는 leaf까지 최대한 내림, 컴포넌트는 라우트에 colocate 후 2번째 재사용 시에만 공유 폴더로 승격, ux-flow-design의 4가지 상태를 `loading.tsx`/`error.tsx`/명시적 빈 상태/권한없음 분기로 구현, 폼은 4단계의 통일된 반환 형식으로 연동.
- `rendering-performance-strategy` (6단계): 라우트별 SSG/ISR/SSR/CSR을 데이터 신선도 요구와 data-model-design의 접근 모델(공유·공개 데이터만 캐싱 후보, 개인화 데이터는 캐시 우회 또는 유저별 키 — 안 그러면 프라이버시 버그)로 결정, 느린 부분만 Suspense로 스트리밍, 독립적인 fetch는 병렬로(워터폴 방지), feature-logic-implementation의 revalidation 트리거를 실제로 연결.
- `deployment-release-readiness` (7단계): 환경변수를 public/secret으로 분류하고 환경별 실제 설정 여부 확인(시크릿이 `NEXT_PUBLIC_`로 새는 사고 방지), preview/production Supabase 프로젝트 분리 확인, 마이그레이션 순서·RLS·빌드·feature-scoping 성공 기준 기반 스모크 테스트 체크리스트, 마이그레이션이 이전 코드와 하위 호환되는지 확인해야 롤백이 실제로 안전한지 알 수 있다는 점 명시, 위험도 기반 전체배포/단계적배포 결정.
- `launch-growth-instrumentation` (8단계): feature-scoping의 성공 기준과 essential-feature-discovery의 핵심 동작에 직접 연결된 이벤트만 추적(무분별한 클릭 추적은 신호를 묻히게 함), 공개 라우트에만 SEO 메타데이터·인증 화면은 noindex, 기능 플래그는 제거 조건까지 함께 정의(플래그 부채 방지), 바이럴/공유 루프가 있다면 단계별로 계측.
- `README.md` 로드맵 표 4~8단계 전부 "초안 작성 (평가 보류)"로 갱신 — 0~8단계 전체 초안이 처음으로 완성됨.
- 평가는 전부 보류 상태. 다음 단계: 사용자가 8개 스킬 전체를 검토하거나, 하나의 아이디어를 0→8단계 전체로 통과시키는 end-to-end 스모크 테스트로 실제 동작 여부를 확인하는 방향을 논의.

## 2026-06-18 (6) — 작업 폴더를 실제 Mac 폴더로 이전, 독립 스킬 `visual-design-foundations` 추가

- 그동안 작업하던 폴더(`무제 폴더 3`)가 실제로는 사용자 Desktop에 연결되지 않은 샌드박스 전용 경로였음을 발견 — 사용자가 직접 만든 `Desktop/webdevskills` 폴더로 전체 내용 이전, `mcp__cowork__request_cowork_directory`로 연결 완료. 이후 모든 파일 작업은 표준 Read/Write/Edit 도구로 이 경로에서 직접 수행한다 (폴더명이 ASCII라 기존 유니코드 경로 버그도 같이 해소됨).
- 사용자가 0~8단계 전체 스킬의 세부 내용과 효과를 검토 후, "더 효율적이거나 디자이너블하거나 토큰을 줄일 수 있는 기능"을 제안 — 후보 4개(시각 디자인 토큰 단계, UI 라이브러리 한 번 선택 단계, 공유 컴포넌트 인벤토리 체크, 시크릿 스캐너 유틸 스크립트) 중 "시각 디자인 토큰 단계"와 "UI 라이브러리 한 번 선택 단계"를 선택.
- 두 후보를 별도 스킬로 쪼개지 않고 `visual-design-foundations` 독립 스킬 하나로 합쳐서 작성 — 실제로 같은 시점에 함께 결정되는 사안(예: shadcn/ui를 고르면 그 자체로 CSS 변수 기반 토큰 컨벤션이 따라옴)이라 인위적으로 나누지 않음. `web-essentials-checklist`와 같은 성격(8단계 라이프사이클과 무관, 프로젝트당 1회 실행)으로 위치시켜, 기존 0~8단계 번호를 재조정하지 않고 추가.
- 핵심 메커니즘: 기존 프로젝트에 이미 토큰/라이브러리가 있는지 먼저 확인 → UI 프리미티브 라이브러리(shadcn/ui·Radix·순수 Tailwind 등)를 컴포넌트 개수·소유권 선호·접근성 요구 같은 실제 신호로 한 번 결정 → 시맨틱 컬러(success/warning/danger/info) 포함 색상 토큰을 WCAG AA 대비 확인과 함께 결정 → 타이포/spacing/radius/shadow 컨벤션 결정 → `tailwind.config.*`/`globals.css`에 실제로 작성(번들된 템플릿 파일이 아니라 매 프로젝트마다 생성되는 실제 코드라는 점에서 CLAUDE.md 3번 규칙과 충돌하지 않음) → `ux-flow-design`/`page-implementation`에 토큰 참조를 인계.
- `README.md`의 "단계별 로드맵과 별개인 추가 스킬" 표에 추가.
- 다음 단계: 사용자 검토 후 테스트 프롬프트 작성 및 평가 진행 여부 결정.

## 2026-06-18 (7) — Claude Code 플러그인 마켓플레이스로 설치 가능하게 전환

- 사용자가 이 리포(`manabout-town/WebDevelopSkills`)를 GitHub에 직접 push 완료 후, Claude Code에서 설치하는 방법을 문의. 단순 스킬 폴더 복사 방식과 정식 플러그인 마켓플레이스 등록 방식 두 가지를 제시했고, 사용자가 마켓플레이스 등록 방식을 선택.
- `.claude-plugin/marketplace.json` 신규 추가 — 마켓플레이스 이름 `web-dev-skills-marketplace`, owner `manabout-town`, 기존 `.claude-plugin/plugin.json`(이름 `web-dev-skills`, 버전 `0.1.0`)을 `source: "./"`로 가리키는 단일 플러그인 엔트리 등록 (리포 루트를 마켓플레이스 루트로 쓰는 구조라 별도 서브디렉토리 분리 없이 동일 위치 재사용).
- 설치 명령: `/plugin marketplace add manabout-town/WebDevelopSkills` → `/plugin install web-dev-skills@web-dev-skills-marketplace` → `/reload-plugins`.
