import { useEffect, useReducer } from "react";
import { fetchPublicDecks, type PublicDeckDTO } from "../services/deckService";
type State = {
    decks: PublicDeckDTO[];
    loading: boolean;
    error: Error | null;
};

type Action = { type: "fetch" } | { type: "success"; decks: PublicDeckDTO[] } | { type: "error"; error: Error };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "fetch":
            return { ...state, loading: true, error: null };
        case "success":
            return { decks: action.decks, loading: false, error: null };
        case "error":
            return { ...state, loading: false, error: action.error };
    }
}

export function usePublicDecks(search_str: string, page: number) {
    const [state, dispatch] = useReducer(reducer, { decks: [], loading: true, error: null });

    useEffect(() => {
        dispatch({ type: "fetch" });
        fetchPublicDecks(search_str, page)
            .then(decks => dispatch({ type: "success", decks }))
            .catch(error => dispatch({ type: "error", error }));
    }, [search_str, page]);

    useEffect(() => {
        console.log(state.decks);
    }, [state]);

    return state;
}
