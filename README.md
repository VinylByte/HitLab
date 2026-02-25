# HitLab

Custom deck builder for Hitster

## Requirements

- Auth via Supabase Auth with Spotify as an OAuth provider (linking accounts).
- UUID primary keys for all tables.
- Soft deletes via deleted_at timestamps.
- Decks can be private/public and shareable via URL; decks support multiple collaborators with roles (owner/editor/viewer).
- We store Spotify track id plus a snapshot of minimal metadata (title, artist, year, album, thumbnail, duration) to avoid repeated API calls.
- Generated PDFs are stored in Supabase Storage (one file per deck & format).
- QR codes encode a short play token or card URL that lets any scanner play the track on the website (not restricted to deck owner).
- Basic analytics for QR scans / plays stored.
- No versioning for MVP.
- Realtime not required for core; optional later.

## Tables & purpose

- users are managed by Supabase Auth; we add a profiles table for app metadata and to store spotify account linkage.
- decks: a deck record (owner id, visibility, share token, metadata).
- deck_collaborators: many-to-many for collaborators with role per deck.
- songs: snapshot of Spotify track metadata (unique by spotify_track_id).
- deck_songs: ordered list of songs in a deck (position, optional card metadata).
- pdf_exports: stored generated PDF records with storage path and format.
- play_events: each time a QR is scanned / play requested — for analytics.
- play_tokens: short-lived or persistent tokens encoded in QR that map to deck/card and optionally track play permissions (useful for short URLs).
- spotify_tokens: store OAuth tokens for controlling Spotify on behalf of user (refresh tokens encrypted or accessible to server only). Marked restricted — only service_role or server-side functions should access.
- optional: tags table if you want deck tags/search.
