> **2026-06-17 업데이트**: 이 문서는 최초 기획 당시(기능 도메인 기준 9단계 로드맵)의 기록이며, 이후 사용자 피드백에 따라 **개발 단계 기준 8단계 로드맵**으로 전면 재구성되었습니다. 최신 로드맵은 [`README.md`](./README.md), 최신 원칙은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요. 아래 내용은 화물로 관련 배경 설명과 보안 이슈 기록 등 여전히 유효한 참고 자료를 포함하므로 삭제하지 않고 남겨둡니다.

---

# 범용 웹 개발 스킬 모음집 — 프로젝트 브리프

> 이 문서는 Claude.ai에서 진행한 기획 대화를 Claude Cowork로 이어가기 위한 컨텍스트 문서입니다.
> Cowork에서 이 폴더를 열고 이 문서를 먼저 읽은 뒤, 사용자와 함께 다음 스킬부터 이어서 작업해주세요.

## 목표

manabout-town님은 Next.js + Supabase 스택으로 여러 웹 서비스(화물 물류 플랫폼 "화물로", Betman 클론, Kmong 클론 등)를 동시에 개발하고 있습니다. 매 프로젝트마다 인증, DB 설계, 결제, 폴더 구조 같은 동일한 작업을 반복하고 있어서, 이를 **Claude Code에서 재사용 가능한 스킬 모음집**으로 만들고자 합니다.

## 핵심 설계 원칙 (중요 — 절대 어긋나면 안 되는 전제)

1. **범용 레이어 스킬이다, 특정 앱 전용이 아니다.** 화물로는 참고 사례 중 하나일 뿐입니다. 화물로의 구체적인 비즈니스 로직(화물 매칭, 입찰, 배차)을 그대로 일반화하지 않습니다. 마켓플레이스든 블로그든 SaaS든 적용되는 "기술 레이어" 단위로 스킬을 만듭니다.
2. **여러 개의 작은 스킬로 모듈화한다.** 하나의 거대한 스킬이 아니라, 필요할 때마다 조합해서 쓸 수 있는 레이어별 스킬 세트입니다.
3. **마켓플레이스 특화 로직(에스크로, 매칭, 입찰 등)은 이 스킬 모음집의 범위 밖입니다.** 필요하면 나중에 별도의 "스킬트리"로 분리해서 만듭니다.
4. **사용자는 본인 1명, Claude Code 개인용입니다.** 팀 공유 목적이 아닙니다.
5. **워킹 템플릿 파일을 만들지 않습니다.** SKILL.md 본문에 코드 예시만 작성하고, Claude가 실제 프로젝트 상황에 맞게 코드를 생성하게 합니다. (단, 인증 스킬의 0단계처럼 "역할 0개부터 N개까지" 유연하게 대응해야 하는 경우는 SKILL.md 안에서 분기 설명으로 다룹니다.)

## 전체 스킬 목차 (9단계 + 확장 후보)

웹 개발을 9단계로 나누고, 각 단계에 대응하는 스킬을 매핑했습니다.

### 필수 레이어 (스킬화 대상)
| 단계 | 레이어 | 스킬 이름(가제) | 상태 |
|---|---|---|---|
| 2 | DB 설계 | `db-schema-design` | 미작성 |
| 3 | 인증/권한 | `nextjs-supabase-auth` | **초안 완료** (아래 참고) |
| 5 | 결제/정산 | `payment-integration` | 미작성 |
| 6 | 파일/서류 업로드 | `file-upload-validation` | 미작성 |
| 7 | UI/UX 웹디자인 | `ui-design-system` | 미작성 |
| 8 | 폴더 구조/코딩 컨벤션 | `project-structure-convention` | 미작성 (**우선순위 2순위**) |
| 9 | 배포/인프라 안전 | `deploy-secrets-safety` | 미작성 |

### 스킬화 대상 아님 (프로젝트마다 다르거나 보안상 부적합)
- 1단계 기획/요구사항 정의 — 프로젝트마다 고유
- 4단계 핵심 기능 구현 — 서비스 고유 도메인 로직

### 확장 후보 (있으면 실용적, 나중에 추가)
- 실시간 기능 (`realtime-features`) — WebSocket/Supabase Realtime 채팅·알림
- 검색/필터링 (`search-filter-patterns`)
- 폼 검증 (`form-validation`)
- 에러 핸들링/로깅 (`error-handling-logging`)
- SEO/메타데이터 (`seo-metadata`)
- 알림 시스템 (`notification-system`)
- (테스트 전략은 이미 `engineering:testing-strategy` 플러그인이 존재하므로 새로 만들 필요 없음 — 단, Claude Code 환경엔 플러그인이 기본 설치되어 있지 않을 수 있으니 필요시 별도 확인)

