create extension if not exists pg_trgm with schema extensions;

create or replace function public.ifacil_normalizar(p_texto text)
returns text
language sql immutable
set search_path = ''
as $$
  select trim(regexp_replace(lower(coalesce(p_texto, '')), '[[:space:][:punct:]]+', ' ', 'g'));
$$;

create or replace function public.buscar_resposta_padrao(p_texto text, p_limiar real default 0.5)
returns table (id uuid, pergunta text, resposta text, similaridade real)
language sql stable
set search_path = public, extensions
as $$
  select r.id, r.pergunta, r.resposta,
         similarity(ifacil_normalizar(r.pergunta), ifacil_normalizar(p_texto)) as similaridade
  from public.respostas_padrao r
  where r.ativo
    and length(ifacil_normalizar(p_texto)) >= 8
    and similarity(ifacil_normalizar(r.pergunta), ifacil_normalizar(p_texto)) >= p_limiar
  order by similaridade desc, r.atualizado_em desc
  limit 1;
$$;

revoke execute on function public.buscar_resposta_padrao(text, real) from public, anon, authenticated;
grant  execute on function public.buscar_resposta_padrao(text, real) to service_role;

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
  v_recebida  timestamptz := least(coalesce(p_recebida_em, now()), now());
begin
  v_status := case p_status
    when 'respondida' then 'resolvida'
    when 'padrao'     then 'resolvida'
    when 'sem_info'   then 'encaminhada'
    when 'humano'     then 'encaminhada'
    else 'em_andamento'
  end;

  insert into contatos (whatsapp, nome, primeira_interacao, ultima_interacao, total_mensagens)
  values (p_telefone, nullif(p_nome, ''), v_recebida, now(), 1)
  on conflict (whatsapp) do update
    set nome             = coalesce(nullif(excluded.nome, ''), contatos.nome),
        ultima_interacao = now(),
        total_mensagens  = coalesce(contatos.total_mensagens, 0) + 1
  returning id into v_contato;

  select id into v_outros from categorias where nome = 'Outros';
  select id into v_categoria from categorias where nome = case
    when v_texto ~ '(edital|inscri|vaga|sele[cç]|processo seletivo|resultado|classifica)' then 'Editais'
    when v_texto ~ '(matr[ií]cula|rematr|documenta|trancar|trancamento)'                 then 'Matrícula'
    when v_texto ~ '(hor[aá]rio|calend[aá]rio|aula|turno|semestre|f[eé]rias)'             then 'Horários'
    when v_texto ~ '(curso|t[eé]cnico|gradua|licencia|engenharia|fic|integrado)'         then 'Cursos'
    else 'Outros'
  end;

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

  insert into mensagens (conversa_id, tipo, mensagem, enviada_em, utilizou_rag, encaminhada_humano)
  values (v_conversa, 'usuario', coalesce(nullif(p_pergunta, ''), '(mensagem sem texto)'), v_recebida, false, false),
         (v_conversa, 'bot', p_resposta, now(), p_status in ('respondida', 'sem_info'), v_sem_info or v_humano);

  if v_sem_info then
    insert into perguntas_nao_respondidas (contato_id, pergunta, motivo, categoria_id)
    values (v_contato, p_pergunta, 'Informação não encontrada nos editais', v_categoria);
  end if;

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
