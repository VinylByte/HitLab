create table public.deck_songs (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  song_id       uuid not null references public.songs(id) on delete cascade,
  card_note     text,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique (deck_id, song_id)
);

create index idx_deck_songs_deck on public.deck_songs(deck_id);

comment on table public.deck_songs is 'list of songs belonging to a deck.';
