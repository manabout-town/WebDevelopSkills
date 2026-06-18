-- posts 테이블 + RLS 정책.
-- 미들웨어는 1차 방어선일 뿐이고, 진짜 보안 경계는 여기(RLS)다.
-- 미들웨어가 어떤 이유로든 우회되어도, 직접 API/DB 호출로는 여전히
-- "본인 글만 쓰고 고칠 수 있다"는 규칙이 지켜져야 한다.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;

-- 누구나(로그인 여부 무관) 글을 읽을 수 있다 — 공개 블로그이므로.
create policy "posts_select_public"
  on posts for select
  using (true);

-- 로그인한 사용자만 글을 작성할 수 있고, author_id는 반드시 자기 자신이어야 한다.
-- 역할이 없으므로 "로그인했는가" 외의 조건은 없다.
create policy "posts_insert_own"
  on posts for insert
  with check (auth.uid() = author_id);

-- 본인 글만 수정 가능.
create policy "posts_update_own"
  on posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 본인 글만 삭제 가능.
create policy "posts_delete_own"
  on posts for delete
  using (auth.uid() = author_id);
