# Banco de dados (Supabase)

As migrações em `migrations/` são a fonte oficial do esquema. Rode no SQL Editor, em ordem, de `0002` a `0011`. A `0001` é só um exemplo. Todas são idempotentes.

Algumas funções foram reescritas em migrações novas. A tabela abaixo diz em qual arquivo está a versão que vale hoje.

| Objeto | Versão atual em |
| --- | --- |
| `ifacil_rotear` | 0010 |
| `ifacil_assuntos`, `ifacil_perguntas_assunto`, `ifacil_texto_menu`, `ifacil_texto_submenu`, `ifacil_rotulo` | 0010 |
| `registrar_atendimento`, `registrar_mensagem_humana`, `ifacil_eh_saudacao` | 0008 |
| `buscar_resposta_padrao`, `ifacil_normalizar` | 0005 |
| `painel_finalizar_atendimento` | 0006 |
| `painel_ordenar_respostas`, `painel_ordenar_assuntos` | 0010 |
| `match_edital_chunks`, tabelas `edital_chunks` e `n8n_chat_histories` | 0002 |
| `atendimento_estado` | 0003 |
| `categorias`, `contatos`, `conversas`, `mensagens`, `perguntas_nao_respondidas`, `respostas_padrao` e as views `vw_*` | 0004 (`vw_respostas_padrao` em 0010) |
| `mensagens_bot` | 0007 |
| Gatilho `atualizado_em` automático | 0011 |

## Pasta `sql/` na raiz

- `diagnostico.sql`: só lê. Mostra quais tabelas têm RLS e quais políticas existem.
- `rls_policies.sql`: script de emergência. Liga RLS em tudo e tira o acesso do visitante. Use se o `npm run testar:banco` acusar vazamento. Não faz parte da ordem de migrações.
