-- ============================================================
-- iFácil — menu de atendimento (AIFÁCIL) e transferência para humano
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

-- 1) Estado do atendimento por contato do WhatsApp
--    Sessão = mensagens com intervalo de até 2 horas (mesma regra das conversas).
create table if not exists public.atendimento_estado (
  telefone           text primary key,
  ultima_mensagem_em timestamptz,
  opcao              smallint,
  humano             boolean not null default false,
  atualizado_em      timestamptz not null default now()
);
alter table public.atendimento_estado enable row level security;

-- 2) Decide o que fazer com a mensagem recebida e já atualiza o estado.
--    rota: menu | opcao | pergunta | humano_ativo
create or replace function public.ifacil_rotear(p_telefone text, p_texto text)
returns table (rota text, opcao smallint)
language plpgsql
set search_path = public
as $$
declare
  e            public.atendimento_estado%rowtype;
  t            text := lower(trim(coalesce(p_texto, '')));
  v_opcao      smallint;
  v_nova       boolean;
begin
  insert into public.atendimento_estado (telefone) values (p_telefone)
  on conflict (telefone) do nothing;

  select * into e from public.atendimento_estado s where s.telefone = p_telefone for update;

  v_nova := e.ultima_mensagem_em is null or e.ultima_mensagem_em < now() - interval '2 hours';

  -- "1", "1.", "1 -", "opção 1"
  if t ~ '^(op[cç][aã]o\s*)?[1-4]\s*[-.)]?$' then
    v_opcao := substring(t from '[1-4]')::smallint;
  -- pedido de atendente escrito por extenso
  elsif t ~ '(falar com (um |uma |algu[eé]m|atendente|humano|pessoa)|atendente humano|atendimento humano)' then
    v_opcao := 4;
  end if;

  if v_nova or t in ('menu', '#menu', '0', 'voltar', 'inicio', 'início') then
    rota := 'menu';
    opcao := null;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), opcao = null, humano = false, atualizado_em = now()
     where s.telefone = p_telefone;
  elsif e.humano then
    -- Atendente humano assumiu: o robô fica em silêncio
    rota := 'humano_ativo';
    opcao := 4;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), atualizado_em = now()
     where s.telefone = p_telefone;
  elsif v_opcao is not null then
    rota := 'opcao';
    opcao := v_opcao;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), opcao = v_opcao, humano = (v_opcao = 4), atualizado_em = now()
     where s.telefone = p_telefone;
  else
    rota := 'pergunta';
    opcao := e.opcao;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), atualizado_em = now()
     where s.telefone = p_telefone;
  end if;

  return next;
end;
$$;

revoke execute on function public.ifacil_rotear(text, text) from public, anon, authenticated;
grant  execute on function public.ifacil_rotear(text, text) to service_role;

-- 3) registrar_atendimento: novos status vindos do menu
--    p_status: respondida | sem_info | nao_texto | erro | menu | opcao | humano
create or replace function public.registrar_atendimento(
  p_telefone    text,
  p_nome        text,
  p_pergunta    text,
  p_resposta    text,
  p_status      text,
  p_recebida_em timestamptz default now()
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_contato   uuid;
  v_conversa  uuid;
  v_categoria uuid;
  v_outros    uuid;
  v_status    text;
  v_sem_info  boolean := p_status = 'sem_info';
  v_humano    boolean := p_status = 'humano';
  v_texto     text    := lower(coalesce(p_pergunta, ''));
  -- Evita tempo de resposta negativo se o relógio de quem envia estiver adiantado
  v_recebida  timestamptz := least(coalesce(p_recebida_em, now()), now());
begin
  v_status := case p_status
    when 'respondida' then 'resolvida'
    when 'sem_info'   then 'encaminhada'
    when 'humano'     then 'encaminhada'
    else 'em_andamento'
  end;

  -- Contato (um por número de WhatsApp)
  insert into contatos (whatsapp, nome, primeira_interacao, ultima_interacao, total_mensagens)
  values (p_telefone, nullif(p_nome, ''), v_recebida, now(), 1)
  on conflict (whatsapp) do update
    set nome             = coalesce(nullif(excluded.nome, ''), contatos.nome),
        ultima_interacao = now(),
        total_mensagens  = coalesce(contatos.total_mensagens, 0) + 1
  returning id into v_contato;

  -- Tema da pergunta por palavras-chave
  select id into v_outros from categorias where nome = 'Outros';
  select id into v_categoria from categorias where nome = case
    when v_texto ~ '(edital|inscri|vaga|sele[cç]|processo seletivo|resultado|classifica)' then 'Editais'
    when v_texto ~ '(matr[ií]cula|rematr|documenta|trancar|trancamento)'                 then 'Matrícula'
    when v_texto ~ '(hor[aá]rio|calend[aá]rio|aula|turno|semestre|f[eé]rias)'             then 'Horários'
    when v_texto ~ '(curso|t[eé]cnico|gradua|licencia|engenharia|fic|integrado)'         then 'Cursos'
    else 'Outros'
  end;

  -- Mesma conversa se o contato falou nas últimas 2 horas; senão abre outra
  select c.id into v_conversa
  from conversas c
  where c.contato_id = v_contato
    and coalesce((select max(m.enviada_em) from mensagens m where m.conversa_id = c.id), c.iniciada_em)
        > now() - interval '2 hours'
  order by c.iniciada_em desc
  limit 1;

  if v_conversa is null then
    insert into conversas (contato_id, iniciada_em, status, categoria_id)
    values (v_contato, v_recebida, v_status, v_categoria)
    returning id into v_conversa;
  else
    update conversas
       set status       = v_status,
           encerrada_em = case when v_status = 'resolvida' then now() else null end,
           categoria_id = case
             when categoria_id is null or categoria_id = v_outros then v_categoria
             else categoria_id
           end
     where id = v_conversa;
  end if;

  if v_status = 'resolvida' then
    update conversas set encerrada_em = now() where id = v_conversa;
  end if;

  -- Pergunta e resposta (o painel mede o tempo entre 'usuario' e 'bot')
  insert into mensagens (conversa_id, tipo, mensagem, enviada_em, utilizou_rag, encaminhada_humano)
  values (v_conversa, 'usuario', coalesce(nullif(p_pergunta, ''), '(mensagem sem texto)'), v_recebida, false, false),
         (v_conversa, 'bot', p_resposta, now(), p_status in ('respondida', 'sem_info'), v_sem_info or v_humano);

  if v_sem_info then
    insert into perguntas_nao_respondidas (contato_id, pergunta, motivo, categoria_id)
    values (v_contato, p_pergunta, 'Informação não encontrada nos editais', v_categoria);
  end if;

  -- Encaminhado para humano (opção 4 ou instabilidade): o robô fica em silêncio
  if v_humano then
    insert into public.atendimento_estado (telefone, ultima_mensagem_em, opcao, humano)
    values (p_telefone, now(), 4, true)
    on conflict (telefone) do update
      set humano = true, opcao = 4, ultima_mensagem_em = now(), atualizado_em = now();
  end if;

  return v_conversa;
end;
$$;

revoke execute on function public.registrar_atendimento(text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant  execute on function public.registrar_atendimento(text, text, text, text, text, timestamptz) to service_role;
