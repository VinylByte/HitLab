import { PAGINATION_BREAKPOINT } from "../components/pages/Settings";
import supabase from "../supabase";

/** Tag attached to a deck. */
export type DeckTag = {
    id: string;
    name: string;
};

/** Owner profile summary embedded in a deck. */
export type DeckOwner = {
    display_name: string | null;
    avatar_url: string | null;
};

/** DTO returned by fetchPublicDecks — one card in the public deck list. */
export type PublicDeckDTO = {
    id: string;
    name: string;
    description: string | null;
    cover_url: string | null;
    created_at: string;
    owner: DeckOwner;
    tags: DeckTag[];
};

/**
 * Fetches all public, non-deleted decks with owner profile and tags.
 * Transforms Supabase response into properly typed PublicDeckDTO[].
 */
export async function fetchPublicDecks(
    search_str: string,
    page: number
): Promise<{ decks: PublicDeckDTO[]; totalCount: number }> {
    const { data, error, count } = await supabase
        .from("decks")
        .select(
            `
            id,
            name,
            description,
            cover_url,
            created_at,
            profiles!owner_id ( display_name, avatar_url ),
            deck_tags ( tags ( id, name ) )
            `,
            { count: "exact" }
        )
        .eq("visibility", "public")
        .is("deleted_at", null)
        .ilike("name", "%" + search_str + "%")
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGINATION_BREAKPOINT, page * PAGINATION_BREAKPOINT - 1);

    if (error) throw error;

    const decks: PublicDeckDTO[] = (data ?? []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        cover_url: row.cover_url,
        created_at: new Date(row.created_at).toLocaleDateString("de-DE"),
        owner: row.profiles ?? { display_name: null, avatar_url: null },
        tags: (row.deck_tags ?? [])
            .map((dt: { tags: { id: string; name: string } | null }) => ({
                id: dt.tags!.id,
                name: dt.tags!.name,
            }))
            .filter((tag): tag is DeckTag => tag !== null),
    }));

    return { decks, totalCount: count ?? 0 };
}

/** Song info embedded in a deck song */
export type Song = {
    id: string;
    title: string;
    artist: string;
    year: number;
    thumbnail_url: string | null;
};

/** DTO returned by fetchPublicDeckSongs - holds meta info about the addition of song to a deck */
export type PublicDeckSongDTO = {
    id: string;
    deck_id: string;
    song: Song;
    card_note: string | null;
    created_at: Date;
};

/**
 * Fetches songs for a public deck and transforms into properly typed DTOs.
 */
export async function fetchPublicDeckSongs(publicDeckId: string): Promise<PublicDeckSongDTO[]> {
    const { data, error } = await supabase
        .from("deck_songs")
        .select(
            `
        id,
        deck_id,
        songs!song_id ( id, spotify_track_id, title, artist, year, thumbnail_url ),
        card_note,
        created_at
        `
        )
        .eq("deck_id", publicDeckId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(row => ({
        id: row.id,
        deck_id: row.deck_id,
        song: {
            id: row.songs.id,
            spotify_track_id: row.songs.spotify_track_id,
            title: row.songs.title,
            artist: row.songs.artist,
            year: row.songs.year,
            thumbnail_url: row.songs.thumbnail_url,
        },
        card_note: row.card_note,
        created_at: new Date(row.created_at),
    }));
}
