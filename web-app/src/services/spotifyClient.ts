import supabase from "../supabase";
import { mapSpotifyError, SpotifyApiError } from "./spotifyErrorMapper";

/**
 * Persists the Spotify OAuth token in the database so it survives page refreshes.
 * Called from useSession when provider_token is available (right after OAuth callback).
 */
export async function persistSpotifyToken(
    accessToken: string,
    refreshToken: string,
    expiresAtUnix?: number
): Promise<void> {
    const expiresAt = new Date(
        expiresAtUnix ? expiresAtUnix * 1000 : Date.now() + 3600 * 1000
    ).toISOString();
    const { error } = await supabase.rpc("upsert_own_spotify_token", {
        p_access_token: accessToken,
        p_refresh_token: refreshToken,
        p_expires_at: expiresAt,
    });
    if (error) console.warn("Failed to persist Spotify token:", error);
}

type SpotifyTrackApi = {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        release_date?: string;
        images: Array<{ url: string }>;
    };
};

type SpotifyDevicesResponse = {
    devices: SpotifyDevice[];
};

type SpotifySearchResponse = {
    tracks: {
        items: SpotifyTrackApi[];
    };
};

type AuthSession = {
    accessTokenStr: string;
    refreshTokenStr: string;
    expiresIn: number;
};

async function getSpotifyAuthSession(): Promise<AuthSession> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session;
    if (!session) throw new Error("Keine aktive Session");

    let accessTokenStr: string;
    let refreshTokenStr: string;
    let expiresIn: number;

    if (session.provider_token) {
        // Token is available in memory (right after OAuth callback)
        accessTokenStr = session.provider_token;
        refreshTokenStr = session.provider_refresh_token ?? "";
        expiresIn = session.expires_at
            ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
            : 3600;
    } else {
        // Fallback: read persisted token from database
        console.debug("[spotify] provider_token missing in session, loading token from DB");
        const { data: rows, error: tokenErr } = await supabase.rpc("get_own_spotify_token");
        if (tokenErr) throw tokenErr;
        if (!rows || rows.length === 0) {
            throw new Error("Kein Spotify Token vorhanden. Bitte erneut einloggen.");
        }
        const row = rows[0];
        accessTokenStr = row.access_token;
        refreshTokenStr = row.refresh_token;
        expiresIn = Math.max(
            0,
            Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000)
        );

        if (expiresIn <= 30) {
            console.warn(
                "[spotify] stored token expired or near expiry, trying supabase session refresh"
            );
            const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
            if (refreshErr) {
                console.error("[spotify] supabase session refresh failed", refreshErr);
                throw new Error("Spotify Token abgelaufen. Bitte erneut einloggen.");
            }

            const refreshedSession = refreshed.session;
            if (!refreshedSession?.provider_token) {
                throw new Error("Spotify Token abgelaufen. Bitte erneut mit Spotify einloggen.");
            }

            accessTokenStr = refreshedSession.provider_token;
            refreshTokenStr = refreshedSession.provider_refresh_token ?? refreshTokenStr;
            expiresIn = refreshedSession.expires_at
                ? Math.max(0, refreshedSession.expires_at - Math.floor(Date.now() / 1000))
                : 3600;

            await persistSpotifyToken(accessTokenStr, refreshTokenStr, refreshedSession.expires_at);
        }
    }

    return {
        accessTokenStr,
        refreshTokenStr,
        expiresIn,
    };
}

async function spotifyFetch<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw {
            status: response.status,
            message: errorBody || response.statusText,
        };
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

function toSpotifyTrack(item: SpotifyTrackApi): SpotifyTrack {
    return {
        spotify_track_id: item.id,
        title: item.name,
        artist: item.artists.map(artist => artist.name).join(", ") || "Unknown",
        album: item.album.name,
        year: Number((item.album.release_date ?? "1900").slice(0, 4)),
        thumbnail_url: item.album.images[0]?.url ?? null,
    };
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const { accessTokenStr } = await getSpotifyAuthSession();

    try {
        console.debug("[spotify] searching tracks", { query: trimmedQuery });
        const params = new URLSearchParams({
            q: trimmedQuery,
            type: "track",
            market: "DE",
            limit: "10",
        });
        const response = await spotifyFetch<SpotifySearchResponse>(
            accessTokenStr,
            `/search?${params.toString()}`
        );
        return response.tracks.items.map(toSpotifyTrack);
    } catch (error) {
        console.error("[spotify] searchTracks failed", error);
        throw mapSpotifyError(error);
    }
}
export type SpotifyDevice = {
    id: string;
    is_active: boolean;
    is_private_session?: boolean;
    is_restricted?: boolean;
    name: string;
    type: string;
    volume_percent?: number | null;
};

export async function getDevices(): Promise<SpotifyDevice[]> {
    const { accessTokenStr } = await getSpotifyAuthSession();

    try {
        const response = await spotifyFetch<SpotifyDevicesResponse>(
            accessTokenStr,
            "/me/player/devices"
        );
        return response.devices;
    } catch (error) {
        console.error("[spotify] getDevices failed", error);
        throw mapSpotifyError(error);
    }
}

export async function startPlayback(trackId: string, deviceId?: string) {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        let targetDevice = deviceId;

        if (!targetDevice) {
            const { devices } = await spotifyFetch<SpotifyDevicesResponse>(
                accessTokenStr,
                "/me/player/devices"
            );
            targetDevice = devices.find(d => d.is_active)?.id ?? undefined;
            if (!targetDevice) {
                throw new SpotifyApiError(
                    "NO_ACTIVE_DEVICE",
                    "Kein aktives Spotify-Gerät gefunden."
                );
            }
        }

        await spotifyFetch<void>(
            accessTokenStr,
            `/me/player/play?device_id=${encodeURIComponent(targetDevice)}`,
            {
                method: "PUT",
                body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
            }
        );
    } catch (error) {
        console.error("[spotify] startPlayback failed", error);
        throw mapSpotifyError(error);
    }
}

export type SpotifyTrack = {
    spotify_track_id: string;
    title: string;
    artist: string;
    album: string;
    year: number;
    thumbnail_url: string | null;
};
