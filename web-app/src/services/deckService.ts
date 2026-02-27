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
 * Flattens the nested Supabase response into a clean PublicDeckDTO[].
 */
export async function fetchPublicDecks(search_str: string, page: number): Promise<PublicDeckDTO[]> {
    const { data, error } = await supabase
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
            `
        )
        .eq("visibility", "public")
        .is("deleted_at", null)
        .ilike("name", "%" + search_str + "%")
        .order("created_at", { ascending: false })
        .range((page - 1) * 12, page * 12 - 1);

    if (error) throw error;

    return (data ?? []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        cover_url: row.cover_url,
        created_at: row.created_at,
        owner: row.profiles ?? { display_name: null, avatar_url: null },
        tags: (row.deck_tags ?? []).map((dt: { tags: DeckTag | null }) => dt.tags).filter((tag): tag is DeckTag => tag !== null),
    }));
}
