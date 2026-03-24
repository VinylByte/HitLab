import supabase from "../supabase";
import type {
    PlaybackState,
    SpotifyDevice,
    SpotifyDevicesResponse,
    SpotifyPlaylistTracksResponse,
    SpotifySearchResponse,
    SpotifyTrack,
    SpotifyTrackApi,
} from "../types/spotify";
import { mapSpotifyError } from "./spotifyErrorMapper";

export function extractSpotifyPlaylistId(input: string): string | null {
    const trimmedInput = input.trim();
    if (!trimmedInput) return null;

    const uriMatch = /^spotify:playlist:([A-Za-z0-9]+)$/i.exec(trimmedInput);
    if (uriMatch) return uriMatch[1];

    try {
        const url = new URL(trimmedInput);
        const pathMatch = /^\/playlist\/([A-Za-z0-9]+)$/.exec(url.pathname);
        if (!pathMatch) return null;
        return pathMatch[1];
    } catch {
        return null;
    }
}

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

type AuthSession = {
    accessTokenStr: string;
    refreshTokenStr: string;
    expiresIn: number;
};

/**
 * Refresh Spotify token using the Edge Function
 * Calls the secure refresh-spotify-token edge function
 */
async function refreshSpotifyTokenViaEdgeFunction(
    refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/refresh-spotify-token`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("[spotify] Edge function error:", response.status, errorBody);
        throw new Error(`Edge function error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
        console.error("[spotify] Spotify error from edge function:", data.error);
        throw new Error(data.error);
    }

    return data;
}

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
                "[spotify] stored token expired or near expiry (expiresIn: " +
                    expiresIn +
                    "s), attempting refresh"
            );

            try {
                // Try to refresh via edge function using refresh_token
                const refreshData = await refreshSpotifyTokenViaEdgeFunction(refreshTokenStr);
                accessTokenStr = refreshData.access_token;
                expiresIn = refreshData.expires_in;

                // Update stored token in database with Unix timestamp (seconds)
                const expiresAtUnix = Math.floor(Date.now() / 1000) + refreshData.expires_in;
                await persistSpotifyToken(accessTokenStr, refreshTokenStr, expiresAtUnix);

                console.debug("[spotify] token refreshed successfully via edge function", {
                    expiresIn: refreshData.expires_in,
                });
            } catch (refreshError) {
                console.warn(
                    "[spotify] edge function refresh failed, trying supabase session refresh",
                    refreshError
                );

                // Fallback: try supabase session refresh
                const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
                if (refreshErr) {
                    console.error("[spotify] supabase session refresh failed", refreshErr);
                    throw new Error("Spotify Token abgelaufen. Bitte erneut einloggen.");
                }

                const refreshedSession = refreshed.session;
                if (!refreshedSession?.provider_token) {
                    throw new Error(
                        "Spotify Token abgelaufen. Bitte erneut mit Spotify einloggen."
                    );
                }

                accessTokenStr = refreshedSession.provider_token;
                refreshTokenStr = refreshedSession.provider_refresh_token ?? refreshTokenStr;
                expiresIn = refreshedSession.expires_at
                    ? Math.max(0, refreshedSession.expires_at - Math.floor(Date.now() / 1000))
                    : 3600;

                await persistSpotifyToken(
                    accessTokenStr,
                    refreshTokenStr,
                    refreshedSession.expires_at
                );
            }
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

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
}

function toSpotifyTrack(item: SpotifyTrackApi): SpotifyTrack {
    return {
        spotify_track_id: item.id,
        title: item.name,
        artist: item.artists.map(artist => artist.name).join(", ") || "Unknown",
        album: item.album.name,
        year: Number((item.album.release_date ?? "1900").slice(0, 4)),
        thumbnail_url: item.album.images[0]?.url ?? null,
        duration_ms: item.duration_ms,
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

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const trimmedPlaylistId = playlistId.trim();
    if (!trimmedPlaylistId) {
        throw new Error("Ungueltige Spotify-Playlist-ID");
    }

    const { accessTokenStr } = await getSpotifyAuthSession();

    try {
        const songs: SpotifyTrack[] = [];
        let offset = 0;
        const limit = 100;
        let total = 0;

        do {
            const params = new URLSearchParams({
                market: "DE",
                limit: String(limit),
                offset: String(offset),
            });

            const response = await spotifyFetch<SpotifyPlaylistTracksResponse>(
                accessTokenStr,
                `/playlists/${encodeURIComponent(trimmedPlaylistId)}/items?${params.toString()}` // /tracks}
            );

            songs.push(
                ...response.items
                    .map(item => item.item)
                    .filter((track): track is SpotifyTrackApi => Boolean(track))
                    .map(toSpotifyTrack)
            );

            total = response.total;
            offset += response.limit;
        } while (offset < total);

        return songs;
    } catch (error) {
        console.error("[spotify] getPlaylistTracks failed", {
            playlistId: trimmedPlaylistId,
            error,
        });
        throw mapSpotifyError(error);
    }
}

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

type StartPlaybackOptions = {
    deviceId?: string;
    positionMs?: number;
};

type StartPlaybackResult = {
    deviceId?: string;
};

export async function startPlayback(
    trackId: string,
    options?: StartPlaybackOptions
): Promise<StartPlaybackResult> {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        let targetDevice = options?.deviceId;

        if (!targetDevice) {
            const { devices } = await spotifyFetch<SpotifyDevicesResponse>(
                accessTokenStr,
                "/me/player/devices"
            );
            targetDevice = devices.find(d => d.is_active)?.id ?? devices[0]?.id ?? undefined;
        }

        const playPath = targetDevice
            ? `/me/player/play?device_id=${encodeURIComponent(targetDevice)}`
            : "/me/player/play";

        const positionMs =
            typeof options?.positionMs === "number"
                ? Math.max(0, Math.floor(options.positionMs))
                : undefined;

        await spotifyFetch<void>(accessTokenStr, playPath, {
            method: "PUT",
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
                ...(positionMs !== undefined ? { position_ms: positionMs } : {}),
            }),
        });

        return { deviceId: targetDevice };
    } catch (error) {
        console.error("[spotify] startPlayback failed", error);
        throw mapSpotifyError(error);
    }
}

export async function pausePlayback(): Promise<void> {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        await spotifyFetch<void>(accessTokenStr, "/me/player/pause", {
            method: "PUT",
        });
    } catch (error) {
        console.error("[spotify] pausePlayback failed", error);
        throw mapSpotifyError(error);
    }
}

export async function resumePlayback(): Promise<void> {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        await spotifyFetch<void>(accessTokenStr, "/me/player/play", {
            method: "PUT",
        });
    } catch (error) {
        console.error("[spotify] resumePlayback failed", error);
        throw mapSpotifyError(error);
    }
}

export async function getPlaybackState(): Promise<PlaybackState | null> {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        const state = await spotifyFetch<PlaybackState | undefined>(accessTokenStr, "/me/player");
        return state ?? null;
    } catch (error) {
        console.error("[spotify] getPlaybackState failed", error);
        throw mapSpotifyError(error);
    }
}

export async function getTrack(trackId: string): Promise<SpotifyTrack> {
    const { accessTokenStr } = await getSpotifyAuthSession();
    try {
        const item = await spotifyFetch<SpotifyTrackApi>(
            accessTokenStr,
            `/tracks/${encodeURIComponent(trackId)}`
        );
        return toSpotifyTrack(item);
    } catch (error) {
        console.error("[spotify] getTrack failed", error);
        throw mapSpotifyError(error);
    }
}
