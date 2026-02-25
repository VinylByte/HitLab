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
-- songs
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
-- tags & deck_tags
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
-- play_tokens
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
-- play_events
-- -------------------------
create policy "play_events_insert_anon"
  on public.play_events for insert
  with check (true);

create policy "play_events_select"
  on public.play_events for select
  using (public.has_deck_access(deck_id, 'viewer'));

-- -------------------------
-- spotify_tokens (NO client access, service_role only)
-- -------------------------
-- No policies = denied for all anon/authenticated users.
-- Access only via service_role key or server-side functions.
