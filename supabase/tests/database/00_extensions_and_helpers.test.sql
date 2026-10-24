begin;
select plan(5);

select has_extension('extensions', 'postgis', 'PostGIS está instalado');
select has_extension('extensions', 'vector', 'pgvector está instalado');
select has_function('public', 'set_updated_at', array[]::text[], 'existe set_updated_at()');

-- set_updated_at cambia updated_at en cada update.
create temp table probe (id int primary key, updated_at timestamptz not null default '2000-01-01');
create trigger probe_updated_at before update on probe
  for each row execute function public.set_updated_at();

insert into probe (id) values (1);
select is((select updated_at from probe where id = 1), '2000-01-01'::timestamptz, 'el insert no toca updated_at');

update probe set id = 1 where id = 1;
select ok((select updated_at from probe where id = 1) > '2000-01-01'::timestamptz, 'el update actualiza updated_at');

select * from finish();
rollback;