## 우선순위

1순위: **인증/권한** (`nextjs-supabase-auth`) — 초안 완료
2순위: **폴더 구조/코딩 컨벤션** (`project-structure-convention`) — 다음 작업 대상

이후 순서는 DB 설계 → 결제 → 파일 업로드 → UI/UX → 배포 안전 순으로 진행 예정이나, 사용자가 원하면 순서를 바꿔도 됩니다.

## 인증/권한 스킬 설계 시 확정된 결정들

- 기술 스택: Next.js + Supabase Auth로 고정 (NextAuth/Clerk 등 다른 provider는 범위 밖)
- 역할 구조: **0개(로그인 여부만 구분)부터 N개(다중 역할 분기)까지 모두 커버**해야 함. 역할이 없는 단순 서비스도 첫 번째 분기 대상으로 명시했습니다.
- 산출물: 미들웨어 라우트 보호 + RLS 정책(이중 방어선) + client/server/service 세 가지 Supabase 클라이언트 분리 + 역할별 온보딩/분기 + (필요시) 역할별 자격 검증 플래그
- 폰업데이션(온보딩 처리) 방식: Server Action, API Route 등 상황에 맞게 제안하는 방식으로, 한 가지로 고정하지 않음
- 화물로 코드(미들웨어, onboarding Server Action, types/index.ts)를 실제로 살펴보고 패턴을 참고했으나, 화물로 특유의 역할명(shipper/driver)이나 도메인 로직은 일반화된 이름(provider/requester)으로 추상화했습니다.

`nextjs-supabase-auth/SKILL.md` 파일이 이 폴더에 포함되어 있습니다 — 전체 내용을 그대로 이어서 검토/수정하면 됩니다. 아직 사용자 피드백을 받기 전 초안 단계이며, skill-creator 워크플로우상 다음 단계는 테스트 프롬프트 2~3개를 만들어 실제로 돌려보고 검증하는 것입니다.

## 화물로 프로젝트에서 발견된 중요 보안 이슈 (참고용 — 이미 조치됨)

화물로 깃 저장소(public)를 분석하던 중, `final_deploy.command` 및 기타 `.command` 배포 스크립트와 `SETUP.md`에 Supabase **service_role 키**(RLS를 완전히 우회하는 관리자급 키)와 Toss 테스트 시크릿 키가 평문으로 커밋되어 있는 것을 발견했습니다. 사용자가 즉시 Supabase 대시보드에서 키를 재발급(rotate)하여 조치를 완료했습니다.

이 사건은 **`deploy-secrets-safety` 스킬과 `nextjs-supabase-auth` 스킬 양쪽에 반영**되어야 합니다 — "민감 키는 절대 코드/문서/배포 스크립트에 평문으로 남기지 않는다"는 원칙이 `nextjs-supabase-auth/SKILL.md`의 1단계(클라이언트 분리)에 이미 한 줄 반영되어 있습니다. 배포 스킬을 만들 때 이 사례를 구체적인 체크리스트 항목으로 확장하면 좋습니다.

## 참고용: 화물로 프로젝트 구조 요약 (스킬 일반화의 출발점이었던 실제 사례)

화물로는 화주(shipper)/기사(driver)/관리자(admin) 3개 역할의 화물 운송 마켓플레이스입니다. 참고했던 패턴:
- Route groups로 역할별 영역 분리: `app/(shipper)/`, `app/(driver)/`, `app/admin/`
- `app/actions/`에 도메인별 Server Action 파일 분리 (`onboarding.ts`, `wallet.ts`, `bids.ts` 등)
- `lib/supabase/{client,server,service}.ts` 3분할
- 가입 → role 미설정 시 `/onboarding` 강제 → role별 프로필 테이블(`driver_profiles`, `shipper_profiles`) upsert → role별 대시보드 리다이렉트
- 미들웨어에서 `users` 테이블 조회로 role 확인 후 분기

이 구조 자체(화주/기사라는 이름)는 스킬에 그대로 들어가지 않으며, "역할별 route group + 역할별 프로필 테이블 + 온보딩 강제 분기"라는 패턴만 추상화해서 반영했습니다.

## 다음에 할 일 (Cowork에서 이어갈 작업)

1. `nextjs-supabase-auth/SKILL.md` 초안을 사용자와 함께 검토 (길이, 누락 사항, 화물로 실제 경험과의 정합성)
2. skill-creator 워크플로우대로 테스트 프롬프트 2~3개 작성 → with-skill/baseline 비교 실행 → 피드백 반영
3. 폴더 구조/코딩 컨벤션 스킬(`project-structure-convention`) 착수
4. 이후 DB 설계 → 결제 → 파일 업로드 → UI/UX → 배포 안전 순으로 진행
