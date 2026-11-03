-- iFácil — mensagens fixas do bot editáveis no painel
-- Idempotente: pode rodar mais de uma vez. Rodar depois da 0006.
--
-- O n8n lê estes textos a cada mensagem (junto com ifacil_rotear).
-- Se uma chave sumir ou ficar vazia, o fluxo usa o texto embutido nele.
-- Rodar de novo não sobrescreve textos já editados pela secretaria.

create table if not exists public.mensagens_bot (
  chave         text primary key,
  ordem         smallint not null default 0,
  titulo        text not null,
  descricao     text,
  texto         text not null,
  atualizado_em timestamptz not null default now()
);

insert into public.mensagens_bot (chave, ordem, titulo, descricao, texto) values
  ('menu_boas_vindas', 1, $txt$Boas-vindas e menu$txt$, $txt$Enviada no primeiro contato, depois de 2 horas sem conversa ou quando o aluno digita "menu".$txt$,
   $txt$Olá! 👋 Eu sou o *AIFÁCIL*, assistente digital de atendimento do *IFSC – Câmpus Tubarão*.

Como posso ajudar? Responda com o *número* da opção desejada:

*1* - Perguntar sobre editais
*2* - Processos de matrícula e rematrícula
*3* - Dúvidas gerais sobre o campus
*4* - Falar com um humano

A qualquer momento, digite *menu* para ver estas opções novamente.$txt$),
  ('opcao_1', 2, $txt$Opção 1 · Editais$txt$, $txt$Resposta quando o aluno escolhe a opção 1 do menu.$txt$,
   $txt$Certo! 📄 Envie sua dúvida sobre *editais*: inscrições, prazos, vagas, documentos exigidos ou resultados. Vou consultar os documentos oficiais.$txt$),
  ('opcao_2', 3, $txt$Opção 2 · Matrícula$txt$, $txt$Resposta quando o aluno escolhe a opção 2 do menu.$txt$,
   $txt$Certo! 📝 Envie sua dúvida sobre *matrícula ou rematrícula*: prazos, documentos ou procedimentos.$txt$),
  ('opcao_3', 4, $txt$Opção 3 · Dúvidas sobre o câmpus$txt$, $txt$Resposta quando o aluno escolhe a opção 3 do menu.$txt$,
   $txt$Certo! 🏫 Envie sua dúvida sobre o *câmpus* que eu procuro nos documentos disponíveis.$txt$),
  ('opcao_4', 5, $txt$Opção 4 · Falar com um humano$txt$, $txt$Resposta quando o aluno pede atendente. Depois dela o bot fica em silêncio até a secretaria finalizar.$txt$,
   $txt$Tudo bem! 🙋 Sua conversa foi encaminhada para a equipe de atendimento do *IFSC – Câmpus Tubarão*. Um atendente humano vai responder por aqui assim que possível, em horário de expediente.

Se quiser voltar ao atendimento automático, digite *menu*.$txt$),
  ('nao_texto', 6, $txt$Mensagem que não é texto$txt$, $txt$Resposta para áudio, imagem, figurinha e outros formatos.$txt$,
   $txt$Olá! No momento consigo atender apenas mensagens de *texto*. Pode escrever sua dúvida sobre editais, inscrições, prazos ou documentos do IFSC Câmpus Tubarão?$txt$),
  ('rodape_resposta', 7, $txt$Rodapé das respostas$txt$, $txt$Adicionado ao fim de cada resposta a uma pergunta (resposta padrão ou editais).$txt$,
   $txt$Caso isso não tenha te ajudado, digite *4* para solicitar um atendimento humano.$txt$),
  ('falha_bot', 8, $txt$Falha do assistente$txt$, $txt$Enviada quando o Gemini não responde. O atendimento é encaminhado para humano.$txt$,
   $txt$Desculpe a demora! 🙏 Um *atendente humano* já vai retornar com as informações solicitadas dentro de alguns minutos.$txt$)
on conflict (chave) do nothing;

-- Painel: admin logado lê e edita o texto (não cria nem apaga mensagens)
alter table public.mensagens_bot enable row level security;
drop policy if exists admin_le_mensagens on public.mensagens_bot;
drop policy if exists admin_edita_mensagens on public.mensagens_bot;
create policy admin_le_mensagens on public.mensagens_bot for select to authenticated using (true);
create policy admin_edita_mensagens on public.mensagens_bot for update to authenticated using (true) with check (true);
revoke all on public.mensagens_bot from anon, authenticated;
grant select on public.mensagens_bot to authenticated;
grant update (texto, atualizado_em) on public.mensagens_bot to authenticated;
