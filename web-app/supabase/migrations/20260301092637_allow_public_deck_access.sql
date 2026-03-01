-- Allow public decks to pass has_deck_access for viewer-level checks
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
