-- Criação da tabela de workflows para armazenar fluxos no-code (arrasta e solta)
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- exemplo: 'atendimento', 'marketing', 'outros'
  definition jsonb not null, -- estrutura do workflow (nó, conexões, etc)
  created_at timestamp with time zone default timezone('utc', now())
);
