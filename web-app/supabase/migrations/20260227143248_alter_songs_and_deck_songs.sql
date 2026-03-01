-- position aus deck_songs entfernen
alter table public.deck_songs drop column position;

-- year in songs als Pflichtfeld setzen
alter table public.songs alter column year set not null;