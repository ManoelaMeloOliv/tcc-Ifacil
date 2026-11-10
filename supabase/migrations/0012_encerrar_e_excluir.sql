-- Comando "encerrar" no WhatsApp e exclusão de conversas pelo painel.
-- Idempotente: pode rodar mais de uma vez.

insert into public.mensagens_bot (chave, ordem, titulo, descricao, texto) values
  ('encerrar', 9, $txt$Conversa encerrada$txt$,
   $txt$Enviada quando o aluno digita "encerrar". A conversa é finalizada e a próxima mensagem começa um atendimento novo.$txt$,
   $txt$Conversa encerrada. ✅ Obrigado pelo contato! Quando precisar, é só mandar uma nova mensagem.$txt$)
on conflict (chave) do nothing;

-- Menu: avisa que dá para encerrar
create or replace function public.ifacil_texto_menu(p_aviso text default null)
returns text
language plpgsql stable
set search_path = public
as $$
declare
  v_intro text;
  v_lista text;
  v_total int;
begin
  select m.texto into v_intro from mensagens_bot m where m.chave = 'menu_assuntos' and length(trim(m.texto)) > 0;

  select count(*), string_agg(format('*%s* - %s', a.n, a.nome), E'\n' order by a.n)
    into v_total, v_lista
  from ifacil_assuntos() a;

  return coalesce(p_aviso || E'\n\n', '')
      || coalesce(v_intro, 'Sobre qual assunto você quer saber? Responda com o *número*:') || E'\n\n'
      || coalesce(v_lista || E'\n', '')
      || format('*%s* - Falar com um atendente', coalesce(v_total, 0) + 1) || E'\n\n'
      || 'Se preferir, escreva sua dúvida com as suas palavras.' || E'\n'
      || 'Para encerrar a conversa, digite *encerrar*.';
end;
$$;

-- Roteamento: igual ao 0010, mais o comando "encerrar" (funciona até durante atendimento humano)
create or replace function public.ifacil_rotear(p_telefone text, p_texto text)
returns table (rota text, opcao smallint, tema text, resposta text, status text, pergunta text)
language plpgsql
set search_path = public
as $$
declare
  e             public.atendimento_estado%rowtype;
  t             text := lower(trim(coalesce(p_texto, '')));
  v_nova        boolean;
  v_num         int;
  v_sub         uuid;
  v_total       int;
  v_categoria   uuid;
  v_nome        text;
  v_quer_humano boolean := false;
  v_encerrar    boolean := false;
  n_sub         uuid;
  n_viu         boolean := false;
  n_humano      boolean := false;
  n_opcao       smallint;
