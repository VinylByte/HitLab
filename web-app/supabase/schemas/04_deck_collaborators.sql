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
