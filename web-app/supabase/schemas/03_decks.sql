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
