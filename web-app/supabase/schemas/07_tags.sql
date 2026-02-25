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
