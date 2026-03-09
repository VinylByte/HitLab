import { useEffect, useReducer } from "react";
import { fetchOwnDecks, type OwnDeckDTO } from "../services/deckService";

type State = {
    ownDecks: OwnDeckDTO[];
    loading: boolean;
    error: Error | null;
};

type Action =
    | { type: "fetch" }
    | { type: "success"; ownDecks: OwnDeckDTO[] }
    | { type: "error"; error: Error }
    | { type: "removeDeck"; deckId: string };

function reduce(state: State, action: Action): State {
    switch (action.type) {
        case "fetch":
            return { ...state, loading: true, error: null };
        case "success":
            return { ownDecks: action.ownDecks, loading: false, error: null };
        case "error":
            return { ...state, loading: false, error: action.error };
        case "removeDeck":
            return { ...state, ownDecks: state.ownDecks.filter(d => d.id !== action.deckId) };
    }
}

export function useOwnDecks() {
    const [state, dispatch] = useReducer(reduce, { ownDecks: [], loading: true, error: null });

    function removeDeck(deckId: string) {
        dispatch({ type: "removeDeck", deckId });
    }

    function load() {
        dispatch({ type: "fetch" });

        fetchOwnDecks()
            .then(ownDecks => dispatch({ type: "success", ownDecks }))
            .catch(error => dispatch({ type: "error", error }));
    }

    useEffect(() => {
        load();
    }, []);

    return { ...state, refetch: load, removeDeck };
}
