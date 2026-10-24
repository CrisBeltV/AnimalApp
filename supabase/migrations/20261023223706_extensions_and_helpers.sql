-- Fase 0: extensiones y funciones base. Todas las tablas siguientes dependen de esto.

-- Geografía (ubicación, radios, parques) y vectores (match visual, fase 6).
-- Van en el esquema "extensions" para no ensuciar "public".
create extension if not exists postgis with schema extensions;
create extension if not exists vector with schema extensions;

-- Mantiene updated_at al día. Se engancha a cada tabla con un trigger "before update".
-- search_path vacío: la función no puede ser engañada por objetos con el mismo nombre en otro esquema.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
