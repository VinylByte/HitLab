import { useCallback, useEffect, useRef, useState } from "react";
import { Center, Container, Stack, Text } from "@mantine/core";
import { Button, Image, Slider } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import {
    startPlayback,
    pausePlayback,
    resumePlayback,
    getPlaybackState,
    getTrack,
} from "../../../../../services/spotifyClient";
import { SpotifyApiError } from "../../../../../services/spotifyErrorMapper";
import "./PlayerElement.css";

export default function PlayerElement({
    currentTrackId,
    onError,
    startAtSeconds = 0,
    stopAtSeconds = null,
    startAtMiddle = false,
    startAtRandom = false,
    minDistanceFromEndSeconds = 30,
    maxPlayDurationSeconds = null,
}: {
    currentTrackId: string | null;
    onError?: (message: string) => void;
    startAtSeconds?: number;
    stopAtSeconds?: number | null;
    startAtMiddle?: boolean;
    startAtRandom?: boolean;
    minDistanceFromEndSeconds?: number;
    maxPlayDurationSeconds?: number | null;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoPausedLocked, setAutoPausedLocked] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);

    const lastPlaybackSignatureRef = useRef<string | null>(null);
    const autoPauseTimeoutRef = useRef<number | null>(null);
    const autoStopAtMsRef = useRef<number | null>(null);

    const reportError = useCallback(
        (err: unknown) => {
            const msg =
                err instanceof SpotifyApiError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : "Unbekannter Fehler";
            console.error("[player]", msg);
            onError?.(msg);
        },
        [onError]
    );

    const clearAutoPauseTimeout = useCallback(() => {
        if (autoPauseTimeoutRef.current !== null) {
            window.clearTimeout(autoPauseTimeoutRef.current);
            autoPauseTimeoutRef.current = null;
        }
    }, []);

    const resolveAutoStopAtMs = useCallback(
        (effectiveStartMs: number, currentDurationMs: number) => {
            const candidates: number[] = [];

            if (typeof stopAtSeconds === "number" && stopAtSeconds >= 0) {
                candidates.push(Math.floor(stopAtSeconds * 1000));
            }

            if (typeof maxPlayDurationSeconds === "number" && maxPlayDurationSeconds > 0) {
                candidates.push(effectiveStartMs + Math.floor(maxPlayDurationSeconds * 1000));
            }

            if (candidates.length === 0) return null;

            const rawStopAtMs = Math.min(...candidates);
            if (currentDurationMs > 0) {
                return Math.min(rawStopAtMs, currentDurationMs);
            }

            return rawStopAtMs;
        },
        [maxPlayDurationSeconds, stopAtSeconds]
    );

    const scheduleAutoPause = useCallback(
        (currentProgressMs: number) => {
            clearAutoPauseTimeout();
            if (autoStopAtMsRef.current === null) return;

            const stopAtMs = autoStopAtMsRef.current;
            const remainingMs = stopAtMs - currentProgressMs;

            if (remainingMs <= 0) {
                void pausePlayback().finally(() => {
                    setIsPlaying(false);
                    setAutoPausedLocked(true);
                });
                return;
            }

            autoPauseTimeoutRef.current = window.setTimeout(() => {
                void pausePlayback().finally(() => {
                    setIsPlaying(false);
                    setAutoPausedLocked(true);
                });
            }, remainingMs);
        },
        [clearAutoPauseTimeout]
    );

    useEffect(() => {
        return () => {
            clearAutoPauseTimeout();
            autoStopAtMsRef.current = null;
        };
    }, [clearAutoPauseTimeout]);

    useEffect(() => {
        const playbackSignature = [
            currentTrackId ?? "",
            startAtSeconds,
            stopAtSeconds ?? "none",
            startAtMiddle ? "middle" : "no-middle",
            startAtRandom ? "random" : "no-random",
            minDistanceFromEndSeconds,
            maxPlayDurationSeconds ?? "none",
        ].join(":");

        if (!currentTrackId || playbackSignature === lastPlaybackSignatureRef.current) return;

        let cancelled = false;

        const play = async () => {
            lastPlaybackSignatureRef.current = playbackSignature;
            setLoading(true);
            setIsPlaying(false);
            setAutoPausedLocked(false);

            autoStopAtMsRef.current = null;

            const dynamicStart = startAtMiddle || startAtRandom;
            let initialStartMs = Math.max(0, Math.floor(startAtSeconds * 1000));
            let knownDurationMs = 0;

            if (dynamicStart) {
                try {
                    const track = await getTrack(currentTrackId);
                    knownDurationMs = track.duration_ms ?? 0;
                    if (startAtMiddle) {
                        initialStartMs = Math.floor(knownDurationMs / 2);
                    } else if (startAtRandom) {
                        const minDistanceMs = Math.max(
                            0,
                            Math.floor(minDistanceFromEndSeconds * 1000)
                        );
                        const maxRandomStartMs = Math.max(0, knownDurationMs - minDistanceMs);
                        initialStartMs = Math.floor(Math.random() * (maxRandomStartMs + 1));
                    }
                } catch (err) {
                    reportError(err);
                    initialStartMs = 0;
                }
            }

            setProgressMs(initialStartMs);
            setDurationMs(dynamicStart ? knownDurationMs : 0);
            clearAutoPauseTimeout();

            try {
                const { deviceId } = await startPlayback(currentTrackId, {
                    positionMs: initialStartMs,
                });
                if (cancelled) return;

                setIsPlaying(true);

                const state = await getPlaybackState();
                if (cancelled) return;

                if (state) {
                    const currentDurationMs = state.item?.duration_ms ?? 0;
                    let effectiveProgressMs = Math.max(initialStartMs, state.progress_ms);

                    if (dynamicStart && currentDurationMs > 0) {
                        let desiredStartMs = initialStartMs;

                        if (startAtMiddle) {
                            desiredStartMs = Math.floor(currentDurationMs / 2);
                        } else if (startAtRandom) {
                            const minDistanceMs = Math.max(
                                0,
                                Math.floor(minDistanceFromEndSeconds * 1000)
                            );
                            const maxRandomStartMs = Math.max(0, currentDurationMs - minDistanceMs);
                            desiredStartMs = Math.floor(Math.random() * (maxRandomStartMs + 1));
                        }

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

                    autoStopAtMsRef.current = resolveAutoStopAtMs(
                        effectiveProgressMs,
                        currentDurationMs
                    );

                    setDurationMs(currentDurationMs);
                    setProgressMs(effectiveProgressMs);
                    scheduleAutoPause(effectiveProgressMs);
                } else {
                    autoStopAtMsRef.current = resolveAutoStopAtMs(initialStartMs, 0);
                    scheduleAutoPause(initialStartMs);
                }
            } catch (err) {
                if (!cancelled) {
                    lastPlaybackSignatureRef.current = null;
                    reportError(err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void play();

        return () => {
            cancelled = true;
            clearAutoPauseTimeout();
            autoStopAtMsRef.current = null;
            lastPlaybackSignatureRef.current = null;
        };
    }, [
        clearAutoPauseTimeout,
        currentTrackId,
        maxPlayDurationSeconds,
        minDistanceFromEndSeconds,
        reportError,
        resolveAutoStopAtMs,
        scheduleAutoPause,
        startAtMiddle,
        startAtRandom,
        startAtSeconds,
        stopAtSeconds,
    ]);

    const togglePlay = useCallback(async () => {
        if (autoPausedLocked) return;

        try {
            if (isPlaying) {
                await pausePlayback();
                setIsPlaying(false);
                clearAutoPauseTimeout();
            } else {
                await resumePlayback();
                setIsPlaying(true);
                scheduleAutoPause(progressMs);
            }
        } catch {
            try {
                const state = await getPlaybackState();
                if (state) {
                    const currentDurationMs = state.item?.duration_ms ?? 0;
                    setIsPlaying(state.is_playing);
                    setProgressMs(state.progress_ms);
                    setDurationMs(currentDurationMs);

                    if (state.is_playing) {
                        scheduleAutoPause(state.progress_ms);
                    } else {
                        clearAutoPauseTimeout();
                    }
                }
            } catch {
                // ignore sync errors
            }
        }
    }, [autoPausedLocked, clearAutoPauseTimeout, isPlaying, progressMs, scheduleAutoPause]);

    useEffect(() => {
        if (!isPlaying || durationMs <= 0) return;

        const intervalId = window.setInterval(() => {
            setProgressMs(prev => {
                const next = prev + 1000;
                if (next >= durationMs) {
                    setIsPlaying(false);
                    clearAutoPauseTimeout();
                    return durationMs;
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [clearAutoPauseTimeout, durationMs, isPlaying]);

    useEffect(() => {
        if (!currentTrackId) return;

        const pollId = window.setInterval(async () => {
            try {
                const state = await getPlaybackState();
                if (!state) return;

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
            } catch {
                // ignore polling errors
            }
        }, 5000);

        return () => window.clearInterval(pollId);
    }, [clearAutoPauseTimeout, currentTrackId, scheduleAutoPause]);

    const progressPct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

    return (
        <div>
            <Container size={"sm"} mt={"xl"}>
                <Stack>
                    <Center>
                        <Image
                            src="/UnknownSong.png"
                            alt="Track cover"
                            className={
                                "cover-image w-50 h-50 object-cover transition-[filter,opacity] duration-500 " +
                                (isPlaying ? "cover-soft-pulse" : "")
                            }
                        />
                    </Center>
                    <Slider
                        aria-label="Player progress"
                        className="w-full mt-6"
                        color="primary"
                        value={progressPct}
                        hideThumb={true}
                    />
                    <Center>
                        <Button
                            isIconOnly
                            color="primary"
                            className="w-15 h-15"
                            radius="full"
                            onPress={togglePlay}
                            isLoading={loading}
                            isDisabled={!currentTrackId || autoPausedLocked}
                        >
                            {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                        </Button>
                    </Center>
                    {autoPausedLocked && (
                        <Text c="dimmed" size="sm" ta="center">
                            Wiedergabelimit erreicht. Scanne einen neuen Song, um weiterzuspielen.
                        </Text>
                    )}
                </Stack>
            </Container>
        </div>
    );
}
