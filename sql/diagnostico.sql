select
  c.relname                as tabela,
  c.relrowsecurity         as rls_ligado,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as qtd_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select tablename, policyname, cmd, roles::text, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

select
  c.relname as view_name,
  coalesce(array_to_string(c.reloptions, ', '), '(nenhuma) -> ignora RLS') as opcoes
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
order by c.relname;

select
  p.proname                                   as funcao,
  case when p.prosecdef then 'DEFINER' else 'INVOKER' end as seguranca,
  pg_get_functiondef(p.oid)                   as codigo
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public';

select extname from pg_extension order by extname;
