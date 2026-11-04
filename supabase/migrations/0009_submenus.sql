alter table public.atendimento_estado
  add column if not exists submenu uuid references public.categorias (id) on delete set null,
  add column if not exists viu_resposta boolean not null default false;

alter table public.categorias
  add column if not exists ordem_menu smallint not null default 50;

update public.categorias set ordem_menu = case nome
  when 'Matrícula' then 1
  when 'Cursos'    then 2
  when 'Horários'  then 3
  when 'Editais'   then 4
  when 'Outros'    then 99
  else ordem_menu
end;

delete from public.mensagens_bot where chave in ('menu_boas_vindas', 'opcao_1', 'opcao_2', 'opcao_3');

insert into public.mensagens_bot (chave, ordem, titulo, descricao, texto) values
  ('menu_assuntos', 1, $txt$Boas-vindas e menu$txt$, $txt$Enviada quando o aluno cumprimenta ou digita "menu". A lista de assuntos é adicionada abaixo deste texto, conforme as respostas cadastradas.$txt$,
   $txt$Olá! 👋 Eu sou o *AIFÁCIL*, assistente digital de atendimento do *IFSC – Câmpus Tubarão*.

Sobre qual assunto você quer saber? Responda com o *número*:$txt$),
  ('submenu_intro', 2, $txt$Submenu de perguntas$txt$, $txt$Enviada quando o aluno escolhe um assunto. {assunto} vira o nome do assunto e a lista de perguntas é adicionada abaixo.$txt$,
   $txt$*{assunto}*: o que você quer saber? Responda com o *número*:$txt$)
on conflict (chave) do nothing;

update public.mensagens_bot
   set texto = $txt$Caso isso não tenha te ajudado, digite *atendente* para falar com uma pessoa ou *menu* para ver os assuntos.$txt$
 where chave = 'rodape_resposta'
   and texto in (
     $txt$Caso isso não tenha te ajudado, digite *4* para solicitar um atendimento humano.$txt$,
     $txt$Caso isso não tenha te ajudado, digite *4* para falar com um atendente ou *menu* para ver todas as opções.$txt$
   );

update public.mensagens_bot
   set titulo = $txt$Falar com um atendente$txt$,
       descricao = $txt$Resposta quando o aluno pede atendente. Depois dela o bot fica em silêncio até a secretaria finalizar, o aluno digitar "menu" ou passarem 24 horas sem conversa.$txt$
 where chave = 'opcao_4';

create or replace function public.ifacil_assuntos()
returns table (n int, id uuid, nome text)
language sql stable
set search_path = public
as $$
  select (row_number() over (order by c.ordem_menu, c.nome))::int, c.id, c.nome
  from categorias c
  where exists (select 1 from respostas_padrao r where r.categoria_id = c.id and r.ativo);
$$;

create or replace function public.ifacil_perguntas_assunto(p_categoria uuid)
returns table (n int, pergunta text, resposta text)
language sql stable
set search_path = public
as $$
  select (row_number() over (order by r.criado_em, r.id))::int, r.pergunta, r.resposta
  from respostas_padrao r
  where r.ativo and r.categoria_id = p_categoria;
$$;

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

  select count(*), string_agg(format('*%s* - %s', a.n, case a.nome when 'Outros' then 'Outros assuntos' else a.nome end), E'\n' order by a.n)
    into v_total, v_lista
  from ifacil_assuntos() a;

  return coalesce(p_aviso || E'\n\n', '')
      || coalesce(v_intro, 'Sobre qual assunto você quer saber? Responda com o *número*:') || E'\n\n'
      || coalesce(v_lista || E'\n', '')
      || format('*%s* - Falar com um atendente', coalesce(v_total, 0) + 1) || E'\n\n'
      || 'Se preferir, escreva sua dúvida com as suas palavras.';
end;
$$;

create or replace function public.ifacil_texto_submenu(p_categoria uuid, p_aviso text default null)
returns text
language plpgsql stable
set search_path = public
as $$
declare
  v_nome  text;
  v_intro text;
  v_lista text;
begin
  select c.nome into v_nome from categorias c where c.id = p_categoria;
  select m.texto into v_intro from mensagens_bot m where m.chave = 'submenu_intro' and length(trim(m.texto)) > 0;

  select string_agg(format('*%s* - %s', p.n, p.pergunta), E'\n' order by p.n) into v_lista
  from ifacil_perguntas_assunto(p_categoria) p;

  return coalesce(p_aviso || E'\n\n', '')
      || replace(coalesce(v_intro, '*{assunto}*: o que você quer saber? Responda com o *número*:'), '{assunto}', case v_nome when 'Outros' then 'Outros assuntos' else v_nome end) || E'\n\n'
      || coalesce(v_lista || E'\n', '')
      || '*0* - Voltar aos assuntos' || E'\n\n'
      || 'Se preferir, escreva sua dúvida com as suas palavras.';
end;
$$;

drop function if exists public.ifacil_rotear(text, text);

create function public.ifacil_rotear(p_telefone text, p_texto text)
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

  if t in ('menu', '#menu', 'inicio', 'início') then
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
    select c.nome into v_nome from categorias c where c.id = v_sub;
    select p.pergunta, p.resposta into pergunta, resposta
    from ifacil_perguntas_assunto(v_sub) p
    where p.n = v_num;

    if resposta is not null then
      rota := 'opcao';
      status := 'padrao';
      tema := v_nome;
      resposta := resposta || E'\n\n' || format('Para ver as outras perguntas de *%s*, digite *voltar*.', case v_nome when 'Outros' then 'Outros assuntos' else v_nome end);
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
    select c.nome into tema from categorias c where c.id = v_sub;
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
     set ultima_mensagem_em = now(), submenu = n_sub, viu_resposta = n_viu,
         humano = n_humano, opcao = n_opcao, atualizado_em = now()
   where s.telefone = p_telefone;

  return next;
end;
$$;

revoke execute on function public.ifacil_assuntos() from public, anon, authenticated;
revoke execute on function public.ifacil_perguntas_assunto(uuid) from public, anon, authenticated;
revoke execute on function public.ifacil_texto_menu(text) from public, anon, authenticated;
revoke execute on function public.ifacil_texto_submenu(uuid, text) from public, anon, authenticated;
revoke execute on function public.ifacil_rotear(text, text) from public, anon, authenticated;
grant  execute on function public.ifacil_assuntos() to service_role;
grant  execute on function public.ifacil_perguntas_assunto(uuid) to service_role;
grant  execute on function public.ifacil_texto_menu(text) to service_role;
grant  execute on function public.ifacil_texto_submenu(uuid, text) to service_role;
grant  execute on function public.ifacil_rotear(text, text) to service_role;
