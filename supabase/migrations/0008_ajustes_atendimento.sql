do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.mensagens'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%tipo%'
  loop
    execute format('alter table public.mensagens drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.mensagens
  add constraint mensagens_tipo_check
  check (tipo in ('usuario', 'bot', 'atendente'));

create or replace function public.ifacil_eh_saudacao(p_texto text)
returns boolean
language sql immutable
set search_path = public
as $$
  select not exists (
    select 1
    from regexp_split_to_table(ifacil_normalizar(p_texto), ' ') as palavra
    where palavra <> ''
      and palavra not in (
        'oi', 'oii', 'oie', 'ola', 'olá', 'opa', 'eai', 'eae', 'e', 'ai', 'aí', 'hey', 'hi', 'hello',
        'bom', 'boa', 'dia', 'tarde', 'noite', 'tudo', 'td', 'bem',
        'obrigado', 'obrigada', 'obg', 'valeu', 'vlw', 'ok', 'okay', 'blz', 'beleza', 'tchau', 'ate', 'até', 'logo',
        'por', 'favor', 'pf', 'pfv', 'gostaria', 'quero', 'queria', 'preciso', 'tenho', 'uma', 'um', 'de',
        'ajuda', 'duvida', 'dúvida', 'duvidas', 'dúvidas',
        'informacao', 'informação', 'informacoes', 'informações', 'atendimento'
      )
  );
$$;

drop function if exists public.ifacil_rotear(text, text);

create function public.ifacil_rotear(p_telefone text, p_texto text)
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

  if t ~ '^(op[cç][aã]o\s*)?[1-4]\s*[-.)]?$' then
    v_opcao := substring(t from '[1-4]')::smallint;
  elsif t ~ '(falar com (um |uma |algu[eé]m|atendente|humano|pessoa)|atendente humano|atendimento humano)' then
    v_opcao := 4;
  end if;

  if t in ('menu', '#menu', '0', 'voltar', 'inicio', 'início') then
    rota := 'menu';
    opcao := null;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), opcao = null, humano = false, atualizado_em = now()
     where s.telefone = p_telefone;
  elsif e.humano and e.ultima_mensagem_em >= now() - interval '24 hours' then
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
  elsif (v_nova and public.ifacil_eh_saudacao(p_texto))
     or public.ifacil_normalizar(p_texto) ~ '^(oi+e?|ol[aá]|opa|bom dia|boa tarde|boa noite)$' then
    rota := 'menu';
    opcao := null;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), opcao = null, humano = false, atualizado_em = now()
     where s.telefone = p_telefone;
  else
    rota := 'pergunta';
    opcao := case when v_nova then null else e.opcao end;
    update public.atendimento_estado s
       set ultima_mensagem_em = now(), opcao = case when v_nova then null else s.opcao end,
           humano = false, atualizado_em = now()
     where s.telefone = p_telefone;
  end if;

  return next;
end;
$$;

revoke execute on function public.ifacil_rotear(text, text) from public, anon, authenticated;
grant  execute on function public.ifacil_rotear(text, text) to service_role;

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

create or replace function public.registrar_mensagem_humana(
  p_telefone   text,
  p_tipo       text,
  p_mensagem   text,
  p_enviada_em timestamptz default now()
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_contato  uuid;
  v_conversa uuid;
begin
  if p_tipo not in ('usuario', 'atendente') then
    raise exception 'Tipo de mensagem inválido: %', p_tipo;
  end if;

  select id into v_contato from contatos where whatsapp = p_telefone;
  if v_contato is null or length(trim(coalesce(p_mensagem, ''))) = 0 then
    return null;
  end if;

  if p_tipo = 'atendente' and exists (
    select 1
    from mensagens m
    join conversas c on c.id = m.conversa_id
    where c.contato_id = v_contato
      and m.tipo = 'bot'
      and trim(m.mensagem) = trim(p_mensagem)
      and m.enviada_em > now() - interval '2 minutes'
  ) then
    return null;
  end if;

  select c.id into v_conversa
  from conversas c
  where c.contato_id = v_contato
  order by c.iniciada_em desc
  limit 1;

  if v_conversa is null then
    return null;
  end if;

  insert into mensagens (conversa_id, tipo, mensagem, enviada_em)
  values (v_conversa, p_tipo, p_mensagem, least(coalesce(p_enviada_em, now()), now()));

  if p_tipo = 'usuario' then
    update contatos
       set ultima_interacao = now(),
           total_mensagens  = coalesce(total_mensagens, 0) + 1
     where id = v_contato;
  else
    update atendimento_estado
       set ultima_mensagem_em = now(), atualizado_em = now()
     where telefone = p_telefone and humano;
  end if;

  return v_conversa;
end;
$$;

revoke execute on function public.registrar_mensagem_humana(text, text, text, timestamptz) from public, anon, authenticated;
grant  execute on function public.registrar_mensagem_humana(text, text, text, timestamptz) to service_role;

update public.mensagens_bot
   set texto = $txt$Desculpe a demora! 🙏 Sua conversa foi encaminhada para um *atendente humano*, que vai responder por aqui assim que possível, em horário de expediente.$txt$
 where chave = 'falha_bot'
   and texto = $txt$Desculpe a demora! 🙏 Um *atendente humano* já vai retornar com as informações solicitadas dentro de alguns minutos.$txt$;

update public.mensagens_bot
   set texto = $txt$Caso isso não tenha te ajudado, digite *4* para falar com um atendente ou *menu* para ver todas as opções.$txt$
 where chave = 'rodape_resposta'
   and texto = $txt$Caso isso não tenha te ajudado, digite *4* para solicitar um atendimento humano.$txt$;

update public.mensagens_bot
   set descricao = $txt$Enviada quando o aluno cumprimenta ou digita "menu". Quem já chega com uma pergunta recebe a resposta direto.$txt$
 where chave = 'menu_boas_vindas';

update public.mensagens_bot
   set descricao = $txt$Resposta quando o aluno pede atendente. Depois dela o bot fica em silêncio até a secretaria finalizar, o aluno digitar "menu" ou passarem 24 horas sem conversa.$txt$
 where chave = 'opcao_4';
