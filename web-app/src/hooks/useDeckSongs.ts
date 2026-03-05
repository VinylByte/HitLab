import { useEffect, useReducer } from "react";
import { fetchDeckSongs, type DeckSongsDTO } from "../services/deckService";

type State = {
    deck_songs: DeckSongsDTO[];
    loading: boolean;
    error: Error | null;
};

type Action =
    | { type: "fetch" }
    | { type: "success"; deck_songs: DeckSongsDTO[] }
    | { type: "error"; error: Error };

function reduce(state: State, action: Action): State {
    switch (action.type) {
        case "fetch":
            return { ...state, loading: true, error: null };
        case "success":
            return { deck_songs: action.deck_songs, loading: false, error: null };
        case "error":
            return { ...state, loading: false, error: action.error };
    }
}

export function useDeckSongs(deck_id: string, isOpen: boolean) {
    const [state, dispatch] = useReducer(reduce, { deck_songs: [], loading: true, error: null });

    useEffect(() => {
        if (!isOpen) return;
        dispatch({ type: "fetch" });
        fetchDeckSongs(deck_id)
            .then(deck_songs => dispatch({ type: "success", deck_songs }))
            .catch(error => dispatch({ type: "error", error }));
    }, [isOpen, deck_id]);

    return state;
}
