-- 3. Documentos del expediente (fotos y PDF): bucket privado, una carpeta por dueño.
-- Los archivos se comparten con enlaces firmados que vencen a los 7 días.
insert into storage.buckets (id, name, public, file_size_limit)
values ('expediente', 'expediente', false, 15728640)
on conflict (id) do update set public = false, file_size_limit = 15728640;

drop policy if exists "Cada dueño ve sus documentos" on storage.objects;
create policy "Cada dueño ve sus documentos" on storage.objects
  for select to authenticated
  using (bucket_id = 'expediente' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Cada dueño sube sus documentos" on storage.objects;
create policy "Cada dueño sube sus documentos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expediente' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Cada dueño cambia sus documentos" on storage.objects;
create policy "Cada dueño cambia sus documentos" on storage.objects
  for update to authenticated
  using (bucket_id = 'expediente' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'expediente' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Cada dueño borra sus documentos" on storage.objects;
create policy "Cada dueño borra sus documentos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expediente' and (storage.foldername(name))[1] = (select auth.uid())::text);
