import { useCallback, useEffect, useRef } from "react";
import { pausePlayback } from "@/services/spotifyClient";
import { createLogger } from "@/lib/logger";

const log = createLogger("player:auto-pause-lock");

export function useAutoPauseLock(params: {
    isMountedRef: React.RefObject<boolean>;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setAutoPausedLocked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { isMountedRef, setIsPlaying, setAutoPausedLocked } = params;

    const autoPauseTimeoutRef = useRef<number | null>(null);
    const autoStopAtMsRef = useRef<number | null>(null);

    const clearAutoPauseTimeout = useCallback(() => {
        if (autoPauseTimeoutRef.current !== null) {
            window.clearTimeout(autoPauseTimeoutRef.current);
            autoPauseTimeoutRef.current = null;
        }
    }, []);

    const pauseAndLock = useCallback(async () => {
        try {
            await pausePlayback();
        } catch (error) {
            log.warn("Failed to pause playback before lock", error);
        } finally {
            if (!isMountedRef.current) return;
            setIsPlaying(false);
            setAutoPausedLocked(true);
        }
    }, [isMountedRef, setAutoPausedLocked, setIsPlaying]);

    const scheduleAutoPause = useCallback(
        (currentProgressMs: number) => {
            clearAutoPauseTimeout();
            if (autoStopAtMsRef.current === null) return;

            const stopAtMs = autoStopAtMsRef.current;
            const remainingMs = stopAtMs - currentProgressMs;

            if (remainingMs <= 0) {
                void pauseAndLock();
                return;
            }

            autoPauseTimeoutRef.current = window.setTimeout(() => {
                void pauseAndLock();
            }, remainingMs);
        },
        [clearAutoPauseTimeout, pauseAndLock]
    );

    useEffect(() => {
        return () => {
            clearAutoPauseTimeout();
            autoStopAtMsRef.current = null;
        };
    }, [clearAutoPauseTimeout]);

    return {
        autoStopAtMsRef,
        clearAutoPauseTimeout,
        scheduleAutoPause,
    };
}
