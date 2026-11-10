# iFácil

Assistente de atendimento por WhatsApp para o Instituto Federal (TCC). Responde dúvidas de alunos com menu guiado, respostas padrão cadastradas pela secretaria e, quando necessário, IA com busca nos editais (RAG). Um painel web permite acompanhar atendimentos e editar o conteúdo do bot.

## Arquitetura

```text
Aluno (WhatsApp)
      │
Evolution API ──webhook──▶ n8n ──▶ Supabase (Postgres + Auth + pgvector)
      ▲                     │              ▲
      └──────resposta───────┘              │
                          Gemini (IA)      │
                                           │
Painel web (React) ────────────────────────┘  (login do admin + RLS)
```

1. **Evolution API** conecta o número de WhatsApp e entrega cada mensagem ao n8n.
2. **n8n** orquestra o atendimento: roteia pelo menu (`ifacil_rotear`), procura resposta padrão (`buscar_resposta_padrao`), cai no agente RAG com Gemini e registra tudo (`registrar_atendimento`).
3. **Supabase** guarda conversas, respostas, mensagens do bot e os vetores dos editais.
4. **Painel** (este frontend) lê e edita o Supabase usando o login do administrador; as políticas de RLS protegem os dados.

## Estrutura

```text
src/
  paginas/        telas (login, visão geral, perguntas, histórico)
  componentes/    peças de interface, agrupadas por área
  servicos/       acesso ao Supabase (única camada que fala com o banco)
  lib/            cliente Supabase
supabase/migrations/   esquema do banco, em ordem (0001 é só exemplo)
sql/                   diagnóstico e políticas de RLS avulsas
n8n/workflows/         export do fluxo (sem credenciais)
docker/ e docker-compose.yml   Postgres, Redis, n8n e Evolution API locais
scripts/               teste de conexão e RLS do banco
```

## Subir o ambiente

```bash
cp .env.example .env
npm install
npm run dev
```

Preencha no `.env`: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (frontend; `VITE_NOME_INSTITUICAO` é opcional) e, para o docker-compose, `POSTGRES_PASSWORD` e `EVOLUTION_API_KEY`.

```bash
docker compose up -d
```

## Banco de dados

Rode no SQL Editor do Supabase, em ordem, as migrações `0002` a `0013` (veja `supabase/README.md`). Todas são idempotentes. Depois, `npm run testar:banco` confere que visitantes sem login não leem nada.

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm test` · `npm run testar:banco`

A cada push, o GitHub Actions (`.github/workflows/verificacao.yml`) roda lint, testes e build.

## Segurança

- `.env` nunca vai para o Git.
- Só a chave `anon` vai para o navegador; a `service_role` fica apenas no n8n.
- Desative o cadastro público de usuários no Supabase Auth: qualquer usuário logado é tratado como administrador.
- Credenciais do n8n ficam no próprio n8n, nunca no JSON exportado.
