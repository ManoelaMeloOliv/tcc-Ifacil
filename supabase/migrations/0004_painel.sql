-- iFácil — tabelas base e views lidas pelo painel web
-- Idempotente: pode rodar mais de uma vez.
--
-- As tabelas usam "create table if not exists": num banco que já as tem,
-- nada é alterado. As views são recriadas (não guardam dados).
-- São as tabelas que registrar_atendimento (0002/0003) preenche.

-- 1) Tabelas

-- Temas das perguntas. "cor" alimenta o gráfico (hex) e "slug_cor"
-- a etiqueta do painel (emerald | amber | red | sky | slate).
create table if not exists public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null unique,
  cor       text not null default '#cbd5e1',
  slug_cor  text not null default 'slate'
);

insert into public.categorias (nome, cor, slug_cor) values
  ('Cursos',    '#059669', 'emerald'),
  ('Matrícula', '#f59e0b', 'amber'),
  ('Horários',  '#ef4444', 'red'),
  ('Editais',   '#0ea5e9', 'sky'),
  ('Outros',    '#cbd5e1', 'slate')
on conflict (nome) do nothing;

create table if not exists public.contatos (
  id                 uuid primary key default gen_random_uuid(),
  whatsapp           text not null unique,
  nome               text,
  primeira_interacao timestamptz not null default now(),
  ultima_interacao   timestamptz not null default now(),
  total_mensagens    integer not null default 0
);

-- Conversa = sequência de mensagens com intervalo de até 2 horas
create table if not exists public.conversas (
  id           uuid primary key default gen_random_uuid(),
  contato_id   uuid not null references public.contatos (id) on delete cascade,
  categoria_id uuid references public.categorias (id) on delete set null,
  iniciada_em  timestamptz not null default now(),
  encerrada_em timestamptz,
  status       text not null default 'em_andamento'
               check (status in ('resolvida', 'encaminhada', 'em_andamento'))
);
create index if not exists conversas_contato_idx  on public.conversas (contato_id, iniciada_em desc);
create index if not exists conversas_iniciada_idx on public.conversas (iniciada_em);

create table if not exists public.mensagens (
  id                 uuid primary key default gen_random_uuid(),
  conversa_id        uuid not null references public.conversas (id) on delete cascade,
  tipo               text not null check (tipo in ('usuario', 'bot')),
  mensagem           text not null,
  enviada_em         timestamptz not null default now(),
  utilizou_rag       boolean not null default false,
  encaminhada_humano boolean not null default false
);
create index if not exists mensagens_conversa_idx on public.mensagens (conversa_id, enviada_em);

-- Perguntas que o bot não soube responder (servem para criar respostas padrão)
create table if not exists public.perguntas_nao_respondidas (
  id           uuid primary key default gen_random_uuid(),
  contato_id   uuid references public.contatos (id) on delete set null,
  categoria_id uuid references public.categorias (id) on delete set null,
  pergunta     text,
  motivo       text,
  criada_em    timestamptz not null default now()
);

-- Respostas padrão cadastradas pelo administrador
create table if not exists public.respostas_padrao (
  id            uuid primary key default gen_random_uuid(),
  pergunta      text not null,
  resposta      text not null,
  categoria_id  uuid references public.categorias (id) on delete set null,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- 2) Views do painel
--    security_invoker: a view respeita o RLS das tabelas de baixo.
--    Meses contados no fuso de Brasília.
drop view if exists public.vw_resumo_dashboard;
drop view if exists public.vw_estatisticas_mensais;
drop view if exists public.vw_temas_mensais;
drop view if exists public.vw_perguntas_frequentes;
drop view if exists public.vw_historico_atendimentos;
drop view if exists public.vw_respostas_padrao;
drop view if exists public.vw_tempos_resposta;

-- Tempo entre cada pergunta e a resposta do bot que veio logo depois
create view public.vw_tempos_resposta with (security_invoker = true) as
select conversa_id, enviada_em,
       extract(epoch from enviada_em - anterior_em)::numeric as segundos
from (
  select m.conversa_id, m.tipo, m.enviada_em,
         lag(m.tipo)       over w as anterior_tipo,
         lag(m.enviada_em) over w as anterior_em
  from public.mensagens m
  window w as (partition by m.conversa_id order by m.enviada_em, m.tipo = 'bot')
) t
where tipo = 'bot' and anterior_tipo = 'usuario';

