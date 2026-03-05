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
    spotify_track_id: string;
    title: string;
    artist: string;
    album: string | null;
    year: number;
    thumbnail_url: string | null;
};

/** DTO returned by fetchPublicDeckSongs - holds meta info about the addition of song to a deck */
export type DeckSongsDTO = {
    id: string;
    deck_id: string;
    song: Song;
    card_note: string | null;
    created_at: Date;
};

/**
 * Fetches songs for a public deck and transforms into properly typed DTOs.
 */
export async function fetchDeckSongs(deckId: string): Promise<DeckSongsDTO[]> {
    const { data, error } = await supabase
        .from("deck_songs")
        .select(
            `
        id,
        deck_id,
        songs!song_id ( id, spotify_track_id, title, artist, album, year, thumbnail_url ),
        card_note,
        created_at
        `
        )
        .eq("deck_id", deckId)
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
            album: row.songs.album,
            year: row.songs.year,
            thumbnail_url: row.songs.thumbnail_url,
        },
        card_note: row.card_note,
        created_at: new Date(row.created_at),
    }));
}

export type OwnDeckDTO = {
    id: string;
    name: string;
    song_count: number;
    visibility: string;
    description: string | null;
    cover_url: string | null;
    created_at: string;
    owner: DeckOwner;
    tags: DeckTag[];
};

export type UpdateDeckInfoDTO = {
    deckId: string;
    name: string;
    description: string;
    private: boolean;
};

export async function updateDeckInfo(payload: UpdateDeckInfoDTO): Promise<void> {
    const { error } = await supabase
        .from("decks")
        .update({
            name: payload.name,
            description: payload.description,
            visibility: payload.private ? "private" : "public",
        })
        .eq("id", payload.deckId)
        .is("deleted_at", null);

    if (error) throw error;
}

export async function fetchOwnDeckById(deckId: string): Promise<OwnDeckDTO> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user.id;
    if (!userId) throw new Error("Nicht eingeloggt");

    const { data, error } = await supabase
        .from("decks")
        .select(
            `
            id,
            name,
            description,
            visibility,
            cover_url,
            created_at,
            profiles!owner_id ( display_name, avatar_url ),
            deck_tags ( tags ( id, name ) )
            `
        )
        .eq("id", deckId)
        .eq("owner_id", userId)
        .is("deleted_at", null)
        .single();

    if (error) throw error;

    const { count, error: countError } = await supabase
        .from("deck_songs")
        .select("id", { count: "exact", head: true })
        .eq("deck_id", deckId)
        .is("deleted_at", null);

    if (countError) throw countError;

    return {
        id: data.id,
        name: data.name,
        song_count: count ?? 0,
        visibility: data.visibility,
        description: data.description,
        cover_url: data.cover_url,
        created_at: new Date(data.created_at).toLocaleDateString("de-DE"),
        owner: data.profiles ?? { display_name: null, avatar_url: null },
        tags: (data.deck_tags ?? [])
            .map((dt: { tags: { id: string; name: string } | null }) => ({
                id: dt.tags!.id,
                name: dt.tags!.name,
            }))
            .filter((tag): tag is DeckTag => tag !== null),
    };
}

export async function fetchOwnDecks(): Promise<OwnDeckDTO[]> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user.id;
    if (!userId) throw new Error("Nicht eingeloggt");

    const { data, error } = await supabase
        .from("decks")
        .select(
            `
            id,
            name,
            description,
            visibility,
            cover_url,
            created_at,
            profiles!owner_id ( display_name, avatar_url ),
            deck_tags ( tags ( id, name ) )
            `
        )
        .eq("owner_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (error) throw error;

    const deckIds = (data ?? []).map(row => row.id);

    let songCountByDeckId = new Map<string, number>();
    if (deckIds.length > 0) {
        const { data: deckSongs, error: deckSongsError } = await supabase
            .from("deck_songs")
            .select("deck_id")
            .in("deck_id", deckIds)
            .is("deleted_at", null);

        if (deckSongsError) throw deckSongsError;

        songCountByDeckId = (deckSongs ?? []).reduce((acc, row) => {
            acc.set(row.deck_id, (acc.get(row.deck_id) ?? 0) + 1);
            return acc;
        }, new Map<string, number>());
    }

    return (data ?? []).map(row => ({
        id: row.id,
        name: row.name,
        song_count: songCountByDeckId.get(row.id) ?? 0,
        visibility: row.visibility,
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
}

export async function removeDeckSongs(deckId: string, songIds: string[]) {
    const { error } = await supabase
        .from("deck_songs")
        .delete()
        .eq("deck_id", deckId)
        .in("song_id", songIds);

    if (error) throw error;
}
