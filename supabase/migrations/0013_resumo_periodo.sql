-- Indicadores da Visão geral para um intervalo qualquer (filtro de dia e hora do painel).
-- Idempotente.

-- Tempo de resposta do bot: ignora intervalos acima de 10 minutos. Eles só acontecem
-- quando a mensagem ficou presa (fila do WhatsApp entregue com atraso, bot fora do ar)
-- e distorciam a média. Mesmas colunas da 0004, então as views mensais continuam iguais.
create or replace view public.vw_tempos_resposta with (security_invoker = true) as
select conversa_id, enviada_em,
       extract(epoch from enviada_em - anterior_em)::numeric as segundos
from (
  select m.conversa_id, m.tipo, m.enviada_em,
         lag(m.tipo)       over w as anterior_tipo,
         lag(m.enviada_em) over w as anterior_em
  from public.mensagens m
  window w as (partition by m.conversa_id order by m.enviada_em, m.tipo = 'bot')
) t
where tipo = 'bot' and anterior_tipo = 'usuario'
  and enviada_em - anterior_em <= interval '10 minutes';

create or replace function public.painel_resumo_periodo(p_inicio timestamptz, p_fim timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  -- Conversa conta no período se começou nele ou teve alguma mensagem nele
  with conv as (
    select c.*
    from conversas c
    where (c.iniciada_em >= p_inicio and c.iniciada_em < p_fim)
       or exists (select 1 from mensagens m
                   where m.conversa_id = c.id and m.enviada_em >= p_inicio and m.enviada_em < p_fim)
  ),
  perg as (
    select m.*
    from mensagens m
    where m.tipo = 'usuario' and m.enviada_em >= p_inicio and m.enviada_em < p_fim
  ),
  frequentes as (
    select min(m.mensagem)                         as pergunta,
           mode() within group (order by cat.nome) as tema,
           count(*)                                as vezes
    from perg m
    join conversas c              on c.id = m.conversa_id
    left join categorias cat      on cat.id = c.categoria_id
    where length(trim(m.mensagem)) >= 12
      and m.mensagem <> '(mensagem sem texto)'
    group by lower(regexp_replace(trim(m.mensagem), '[[:space:][:punct:]]+', ' ', 'g'))
    order by vezes desc
    limit 3
  ),
  temas as (
    select coalesce(cat.nome, 'Outros') as tema,
           coalesce(cat.cor, '#cbd5e1') as cor,
           count(*)                     as total
    from conv c
    left join categorias cat on cat.id = c.categoria_id
    group by 1, 2
  )
  select jsonb_build_object(
    'atendimentos',   (select count(*) from conv),
    'contatos',       (select count(distinct contato_id) from conv),
    'resolvidos',     (select count(*) from conv where status = 'resolvida'),
    'perguntas',      (select count(*) from perg),
    'tempo_resposta', (select coalesce(round(avg(t.segundos), 1), 0)
                         from vw_tempos_resposta t
                        where t.enviada_em >= p_inicio and t.enviada_em < p_fim),
    'temas',          coalesce((select jsonb_agg(to_jsonb(temas)) from temas), '[]'::jsonb),
    'frequentes',     coalesce((select jsonb_agg(to_jsonb(frequentes)) from frequentes), '[]'::jsonb)
  );
$$;

revoke execute on function public.painel_resumo_periodo(timestamptz, timestamptz) from public, anon;
grant  execute on function public.painel_resumo_periodo(timestamptz, timestamptz) to authenticated;

-- Faz a API do Supabase enxergar as funções novas na hora
notify pgrst, 'reload schema';
