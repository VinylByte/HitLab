-- ============================================================
-- HitLab Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  spotify_user_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table public.profiles is 'App-level user metadata, linked 1:1 to auth.users.';

-- ============================================================
-- 2. decks
-- ============================================================
create type public.deck_visibility as enum ('private', 'public');

create table public.decks (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  visibility    public.deck_visibility not null default 'private',
  share_token   text unique default encode(extensions.gen_random_bytes(16), 'hex'),
  cover_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_decks_owner_id on public.decks(owner_id);
create index idx_decks_share_token on public.decks(share_token);

comment on table public.decks is 'A card deck created by a user.';

-- ============================================================
-- 3. deck_collaborators
-- ============================================================
create type public.collaborator_role as enum ('owner', 'editor', 'viewer');

create table public.deck_collaborators (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          public.collaborator_role not null default 'viewer',
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique (deck_id, user_id)
);

create index idx_deck_collaborators_deck on public.deck_collaborators(deck_id);
create index idx_deck_collaborators_user on public.deck_collaborators(user_id);

comment on table public.deck_collaborators is 'Many-to-many: users who collaborate on a deck with a given role.';

-- ============================================================
-- 4. songs
-- ============================================================
create table public.songs (
  id                uuid primary key default gen_random_uuid(),
  spotify_track_id  text not null unique,
  title             text not null,
  artist            text not null,
  album             text,
  year              smallint,
  thumbnail_url     text,
  duration_ms       integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index idx_songs_spotify_track on public.songs(spotify_track_id);

comment on table public.songs is 'Snapshot of Spotify track metadata to avoid repeated API calls.';

-- ============================================================
-- 5. deck_songs
-- ============================================================
create table public.deck_songs (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  song_id       uuid not null references public.songs(id) on delete cascade,
  position      integer not null default 0,
  card_note     text,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique (deck_id, song_id)
);

create index idx_deck_songs_deck on public.deck_songs(deck_id);
create index idx_deck_songs_position on public.deck_songs(deck_id, position);

comment on table public.deck_songs is 'Ordered list of songs belonging to a deck.';

-- ============================================================
-- 6. tags
-- ============================================================
create table public.tags (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  created_at    timestamptz not null default now()
);

create table public.deck_tags (
  deck_id       uuid not null references public.decks(id) on delete cascade,
  tag_id        uuid not null references public.tags(id) on delete cascade,
  primary key (deck_id, tag_id)
);

create index idx_deck_tags_tag on public.deck_tags(tag_id);

comment on table public.tags is 'Reusable tags for categorising decks.';
comment on table public.deck_tags is 'Many-to-many relation between decks and tags.';

-- ============================================================
-- 7. pdf_exports
-- ============================================================
create table public.pdf_exports (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  format        text not null default 'a4',
  storage_path  text not null,
  file_size     bigint,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_pdf_exports_deck on public.pdf_exports(deck_id);

comment on table public.pdf_exports is 'Records of generated PDF files stored in Supabase Storage.';

-- ============================================================
-- 8. play_tokens
-- ============================================================
create table public.play_tokens (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique default encode(extensions.gen_random_bytes(12), 'hex'),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  deck_song_id  uuid references public.deck_songs(id) on delete set null,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_play_tokens_token on public.play_tokens(token);

comment on table public.play_tokens is 'Short tokens encoded in QR codes that map to a deck/card for playback.';

-- ============================================================
-- 9. play_events
-- ============================================================
create table public.play_events (
  id              uuid primary key default gen_random_uuid(),
  play_token_id   uuid references public.play_tokens(id) on delete set null,
  deck_id         uuid not null references public.decks(id) on delete cascade,
  song_id         uuid references public.songs(id) on delete set null,
  scanned_by      uuid references public.profiles(id) on delete set null,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz not null default now()
);

create index idx_play_events_deck on public.play_events(deck_id);
create index idx_play_events_token on public.play_events(play_token_id);

comment on table public.play_events is 'Analytics: each QR scan or play request.';

-- ============================================================
-- 10. spotify_tokens  (restricted – service_role only)
-- ============================================================
create table public.spotify_tokens (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  access_token    text not null,
  refresh_token   text not null,
  token_type      text not null default 'Bearer',
  scope           text,
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.spotify_tokens is 'Spotify OAuth tokens. Access restricted to service_role only.';

-- ============================================================
-- Helper: auto-update updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach trigger to tables that have updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.decks
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.songs
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.spotify_tokens
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Helper: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.deck_collaborators enable row level security;
alter table public.songs enable row level security;
alter table public.deck_songs enable row level security;
alter table public.tags enable row level security;
alter table public.deck_tags enable row level security;
alter table public.pdf_exports enable row level security;
alter table public.play_tokens enable row level security;
alter table public.play_events enable row level security;
alter table public.spotify_tokens enable row level security;

-- -------------------------
-- profiles
-- -------------------------
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_public"
  on public.profiles for select
  using (deleted_at is null);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -------------------------
-- decks
-- -------------------------
-- Helper to check deck access
create or replace function public.has_deck_access(p_deck_id uuid, p_min_role public.collaborator_role default 'viewer')
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.decks
    where id = p_deck_id
      and deleted_at is null
      and (
        owner_id = auth.uid()
        or exists (
          select 1 from public.deck_collaborators
          where deck_id = p_deck_id
            and user_id = auth.uid()
            and deleted_at is null
            and (
              case p_min_role
                when 'viewer' then role in ('viewer', 'editor', 'owner')
                when 'editor' then role in ('editor', 'owner')
                when 'owner'  then role = 'owner'
              end
            )
        )
      )
  );
$$;

create policy "decks_select_own_or_collaborator"
  on public.decks for select
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or visibility = 'public'
      or exists (
        select 1 from public.deck_collaborators
        where deck_id = id and user_id = auth.uid() and deleted_at is null
      )
    )
  );

create policy "decks_insert_own"
  on public.decks for insert
  with check (owner_id = auth.uid());

create policy "decks_update_own_or_editor"
  on public.decks for update
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or exists (
        select 1 from public.deck_collaborators
        where deck_id = id and user_id = auth.uid() and role in ('editor', 'owner') and deleted_at is null
      )
    )
  );

