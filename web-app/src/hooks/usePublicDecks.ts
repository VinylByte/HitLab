import { useEffect, useReducer } from "react";
import { fetchPublicDecks } from "../services/deckService";
import type { PublicDeck } from "../types/deck";
type State = {
    decks: PublicDeck[];
    totalCount: number;
    loading: boolean;
    error: Error | null;
};

type Action =
    | { type: "fetch" }
    | { type: "success"; decks: PublicDeck[]; totalCount: number }
    | { type: "error"; error: Error };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "fetch":
            return { ...state, loading: true, error: null };
        case "success":
            return {
                decks: action.decks,
                totalCount: action.totalCount,
                loading: false,
                error: null,
            };
        case "error":
            return { ...state, loading: false, error: action.error };
    }
}

export function usePublicDecks(search_str: string, page: number) {
    const [state, dispatch] = useReducer(reducer, {
        decks: [],
        totalCount: 0,
        loading: true,
        error: null,
    });

    useEffect(() => {
        dispatch({ type: "fetch" });
        fetchPublicDecks(search_str, page)
            .then(({ decks, totalCount }) => dispatch({ type: "success", decks, totalCount }))
            .catch(error => dispatch({ type: "error", error }));
    }, [search_str, page]);

    return state;
}