-- Últimos 12 meses, inclusive os sem atendimento (barra zerada no gráfico)
create view public.vw_estatisticas_mensais with (security_invoker = true) as
with meses as (
  select generate_series(
           date_trunc('month', now() at time zone 'America/Sao_Paulo') - interval '11 months',
           date_trunc('month', now() at time zone 'America/Sao_Paulo'),
           interval '1 month'
         )::date as mes
),
conv as (
  select date_trunc('month', c.iniciada_em at time zone 'America/Sao_Paulo')::date as mes,
         count(*)                                     as total_atendimentos,
         count(distinct c.contato_id)                 as total_contatos,
         count(*) filter (where c.status = 'resolvida') as total_resolvidos
  from public.conversas c
  group by 1
),
msg as (
  select date_trunc('month', m.enviada_em at time zone 'America/Sao_Paulo')::date as mes,
         count(*) as total_perguntas
  from public.mensagens m
  where m.tipo = 'usuario'
  group by 1
),
tempo as (
  select date_trunc('month', t.enviada_em at time zone 'America/Sao_Paulo')::date as mes,
         round(avg(t.segundos), 1) as tempo_resposta_medio_seg
  from public.vw_tempos_resposta t
  group by 1
)
select meses.mes,
       coalesce(conv.total_atendimentos, 0)     as total_atendimentos,
       coalesce(conv.total_contatos, 0)         as total_contatos,
       coalesce(conv.total_resolvidos, 0)       as total_resolvidos,
       coalesce(msg.total_perguntas, 0)         as total_perguntas,
       coalesce(tempo.tempo_resposta_medio_seg, 0) as tempo_resposta_medio_seg
from meses
left join conv  using (mes)
left join msg   using (mes)
left join tempo using (mes);

create view public.vw_temas_mensais with (security_invoker = true) as
select date_trunc('month', c.iniciada_em at time zone 'America/Sao_Paulo')::date as mes,
       coalesce(cat.nome, 'Outros')  as tema,
       coalesce(cat.cor, '#cbd5e1')  as cor,
       count(*)                      as total
from public.conversas c
left join public.categorias cat on cat.id = c.categoria_id
group by 1, 2, 3;

-- Perguntas repetidas no mês (texto normalizado). Ignora respostas curtas
-- de menu como "1", "oi" e "menu".
create view public.vw_perguntas_frequentes with (security_invoker = true) as
select date_trunc('month', m.enviada_em at time zone 'America/Sao_Paulo')::date as mes,
       min(m.mensagem)                                  as pergunta,
       mode() within group (order by cat.nome)          as tema,
       count(*)                                         as vezes_utilizada
from public.mensagens m
join public.conversas c       on c.id = m.conversa_id
left join public.categorias cat on cat.id = c.categoria_id
where m.tipo = 'usuario'
  and length(trim(m.mensagem)) >= 12
  and m.mensagem <> '(mensagem sem texto)'
group by 1, lower(regexp_replace(trim(m.mensagem), '[[:space:][:punct:]]+', ' ', 'g'))
order by 1 desc, vezes_utilizada desc;

create view public.vw_historico_atendimentos with (security_invoker = true) as
select c.id,
       c.iniciada_em,
       c.status,
       ct.nome      as nome_contato,
       ct.whatsapp  as telefone,
       cat.nome     as tema,
       (select m.mensagem from public.mensagens m
         where m.conversa_id = c.id and m.tipo = 'usuario'
         order by m.enviada_em desc limit 1)              as ultima_mensagem,
       (select count(*) from public.mensagens m
         where m.conversa_id = c.id)                      as total_mensagens,
       (select round(avg(t.segundos), 1) from public.vw_tempos_resposta t
         where t.conversa_id = c.id)                      as tempo_resposta_medio_seg
from public.conversas c
join public.contatos ct        on ct.id = c.contato_id
left join public.categorias cat on cat.id = c.categoria_id;

create view public.vw_resumo_dashboard with (security_invoker = true) as
select (select count(*) from public.mensagens where tipo = 'usuario')       as total_perguntas,
       (select count(*) from public.contatos)                               as total_contatos,
       (select count(*) from public.conversas)                              as total_atendimentos,
       (select count(*) from public.conversas where status = 'resolvida')   as total_resolvidos,
       (select round(100.0 * count(*) filter (where status = 'resolvida') / nullif(count(*), 0), 1)
          from public.conversas)                                            as taxa_resolucao,
       (select round(avg(segundos), 1) from public.vw_tempos_resposta)      as tempo_resposta_medio_seg;

create view public.vw_respostas_padrao with (security_invoker = true) as
select r.id, r.pergunta, r.resposta, r.categoria_id, r.ativo, r.criado_em, r.atualizado_em,
       cat.nome     as categoria,
       cat.slug_cor as slug_cor
from public.respostas_padrao r
left join public.categorias cat on cat.id = r.categoria_id;

-- 3) Acesso: só admin logado (authenticated). Visitante (anon) não vê nada.
--    Mesmo modelo de sql/rls_policies.sql.
do $$
declare t text;
begin
  foreach t in array array['categorias', 'contatos', 'conversas', 'mensagens',
                           'perguntas_nao_respondidas', 'respostas_padrao']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_acesso_total on public.%I', t);
    execute format('create policy admin_acesso_total on public.%I
                      for all to authenticated using (true) with check (true)', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

revoke all on public.vw_tempos_resposta, public.vw_estatisticas_mensais, public.vw_temas_mensais,
              public.vw_perguntas_frequentes, public.vw_historico_atendimentos,
              public.vw_resumo_dashboard, public.vw_respostas_padrao
  from anon;
grant select on public.vw_tempos_resposta, public.vw_estatisticas_mensais, public.vw_temas_mensais,
                public.vw_perguntas_frequentes, public.vw_historico_atendimentos,
                public.vw_resumo_dashboard, public.vw_respostas_padrao
  to authenticated;
