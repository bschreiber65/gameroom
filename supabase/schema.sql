-- Codenames Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Friendships
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, friend_id),
  check (user_id <> friend_id)
);

-- Games
create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references public.profiles(id) on delete set null,
  player2_id uuid references public.profiles(id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'in_progress', 'win', 'loss')),
  turn_limit integer not null default 9,
  mistake_limit integer not null default 9,
  turn_count integer not null default 0,
  clue_count integer not null default 0,
  mistake_count integer not null default 0,
  correct_count integer not null default 0,
  current_turn text not null default 'player1'
    check (current_turn in ('player1', 'player2')),
  turn_lock text not null default '',
  card_lock boolean not null default true,
  cards jsonb not null default '[]'::jsonb,
  event_log jsonb not null default '[]'::jsonb,
  previous_words text[] default '{}',
  referral_game_id uuid references public.games(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

-- Invitations
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_id uuid references public.profiles(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'expired')),
  turn_limit integer not null default 9,
  mistake_limit integer not null default 9,
  previous_words text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_games_player1 on public.games(player1_id);
create index if not exists idx_games_player2 on public.games(player2_id);
create index if not exists idx_games_status on public.games(status);
create index if not exists idx_messages_game on public.messages(game_id);
create index if not exists idx_messages_user on public.messages(user_id);
create index if not exists idx_friendships_user on public.friendships(user_id);
create index if not exists idx_friendships_friend on public.friendships(friend_id);
create index if not exists idx_invitations_to_user on public.invitations(to_user_id);
create index if not exists idx_invitations_status on public.invitations(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_games_updated_at on public.games;
create trigger update_games_updated_at
  before update on public.games
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_invitations_updated_at on public.invitations;
create trigger update_invitations_updated_at
  before update on public.invitations
  for each row execute procedure public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.games enable row level security;
alter table public.messages enable row level security;
alter table public.invitations enable row level security;

-- Profiles: anyone authenticated can read, only own profile can update
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Friendships: can view/create/delete own
drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view own friendships"
  on public.friendships for select
  to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

drop policy if exists "Users can create friendships" on public.friendships;
create policy "Users can create friendships"
  on public.friendships for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own friendships" on public.friendships;
create policy "Users can delete own friendships"
  on public.friendships for delete
  to authenticated
  using (user_id = auth.uid());

-- Games: can view/update games you're a player in, create as player1
drop policy if exists "Users can view their games" on public.games;
create policy "Users can view their games"
  on public.games for select
  to authenticated
  using (player1_id = auth.uid() or player2_id = auth.uid() or status = 'waiting');

drop policy if exists "Users can create games" on public.games;
create policy "Users can create games"
  on public.games for insert
  to authenticated
  with check (player1_id = auth.uid());

drop policy if exists "Players can update their games" on public.games;
create policy "Players can update their games"
  on public.games for update
  to authenticated
  using (player1_id = auth.uid() or player2_id = auth.uid() or (status = 'waiting' and player2_id is null));

-- Messages: can view global + own game messages, create as self
drop policy if exists "Users can view messages" on public.messages;
create policy "Users can view messages"
  on public.messages for select
  to authenticated
  using (
    game_id is null
    or game_id in (
      select id from public.games
      where player1_id = auth.uid() or player2_id = auth.uid()
    )
  );

drop policy if exists "Users can create messages" on public.messages;
create policy "Users can create messages"
  on public.messages for insert
  to authenticated
  with check (user_id = auth.uid());

-- Invitations: can view/create/update own
drop policy if exists "Users can view own invitations" on public.invitations;
create policy "Users can view own invitations"
  on public.invitations for select
  to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

drop policy if exists "Users can create invitations" on public.invitations;
create policy "Users can create invitations"
  on public.invitations for insert
  to authenticated
  with check (from_user_id = auth.uid());

drop policy if exists "Users can update invitations sent to them" on public.invitations;
create policy "Users can update invitations sent to them"
  on public.invitations for update
  to authenticated
  using (to_user_id = auth.uid() or from_user_id = auth.uid());

-- ============================================
-- ENABLE REALTIME
-- ============================================

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'games') then
    alter publication supabase_realtime add table public.games;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'invitations') then
    alter publication supabase_realtime add table public.invitations;
  end if;
end $$;
