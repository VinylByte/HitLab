import type { Tables } from "../database.types";

export type SongRow = Tables<"songs">;

export type Song = Pick<
  SongRow,
  "id" | "spotify_track_id" | "title" | "artist" | "album" | "year" | "thumbnail_url"
>;

export type DeckSong = {
  id: string;
  deck_id: string;
  song: Song;
  card_note: string | null;
  created_at: Date;
};
