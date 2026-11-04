create or replace function public.ifacil_carimba_atualizacao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists carimba_atualizacao on public.respostas_padrao;
create trigger carimba_atualizacao
  before update on public.respostas_padrao
  for each row execute function public.ifacil_carimba_atualizacao();

drop trigger if exists carimba_atualizacao on public.mensagens_bot;
create trigger carimba_atualizacao
  before update on public.mensagens_bot
  for each row execute function public.ifacil_carimba_atualizacao();

revoke execute on function public.ifacil_carimba_atualizacao() from public, anon, authenticated;
