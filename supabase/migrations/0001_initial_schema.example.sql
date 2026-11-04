create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  course text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('pdf', 'url', 'text', 'other')),
  source_reference text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  rag_context jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_documents_status on public.knowledge_documents (status);
create index if not exists idx_chat_conversations_user_id on public.chat_conversations (user_id);
create index if not exists idx_chat_messages_conversation_id on public.chat_messages (conversation_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages (created_at);

alter table public.profiles enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "conversations_select_own"
  on public.chat_conversations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "messages_select_own"
  on public.chat_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.chat_conversations c
      where c.id = conversation_id
        and c.user_id = auth.uid()
    )
  );
