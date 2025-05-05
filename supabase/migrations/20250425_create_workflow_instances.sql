-- Tabela para registrar execuções de workflows (instâncias de bots)
create table if not exists workflow_instances (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id),
  user_id uuid, -- usuário dono do fluxo
  step_index integer default 0,
  context jsonb, -- contexto da execução (ex: variáveis, respostas, etc)
  active boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);