begin
  insert into public.atendimento_estado (telefone) values (p_telefone)
  on conflict (telefone) do nothing;

  select * into e from public.atendimento_estado s where s.telefone = p_telefone for update;

  v_nova := e.ultima_mensagem_em is null or e.ultima_mensagem_em < now() - interval '2 hours';
  v_sub  := case when v_nova then null else e.submenu end;

  if t ~ '^(op[cç][aã]o\s*)?[0-9]{1,2}\s*[-.)]?$' then
    v_num := substring(t from '[0-9]{1,2}')::int;
  end if;

  rota := 'menu';
  status := 'menu';

  if t ~ '^#?(encerrar|finalizar|sair)( (a )?(conversa|atendimento))?[.!]*$' then
    v_encerrar := true;
    rota := 'opcao';
    status := 'encerrada';
    select m.texto into resposta from mensagens_bot m where m.chave = 'encerrar' and length(trim(m.texto)) > 0;
    resposta := coalesce(resposta, 'Conversa encerrada. ✅ Obrigado pelo contato! Quando precisar, é só mandar uma nova mensagem.');
  elsif t in ('menu', '#menu', 'inicio', 'início') then
    resposta := ifacil_texto_menu();
  elsif t = 'voltar' or v_num = 0 then
    if v_sub is not null and e.viu_resposta and not e.humano then
      resposta := ifacil_texto_submenu(v_sub);
      n_sub := v_sub;
    else
      resposta := ifacil_texto_menu();
    end if;
  elsif e.humano and e.ultima_mensagem_em >= now() - interval '24 hours' then
    rota := 'humano_ativo';
    status := null;
    opcao := 4;
    n_sub := e.submenu;
    n_viu := e.viu_resposta;
    n_humano := true;
    n_opcao := 4;
  elsif t ~ '^(atendente|humano)$'
     or t ~ '(falar com (um |uma |algu[eé]m|atendente|humano|pessoa)|atendente humano|atendimento humano)' then
    v_quer_humano := true;
  elsif v_num is not null and v_sub is null then
    select a.id, a.nome into v_categoria, v_nome from ifacil_assuntos() a where a.n = v_num;
    select count(*) into v_total from ifacil_assuntos();
    if v_categoria is not null then
      resposta := ifacil_texto_submenu(v_categoria);
      tema := v_nome;
      n_sub := v_categoria;
    elsif v_num = v_total + 1 then
      v_quer_humano := true;
    else
      resposta := ifacil_texto_menu('Não encontrei essa opção. 🙂');
    end if;
  elsif v_num is not null then
    v_nome := ifacil_rotulo(v_sub);
    select p.pergunta, p.resposta into pergunta, resposta
    from ifacil_perguntas_assunto(v_sub) p
    where p.n = v_num;

    if resposta is not null then
      rota := 'opcao';
      status := 'padrao';
      tema := v_nome;
      resposta := resposta || E'\n\n' || format('Para ver as outras perguntas de *%s*, digite *voltar*.', v_nome);
      n_sub := v_sub;
      n_viu := true;
    elsif exists (select 1 from ifacil_perguntas_assunto(v_sub)) then
      resposta := ifacil_texto_submenu(v_sub, 'Não encontrei essa opção. 🙂');
      tema := v_nome;
      n_sub := v_sub;
    else
      resposta := ifacil_texto_menu();
    end if;
  elsif (v_nova and public.ifacil_eh_saudacao(p_texto))
     or public.ifacil_normalizar(p_texto) ~ '^(oi+e?|ol[aá]|opa|bom dia|boa tarde|boa noite)$' then
    resposta := ifacil_texto_menu();
  else
    rota := 'pergunta';
    status := null;
    tema := ifacil_rotulo(v_sub);
    n_sub := v_sub;
    n_viu := not v_nova and e.viu_resposta;
  end if;

  if v_quer_humano then
    rota := 'opcao';
    status := 'humano';
    opcao := 4;
    select m.texto into resposta from mensagens_bot m where m.chave = 'opcao_4' and length(trim(m.texto)) > 0;
    resposta := coalesce(resposta, 'Sua conversa foi encaminhada para a equipe de atendimento. Um atendente vai responder por aqui assim que possível, em horário de expediente.');
    n_sub := null;
    n_viu := false;
    n_humano := true;
    n_opcao := 4;
  end if;

  update public.atendimento_estado s
     set ultima_mensagem_em = case when v_encerrar then null else now() end,
         submenu = n_sub, viu_resposta = n_viu,
         humano = n_humano, opcao = n_opcao, atualizado_em = now()
   where s.telefone = p_telefone;

  -- Encerrar também apaga a memória da IA, para a próxima conversa começar limpa
  if v_encerrar then
    delete from public.n8n_chat_histories h where split_part(h.session_id, '@', 1) = p_telefone;
  end if;

  return next;
end;
$$;

revoke execute on function public.ifacil_texto_menu(text) from public, anon, authenticated;
revoke execute on function public.ifacil_rotear(text, text) from public, anon, authenticated;
grant  execute on function public.ifacil_texto_menu(text) to service_role;
grant  execute on function public.ifacil_rotear(text, text) to service_role;

