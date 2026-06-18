# 설계 요약 — 개인 블로그 SaaS (역할 0개)

## 적용한 범위

스킬의 0단계 질문("역할이 몇 개인가?")에 따라 이 앱은 **역할 0개** — 로그인 여부만
구분하면 되는 케이스로 분류했다. 그래서 스킬의 1~3단계(클라이언트 분리, 미들웨어
라우트 보호, 서버 측 재검증)까지만 적용하고, 4단계(콜백 라우트/로그아웃)는 향후
확장을 고려해 가볍게만 포함했다. **5단계(회원가입→온보딩→역할 분기)와 6단계
(역할별 자격 검증)는 의도적으로 완전히 건너뛰었다.**

## 만든 파일

- `lib/supabase/client.ts`, `server.ts`, `middleware.ts` — 스킬이 권장하는 3종 분리.
  **`service.ts`(service_role 클라이언트)는 만들지 않았다.** 이 앱에는 "사용자
  권한으로는 할 수 없고 시스템이 대신 해야 하는 작업"이 없기 때문이다(온보딩 시
  역할별 프로필 생성, 배치 정산 같은 것이 없음). 안 쓰는 service_role 클라이언트를
  미리 만들어두면 나중에 누군가 "있으니까 쓰자"는 식으로 RLS를 우회하는 코드를
  습관적으로 끼워넣는 계기가 될 수 있어, 필요해지기 전까지는 아예 존재하지 않게 했다.
- `middleware.ts` — 로그인 여부만 검사. `/write`와 그 하위 경로만 보호 대상으로 지정.
  role 조회 쿼리, role→대시보드 분기 같은 코드는 전혀 없다. 이미 로그인한 사용자가
  `/login`, `/signup`에 다시 들어오면 단순히 홈으로 보낸다(역할별 대시보드가 없으므로
  보낼 곳이 "홈" 하나뿐).
- `app/auth/callback/route.ts` — 매직 링크/OAuth용 code-exchange 라우트. 지금은
  이메일+비밀번호만 쓰지만, 나중에 구글 로그인 등을 추가할 가능성이 있어 미리
  넣어뒀다(스킬 4단계 권장). 비용이 거의 없는 파일 하나이므로 과한 선반영은 아니라고
  판단했다.
- `lib/actions/auth.ts` — login/signup/logout Server Action. 로그아웃은 클라이언트
  `signOut()`만 호출하지 않고 서버에서 세션을 지운다(스킬 권장사항). signup 성공 후
  role 입력이나 온보딩으로 보내지 않고, 그냥 이메일 확인 안내 후 로그인 페이지로
  보낸다 — 가입과 동시에 "이미 다 가입 완료"이기 때문이다.
- `lib/actions/posts.ts` — 글 작성 Server Action. 미들웨어를 한 번 더 믿지 않고
  `getUser()`로 로그인 여부를 재검증한다. **여기서도 role 체크는 없다** — "로그인
  했는가"가 유일한 조건. insert 시 `author_id`를 명시적으로 `user.id`로 고정해서,
  RLS의 `auth.uid() = author_id` 정책과 이중으로 맞물리게 했다.
- `app/write/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx` — 페이지는
  단일 폼만 가진 가장 단순한 형태. route group으로 역할별 폴더를 나누는 구조
  (`(provider)/`, `(requester)/` 등)는 적용하지 않았다 — 분리할 역할 자체가 없다.
- `components/SiteHeader.tsx` — 로그인 상태에 따라 "글쓰기/로그아웃" vs "로그인"
  단 두 가지로만 분기. role에 따른 메뉴 분기는 없다.
- `supabase/migrations/0001_posts_rls.sql` — `posts` 테이블 RLS. select는 전체
  공개(블로그니까 누구나 읽어야 함), insert/update/delete는 `auth.uid() = author_id`
  하나의 조건만 사용. role을 참조하는 정책(`exists (select 1 from users where
  role = ...)`)은 전혀 없다 — `users`/`profiles` 테이블 자체를 만들지 않았다
  (auth.users만으로 충분).
- `.env.local.example` — `SUPABASE_SERVICE_ROLE_KEY`는 주석으로 "지금은 안 씀"이라고
  명시하고 변수 자체를 적지 않았다. 비밀번호/키를 코드에 평문으로 남기지 않는다는
  스킬의 원칙을 따른 것.

## 의도적으로 만들지 않은 것 (과설계 방지 체크)

- `role` 컬럼, `users`/`profiles` 테이블 — 만들지 않음. 모든 사용자가 동일한 권한이고
  앱에 "글쓴이"라는 구분 자체가 `auth.users.id`만으로 충분히 표현되기 때문.
- `/onboarding` 페이지 — 만들지 않음. 가입 즉시 사용 가능한 상태이고 추가로 받아야
  할 정보(사업자등록증, 역할 선택 등)가 없음.
- `service.ts` (service_role 클라이언트) — 만들지 않음. 위에서 설명.
- route groups (`(admin)/`, `(provider)/` 등) — 만들지 않음. 보호 대상이 `/write`
  하나뿐이라 미들웨어의 path 문자열 체크로 충분하고, 폴더 구조를 나눌 만큼의
  복잡도가 없음.
- role 기반 RLS 정책(`exists (select ... where role = 'admin')` 같은 패턴) — 만들지
  않음. 모든 로그인 사용자가 동일 권한이므로 `auth.uid() = author_id` 하나로 충분.
- pending_role / 역할 승급 플로우 — 해당 없음.

## 결론

스킬의 0단계 가이드("역할이 없는 서비스에 role 컬럼과 분기 로직을 미리 깔아두는 건
나중에 걷어내야 할 복잡도를 미리 만드는 것")를 그대로 따라, role/온보딩/서류 검증
관련 코드를 전혀 추가하지 않았다. 동시에 스킬이 "역할이 없어도 반드시 챙겨야 한다"고
강조하는 부분(미들웨어의 토큰 갱신 쿠키 처리, 미들웨어만 믿지 않는 서버 측 재검증,
RLS, 서버에서 처리하는 로그아웃)은 빠짐없이 반영했다. 즉 "단순화"와 "보안 경계
누락"을 구분해서, 후자는 절대 단순화 대상으로 삼지 않았다.
