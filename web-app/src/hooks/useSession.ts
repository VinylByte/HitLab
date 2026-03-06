import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "../supabase";
import { persistSpotifyToken } from "../services/spotifyClient";

/**
 * Tracks the current Supabase auth session.
 * Returns `undefined` while loading, `null` when logged out, or the active `Session`.
 *
 * On SIGNED_IN / TOKEN_REFRESHED events the Spotify provider_token is
 * persisted to the database so it remains available after page refreshes.
 */
export function useSession() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.provider_token) {
                persistSpotifyToken(
                    session.provider_token,
                    session.provider_refresh_token ?? "",
                    session.expires_at
                );
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.provider_token) {
                persistSpotifyToken(
                    session.provider_token,
                    session.provider_refresh_token ?? "",
                    session.expires_at
                );
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return session;
}
