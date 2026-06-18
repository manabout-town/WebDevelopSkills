-- 초기 스키마 예시: profiles 테이블에 role 컬럼을 두어
-- 운영자(admin) 여부를 구분합니다.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "사용자는 자신의 프로필을 읽을 수 있음"
  on public.profiles for select
  using (auth.uid() = id);
