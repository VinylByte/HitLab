import { useEffect } from "react";
import { getPlaybackState } from "@/services/spotifyClient";
import { createLogger } from "@/lib/logger";

const log = createLogger("player:playback-polling");

export function usePlaybackPolling(params: {
    currentTrackId: string | null;
    isMountedRef: React.RefObject<boolean>;
    autoStopAtMsRef: React.RefObject<number | null>;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setProgressMs: React.Dispatch<React.SetStateAction<number>>;
    setDurationMs: React.Dispatch<React.SetStateAction<number>>;
    setAutoPausedLocked: React.Dispatch<React.SetStateAction<boolean>>;
    scheduleAutoPause: (progressMs: number) => void;
    clearAutoPauseTimeout: () => void;
}) {
    const {
        currentTrackId,
        isMountedRef,
        autoStopAtMsRef,
        setIsPlaying,
        setProgressMs,
        setDurationMs,
        setAutoPausedLocked,
        scheduleAutoPause,
        clearAutoPauseTimeout,
    } = params;

    useEffect(() => {
        if (!currentTrackId) return;

        let hasLoggedPollingError = false;

        const pollId = window.setInterval(async () => {
            try {
                const state = await getPlaybackState();
                if (!state || !isMountedRef.current) return;

                hasLoggedPollingError = false;

                const currentDurationMs = state.item?.duration_ms ?? 0;

                setProgressMs(state.progress_ms);
                setDurationMs(currentDurationMs);
                setIsPlaying(state.is_playing);

                if (state.is_playing) {
                    scheduleAutoPause(state.progress_ms);
                } else {
                    clearAutoPauseTimeout();
                    if (
                        autoStopAtMsRef.current !== null &&
                        state.progress_ms >= autoStopAtMsRef.current
                    ) {
                        setAutoPausedLocked(true);
                    }
                }
            } catch (error) {
                if (!hasLoggedPollingError) {
                    log.warn("Playback polling failed", error);
                    hasLoggedPollingError = true;
                }
            }
        }, 5000);

        return () => window.clearInterval(pollId);
    }, [
        autoStopAtMsRef,
        clearAutoPauseTimeout,
        currentTrackId,
        isMountedRef,
        scheduleAutoPause,
        setAutoPausedLocked,
        setDurationMs,
        setIsPlaying,
        setProgressMs,
    ]);
}
