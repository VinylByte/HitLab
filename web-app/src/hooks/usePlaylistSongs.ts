import { useEffect, useReducer, useRef } from "react";
import { extractSpotifyPlaylistId, getPlaylistTracks } from "../services/spotifyClient";
import type { SpotifyTrack } from "../types/spotify";

type State = {
	songs: SpotifyTrack[];
	loading: boolean;
	error: Error | null;
};

type Action =
	| { type: "fetch" }
	| { type: "success"; songs: SpotifyTrack[] }
	| { type: "error"; error: Error };

function reduce(state: State, action: Action): State {
	switch (action.type) {
		case "fetch":
			return { ...state, loading: true, error: null };
		case "success":
			return { songs: action.songs, loading: false, error: null };
		case "error":
			return { ...state, loading: false, error: action.error };
	}
}

export function usePlaylistSongs(playlistLink: string) {
	const [state, dispatch] = useReducer(reduce, { songs: [], loading: false, error: null });
	const requestRef = useRef(0);

	useEffect(() => {
		if (!playlistLink.trim()) {
			dispatch({ type: "success", songs: [] });
			return;
		}

		const playlistId = extractSpotifyPlaylistId(playlistLink);
		if (!playlistId) {
			dispatch({ type: "error", error: new Error("Ungueltiger Spotify-Playlist-Link") });
			return;
		}

		const timer = setTimeout(async () => {
			const requestId = ++requestRef.current;
			dispatch({ type: "fetch" });

			try {
				const songs = await getPlaylistTracks(playlistId);
				if (requestId === requestRef.current) {
					dispatch({ type: "success", songs });
				}
			} catch (error) {
				console.error("[spotify] usePlaylist failed", {
					playlistLink,
					error,
				});

				if (requestId === requestRef.current) {
					dispatch({ type: "error", error: error as Error });
				}
			}
		}, 350);

		return () => clearTimeout(timer);
	}, [playlistLink]);

	return state;
}
