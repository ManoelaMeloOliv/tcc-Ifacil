-- ============================================================
-- RLS — iFácil
-- Cole no Supabase > SQL Editor e rode INTEIRO, de uma vez.
-- Pode rodar mais de uma vez sem problema (é idempotente).
--
-- MODELO DE ACESSO:
--   anon          (visitante, sem login) -> não enxerga NADA
--   authenticated (admin logado)         -> lê e escreve tudo
--
-- Isso vale porque no iFácil só existe um tipo de conta: administrador.
-- Se um dia alunos/responsáveis também tiverem login, este arquivo precisa
-- ser revisto — senão eles herdariam acesso total.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Liga o RLS em todas as tabelas do schema public
-- ------------------------------------------------------------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format('alter table public.%I enable row level security', t.relname);
    raise notice 'RLS ligado: %', t.relname;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2) Uma policy por tabela: só admin logado entra
--    Sem policy pro papel anon => visitante não lê nem uma linha.
-- ------------------------------------------------------------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format('drop policy if exists admin_acesso_total on public.%I', t.relname);
    execute format(
      'create policy admin_acesso_total on public.%I
         for all to authenticated using (true) with check (true)',
      t.relname
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- 3) Views: forçar SECURITY INVOKER
--    Por padrão uma view roda com os poderes de QUEM A CRIOU, ignorando o RLS
--    das tabelas de baixo. Sem esta etapa, vw_historico_atendimentos entregaria
--    os telefones mesmo com o RLS ligado nas tabelas.
-- ------------------------------------------------------------
do $$
declare v record;
begin
  for v in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'v'
  loop
    execute format('alter view public.%I set (security_invoker = true)', v.relname);
    raise notice 'security_invoker ligado: %', v.relname;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 4) Permissões de tabela (camada anterior ao RLS)
--    RLS filtra linhas; GRANT decide se o papel chega na tabela.
--    Fechamos o anon aqui também — defesa em profundidade.
-- ------------------------------------------------------------
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ------------------------------------------------------------
-- 5) Conferência — rode e leia o resultado
-- ------------------------------------------------------------
select
  c.relname as tabela,
  c.relrowsecurity as rls_ligado,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select
  c.relname as view_name,
  coalesce(array_to_string(c.reloptions, ', '), 'FALTOU security_invoker!') as opcoes
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
order by c.relname;

-- ------------------------------------------------------------
-- 6) LIMPEZA — só rode depois de confirmar que o login novo funciona
--    A RPC antiga e a tabela de admins não são mais usadas pelo app.
--    Confira antes o que tem lá dentro (senhas em texto puro?).
-- ------------------------------------------------------------
-- drop function if exists public.verificar_login_admin(text, text);
-- drop table if exists public.administradores;
