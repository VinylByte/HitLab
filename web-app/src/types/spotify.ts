import type { Song } from "./song";

export type SpotifyTrack = Omit<Song, "id">;

export type SpotifyDevice = {
    id: string;
    is_active: boolean;
    is_private_session?: boolean;
    is_restricted?: boolean;
    name: string;
    type: string;
    volume_percent?: number | null;
};

export type PlaybackState = {
    is_playing: boolean;
    progress_ms: number;
    item: SpotifyTrackApi | null;
};

/** Internal Spotify API response types (used only in spotifyClient) */

export type SpotifyTrackApi = {
    id: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        release_date?: string;
        images: Array<{ url: string }>;
    };
};

export type SpotifyDevicesResponse = {
    devices: SpotifyDevice[];
};

export type SpotifySearchResponse = {
    tracks: {
        items: SpotifyTrackApi[];
    };
};

export type SpotifyPlaylistTrackItem = {
    item: SpotifyTrackApi | null;
};

export type SpotifyPlaylistTracksResponse = {
    items: SpotifyPlaylistTrackItem[];
    total: number;
    limit: number;
    offset: number;
};
