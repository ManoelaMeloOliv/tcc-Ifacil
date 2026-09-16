# Workflows n8n (RAG)

Esta pasta armazena os arquivos **JSON exportados** dos fluxos n8n usados no chat RAG do TCC.

## Convenção sugerida

- Nomeie os arquivos com data + objetivo + versão, por exemplo:
  - `2026-09-16-rag-chat-v1.json`
  - `2026-09-20-rag-chat-v2.json`
- Mantenha histórico de versões no Git para facilitar auditoria e rollback.

## Segurança

- **Nunca** exporte/commite credenciais, tokens, chaves de API ou segredos.
- Revise o JSON antes de commitar para garantir que só existam referências seguras (placeholders/IDs sem segredo).
- As credenciais reais devem permanecer no ambiente do n8n (externo ao repositório).
