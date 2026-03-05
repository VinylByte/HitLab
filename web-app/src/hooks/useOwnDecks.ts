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
    | { type: "error"; error: Error };

function reduce(state: State, action: Action): State {
    switch (action.type) {
        case "fetch":
            return { ...state, loading: true, error: null };
        case "success":
            return { ownDecks: action.ownDecks, loading: false, error: null };
        case "error":
            return { ...state, loading: false, error: action.error };
    }
}

export function useOwnDecks() {
    const [state, dispatch] = useReducer(reduce, { ownDecks: [], loading: true, error: null });

    useEffect(() => {
        dispatch({ type: "fetch" });

        fetchOwnDecks()
            .then(ownDecks => dispatch({ type: "success", ownDecks }))
            .catch(error => dispatch({ type: "error", error }));
    }, []);

    return state;
}