-- Registro: igual ao 0008, mais o status "encerrada" e conversas finalizadas não são reabertas
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
    when 'encerrada'  then 'finalizada'
    else 'em_andamento'
  end;

  insert into contatos (whatsapp, nome, primeira_interacao, ultima_interacao, total_mensagens)
  values (p_telefone, nullif(p_nome, ''), v_recebida, now(), 1)
  on conflict (whatsapp) do update
    set nome             = coalesce(nullif(excluded.nome, ''), contatos.nome),
        ultima_interacao = now(),
        total_mensagens  = coalesce(contatos.total_mensagens, 0) + 1
  returning id into v_contato;

  delete from mensagens m
   using conversas c
   where c.id = m.conversa_id
     and c.contato_id = v_contato
     and m.tipo = 'atendente'
     and trim(m.mensagem) = trim(p_resposta)
     and m.enviada_em > now() - interval '2 minutes';

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
    and c.status <> 'finalizada'
    and coalesce((select max(m.enviada_em) from mensagens m where m.conversa_id = c.id), c.iniciada_em)
        > now() - interval '2 hours'
  order by c.iniciada_em desc
  limit 1;

  if v_conversa is null then
    insert into conversas (contato_id, iniciada_em, status, categoria_id, encerrada_em)
    values (v_contato, v_recebida, v_status, v_categoria,
            case when v_status in ('resolvida', 'finalizada') then now() end)
    returning id into v_conversa;
  else
    if v_status not in ('encaminhada', 'finalizada') and exists (
      select 1
      from conversas c
      join atendimento_estado e on e.telefone = p_telefone
      where c.id = v_conversa and c.status = 'encaminhada' and e.humano
    ) then
      v_status := 'encaminhada';
    end if;

    update conversas
       set status       = v_status,
           encerrada_em = case when v_status in ('resolvida', 'finalizada') then now() else null end,
           categoria_id = case
             when categoria_id is null or categoria_id = v_outros then v_categoria
             else categoria_id
           end
     where id = v_conversa;
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

-- Painel: exclui conversas (e as mensagens, por cascata). Contato que fica sem
-- nenhuma conversa é apagado junto, com o estado do bot e a memória da IA.
create or replace function public.painel_excluir_conversas(p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contatos uuid[];
  v_total    integer;
begin
  if auth.uid() is null then
    raise exception 'Acesso negado';
  end if;

  select array_agg(distinct c.contato_id) into v_contatos
  from conversas c where c.id = any(p_ids);

  if v_contatos is null then
    return 0;
  end if;

  -- Perguntas sem resposta que nasceram nessas conversas
  delete from perguntas_nao_respondidas p
   using conversas c
   where c.id = any(p_ids)
     and p.contato_id = c.contato_id
     and p.criada_em >= c.iniciada_em - interval '1 minute'
     and p.criada_em <= coalesce((select max(m.enviada_em) from mensagens m where m.conversa_id = c.id), c.iniciada_em)
                        + interval '1 minute';

  delete from conversas c where c.id = any(p_ids);
  get diagnostics v_total = row_count;

  -- Quem ainda tem conversa aguardando atendente continua como está
  update atendimento_estado e
     set humano = false, opcao = null, submenu = null, viu_resposta = false,
         ultima_mensagem_em = null, atualizado_em = now()
    from contatos ct
   where ct.id = any(v_contatos)
     and e.telefone = ct.whatsapp
     and not exists (select 1 from conversas c where c.contato_id = ct.id and c.status = 'encaminhada');

  delete from n8n_chat_histories h
   using contatos ct
   where ct.id = any(v_contatos)
     and split_part(h.session_id, '@', 1) = ct.whatsapp
     and not exists (select 1 from conversas c where c.contato_id = ct.id);

  delete from atendimento_estado e
   using contatos ct
   where ct.id = any(v_contatos)
     and e.telefone = ct.whatsapp
     and not exists (select 1 from conversas c where c.contato_id = ct.id);

  delete from perguntas_nao_respondidas p
   where p.contato_id = any(v_contatos)
     and not exists (select 1 from conversas c where c.contato_id = p.contato_id);

  delete from contatos ct
   where ct.id = any(v_contatos)
     and not exists (select 1 from conversas c where c.contato_id = ct.id);

  return v_total;
end;
$$;

revoke execute on function public.painel_excluir_conversas(uuid[]) from public, anon;
grant  execute on function public.painel_excluir_conversas(uuid[]) to authenticated;

-- Faz a API do Supabase enxergar as funções novas na hora
notify pgrst, 'reload schema';
