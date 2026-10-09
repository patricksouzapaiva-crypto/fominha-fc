-- Opcional. O duelo ao vivo funciona só com Realtime (broadcast + presence).
-- Esta tabela guarda o estado pra quem chega na final primeiro e precisa
-- recarregar a página ou trocar de rede. Cole no SQL Editor do Supabase.

create table if not exists public.duels (
  id text primary key check (id ~ '^[A-Z0-9]{4,12}$'),
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.duels enable row level security;

grant select, insert, update on public.duels to anon, authenticated;

drop policy if exists duels_select on public.duels;
create policy duels_select on public.duels
  for select to anon, authenticated
  using (id ~ '^[A-Z0-9]{4,12}$');

drop policy if exists duels_insert on public.duels;
create policy duels_insert on public.duels
  for insert to anon, authenticated
  with check (id ~ '^[A-Z0-9]{4,12}$');

drop policy if exists duels_update on public.duels;
create policy duels_update on public.duels
  for update to anon, authenticated
  using (id ~ '^[A-Z0-9]{4,12}$')
  with check (id ~ '^[A-Z0-9]{4,12}$');

do $$
begin
  alter publication supabase_realtime add table public.duels;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
