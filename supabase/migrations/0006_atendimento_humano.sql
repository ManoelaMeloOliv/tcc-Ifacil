do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.conversas'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.conversas drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.conversas
  add constraint conversas_status_check
  check (status in ('resolvida', 'encaminhada', 'em_andamento', 'finalizada'));

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
    if v_status <> 'encaminhada' and exists (
      select 1
      from conversas c
      join atendimento_estado e on e.telefone = p_telefone
      where c.id = v_conversa and c.status = 'encaminhada' and e.humano
    ) then
      v_status := 'encaminhada';
    end if;

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

create or replace function public.painel_finalizar_atendimento(p_conversa uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_telefone text;
begin
  update conversas c
     set status = 'finalizada', encerrada_em = now()
    from contatos ct
   where c.id = p_conversa and ct.id = c.contato_id
  returning ct.whatsapp into v_telefone;

  if v_telefone is null then
    raise exception 'Conversa % não encontrada', p_conversa;
  end if;

  update atendimento_estado
     set humano = false, opcao = null, atualizado_em = now()
   where telefone = v_telefone;
end;
$$;

revoke execute on function public.painel_finalizar_atendimento(uuid) from public, anon;
grant  execute on function public.painel_finalizar_atendimento(uuid) to authenticated;

update conversas c
   set status = 'encaminhada', encerrada_em = null
  from contatos ct
  join atendimento_estado e on e.telefone = ct.whatsapp
 where ct.id = c.contato_id
   and e.humano
   and c.status = 'resolvida'
   and exists (select 1 from mensagens m where m.conversa_id = c.id and m.encaminhada_humano)
   and c.id = (select c2.id from conversas c2 where c2.contato_id = c.contato_id
               order by c2.iniciada_em desc limit 1);
