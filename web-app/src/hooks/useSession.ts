import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "../supabase";

/**
 * Tracks the current Supabase auth session.
 * Returns `undefined` while loading, `null` when logged out, or the active `Session`.
 */
export function useSession() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return session;
}
