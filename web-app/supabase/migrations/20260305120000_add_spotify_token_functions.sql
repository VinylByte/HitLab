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
