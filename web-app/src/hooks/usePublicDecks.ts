import { useEffect, useState } from "react";
import { fetchPublicDecks, type PublicDeckDTO } from "../services/deckService";

export function usePublicDecks() {
    const [decks, setDecks] = useState<PublicDeckDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchPublicDecks()
            .then(setDecks)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { decks, loading, error };
}
