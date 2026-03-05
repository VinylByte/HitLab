import { useEffect, useState } from "react";
import { Center, Container, Stack } from "@mantine/core";
import { Button, Image, Slider } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import "./PlayerElement.css";

export default function PlayerElement({ currentTrackId }: { currentTrackId: string | null }) {
    const [loadingSong, setLoadingSong] = useState(true);
    // Time in Seconds
    const [currentTrackTime, setCurrentTrackTime] = useState(0);
    const [totalTrackTime] = useState(100);

    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentTrackTime(prevTime => {
                if (totalTrackTime <= 0) {
                    return prevTime;
                }

                return Math.min(prevTime + 1, totalTrackTime);
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isPlaying, totalTrackTime]);

    useEffect(() => {
        if (totalTrackTime > 0 && currentTrackTime >= totalTrackTime && isPlaying) {
            setIsPlaying(false);
        }
    }, [currentTrackTime, isPlaying, totalTrackTime]);

    useEffect(() => {
        setLoadingSong(!currentTrackId);
    }, [currentTrackId]);

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
                        value={totalTrackTime > 0 ? (currentTrackTime / totalTrackTime) * 100 : 0}
                        hideThumb={true}
                    />
                    <Center>
                        <Button
                            isIconOnly
                            color="primary"
                            className="w-15 h-15"
                            radius="full"
                            onPress={togglePlay}
                            isLoading={loadingSong}
                        >
                            {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                        </Button>
                    </Center>
                </Stack>
            </Container>
        </div>
    );
}
