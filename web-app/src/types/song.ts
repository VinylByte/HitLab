import type { Tables } from "./database.types";

export type SongRow = Tables<"songs">;

/** Song info embedded in a deck song */
export type Song = Pick<
    SongRow,
    "id" | "spotify_track_id" | "title" | "artist" | "album" | "year" | "thumbnail_url"
> & {
    duration_ms?: number;
};

/** DTO returned by fetchPublicDeckSongs - holds meta info about the addition of song to a deck */
export type DeckSong = {
    id: string;
    deck_id: string;
    song: Song;
    card_note: string | null;
    created_at: Date;
};
