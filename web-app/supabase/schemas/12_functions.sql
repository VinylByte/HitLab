-- Auto-update updated_at on row modification
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

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.decks
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.songs
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.spotify_tokens
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
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

-- Helper: check deck access by minimum role
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
        or (p_min_role = 'viewer' and visibility = 'public')
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
-- Upsert the calling user's Spotify OAuth token
create or replace function public.upsert_own_spotify_token(
  p_access_token  text,
  p_refresh_token text,
  p_expires_at    timestamptz,
  p_scope         text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.spotify_tokens (user_id, access_token, refresh_token, expires_at, scope)
  values (auth.uid(), p_access_token, p_refresh_token, p_expires_at, p_scope)
  on conflict (user_id) do update set
    access_token  = excluded.access_token,
    refresh_token = excluded.refresh_token,
    expires_at    = excluded.expires_at,
    scope         = coalesce(excluded.scope, public.spotify_tokens.scope),
    updated_at    = now();
end;
$$;

-- Retrieve the calling user's stored Spotify OAuth token
create or replace function public.get_own_spotify_token()
returns table (
  access_token  text,
  refresh_token text,
  expires_at    timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select access_token, refresh_token, expires_at
  from public.spotify_tokens
  where user_id = auth.uid();
$$;