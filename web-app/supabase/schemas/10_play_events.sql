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
