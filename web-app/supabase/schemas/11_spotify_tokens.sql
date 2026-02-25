-- Spotify OAuth tokens. Access restricted to service_role only.

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
