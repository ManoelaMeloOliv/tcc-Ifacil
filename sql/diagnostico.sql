-- ============================================================
-- DIAGNÓSTICO DO BANCO — iFácil
-- Cole no Supabase > SQL Editor e rode. Me manda o resultado.
-- Não altera nada, só lê metadados.
-- ============================================================

-- 1) Tabelas e se o RLS está LIGADO em cada uma
select
  c.relname                as tabela,
  c.relrowsecurity         as rls_ligado,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as qtd_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- 2) Policies que já existem
select tablename, policyname, cmd, roles::text, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Colunas de cada tabela (pra eu conferir os nomes)
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 4) Views e suas opcoes
--    Se a coluna "opcoes" nao mostrar security_invoker=true, a view roda como
--    o DONO dela e IGNORA o RLS das tabelas de baixo (ou seja: vaza dado).
select
  c.relname as view_name,
  coalesce(array_to_string(c.reloptions, ', '), '(nenhuma) -> ignora RLS') as opcoes
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
order by c.relname;

-- 5) Código das funções (inclui verificar_login_admin)
select
  p.proname                                   as funcao,
  case when p.prosecdef then 'DEFINER' else 'INVOKER' end as seguranca,
  pg_get_functiondef(p.oid)                   as codigo
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public';

-- 6) Extensões instaladas (pgcrypto = senha com hash)
select extname from pg_extension order by extname;
