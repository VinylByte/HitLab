import supabase from "../supabase";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { AccessToken, Device, Track } from "@spotify/web-api-ts-sdk";
import { mapSpotifyError, SpotifyApiError } from "./spotifyErrorMapper";

async function getSpotifySdk(): Promise<SpotifyApi> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session;
    const providerToken = session?.provider_token;

    if (!providerToken) {
        throw new Error("Kein Spotify Access Token in der Session");
    }

    const accessToken: AccessToken = {
        access_token: providerToken,
        token_type: "Bearer",
        expires_in: session.expires_at
            ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
            : 3600,
        refresh_token: session.provider_refresh_token ?? "",
    };

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    if (!clientId) {
        throw new Error("VITE_SPOTIFY_CLIENT_ID fehlt in den Frontend-Umgebungsvariablen");
    }

    return SpotifyApi.withAccessToken(clientId, accessToken);
}

function toSpotifyTrack(item: Track): SpotifyTrack {
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

    const sdk = await getSpotifySdk();

    try {
        const response = await sdk.search(trimmedQuery, ["track"], "DE", 10);
        return response.tracks.items.map(toSpotifyTrack);
    } catch (error) {
        throw mapSpotifyError(error);
    }
}
export type SpotifyDevice = Device;

export async function getDevices(): Promise<SpotifyDevice[]> {
    const sdk = await getSpotifySdk();

    try {
        const response = await sdk.player.getAvailableDevices();
        return response.devices;
    } catch (error) {
        throw mapSpotifyError(error);
    }
}

export async function startPlayback(trackId: string, deviceId?: string) {
    const sdk = await getSpotifySdk();
    try {
        let targetDevice = deviceId;

        if (!targetDevice) {
            const { devices } = await sdk.player.getAvailableDevices();
            targetDevice = devices.find(d => d.is_active)?.id ?? undefined;
            if (!targetDevice) {
                throw new SpotifyApiError(
                    "NO_ACTIVE_DEVICE",
                    "Kein aktives Spotify-Gerät gefunden."
                );
            }
        }

        await sdk.player.startResumePlayback(targetDevice, undefined, [`spotify:track:${trackId}`]);
    } catch (error) {
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
