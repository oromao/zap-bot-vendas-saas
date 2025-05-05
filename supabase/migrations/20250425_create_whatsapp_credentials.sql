-- Create extension if not exists
create extension if not exists "uuid-ossp";

-- Create WhatsApp credentials table
create table if not exists whatsapp_credentials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  phone_number_id text not null,
  access_token text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Enable RLS
alter table whatsapp_credentials enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can manage their own WhatsApp credentials" on whatsapp_credentials;

-- Create policy to allow users to manage their own credentials
create policy "Users can manage their own WhatsApp credentials"
  on whatsapp_credentials
  for all
  using (auth.uid() = user_id);
