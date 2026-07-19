-- Supabase database migration for documents and document shares

create extension if not exists pgcrypto;

-- Documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled Document',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Document shares table
create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null check (permission in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  unique (document_id, user_id)
);

create index if not exists documents_owner_id_idx on public.documents (owner_id);
create index if not exists documents_updated_at_idx on public.documents (updated_at desc);
create index if not exists document_shares_user_id_idx on public.document_shares (user_id);
create index if not exists document_shares_document_id_idx on public.document_shares (document_id);

-- Updated_at trigger helper for documents
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- Row Level Security

-- Helper functions to avoid recursive RLS checks
create or replace function public.is_document_owner(doc_id uuid)
returns boolean
security definer
language sql as $$
  select exists(
    select 1 from public.documents where id = doc_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_document_shared(doc_id uuid)
returns boolean
security definer
language sql as $$
  select exists(
    select 1 from public.document_shares where document_id = doc_id and user_id = auth.uid()
  );
$$;

alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

drop policy if exists "documents_select_own_or_shared" on public.documents;
create policy "documents_select_own_or_shared"
  on public.documents
  for select
  using (
    owner_id = auth.uid() or public.is_document_shared(id)
  );

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents
  for insert
  with check (owner_id = auth.uid());

drop policy if exists "documents_update_owner" on public.documents;
create policy "documents_update_owner"
  on public.documents
  for update
  using (owner_id = auth.uid());

drop policy if exists "documents_update_shared_editor" on public.documents;
create policy "documents_update_shared_editor"
  on public.documents
  for update
  using (
    (
      public.is_document_owner(id)
    ) or (
      -- allow if shared with editor permission
      exists (
        select 1 from public.document_shares where document_shares.document_id = documents.id and document_shares.user_id = auth.uid() and document_shares.permission = 'editor'
      )
    )
  );

drop policy if exists "documents_delete_owner" on public.documents;
create policy "documents_delete_owner"
  on public.documents
  for delete
  using (owner_id = auth.uid());

drop policy if exists "document_shares_select" on public.document_shares;
create policy "document_shares_select"
  on public.document_shares
  for select
  using (
    user_id = auth.uid() or public.is_document_owner(document_id)
  );

drop policy if exists "document_shares_insert_owner" on public.document_shares;
create policy "document_shares_insert_owner"
  on public.document_shares
  for insert
  with check (public.is_document_owner(document_id));

drop policy if exists "document_shares_update_owner" on public.document_shares;
create policy "document_shares_update_owner"
  on public.document_shares
  for update
  using (public.is_document_owner(document_id));

drop policy if exists "document_shares_delete_owner" on public.document_shares;
create policy "document_shares_delete_owner"
  on public.document_shares
  for delete
  using (public.is_document_owner(document_id));

-- Normalize legacy empty-object defaults to Tiptap JSON
update public.documents
set content = '{"type":"doc","content":[]}'::jsonb
where content = '{}'::jsonb;

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
