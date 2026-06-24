# WebDevelopSkills

> Next.js + Supabase 스택, 개발 단계별 Claude Code 스킬 모음집

[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-5B4FE9)](https://claude.ai/code)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-RLS%20First-3ECF8E?logo=supabase)](https://supabase.com)

---

## 개요

`WebDevelopSkills`는 Next.js + Supabase 스택으로 웹 서비스를 구축할 때 **개발 단계별로 반복되는 작업 패턴을 스킬로 추상화**한 Claude Code 플러그인이다.

인증이든 결제든 채팅이든, 기능 도메인에 관계없이 기획 → 디자인 → 데이터 모델링 → 기능 구현 → 페이지 구현 → 렌더링 → 배포 → 계측이라는 **동일한 단계**를 반복한다. 각 단계에서 일반화 가능한 패턴만을 스킬로 정의한다.

---

## 설치

```bash
# Claude Code 플러그인으로 설치
/plugin install /path/to/WebDevelopSkills
```

또는 `skills/` 하위 폴더를 `~/.claude/skills/`에 직접 복사해 개별 스킬로 사용한다.

---

## 스킬 로드맵 (9단계)

| # | 단계 | 스킬 | 상태 |
|---|------|------|------|
| 0 | 아이디어 → 필수 기능 | `essential-feature-discovery` | ✅ 완료 |
| 1 | 기획 | `feature-scoping` | ✅ 완료 |
| 2 | 디자인 | `ux-flow-design` | 🔄 초안 |
| 3 | 데이터 모델링 | `data-model-design` | 🔄 초안 |
| 4 | 기능 구현 | `feature-logic-implementation` | 🔄 초안 |
| 5 | 페이지 구현 | `page-implementation` | 🔄 초안 |
| 6 | 렌더링 전략 | `rendering-performance-strategy` | 🔄 초안 |
| 7 | 배포 | `deployment-release-readiness` | 🔄 초안 |
| 8 | 마케팅/계측 | `launch-growth-instrumentation` | 🔄 초안 |

### 단계별 스킬 요약

**`essential-feature-discovery` (0단계)**
아이디어를 Essential(v1 필수) / Important(v1 직후) / Nice-to-have(보류) 3티어로 분류. "이 기능 없이도 핵심 동작이 끝까지 되는가" removal test로 판정.

**`feature-scoping` (1단계)**
기능 하나를 문제 정의 → 유저 플로우 → MVP 컷라인 → 성공 기준으로 명확화.

**`ux-flow-design` (2단계)**
화면 목록, 네비게이션 흐름, 각 화면의 로딩/빈/에러/권한없음 4가지 상태를 코드 작성 전에 정의.

**`data-model-design` (3단계)**
접근 모델(누가 읽고 쓰는가) → RLS 정책(select/insert/update/delete) 도출. N:N은 조인 테이블, 인덱스는 추적된 쿼리 패턴에만 적용.

**`feature-logic-implementation` (4단계)**
Server Action vs Route Handler 선택 기준, entry point 경량화, 클라이언트/서버 검증 역할 분리, 통일된 성공/에러 반환 형식.

**`page-implementation` (5단계)**
라우트 그룹은 도메인이 아닌 접근 권한 기준(public/authenticated/admin)으로 분리. 서버 컴포넌트가 기본, 클라이언트 경계는 leaf까지 내림.

**`rendering-performance-strategy` (6단계)**
라우트별 렌더링 모드 결정(공유/공개 데이터만 캐시), Suspense 스트리밍, 병렬 fetch로 워터폴 방지.

**`deployment-release-readiness` (7단계)**
환경변수 public/secret 분류, preview/production Supabase 프로젝트 분리, 배포 전 마이그레이션·RLS·빌드 체크.

**`launch-growth-instrumentation` (8단계)**
성공 기준과 직결된 이벤트만 추적, 공개 라우트만 SEO 메타데이터, 기능 플래그는 제거 조건까지 함께 정의.

---

## 단계별 로드맵 외 추가 스킬

| 스킬 | 설명 |
|------|------|
| `web-essentials-checklist` | 파비콘/PWA, 반응형, 접근성, 보안 헤더, 레이트리밋, SEO, 에러/404 페이지 등 웹앱 필수 항목 체크리스트 |
| `visual-design-foundations` | UI 라이브러리 선택 + 디자인 토큰(색상/타이포/spacing) 결정 → `tailwind.config.*` / `globals.css` 작성 |

---

## 핵심 설계 원칙

1. **범용 레이어** — 특정 서비스의 클론이 아님. 어떤 기능(인증/결제/채팅)에도 적용 가능한 일반화된 패턴만 포함
2. **단계 기준 모듈화** — 기능 도메인이 아니라 개발 단계 기준으로 스킬을 분리
3. **코드는 예시** — SKILL.md에 실제 동작 파일을 두지 않음. 코드는 매 프로젝트마다 Claude가 새로 생성
4. **보안 우선** — 민감한 키를 코드/문서/배포 스크립트에 평문으로 남기지 않음
5. **언어 규칙** — SKILL.md 본문은 영문, 그 외 문서와 채팅은 한글

---

## 디렉터리 구조

```
WebDevelopSkills/
├── skills/
│   ├── essential-feature-discovery/
│   ├── feature-scoping/
│   ├── ux-flow-design/
│   ├── data-model-design/
│   ├── feature-logic-implementation/
│   ├── page-implementation/
│   ├── rendering-performance-strategy/
│   ├── deployment-release-readiness/
│   ├── launch-growth-instrumentation/
│   ├── web-essentials-checklist/
│   └── visual-design-foundations/
├── PROJECT_BRIEF.md      # 설계 배경 및 원칙
├── CLAUDE.md             # Claude Code 준수 규칙
└── CHANGELOG.md          # 스킬 평가 이력
```

---

## 설계 배경

기능 도메인(인증/결제/채팅) 단위로 스킬을 나누면 "로그인 스킬", "결제 스킬"처럼 기능이 바뀔 때마다 스킬을 새로 만들어야 한다. 반면 **개발 단계** 단위로 나누면 어떤 기능이든 동일한 8단계 파이프라인을 통과하므로 스킬이 범용적으로 재사용된다.

아이디어 → `essential-feature-discovery` → `feature-scoping` → `ux-flow-design` → ... → `launch-growth-instrumentation`의 파이프라인을 따르면, 아이디어만 던져도 필수 기능 목록 → 페이지 목록과 일관된 UX → 실제 구현까지 이어지는 개발 흐름이 완성된다.

이전 v1 도메인 기반 스킬은 `skills/_archived-v1-domain-based/`에 보관되어 있다.

---

## 라이선스

MIT
