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
    type SpotifyTrack,
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
    const [track, setTrack] = useState<SpotifyTrack | null>(null);
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
                const [trackInfo] = await Promise.all([
                    getTrack(currentTrackId),
                    startPlayback(currentTrackId),
                ]);
                if (cancelled) return;
                setTrack(trackInfo);
                setIsPlaying(true);

                const state = await getPlaybackState();
                if (!cancelled && state) {
                    setDurationMs(state.duration_ms);
                    setProgressMs(state.progress_ms);
                }
            } catch (err) {
                if (!cancelled) reportError(err);
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
        } catch (err) {
            reportError(err);
        }
    }, [isPlaying, reportError]);

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
        if (!isPlaying) return;

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
    }, [isPlaying]);

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const coverUrl = track?.thumbnail_url ?? "/UnknownSong.png";
    const progressPct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

    return (
        <div>
            <Container size={"sm"} mt={"xl"}>
                <Stack>
                    <Center>
                        <Image
                            src={coverUrl}
                            alt="Track cover"
                            className={
                                "cover-image w-50 h-50 object-cover transition-[filter,opacity] duration-500 " +
                                (isPlaying ? "cover-soft-pulse" : "")
                            }
                        />
                    </Center>
                    {track && (
                        <Center>
                            <Stack gap={2} align="center">
                                <Text fw={600} size="lg" lineClamp={1}>
                                    {track.title}
                                </Text>
                                <Text c="dimmed" size="sm" lineClamp={1}>
                                    {track.artist}
                                </Text>
                            </Stack>
                        </Center>
                    )}
                    <Slider
                        aria-label="Player progress"
                        className="w-full mt-6"
                        color="primary"
                        value={progressPct}
                        hideThumb={true}
                    />
                    {durationMs > 0 && (
                        <div className="flex justify-between px-1 -mt-2">
                            <Text size="xs" c="dimmed">
                                {formatTime(progressMs)}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {formatTime(durationMs)}
                            </Text>
                        </div>
                    )}
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
