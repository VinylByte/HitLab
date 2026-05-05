/**
 * Centralized route definitions.
 *
 * - `routes` holds static paths (use for navigate("/...") and <Link to="...">).
 * - `routePatterns` holds the parameterized patterns used by react-router
 *   `<Route path={...} />` declarations (with `:param` placeholders).
 * - `routeBuilders` are helpers that produce concrete URLs from pattern params.
 */

export const routes = {
    home: "/",
    decks: "/decks",
    play: "/play",
    profile: "/profile",
    lab: "/lab",
    login: "/login",
    signup: "/signup",
    createDeck: "/decks/new",
} as const;

export const routePatterns = {
    publicDeckView: "/decks/:deckId/view",
    labDeckView: "/lab/:deckId/view",
    deckEdit: "/decks/:id/edit",
    deckSongs: "/decks/:id/songs",
    playTrack: "/play/:currentTrackId",
} as const;

export const routeBuilders = {
    publicDeckView: (deckId: string) => `/decks/${deckId}/view`,
    labDeckView: (deckId: string) => `/lab/${deckId}/view`,
    deckEdit: (deckId: string) => `/decks/${deckId}/edit`,
    deckSongs: (deckId: string) => `/decks/${deckId}/songs`,
    playTrack: (trackId: string) => `/play/${trackId}`,
} as const;
