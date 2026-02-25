create table public.songs (
  id                uuid primary key default gen_random_uuid(),
  spotify_track_id  text not null unique,
  title             text not null,
  artist            text not null,
  album             text,
  year              smallint,
  thumbnail_url     text,
  duration_ms       integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index idx_songs_spotify_track on public.songs(spotify_track_id);

comment on table public.songs is 'Snapshot of Spotify track metadata to avoid repeated API calls.';
