import { Center, Container, Stack, Text } from "@mantine/core";
import { Button, Image } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import {
    usePlayerElementController,
    type PlayerElementControllerOptions,
} from "./controller/usePlayerElementController";
import "./PlayerElement.css";

type PlayerElementProps = PlayerElementControllerOptions;

export default function PlayerElement({
    currentTrackId,
    onError,
    startAtSeconds = 0,
    stopAtSeconds = null,
    startAtMiddle = false,
    startAtRandom = false,
    minDistanceFromEndSeconds = 30,
    maxPlayDurationSeconds = null,
}: PlayerElementProps) {
    const { isPlaying, loading, autoPausedLocked, togglePlay } = usePlayerElementController({
        currentTrackId,
        onError,
        startAtSeconds,
        stopAtSeconds,
        startAtMiddle,
        startAtRandom,
        minDistanceFromEndSeconds,
        maxPlayDurationSeconds,
    });

    return (
        <div>
            <Container size={"sm"} mt={"xl"}>
                <Stack>
                    <Center>
                        <Image
                            src="/UnknownSong.png"
                            alt="Track cover"
                            className={
                                "cover-image w-65 h-65 object-cover transition-[filter,opacity] duration-500 " +
                                (isPlaying ? "cover-soft-pulse" : "")
                            }
                        />
                    </Center>

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
