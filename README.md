# iFácil — Estrutura de Monorepo (TCC)

Este repositório concentra o **frontend web** do projeto iFácil e prepara a estrutura documental para evolução do TCC com integração externa de **Supabase** e **n8n**.

> Importante: a implementação atual do frontend foi mantida no diretório raiz por compatibilidade e **não teve alteração de lógica/comportamento**.

## Contexto do TCC

O objetivo é consolidar uma arquitetura em que a aplicação web consome:

1. **Supabase** para autenticação e persistência de dados.
2. **Pipeline RAG** orquestrado via **n8n** para chat com base de conhecimento.

## Arquitetura

- **Frontend web → Supabase** (auth + dados)
- **Frontend web → Webhook n8n → pipeline RAG/LLM/fonte de conhecimento → resposta ao usuário**

n8n e Supabase são serviços externos ao repositório: este projeto não provisiona esses ambientes.

## Layout atual do repositório

```text
.
├── src/                         # Frontend React/Vite (existente)
├── scripts/                     # Scripts utilitários existentes
├── sql/                         # SQL existente do projeto
├── n8n/
│   └── workflows/README.md      # Guia para versionar exports JSON de workflows
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.example.sql  # Exemplo ilustrativo de migração
├── .env.example
├── package.json
└── README.md
```

## Papéis das novas pastas

### `n8n/workflows/`

Armazena exports JSON de workflows n8n do chat RAG, com versionamento em Git e revisão de segurança antes do commit.

### `supabase/migrations/`

Armazena migrações SQL versionadas. O arquivo `0001_initial_schema.example.sql` é **apenas exemplo ilustrativo** e deve ser revisado antes de aplicação real.

## Ambiente local (frontend)

Use os comandos já existentes do projeto:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
npm run testar:banco
```

## Configuração de ambiente

1. Copie `.env.example` para `.env`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Configure `VITE_N8N_RAG_WEBHOOK_URL` (e opcionais, se necessário).

## Diretrizes de segurança

- `.env` não deve ser commitado.
- `VITE_SUPABASE_ANON_KEY` é chave pública de cliente; use somente permissões e RLS adequadas.
- **Nunca** exponha `SUPABASE_SERVICE_ROLE_KEY` no browser.
- Credenciais/sigilos do n8n devem permanecer no ambiente do n8n, nunca em exports JSON nem no Git.

## Fluxo recomendado (n8n e Supabase)

### Workflows n8n

1. Modelar/ajustar workflow no n8n (externo).
2. Exportar JSON sem credenciais.
3. Salvar em `n8n/workflows/` com nome versionado.
4. Abrir PR descrevendo mudanças do fluxo.

### Migrações Supabase

1. Propor/editar migração em `supabase/migrations/`.
2. Revisar segurança (RLS, privilégios e impacto em produção).
3. Aplicar a migração no ambiente Supabase apropriado (fora deste repositório).
4. Registrar no PR o contexto da alteração.

---

Seções de infraestrutura (n8n/Supabase) aqui são de documentação e scaffolding: a execução real ocorre em ambientes externos.