create policy "decks_delete_own"
  on public.decks for delete
  using (owner_id = auth.uid());

-- -------------------------
-- deck_collaborators
-- -------------------------
create policy "collab_select"
  on public.deck_collaborators for select
  using (
    deleted_at is null
    and (
      user_id = auth.uid()
      or public.has_deck_access(deck_id, 'viewer')
    )
  );

create policy "collab_insert_owner"
  on public.deck_collaborators for insert
  with check (
    exists (
      select 1 from public.decks
      where id = deck_id and owner_id = auth.uid() and deleted_at is null
    )
  );

create policy "collab_update_owner"
  on public.deck_collaborators for update
  using (
    exists (
      select 1 from public.decks
      where id = deck_id and owner_id = auth.uid() and deleted_at is null
    )
  );

create policy "collab_delete_owner"
  on public.deck_collaborators for delete
  using (
    exists (
      select 1 from public.decks
      where id = deck_id and owner_id = auth.uid() and deleted_at is null
    )
  );

-- -------------------------
-- songs (read-only for authenticated users, insert by authenticated)
-- -------------------------
create policy "songs_select_authenticated"
  on public.songs for select
  using (deleted_at is null);

create policy "songs_insert_authenticated"
  on public.songs for insert
  with check (auth.uid() is not null);

create policy "songs_update_authenticated"
  on public.songs for update
  using (auth.uid() is not null and deleted_at is null);

-- -------------------------
-- deck_songs
-- -------------------------
create policy "deck_songs_select"
  on public.deck_songs for select
  using (
    deleted_at is null
    and public.has_deck_access(deck_id, 'viewer')
  );

create policy "deck_songs_insert"
  on public.deck_songs for insert
  with check (public.has_deck_access(deck_id, 'editor'));

create policy "deck_songs_update"
  on public.deck_songs for update
  using (public.has_deck_access(deck_id, 'editor'));

create policy "deck_songs_delete"
  on public.deck_songs for delete
  using (public.has_deck_access(deck_id, 'editor'));

-- -------------------------
-- tags & deck_tags (public read, insert by authenticated)
-- -------------------------
create policy "tags_select_all"
  on public.tags for select
  using (true);

create policy "tags_insert_authenticated"
  on public.tags for insert
  with check (auth.uid() is not null);

create policy "deck_tags_select"
  on public.deck_tags for select
  using (true);

create policy "deck_tags_insert"
  on public.deck_tags for insert
  with check (public.has_deck_access(deck_id, 'editor'));

create policy "deck_tags_delete"
  on public.deck_tags for delete
  using (public.has_deck_access(deck_id, 'editor'));

-- -------------------------
-- pdf_exports
-- -------------------------
create policy "pdf_exports_select"
  on public.pdf_exports for select
  using (
    deleted_at is null
    and public.has_deck_access(deck_id, 'viewer')
  );

create policy "pdf_exports_insert"
  on public.pdf_exports for insert
  with check (public.has_deck_access(deck_id, 'editor'));

-- -------------------------
-- play_tokens (readable by anyone for QR scanning, managed by deck editors)
-- -------------------------
create policy "play_tokens_select_all"
  on public.play_tokens for select
  using (deleted_at is null);

create policy "play_tokens_insert"
  on public.play_tokens for insert
  with check (public.has_deck_access(deck_id, 'editor'));

create policy "play_tokens_delete"
  on public.play_tokens for delete
  using (public.has_deck_access(deck_id, 'owner'));

-- -------------------------
-- play_events (insert by anyone, select by deck owner/editors)
-- -------------------------
create policy "play_events_insert_anon"
  on public.play_events for insert
  with check (true);

create policy "play_events_select"
  on public.play_events for select
  using (public.has_deck_access(deck_id, 'viewer'));

-- -------------------------
-- spotify_tokens (NO client access – service_role only)
-- -------------------------
-- No policies = denied for all anon/authenticated users.
-- Access only via service_role key or server-side functions.
