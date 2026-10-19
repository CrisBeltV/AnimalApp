-- Animaapp: tablas de la nube.
-- Cómo usarlo: en Supabase abre "SQL Editor", toca "New query",
-- pega todo este archivo y toca "Run". Solo se hace una vez.

-- 1. Copia de los datos de cada dueño (su mascota, registros, logros).
create table if not exists public.app_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;

-- Cada dueño solo puede ver y cambiar su propia copia.
drop policy if exists "Cada dueño ve sus datos" on public.app_data;
create policy "Cada dueño ve sus datos" on public.app_data
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2. Reportes de mascotas perdidas y encontradas, compartidos entre dueños.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('perdida', 'encontrada')),
  pet_name text not null,
  species text not null check (species in ('perro', 'gato')),
  description text not null default '',
  place text not null default '',
  note text,
  with_me boolean,
  lat double precision, -- para el radio de 2 km (siguiente paso)
  lng double precision,
  closed boolean not null default false, -- true cuando la mascota volvió a casa
  created_at timestamptz not null default now()
);

create index if not exists reports_open_recent on public.reports (closed, created_at desc);

alter table public.reports enable row level security;

-- Cualquier dueño con cuenta ve los reportes; nunca se muestra su correo ni su teléfono.
drop policy if exists "Los dueños ven los reportes" on public.reports;
create policy "Los dueños ven los reportes" on public.reports
  for select to authenticated
  using (true);

drop policy if exists "Cada dueño publica sus reportes" on public.reports;
create policy "Cada dueño publica sus reportes" on public.reports
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Cada dueño cambia sus reportes" on public.reports;
create policy "Cada dueño cambia sus reportes" on public.reports
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Cada dueño borra sus reportes" on public.reports;
create policy "Cada dueño borra sus reportes" on public.reports
  for delete to authenticated
  using ((select auth.uid()) = user_id);
