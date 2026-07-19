-- Add signup attempt tracking for rate limiting

create table if not exists public.signup_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists signup_attempts_ip_created_at_idx on public.signup_attempts (ip, created_at desc);
