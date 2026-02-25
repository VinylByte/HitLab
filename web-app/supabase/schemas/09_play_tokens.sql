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
