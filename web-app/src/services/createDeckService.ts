import supabase from "../supabase";
import type { SpotifyTrack } from "./spotifyClient";

export type MetaDeckDTO = {
    name: string;
    description: string;
    private: boolean;
    cover: Blob;
};

export async function createDeck(metaDeck: MetaDeckDTO): Promise<string> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) throw new Error("Nicht eingeloggt");

    const { data: ownProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

    if (profileError) throw normalizeError(profileError);
    if (!ownProfile) {
        throw new Error("Profil nicht gefunden. Bitte neu anmelden und erneut versuchen.");
    }

    const publicUrl = await persistPublicFile("deck-covers", metaDeck.cover, userId);

    const { data, error } = await supabase
        .from("decks")
        .insert({
            owner_id: userId,
            name: metaDeck.name,
            description: metaDeck.description,
            visibility: metaDeck.private ? "private" : "public",
            cover_url: publicUrl,
        })
        .select("id")
        .single();

    if (error) throw normalizeError(error);
    return data.id;
}

export type BucketName = "deck-covers";

/**
 * Persist a file in a public Bucket
 * @param bucket name of the bucket the file should be stored in
 * @param file the file to be stored (should be supported by bucket)
 * @param userId the userId the file is associated with
 * @returns public URL to the file
 */
async function persistPublicFile(bucket: BucketName, file: Blob, userId: string): Promise<string> {
    const fileExt = file.type.split("/")[1]; // z.B. "jpeg"
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`; // eindeutiger Pfad pro User

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) throw normalizeError(uploadError);

    // fetch public URL (no await, because it's synchronous)
    const {
        data: { publicUrl },
    } = supabase.storage.from("deck-covers").getPublicUrl(filePath);

    return publicUrl;
}

function normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) return new Error(message);
    }
    return new Error("Unbekannter Fehler");
}

/**
 * Adds selected songs to a deck (which is edited under a lab tab while logged in).
 * Also upserts the Tracks in the Database (persist if non existend, ignore if existend)
 * @param deckId Deck to which the songs should be added to
 * @param tracks the spotify songs that should be added to a deck
 */
export async function addDeckSong(
    deckId: string,
    tracks: SpotifyTrack[],
    onSongSettled: (spotifyTrackId: string) => void
): Promise<void> {
    const addedTracks = await addSong(tracks);
    // const { error } = await supabase.from("deck_songs").upsert(
    //     addedTracks.map(t => ({
    //         deck_id: deckId,
    //         song_id: t.id,
    //     })),
    //     { onConflict: "deck_id,song_id" }
    // );

    // if (error) throw error;

    await Promise.allSettled(
        addedTracks.map(async t => {
            const { error } = await supabase
                .from("deck_songs")
                .upsert({ deck_id: deckId, song_id: t.id }, { onConflict: "deck_id,song_id" });
            if (error) throw error;
            onSongSettled(t.spotify_track_id);
        })
    );
}

async function addSong(
    tracks: SpotifyTrack[]
): Promise<{ id: string; spotify_track_id: string }[]> {
    const { data, error } = await supabase
        .from("songs")
        .upsert(
            tracks.map(t => ({
                spotify_track_id: t.spotify_track_id,
                title: t.title,
                artist: t.artist,
                album: t.album ?? null,
                thumbnail_url: t.thumbnail_url,
                year: t.year,
            })),
            { onConflict: "spotify_track_id" }
        )
        .select("id, spotify_track_id");

    if (error) throw error;

    return data;
}
