import { useCallback, useEffect, useRef, useState } from "react";
import { Center, Container, Stack } from "@mantine/core";
import { Button, Image, Slider } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import {
    startPlayback,
    pausePlayback,
    resumePlayback,
    getPlaybackState,
} from "../../../../../services/spotifyClient";
import { SpotifyApiError } from "../../../../../services/spotifyErrorMapper";
import "./PlayerElement.css";

export default function PlayerElement({
    currentTrackId,
    onError,
}: {
    currentTrackId: string | null;
    onError?: (message: string) => void;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);
    const lastTrackIdRef = useRef<string | null>(null);

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

    useEffect(() => {
        if (!currentTrackId || currentTrackId === lastTrackIdRef.current) return;
        lastTrackIdRef.current = currentTrackId;

        let cancelled = false;
        const play = async () => {
            setLoading(true);
            setIsPlaying(false);
            setProgressMs(0);
            setDurationMs(0);

            try {
                await startPlayback(currentTrackId);
                if (cancelled) return;
                setIsPlaying(true);

                const state = await getPlaybackState();
                if (!cancelled && state) {
                    setDurationMs(state.duration_ms);
                    setProgressMs(state.progress_ms);
                }
            } catch (err) {
                if (!cancelled) {
                    lastTrackIdRef.current = null;
                    reportError(err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void play();
        return () => {
            cancelled = true;
        };
    }, [currentTrackId, reportError]);

    const togglePlay = useCallback(async () => {
        try {
            if (isPlaying) {
                await pausePlayback();
                setIsPlaying(false);
            } else {
                await resumePlayback();
                setIsPlaying(true);
            }
        } catch {
            try {
                const state = await getPlaybackState();
                if (state) {
                    setIsPlaying(state.is_playing);
                    setProgressMs(state.progress_ms);
                    setDurationMs(state.duration_ms);
                }
            } catch {
                // ignore sync errors
            }
        }
    }, [isPlaying]);

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
                }
            } catch {
                // ignore polling errors
            }
        }, 5000);

        return () => window.clearInterval(pollId);
    }, [currentTrackId]);

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
                            isDisabled={!currentTrackId}
                        >
                            {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                        </Button>
                    </Center>
                </Stack>
            </Container>
        </div>
    );
}
