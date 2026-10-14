-- ============================================================
-- iFácil — estruturas usadas pelo fluxo n8n (WhatsApp + RAG)
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

-- 1) Base vetorial dos editais (nó "Supabase Vector Store" do n8n)
--    gemini-embedding-001 gera vetores de 3072 dimensões.
create table if not exists public.edital_chunks (
  id        bigserial primary key,
  content   text not null,
  metadata  jsonb not null default '{}'::jsonb,
  embedding extensions.vector(3072)
);
alter table public.edital_chunks enable row level security;

create or replace function public.match_edital_chunks(
  query_embedding extensions.vector(3072),
  match_count     int   default 8,
  filter          jsonb default '{}'::jsonb
)
returns table (id bigint, content text, metadata jsonb, similarity float)
language sql stable
set search_path = public, extensions
as $$
  select c.id, c.content, c.metadata,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.edital_chunks c
  where c.metadata @> filter
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- 2) Memória da conversa (nó "Postgres Chat Memory" do n8n)
create table if not exists public.n8n_chat_histories (
  id         serial primary key,
  session_id varchar(255) not null,
  message    jsonb not null
);
create index if not exists n8n_chat_histories_session_idx
  on public.n8n_chat_histories (session_id);
alter table public.n8n_chat_histories enable row level security;

-- 3) Registro de cada atendimento nas tabelas lidas pelo painel
--    (contatos -> conversas -> mensagens). Chamado pelo n8n via RPC.
--    p_status: respondida | sem_info | nao_texto | erro
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
  v_texto     text    := lower(coalesce(p_pergunta, ''));
  -- Evita tempo de resposta negativo se o relógio de quem envia estiver adiantado
  v_recebida  timestamptz := least(coalesce(p_recebida_em, now()), now());
begin
  v_status := case p_status
    when 'respondida' then 'resolvida'
    when 'sem_info'   then 'encaminhada'
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
         (v_conversa, 'bot', p_resposta, now(), p_status in ('respondida', 'sem_info'), v_sem_info);

  if v_sem_info then
    insert into perguntas_nao_respondidas (contato_id, pergunta, motivo, categoria_id)
    values (v_contato, p_pergunta, 'Informação não encontrada nos editais', v_categoria);
  end if;

  return v_conversa;
end;
$$;

-- Só o service_role (n8n) executa as funções de escrita/busca
revoke execute on function public.registrar_atendimento(text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant  execute on function public.registrar_atendimento(text, text, text, text, text, timestamptz) to service_role;
revoke execute on function public.match_edital_chunks(extensions.vector, int, jsonb) from public, anon, authenticated;
grant  execute on function public.match_edital_chunks(extensions.vector, int, jsonb) to service_role;
