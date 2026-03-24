import { useCallback, useEffect, useRef, useState } from "react";
import { Center, Container, Stack, Text } from "@mantine/core";
import { Button, Image, Slider } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import {
    startPlayback,
    pausePlayback,
    resumePlayback,
    getPlaybackState,
    seekPlayback,
} from "../../../../../services/spotifyClient";
import { SpotifyApiError } from "../../../../../services/spotifyErrorMapper";
import "./PlayerElement.css";

export default function PlayerElement({
    currentTrackId,
    onError,
    startAtSeconds = 0,
    playDurationSeconds = null,
    startAtMiddle = false,
}: {
    currentTrackId: string | null;
    onError?: (message: string) => void;
    startAtSeconds?: number;
    playDurationSeconds?: number | null;
    startAtMiddle?: boolean;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoPausedLocked, setAutoPausedLocked] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);
    const lastPlaybackSignatureRef = useRef<string | null>(null);
    const autoPauseTimeoutRef = useRef<number | null>(null);

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

    const scheduleAutoPause = useCallback(
        (currentProgressMs: number) => {
            clearAutoPauseTimeout();
            if (!playDurationSeconds || playDurationSeconds <= 0) return;

            const startOffsetMs = Math.max(0, Math.floor(startAtSeconds * 1000));
            const stopAtMs = startOffsetMs + Math.floor(playDurationSeconds * 1000);
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
        [clearAutoPauseTimeout, playDurationSeconds, startAtSeconds]
    );

    useEffect(() => {
        return () => {
            clearAutoPauseTimeout();
        };
    }, [clearAutoPauseTimeout]);

    useEffect(() => {
        const playbackSignature = `${currentTrackId ?? ""}:${startAtSeconds}:${playDurationSeconds ?? "full"}:${startAtMiddle ? "middle" : "start"}`;
        if (!currentTrackId || playbackSignature === lastPlaybackSignatureRef.current) return;

        let cancelled = false;
        const play = async () => {
            lastPlaybackSignatureRef.current = playbackSignature;
            setLoading(true);
            setIsPlaying(false);
            setAutoPausedLocked(false);
            const startOffsetMs = Math.max(0, Math.floor(startAtSeconds * 1000));
            setProgressMs(startAtMiddle ? 0 : startOffsetMs);
            setDurationMs(0);
            clearAutoPauseTimeout();

            try {
                await startPlayback(currentTrackId, {
                    positionMs: startAtMiddle ? 0 : startOffsetMs,
                });
                if (cancelled) return;
                setIsPlaying(true);

                const state = await getPlaybackState();
                if (!cancelled && state) {
                    let effectiveProgressMs = state.progress_ms;

                    if (startAtMiddle && state.duration_ms > 0) {
                        const middleMs = Math.floor(state.duration_ms / 2);
                        try {
                            await seekPlayback(middleMs);
                            effectiveProgressMs = middleMs;
                        } catch {
                            // ignore seek errors and keep current progress
                        }
                    }

                    setDurationMs(state.duration_ms);
                    setProgressMs(effectiveProgressMs);
                    scheduleAutoPause(effectiveProgressMs);
                } else if (!cancelled) {
                    scheduleAutoPause(startAtMiddle ? 0 : startOffsetMs);
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
            lastPlaybackSignatureRef.current = null;
        };
    }, [
        clearAutoPauseTimeout,
        currentTrackId,
        playDurationSeconds,
        reportError,
        scheduleAutoPause,
        startAtMiddle,
        startAtSeconds,
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
                    setIsPlaying(state.is_playing);
                    setProgressMs(state.progress_ms);
                    setDurationMs(state.duration_ms);
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
                    return durationMs;
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [isPlaying, durationMs]);

    useEffect(() => {
        if (!currentTrackId) return;

        const pollId = window.setInterval(async () => {
            try {
                const state = await getPlaybackState();
                if (state) {
                    setProgressMs(state.progress_ms);
                    setDurationMs(state.duration_ms);
                    setIsPlaying(state.is_playing);
                    if (state.is_playing) {
                        scheduleAutoPause(state.progress_ms);
                    } else {
                        clearAutoPauseTimeout();
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
                            Zeitfenster beendet. Scanne einen neuen Song, um weiterzuspielen.
                        </Text>
                    )}
                </Stack>
            </Container>
        </div>
    );
}
