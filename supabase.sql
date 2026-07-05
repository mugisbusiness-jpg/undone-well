-- Undone Well — run this once in Supabase SQL Editor

create table if not exists public.site_config (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Lock the table down; the API uses the service key which bypasses RLS.
alter table public.site_config enable row level security;
