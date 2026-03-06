import { useEffect, useReducer, useRef } from "react";
import { searchTracks, type SpotifyTrack } from "../services/spotifyClient";

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

export function useSongSearch(search_str: string) {
    const [state, dispatch] = useReducer(reduce, { songs: [], loading: false, error: null });
    const requestRef = useRef(0);

    useEffect(() => {
        if (search_str.trim().length < 2) {
            dispatch({ type: "success", songs: [] });
            return;
        }

        const timer = setTimeout(async () => {
            const requestId = ++requestRef.current;
            dispatch({ type: "fetch" });
            try {
                const songs = await searchTracks(search_str);
                if (requestId === requestRef.current)
                    dispatch({
                        type: "success",
                        songs,
                    });
            } catch (error) {
                console.error("[spotify] useSongSearch failed", {
                    query: search_str,
                    error,
                });
                if (requestId === requestRef.current)
                    dispatch({ type: "error", error: error as Error });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search_str]);

    return state;
}
