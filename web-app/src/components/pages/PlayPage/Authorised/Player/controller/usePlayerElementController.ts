import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    getPlaybackState,
    getTrack,
    resumePlayback,
    startPlayback,
    pausePlayback,
} from "@/services/spotifyClient";
import { SpotifyApiError } from "@/services/spotifyErrorMapper";
import { createLogger } from "@/lib/logger";
import type { PlayerElementControllerOptions, PlayerElementControllerState } from "./types";
import { buildPlaybackSignature, computeDesiredStartMs, resolveAutoStopAtMs } from "./utils";
import { useAutoPauseLock } from "./useAutoPauseLock";
import { usePlaybackPolling } from "./usePlaybackPolling";
import { useProgressTicker } from "./useProgressTicker";

const log = createLogger("player:element-controller");

export type { PlayerElementControllerOptions } from "./types";

export function usePlayerElementController(
    options: PlayerElementControllerOptions
): PlayerElementControllerState {
    const currentTrackId = options.currentTrackId;
    const onError = options.onError;

    const startAtSeconds = options.startAtSeconds ?? 0;
    const stopAtSeconds = options.stopAtSeconds ?? null;
    const startAtMiddle = options.startAtMiddle ?? false;
    const startAtRandom = options.startAtRandom ?? false;
    const minDistanceFromEndSeconds = options.minDistanceFromEndSeconds ?? 30;
    const maxPlayDurationSeconds = options.maxPlayDurationSeconds ?? null;

    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoPausedLocked, setAutoPausedLocked] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);

    const requestIdRef = useRef(0);
    const isMountedRef = useRef(false);

    const lastPlaybackSignatureRef = useRef<string | null>(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const reportError = useCallback(
        (err: unknown) => {
            const msg =
                err instanceof SpotifyApiError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : "Unbekannter Fehler";
            log.error("Player controller error", { message: msg, error: err });
            onError?.(msg);
        },
        [onError]
    );

    const {
        clearAutoPauseTimeout,
        scheduleAutoPause,
        autoStopAtMsRef: autoStopAtMsFromHook,
    } = useAutoPauseLock({
        isMountedRef,
        setIsPlaying,
        setAutoPausedLocked,
    });

    const resolveAutoStopAtMsMemo = useCallback(
        (effectiveStartMs: number, currentDurationMs: number) => {
            return resolveAutoStopAtMs({
                effectiveStartMs,
                currentDurationMs,
                stopAtSeconds,
                maxPlayDurationSeconds,
            });
        },
        [maxPlayDurationSeconds, stopAtSeconds]
    );

    const playbackSignature = useMemo(
        () =>
            buildPlaybackSignature({
                currentTrackId,
                startAtSeconds,
                stopAtSeconds,
                startAtMiddle,
                startAtRandom,
                minDistanceFromEndSeconds,
                maxPlayDurationSeconds,
            }),
        [
            currentTrackId,
            maxPlayDurationSeconds,
            minDistanceFromEndSeconds,
            startAtMiddle,
            startAtRandom,
            startAtSeconds,
            stopAtSeconds,
        ]
    );

    useEffect(() => {
        if (!currentTrackId || playbackSignature === lastPlaybackSignatureRef.current) return;

        const requestId = ++requestIdRef.current;

        let cancelled = false;

        const isStale = () =>
            cancelled || requestId !== requestIdRef.current || !isMountedRef.current;

        const play = async () => {
            lastPlaybackSignatureRef.current = playbackSignature;

            setLoading(true);
            setIsPlaying(false);
            setAutoPausedLocked(false);
            autoStopAtMsFromHook.current = null;

            const dynamicStart = startAtMiddle || startAtRandom;
            let initialStartMs = computeDesiredStartMs({
                startAtSeconds,
                startAtMiddle: false,
                startAtRandom: false,
                minDistanceFromEndSeconds,
                durationMs: 0,
            });
            let knownDurationMs = 0;

            if (dynamicStart) {
                try {
                    const track = await getTrack(currentTrackId);
                    knownDurationMs = track.duration_ms ?? 0;
                    initialStartMs = computeDesiredStartMs({
                        startAtSeconds,
                        startAtMiddle,
                        startAtRandom,
                        minDistanceFromEndSeconds,
                        durationMs: knownDurationMs,
                    });
                } catch (err) {
                    reportError(err);
                    initialStartMs = 0;
                }
            }

            if (isStale()) return;

            setProgressMs(initialStartMs);
            setDurationMs(dynamicStart ? knownDurationMs : 0);
            clearAutoPauseTimeout();

            try {
                const { deviceId } = await startPlayback(currentTrackId, {
                    positionMs: initialStartMs,
                });
                if (isStale()) return;

                setIsPlaying(true);

                const state = await getPlaybackState();
                if (isStale()) return;

                if (state) {
                    const currentDurationMs = state.item?.duration_ms ?? 0;
                    let effectiveProgressMs = Math.max(initialStartMs, state.progress_ms);

                    if (dynamicStart && currentDurationMs > 0) {
                        const desiredStartMs = computeDesiredStartMs({
                            startAtSeconds,
                            startAtMiddle,
                            startAtRandom,
                            minDistanceFromEndSeconds,
                            durationMs: currentDurationMs,
                        });

                        try {
                            await startPlayback(currentTrackId, {
                                deviceId,
                                positionMs: desiredStartMs,
                            });
                            effectiveProgressMs = desiredStartMs;
                        } catch (restartErr) {
                            reportError(restartErr);
                        }
                    }

                    autoStopAtMsFromHook.current = resolveAutoStopAtMsMemo(
                        effectiveProgressMs,
                        currentDurationMs
                    );

                    setDurationMs(currentDurationMs);
                    setProgressMs(effectiveProgressMs);
                    scheduleAutoPause(effectiveProgressMs);
                } else {
                    autoStopAtMsFromHook.current = resolveAutoStopAtMsMemo(initialStartMs, 0);
                    scheduleAutoPause(initialStartMs);
                }
            } catch (err) {
                if (!isStale()) {
                    lastPlaybackSignatureRef.current = null;
                    reportError(err);
                }
            } finally {
                if (!isStale()) setLoading(false);
            }
        };

        void play();

        return () => {
            cancelled = true;
            clearAutoPauseTimeout();
            autoStopAtMsFromHook.current = null;
            lastPlaybackSignatureRef.current = null;
        };
    }, [
        clearAutoPauseTimeout,
        currentTrackId,
        playbackSignature,
        minDistanceFromEndSeconds,
        reportError,
        resolveAutoStopAtMsMemo,
        scheduleAutoPause,
        startAtMiddle,
        startAtRandom,
        startAtSeconds,
    ]);

    const togglePlay = useCallback(async () => {
        if (autoPausedLocked) return;

        try {
            if (isPlaying) {
                await pausePlayback();
                if (!isMountedRef.current) return;
                setIsPlaying(false);
                clearAutoPauseTimeout();
            } else {
                await resumePlayback();
                if (!isMountedRef.current) return;
                setIsPlaying(true);
                scheduleAutoPause(progressMs);
            }
        } catch (toggleError) {
            log.warn("Toggle playback failed, trying state sync", toggleError);
            try {
                const state = await getPlaybackState();
                if (!state || !isMountedRef.current) return;

                const currentDurationMs = state.item?.duration_ms ?? 0;
                setIsPlaying(state.is_playing);
                setProgressMs(state.progress_ms);
                setDurationMs(currentDurationMs);

                if (state.is_playing) {
                    scheduleAutoPause(state.progress_ms);
                } else {
                    clearAutoPauseTimeout();
                }
            } catch (syncError) {
                log.warn("Failed to sync playback state after toggle failure", syncError);
            }
        }
    }, [autoPausedLocked, clearAutoPauseTimeout, isPlaying, progressMs, scheduleAutoPause]);

    useProgressTicker({
        isPlaying,
        durationMs,
        isMountedRef,
        setIsPlaying,
        setProgressMs,
        clearAutoPauseTimeout,
    });

    usePlaybackPolling({
        currentTrackId,
        isMountedRef,
        autoStopAtMsRef: autoStopAtMsFromHook,
        setIsPlaying,
        setProgressMs,
        setDurationMs,
        setAutoPausedLocked,
        scheduleAutoPause,
        clearAutoPauseTimeout,
    });

    const progressPct = useMemo(() => {
        return durationMs > 0 ? (progressMs / durationMs) * 100 : 0;
    }, [durationMs, progressMs]);

    return {
        isPlaying,
        loading,
        autoPausedLocked,
        progressPct,
        togglePlay,
    };
}
