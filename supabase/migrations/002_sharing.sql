-- View to expose auth.users safely to the public schema for user lookup
create or replace view public.users as
select
  id,
  email,
  coalesce(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ) as name
from auth.users;

-- Grant select permission to authenticated users so they can perform sharing search, and to service_role
grant select on public.users to authenticated;
grant select on public.users to service_role;
